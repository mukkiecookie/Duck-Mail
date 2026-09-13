import { useState, useEffect, useCallback } from "react";

const API_URL = "https://letters-app-am1z.onrender.com";
const USERS = ["Munkie", "Chandhini"]; // replace with your friend's actual name

function App() {
  const [me, setMe] = useState(USERS[0]);
  const [letters, setLetters] = useState([]);
  const [content, setContent] = useState("");

  const other = USERS.find((u) => u !== me);

  // ...inside the component:
const fetchLetters = useCallback(async () => {
  const res = await fetch(`${API_URL}/letters`);
  const data = await res.json();
  setLetters(data.filter((l) => l.sender === me || l.receiver === me));
}, [me]);

useEffect(() => {
  fetchLetters();
  const interval = setInterval(fetchLetters, 2000);
  return () => clearInterval(interval);
}, [fetchLetters]);

  const sendLetter = async () => {
    if (!content.trim()) return;
    const params = new URLSearchParams({ sender: me, receiver: other, content });
    await fetch(`${API_URL}/send?${params}`, { method: "POST" });
    setContent("");
    fetchLetters();
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Letter Delivery</h2>

      <div style={{ marginBottom: 16 }}>
        I am:{" "}
        <select value={me} onChange={(e) => setMe(e.target.value)}>
          {USERS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Write to ${other}...`}
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === "Enter" && sendLetter()}
        />
        <button onClick={sendLetter}>Send</button>
      </div>

      <div>
        {letters.slice().reverse().map((l) => (
          <div
            key={l.id}
            style={{
              padding: 10,
              marginBottom: 8,
              borderRadius: 8,
              background: l.status === "Delivered" ? "#d4f7d4" : "#f7f0d4",
              textAlign: l.sender === me ? "right" : "left",
            }}
          >
            <strong>{l.sender === me ? "You" : l.sender} → {l.receiver === me ? "You" : l.receiver}</strong>
            <p style={{ margin: "4px 0" }}>{l.content}</p>
            <small>{l.status}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;