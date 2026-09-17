import { useState } from "react";
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

import blueButton from "../assets/Blue_Button.svg";
import greyButton from "../assets/Grey_Button.svg";

const STAMPS = [stamp1, stamp2, stamp3, stamp4, stamp5, stamp6, stamp7, stamp8, stamp9, stamp10];

function EnvelopeModal({ onSend, onTrash, sending }) {
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const visibleCount = 3;

  const canScrollLeft = scrollIndex > 0;
  const canScrollRight = scrollIndex + visibleCount < STAMPS.length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "#fdf6d8",
          border: "3px solid #222",
          borderRadius: 8,
          width: 420,
          padding: 20,
          fontFamily: "Minecraft, sans-serif",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #222",
            paddingBottom: 10,
            marginBottom: 20,
          }}
        >
          <span>☐</span>
          <span>Customize your letter</span>
          <span onClick={onTrash} style={{ cursor: "pointer" }}>☒</span>
        </div>

        {/* Envelope preview */}
        <div
          style={{
            position: "relative",
            background: "#fdf9e8",
            border: "3px dashed #d94f3d",
            borderRadius: 6,
            height: 150,
            marginBottom: 20,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="150" y2="90" stroke="#888" strokeWidth="2" />
            <line x1="300" y1="0" x2="150" y2="90" stroke="#888" strokeWidth="2" />
          </svg>
          {selectedStamp && (
            <img
              src={selectedStamp}
              alt="Selected stamp"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 50,
                height: 65,
                imageRendering: "pixelated",
              }}
            />
          )}
        </div>

        {/* Stamp picker */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span
            onClick={() => canScrollLeft && setScrollIndex((i) => i - 1)}
            style={{ cursor: canScrollLeft ? "pointer" : "default", opacity: canScrollLeft ? 1 : 0.3 }}
          >
            ◀
          </span>
          <div style={{ display: "flex", gap: 10, flex: 1, justifyContent: "center" }}>
            {STAMPS.slice(scrollIndex, scrollIndex + visibleCount).map((stamp, i) => {
              const actualIndex = scrollIndex + i;
              const isSelected = selectedStamp === stamp;
              return (
                <img
                  key={actualIndex}
                  src={stamp}
                  alt={`Stamp ${actualIndex + 1}`}
                  onClick={() => setSelectedStamp(stamp)}
                  style={{
                    width: 55,
                    height: 70,
                    imageRendering: "pixelated",
                    cursor: "pointer",
                    border: isSelected ? "3px solid #d94f3d" : "3px dashed transparent",
                    borderRadius: 4,
                  }}
                />
              );
            })}
          </div>
          <span
            onClick={() => canScrollRight && setScrollIndex((i) => i + 1)}
            style={{ cursor: canScrollRight ? "pointer" : "default", opacity: canScrollRight ? 1 : 0.3 }}
          >
            ▶
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button
            onClick={() => onSend(selectedStamp)}
            disabled={!selectedStamp || sending}
            style={{
                fontFamily: "Minecraft, sans-serif",
                width: 168,
                height: 46,
                border: "none",
                background: `url(${blueButton})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                cursor: selectedStamp ? "pointer" : "not-allowed",
                color: "#222",
                opacity: selectedStamp ? 1 : 0.5,
                transition: "transform 0.08s ease, filter 0.15s ease",
            }}
            onMouseEnter={(e) => {
                if (selectedStamp) e.currentTarget.style.filter = "brightness(1.1)";
            }}
            onMouseDown={(e) => {
                if (selectedStamp) e.currentTarget.style.transform = "scale(0.93)";
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
            <button
            onClick={onTrash}
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
      </div>
    </div>
  );
}

export default EnvelopeModal;