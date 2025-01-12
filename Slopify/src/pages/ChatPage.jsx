import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import MessageList from "../components/MessageList";
import MessageForm from "../components/MessageForm";
import Button from "../components/Button";

export default function ChatPage() {
  const [displayName, setDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: session } = await supabase.auth.getSession();

      if (!session || !session.session) {
        navigate("/");
        return;
      }

      const userId = session.session.user.id;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .single();

      if (profile) {
        setDisplayName(profile.display_name);
      } else {
        setDisplayName("Unknown User");
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const navToSlopbox = async (e) => {
    e.preventDefault();
    navigate("/slopbox");
  };

  const navToProfile = async (e) => {
    e.preventDefault();
    navigate("/profile");
  };

  return (
    <div id="chat-page">
      <h2>Welcome back to Slopify, {displayName}!</h2>
      <MessageList currentUser={displayName} />
      <MessageForm />
      {/* <form onSubmit={navToSlopbox}>
        <Button
          action="submit"
          content="SLOPBOX"
          background="#FF00FF"
          color="black"
        />
      </form> */}
      <form onSubmit={navToProfile}>
        <Button
          action="submit"
          content="EDIT PROFILE"
          background="#FF00FF"
          color="black"
        />
      </form>
    </div>
  );
}
