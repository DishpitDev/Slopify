import emojis, { EMOJI_REGEX, createEmojiElement } from "../utils/emoji.js";

function sanitizeHTML(message) {
  // purges script tags
  message = message.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");

  // purges iframe tags
  message = message.replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, "");

  // purges object tags
  message = message.replace(/<(object|embed|applet)[^>]*>[\s\S]*?<\/\1>/gi, "");

  // purges event handlers
  message = message.replace(
    /<([a-z][a-z0-9]*)\s+[^>]*\s*on\w+="[^"]*"[^>]*>/gi,
    "<$1>",
  );

  return message;
}

function processEmojis(message) {
  const emojis = message.match(EMOJI_REGEX);

  if (!emojis) {
    return message;
  }

  for (let emoji of emojis) {
    const emojiElement = createEmojiElement(emoji.slice(1, -1));
    if (!emojiElement) {
      continue;
    }
    message = message.replace(emoji, emojiElement);
  }

  return message;
}

export default function Message(data) {
  const sanitizedMessage = sanitizeHTML(data.message);
  const finalMessage = processEmojis(sanitizedMessage);

  return (
    <div key={data.id} className="message">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "10px", maxWidth: "90%" }}>
          <img
            src={data.photo}
            alt="Profile"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
          <div style={{ maxWidth: "90%" }}>
            <strong style={{ color: data.color }}>{data.name}</strong>
            <p
              style={{ margin: 0, marginTop: "0.5rem" }}
              dangerouslySetInnerHTML={{ __html: finalMessage }}
            />
          </div>
        </div>
        <small style={{ minWidth: "15%" }}>{data.date}</small>
      </div>
    </div>
  );
}
