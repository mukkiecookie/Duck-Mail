import { useState } from "react";
import typewriterImg from "../assets/Typewriter.png";
import EnvelopeModal from "../components/EnvelopeModal";

import blueButton from "../assets/Blue_Button.svg";
import greyButton from "../assets/Grey_Button.svg";

const API_URL = "https://letters-app-am1z.onrender.com";

function formatDate() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function ComposePage({ me, other }) {
  const [content, setContent] = useState("");
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [sending, setSending] = useState(false);

  const openEnvelope = () => {
    if (!content.trim()) return;
    setShowEnvelope(true);
  };

  const handleTrash = () => {
    setContent("");
    setShowEnvelope(false);
  };

  const handleSend = async (stampIndex) => {
    setSending(true);
    const params = new URLSearchParams({
      sender: me,
      receiver: other,
      content,
      stamp_index: stampIndex,
    });
    await fetch(`${API_URL}/send?${params}`, { method: "POST" });
    setSending(false);
    setContent("");
    setShowEnvelope(false);
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 40,
      }}
    >
      {/* Paper - sits above the typewriter, shows live text */}
      <div
        style={{
          position: "relative",
          width: "43.2%",
          background: "#f3ecd8",
          border: "2px solid #163558",
          borderRadius: 4,
          padding: 16,
          marginBottom: -120,
          zIndex: 0,
          fontFamily: "Minecraft, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
          <span>To: {other}</span>
          <span>Date: {formatDate()}</span>
        </div>
        <div style={{ borderTop: "1px solid #999", marginBottom: 10 }} />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your letter..."
          style={{
            width: "100%",
            height: 240,
            border: "none",
            background: "transparent",
            resize: "none",
            outline: "none",
            fontFamily: "Minecraft, sans-serif",
            fontSize: 13,
            lineHeight: 1.6,
            overflowY: "auto",
          }}
        />
      </div>

      {/* Typewriter illustration */}
      <img
        src={typewriterImg}
        alt="Typewriter"
        style={{ width: "80%", imageRendering: "pixelated", zIndex: 1 }}
      />

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8.5417vw", marginTop: 40 }}>
        <button
          onClick={openEnvelope}
          disabled={!content.trim()}
          style={{
            fontFamily: "Minecraft, sans-serif",
            width: 168,
            height: 46,
            border: "none",
            background: `url(${blueButton})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            cursor: content.trim() ? "pointer" : "not-allowed",
            color: "#222",
            opacity: content.trim() ? 1 : 0.5,
            transition: "transform 0.08s ease, filter 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (content.trim()) e.currentTarget.style.filter = "brightness(1.1)";
          }}
          onMouseDown={(e) => {
            if (content.trim()) e.currentTarget.style.transform = "scale(0.93)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.filter = "brightness(1)";
          }}
        >
          Envelope
        </button>
        <button
          onClick={handleTrash}
          style={{
            fontFamily: "Minecraft, sans-serif",
            width: 168,
            height: 46,
            border: "none",
            background: `url(${greyButton})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            cursor: "pointer",
            color: "#222",
            transition: "transform 0.08s ease, filter 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.1)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.93)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.filter = "brightness(1)";
          }}
        >
          Trash
        </button>
      </div>

      {showEnvelope && (
        <EnvelopeModal
          onSend={(stampIndex) => handleSend(stampIndex)}
          onBack={() => setShowEnvelope(false)}
          sending={sending}
        />
      )}
    </div>
  );
}

export default ComposePage;