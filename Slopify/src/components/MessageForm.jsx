import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Button from "./Button";

export default function MessageForm() {
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(1000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const user = supabase.auth.getUser();
    const { data: userData, error: userError } = await user;

    if (userError || !userData.user) {
      console.error("Error retrieving user:", userError);
      return;
    }

    const { id: user_id } = userData.user;

    const { error } = await supabase
      .from("messages")
      .insert([{ content: message, user_id }]);

    if (error) {
      console.error("Error sending message:", error.message);
    } else {
      setMessage("");
      setCharCount(1000);
    }
  };

  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    const newCharCount = 1000 - newMessage.length;
    if (newCharCount >= 0) {
      setMessage(newMessage);
      setCharCount(newCharCount);
    }
  };

  const getColor = () => {
    if (charCount <= 0) return "black";
    if (charCount <= 10) return "red";
    if (charCount <= 100) return "yellow";
    return "white";
  };

  useEffect(() => {
  }, [charCount]);

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={handleInputChange}
        style={{ padding: "0.5rem", width: "70%" }}
      />
      <Button
        action="submit"
        content="Send"
        background="#458588"
        color="white"
      />
      <div
        style={{
          fontSize: "14px",
          color: getColor(),
          marginTop: "0.5rem",
          fontWeight: "bold",
          display: "inline-block",
        }}
      >
        {charCount}
      </div>
    </form>
  );
}
