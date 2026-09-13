import { useState, useEffect, useCallback } from "react";

const API_URL = "https://letters-app-am1z.onrender.com";
const USERS = ["Munkie", "Chandhini"];

function App() {
  const [me, setMe] = useState(() => localStorage.getItem("letterAppUser") || null);
  const [letters, setLetters] = useState([]);
  const [content, setContent] = useState("");

  const other = USERS.find((u) => u !== me);

  const fetchLetters = useCallback(async () => {
    if (!me) return;
    const res = await fetch(`${API_URL}/letters?viewer=${me}`);
    const data = await res.json();
    setLetters(data);
  }, [me]);

  useEffect(() => {
    fetchLetters();
    const interval = setInterval(fetchLetters, 2000);
    return () => clearInterval(interval);
  }, [fetchLetters]);

  const chooseIdentity = (name) => {
    localStorage.setItem("letterAppUser", name);
    setMe(name);
  };

  const sendLetter = async () => {
    if (!content.trim()) return;
    const params = new URLSearchParams({ sender: me, receiver: other, content });
    await fetch(`${API_URL}/send?${params}`, { method: "POST" });
    setContent("");
    fetchLetters();
  };

  if (!me) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center", fontFamily: "sans-serif" }}>
        <h2>Who are you?</h2>
        <p>This only needs to be set once on this device.</p>
        {USERS.map((u) => (
          <button key={u} onClick={() => chooseIdentity(u)} style={{ margin: 8, padding: "10px 20px" }}>
            {u}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Letter Delivery</h2>
      <p style={{ color: "#888", marginTop: -10 }}>Signed in as {me}</p>

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
            <p style={{ margin: "4px 0" }}>
              {l.content !== null ? l.content : "✉️ (arriving...)"}
            </p>
            <small>{l.status}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;