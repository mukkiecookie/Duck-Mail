import { useState, useEffect, useRef } from "react";
import crossButton from "../assets/Cross_Button.svg";
import arrowIcon from "../assets/Arrow.svg";
import peachButton from "../assets/Peach_Button.svg";
import uploadButton from "../assets/Upload_Button.svg";

import envelope1 from "../assets/Envelope_1.png";

import stamp1 from "../assets/Stamp_1.png";
import stamp2 from "../assets/Stamp_2.png";
import stamp3 from "../assets/Stamp_3.png";
import stamp4 from "../assets/Stamp_4.png";
import stamp5 from "../assets/Stamp_5.png";
import stamp6 from "../assets/Stamp_6.png";
import stamp7 from "../assets/Stamp_7.png";
import stamp8 from "../assets/Stamp_8.png";
import stamp9 from "../assets/Stamp_9.png";
import stamp10 from "../assets/Stamp_10.png";

const API_URL = "http://127.0.0.1:8000";

const BUILT_IN_STAMPS = [stamp1, stamp2, stamp3, stamp4, stamp5, stamp6, stamp7, stamp8, stamp9, stamp10];

function ArrowButton({ onClick, disabled, flip, size = 48 }) {
  return (
    <img
      src={arrowIcon}
      alt="arrow"
      onClick={disabled ? undefined : onClick}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.3 : 1,
        transform: flip ? "scaleX(-1)" : "none",
        transition: "transform 0.08s ease, filter 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.filter = "brightness(1.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "brightness(1)";
        e.currentTarget.style.transform = flip ? "scaleX(-1)" : "none";
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = flip ? "scaleX(-1) scale(0.85)" : "scale(0.85)";
        }
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = flip ? "scaleX(-1)" : "none";
      }}
    />
  );
}

function EnvelopeModal({ onSend, onBack, sending }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customStamps, setCustomStamps] = useState([]);
  const fileInputRef = useRef(null);

  const STAMPS = [...BUILT_IN_STAMPS, ...customStamps];

  useEffect(() => {
    fetch(`${API_URL}/stamps`)
      .then((res) => res.json())
      .then((data) => {
        setCustomStamps(data.map((s) => `data:image/png;base64,${s.data}`));
      });
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${API_URL}/stamps`, { method: "POST", body: formData });

    // Refresh the stamp list so the new one shows up immediately
    const res = await fetch(`${API_URL}/stamps`);
    const data = await res.json();
    setCustomStamps(data.map((s) => `data:image/png;base64,${s.data}`));

    e.target.value = ""; // reset the input so the same file can be re-selected later
  };

  const canScrollLeft = selectedIndex > 0;
  const canScrollRight = selectedIndex < STAMPS.length - 1;

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
            marginBottom: 20,
          }}
        >
          <img
            src={uploadButton}
            alt="Upload a new stamp"
            onClick={handleUploadClick}
            style={{ width: 22, height: 22, cursor: "pointer", imageRendering: "pixelated" }}
          />
          <input
            type="file"
            accept="image/png,image/jpeg"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ width: 110, height: 2, background: "#8D504F" }} />
            ))}
          </span>
          <span style={{ fontSize: 14 }}>Customize your letter</span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ width: 110, height: 2, background: "#8D504F" }} />
            ))}
          </span>
          <img
            src={crossButton}
            alt="Back to typewriter"
            onClick={onBack}
            style={{ width: 22, height: 22, cursor: "pointer", imageRendering: "pixelated" }}
          />
        </div>

        {/* INNER container - yellow, wraps envelope + stamp picker */}
        <div
          style={{
            background: "#FFF3BF",
            borderRadius: 8,
            border: "2px solid #222",
            padding: 24,
          }}
        >
          {/* Envelope preview - fixed, no carousel */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <img
              src={envelope1}
              alt="Envelope"
              style={{
                display: "block",
                maxWidth: 380,
                height: "auto",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: 20,
                right: "calc(50% - 190px + 20px)",
              }}
            >
              <img
                src={STAMPS[selectedIndex]}
                alt="Selected stamp"
                style={{ width: 80, height: "auto", display: "block" }}
              />
            </div>
          </div>

          {/* Stamp picker row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ArrowButton
              flip
              size={36}
              disabled={!canScrollLeft}
              onClick={() => setSelectedIndex((i) => i - 1)}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                background: "#FFFCED",
                border: "3px solid #333",
                padding: 12,
              }}
            >
              {[selectedIndex - 1, selectedIndex, selectedIndex + 1].map((idx) => {
                const inRange = idx >= 0 && idx < STAMPS.length;
                if (!inRange) {
                  return <div key={idx} style={{ width: 80, height: 100 }} />;
                }
                const isSelected = idx === selectedIndex;
                return (
                  <img
                    key={idx}
                    src={STAMPS[idx]}
                    alt={`Stamp ${idx + 1}`}
                    style={{
                      width: 80,
                      height: "auto",
                      opacity: isSelected ? 1 : 0.5,
                      transition: "opacity 0.15s ease",
                    }}
                  />
                );
              })}
            </div>

            <ArrowButton
              size={36}
              disabled={!canScrollRight}
              onClick={() => setSelectedIndex((i) => i + 1)}
            />
          </div>
        </div>
        {/* end of yellow inner container */}

        {/* Send button - outside the yellow box, back in the peach area */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <button
            onClick={() => onSend(selectedIndex)}
            disabled={sending}
            style={{
              fontFamily: "Minecraft, sans-serif",
              width: 168,
              height: 46,
              border: "none",
              background: `url(${peachButton})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              cursor: sending ? "not-allowed" : "pointer",
              color: "#222",
              transition: "transform 0.08s ease, filter 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!sending) e.currentTarget.style.filter = "brightness(1.1)";
            }}
            onMouseDown={(e) => {
              if (!sending) e.currentTarget.style.transform = "scale(0.93)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.filter = "brightness(1)";
            }}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnvelopeModal;