import { useState, useEffect } from "react";
import peachButton from "../assets/Peach_Button.svg";
import crossButton from "../assets/Cross_Button.svg";
import searchButton from "../assets/Search_Button.svg";

import stamp1 from "../assets/Stamp_1.png";

const BUILT_IN_STAMPS = [stamp1];

const API_URL = "https://letters-app-am1z.onrender.com";

function HistoryPage({ me, onClose }) {
  const [letters, setLetters] = useState([]);
  const [openLetter, setOpenLetter] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customStamps, setCustomStamps] = useState([]);

  const STAMPS = [...BUILT_IN_STAMPS, ...customStamps];

  useEffect(() => {
    const fetchStamps = async () => {
      const res = await fetch(`${API_URL}/stamps`);
      const data = await res.json();
      setCustomStamps(data.map((s) => `data:image/png;base64,${s.data}`));
    };
    fetchStamps();
  }, []);

  useEffect(() => {
    const fetchLetters = async () => {
      const res = await fetch(`${API_URL}/letters?viewer=${me}`);
      const data = await res.json();
      const receivedOnly = data.filter((l) => l.sender !== me);
      setLetters(receivedOnly.slice().reverse());

      // Mark all currently-visible delivered letters as seen
      const deliveredIds = receivedOnly.filter((l) => l.status === "Delivered").map((l) => l.id);
      if (deliveredIds.length > 0) {
        const maxId = Math.max(...deliveredIds);
        localStorage.setItem(`lastSeenLetter_${me}`, maxId.toString());
      }
    };
    fetchLetters();
    const interval = setInterval(fetchLetters, 5000);
    return () => clearInterval(interval);
  }, [me]);

  const filteredLetters = letters.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.content || "").toLowerCase().includes(q) ||
      (l.sender || "").toLowerCase().includes(q) ||
      (l.date || "").includes(q)
    );
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(241, 231, 223, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      {/* OUTER container - peach */}
      <div
        style={{
          background: "#F2D7BA",
          border: "4px solid #222",
          borderRadius: 15,
          width: 560,
          padding: 28,
          fontFamily: "Minecraft, sans-serif",
          boxShadow: "8px 8px 0 rgba(0,0,0,0.25)",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 14,
            marginBottom: searchOpen ? 12 : 20,
          }}
        >
          <img
            src={searchButton}
            alt="Search"
            onClick={() => setSearchOpen((s) => !s)}
            style={{
              width: 22,
              height: 22,
              cursor: "pointer",
              imageRendering: "pixelated",
              transition: "transform 0.08s ease, filter 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.2)")}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.85)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ width: 110, height: 2, background: "#8D504F" }} />
            ))}
          </span>
          <span style={{ fontSize: 14 }}>Your past letters</span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ width: 110, height: 2, background: "#8D504F" }} />
            ))}
          </span>
          <img
            src={crossButton}
            alt="Back to typewriter"
            onClick={onClose}
            style={{ width: 22, height: 22, cursor: "pointer", imageRendering: "pixelated" }}
          />
        </div>

        {/* Search input - only shows when toggled open */}
        {searchOpen && (
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search letters..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 12px",
              marginBottom: 16,
              fontFamily: "Minecraft, sans-serif",
              fontSize: 13,
              border: "2px solid #222",
              borderRadius: 6,
              background: "#FFFCED",
              outline: "none",
            }}
          />
        )}

        {/* INNER container - cream, holds the scrollable list */}
        <div
          style={{
            background: "#FFF3BF",
            border: "2px solid #222",
            borderRadius: 8,
            padding: 16,
            maxHeight: 420,
            overflowY: "auto",
          }}
        >
          {filteredLetters.length === 0 && (
            <p style={{ textAlign: "center", color: "#886", padding: 20 }}>
              {searchQuery.trim() ? "No matching letters." : "No letters yet."}
            </p>
          )}

          {filteredLetters.map((l) => (
            <div
              key={l.id}
              onClick={() => setOpenLetter(l)}
              style={{
                background: "#FFFCED",
                border: "2px solid #c9a876",
                borderRadius: 6,
                padding: 14,
                marginBottom: 12,
                cursor: "pointer",
                transition: "transform 0.08s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                <span>From: {l.sender}</span>
                <span>Date: {l.date}</span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {l.content}
              </p>
              <small style={{ color: "#886" }}>{l.status}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded letter overlay */}
      {openLetter && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(241, 231, 223, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: "#F2D7BA",
              border: "4px solid #222",
              borderRadius: 15,
              width: 480,
              padding: 28,
              fontFamily: "Minecraft, sans-serif",
              boxShadow: "8px 8px 0 rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                background: "#FFF3BF",
                border: "2px solid #222",
                borderRadius: 8,
                padding: 20,
              }}
            >
              {/* From/Date - completely separate, untouched by the float */}
              <div style={{ fontSize: 13, marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
                <span>From: {openLetter.sender}</span>
                <span>Date: {openLetter.date}</span>
              </div>

              {/* Only this box contains the floated stamp + wrapping text */}
              <div
                style={{
                  maxHeight: 280,
                  overflowY: "auto",
                  paddingRight: 10,
                }}
              >
                <img
                  src={STAMPS[openLetter.stamp_index] || STAMPS[0]}
                  alt="Stamp"
                  style={{
                    width: 70,
                    height: "auto",
                    float: "right",
                    marginLeft: 14,
                    marginBottom: 10,
                  }}
                />
                <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                  {openLetter.content}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              <button
                onClick={() => setOpenLetter(null)}
                style={{
                  fontFamily: "Minecraft, sans-serif",
                  width: 168,
                  height: 46,
                  border: "none",
                  background: `url(${peachButton})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  cursor: "pointer",
                  color: "#222",
                  transition: "transform 0.08s ease, filter 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.filter = "brightness(1)";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;