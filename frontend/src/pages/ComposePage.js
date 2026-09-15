import { useState } from "react";

const API_URL = "https://letters-app-am1z.onrender.com";

function ComposePage({ me, other }) {
  const [content, setContent] = useState("");
  const [sentMsg, setSentMsg] = useState("");

  const sendLetter = async () => {
    if (!content.trim()) return;
    const params = new URLSearchParams({ sender: me, receiver: other, content });
    const res = await fetch(`${API_URL}/send?${params}`, { method: "POST" });
    const data = await res.json();
    setContent("");
    setSentMsg(`Sent! Pickup in ~${Math.round(data.pickup_seconds / 60)} min.`);
    setTimeout(() => setSentMsg(""), 4000);
  };

  return (
    <div>
      <h3>Write to {other}</h3>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your letter..."
        rows={6}
        style={{ width: "100%", padding: 10, boxSizing: "border-box" }}
      />
      <button onClick={sendLetter} style={{ marginTop: 10, padding: "8px 20px" }}>
        Send
      </button>
      {sentMsg && <p style={{ color: "green" }}>{sentMsg}</p>}
    </div>
  );
}

export default ComposePage;