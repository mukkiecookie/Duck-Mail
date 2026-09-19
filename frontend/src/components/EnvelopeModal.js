import { useState } from "react";
import closeButton from "../assets/Close_Button.svg";
import arrowIcon from "../assets/Arrow.svg";
import blueButton from "../assets/Blue_Button.svg";

import envelope1 from "../assets/Envelope_1.png";
import envelope2 from "../assets/Envelope_2.png";
import envelope3 from "../assets/Envelope_3.png";
import envelope4 from "../assets/Envelope_4.png";
import envelope5 from "../assets/Envelope_5.png";
import envelope6 from "../assets/Envelope_6.png";
import envelope7 from "../assets/Envelope_7.png";
import envelope8 from "../assets/Envelope_8.png";
import envelope9 from "../assets/Envelope_9.png";
import envelope10 from "../assets/Envelope_10.png";

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

const ENVELOPES = [envelope1, envelope2, envelope3, envelope4, envelope5, envelope6, envelope7, envelope8, envelope9, envelope10];
const STAMPS = [stamp1, stamp2, stamp3, stamp4, stamp5, stamp6, stamp7, stamp8, stamp9, stamp10];

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
  const [envelopeIndex, setEnvelopeIndex] = useState(0);
  const [stampIndex, setStampIndex] = useState(null);
  const [stampScroll, setStampScroll] = useState(0);
  const visibleCount = 3;

  const canScrollLeft = stampScroll > 0;
  const canScrollRight = stampScroll + visibleCount < STAMPS.length;
  const canSend = stampIndex !== null;

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
        {/* Title bar - lives directly in the peach container */}
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
            src={closeButton}
            alt="Back to typewriter"
            onClick={onBack}
            style={{ width: 22, height: 22, cursor: "pointer", imageRendering: "pixelated" }}
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
            src={closeButton}
            alt="Back to typewriter"
            onClick={onBack}
            style={{ width: 22, height: 22, cursor: "pointer", imageRendering: "pixelated" }}
          />
        </div>

        {/* INNER container - yellow, wraps envelope + both arrow rows + stamps */}
        <div
          style={{
            background: "#FFF3BF",
            borderRadius: 8,
            border: "2px solid #222",
            padding: 24,
          }}
        >
          {/* Envelope row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <ArrowButton
              flip
              disabled={envelopeIndex === 0}
              onClick={() => setEnvelopeIndex((i) => i - 1)}
            />

            <div style={{ position: "relative", flex: 1, display: "flex", justifyContent: "center" }}>
              <img
                src={ENVELOPES[envelopeIndex]}
                alt={`Envelope ${envelopeIndex + 1}`}
                style={{
                  display: "block",
                  maxWidth: 380,
                  height: "auto",
                  imageRendering: "pixelated",
                }}
              />

              {stampIndex !== null && (
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    right: "calc(50% - 190px + 20px)",
                  }}
                >
                  <img
                    src={STAMPS[stampIndex]}
                    alt="Selected stamp"
                    style={{ width: 80, height: "auto", imageRendering: "pixelated", display: "block" }}
                  />
                </div>
              )}
            </div>

            <ArrowButton
              disabled={envelopeIndex === ENVELOPES.length - 1}
              onClick={() => setEnvelopeIndex((i) => i + 1)}
            />
          </div>

          {/* Stamp picker row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ArrowButton
              flip
              size={36}
              disabled={!canScrollLeft}
              onClick={() => setStampScroll((i) => i - 1)}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                flex: 1,
                justifyContent: "center",
                background: "#FFFCED",
                border: "2px solid #333",
                padding: 12,
              }}
            >
              {STAMPS.slice(stampScroll, stampScroll + visibleCount).map((stamp, i) => {
                const actualIndex = stampScroll + i;
                const isSelected = stampIndex === actualIndex;
                return (
                  <img
                    key={actualIndex}
                    src={stamp}
                    alt={`Stamp ${actualIndex + 1}`}
                    onClick={() => setStampIndex(actualIndex)}
                    style={{
                      width: 80,
                      height: "auto",
                      imageRendering: "pixelated",
                      cursor: "pointer",
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
              onClick={() => setStampScroll((i) => i + 1)}
            />
          </div>
        </div>

        {/* Send button - outside the yellow box, back in the peach area */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <button
            onClick={() => onSend(STAMPS[stampIndex], ENVELOPES[envelopeIndex])}
            disabled={!canSend || sending}
            style={{
              fontFamily: "Minecraft, sans-serif",
              fontSize: 16,
              width: 180,
              height: 48,
              border: "none",
              background: `url(${blueButton})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              color: "#222",
              cursor: canSend ? "pointer" : "not-allowed",
              opacity: canSend ? 1 : 0.5,
              transition: "transform 0.08s ease, filter 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (canSend) e.currentTarget.style.filter = "brightness(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.filter = "brightness(1)";
            }}
            onMouseDown={(e) => {
              if (canSend) e.currentTarget.style.transform = "scale(0.93)";
            }}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnvelopeModal;