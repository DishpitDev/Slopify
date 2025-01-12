import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import Message from "./Message";
import { sendNotification } from "@tauri-apps/plugin-notification";

const PAGE_SIZE = 50;

export default function MessageList(data) {
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [scrolling, setScrolling] = useState(false);

  const sortedMessages = useMemo(
    () =>
      Object.values(messages).sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      ),
    [messages],
  );

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new;
          attachDisplayName(newMessage).then((msgWithDisplayName) => {
            setMessages((prev) => ({
              ...prev,
              [newMessage.id]: msgWithDisplayName,
            }));
            if (
              data.currentUser &&
              msgWithDisplayName.content.includes(`@${data.currentUser}`)
            ) {
              triggerNotification(msgWithDisplayName);
            }
          });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const messageBox = document.getElementById("message-box");

    if (messageBox) {
      messageBox.scrollTop = messageBox.scrollHeight;
    }
  }, [messages]);

  const formatDate = (utcDateString) => {
    const messageDate = new Date(`${utcDateString}Z`);
    const now = new Date();

    const isToday = messageDate.toDateString() === now.toDateString();

    const isYesterday =
      messageDate.toDateString() ===
      new Date(now.setDate(now.getDate() - 1)).toDateString();

    if (isToday) {
      return `Today, ${messageDate.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })}`;
    }

    if (isYesterday) {
      return `Yesterday, ${messageDate.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })}`;
    }

    return messageDate.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const attachDisplayName = async (message) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("display_name, profile_color, profile_photo_url")
      .eq("id", message.user_id)
      .single();

    if (error) {
      console.error(
        "Error fetching display name and profile color:",
        error.message,
      );
      throw new Error("Unable to load user profile");
    }

    return {
      ...message,
      display_name: profile.display_name,
      profile_color: profile.profile_color,
      profile_photo_url: profile.profile_photo_url,
    };
  };

  const fetchMessages = async (olderThan = null) => {
    if (scrolling) return;

    setScrolling(true);
    const query = supabase
      .from("messages")
      .select("id, user_id, content, created_at")
      .order("created_at", { ascending: true })
      .limit(PAGE_SIZE);

    if (olderThan) {
      query.lt("created_at", olderThan);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching messages:", error.message);
    } else {
      try {
        const messagesWithDisplayNames = await Promise.all(
          data.map(attachDisplayName),
        );
        setMessages((prev) => ({
          ...prev,
          ...messagesWithDisplayNames.reduce((acc, msg) => {
            acc[msg.id] = msg;
            return acc;
          }, {}),
        }));
        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (e) {
        console.error("Failed to attach display names:", e);
      }
    }

    setLoading(false);
    setScrolling(false);
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (!(scrollTop === 0 && hasMore)) {
      return;
    }

    const oldestMessage = sortedMessages[sortedMessages.length - 1];
    if (oldestMessage) {
      fetchMessages(oldestMessage.created_at);
    }
  };

  const triggerNotification = (message) => {
    sendNotification({
      title: `${message.display_name} mentioned you!`,
      body: message.content,
    });
  };

  return (
    <div
      id="message-box"
      style={{
        height: "500px",
        overflowY: "auto",
        border: "1px solid #ccc",
      }}
      onScroll={handleScroll}
    >
      {loading ? (
        <p>Loading...</p>
      ) : (
        sortedMessages.map((msg) => (
          <Message
            key={msg.id}
            name={msg.display_name}
            color={msg.profile_color}
            photo={msg.profile_photo_url}
            date={formatDate(msg.created_at)}
            message={msg.content}
          />
        ))
      )}
    </div>
  );
}
