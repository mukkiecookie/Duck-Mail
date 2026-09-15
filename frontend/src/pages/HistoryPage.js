import { useState, useEffect } from "react";

const API_URL = "https://letters-app-am1z.onrender.com";

function HistoryPage({ me }) {
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    const fetchLetters = async () => {
      const res = await fetch(`${API_URL}/letters?viewer=${me}`);
      const data = await res.json();
      setLetters(data);
    };
    fetchLetters();
    const interval = setInterval(fetchLetters, 5000);
    return () => clearInterval(interval);
  }, [me]);

  return (
    <div>
      {letters.slice().reverse().map((l) => (
        <div
          key={l.id}
          style={{
            padding: 10,
            marginBottom: 8,
            borderRadius: 8,
            background: l.status === "Delivered" ? "#d4f7d4" : l.status === "In Transit" ? "#f7f0d4" : "#e0e0e0",
            textAlign: l.sender === me ? "right" : "left",
          }}
        >
          <strong>{l.sender === me ? "You" : l.sender} → {l.receiver === me ? "You" : l.receiver}</strong>
          <p style={{ margin: "4px 0" }}>{l.content}</p>
          <small>{l.status}</small>
        </div>
      ))}
    </div>
  );
}

export default HistoryPage;