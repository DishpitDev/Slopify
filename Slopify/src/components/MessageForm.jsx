import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Button from "./Button";
import emojis from "../utils/emoji.js";

export default function MessageForm() {
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(1000);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

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

  const handleEmojiClick = (emojiKey) => {
    const emojiText = `:${emojiKey}:`;
    const newMessage = message + emojiText;
    const newCharCount = 1000 - newMessage.length;

    if (newCharCount >= 0) {
      setMessage(newMessage);
      setCharCount(newCharCount);
    }

    setEmojiPickerVisible(false);
  }

  const getColor = () => {
    if (charCount <= 0) return "black";
    if (charCount <= 10) return "red";
    if (charCount <= 100) return "yellow";
    return "white";
  };

  useEffect(() => {
  }, [charCount]);

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem", position: "relative", width: "100%", display: "flex", flexDirection: "row", alignItems: "center" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
        <input
          type="text"
          placeholder="Message your fellow sloppers..."
          value={message}
          onChange={handleInputChange}
          style={{ padding: "0.5rem", width: "100%", paddingRight: "30px" }}
        />
        <button
          type="button"
          onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
          style={{
            marginLeft: "-45px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            filter: "grayscale(100%)",
          }}
        >
          😊
        </button>
      </div>
      {emojiPickerVisible && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(40px, 1fr))",
            gap: "0.75rem",
            maxHeight: "300px",
            width: "60%",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          {Object.keys(emojis).map((emojiKey) => (
            <img
              key={emojiKey}
              src={emojis[emojiKey]}
              alt={emojiKey}
              title={emojiKey}
              style={{ width: "40px", height: "40px", cursor: "pointer" }}
              onClick={() => handleEmojiClick(emojiKey)}
            />
          ))}
        </div>
      )}
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
