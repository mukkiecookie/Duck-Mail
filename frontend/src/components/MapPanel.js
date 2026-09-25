import { useState, useEffect, useRef } from "react";
import person1Map from "../assets/Person_1_Map.png";
import duckIcon from "../assets/TopRow_Duck.svg";

import yellowButton from "../assets/Yellow_Button.svg";
import greenButton from "../assets/Green_Button.svg";
import greyButton from "../assets/Grey_Button.svg";

const API_URL = "https://letters-app-am1z.onrender.com";
const MAP_WIDTH = 720;
const MAP_HEIGHT = 712;
const DEFAULT_HOLDER = "Mukul"; // whoever starts at side A - must match backend's DEFAULT_HOLDER

const SHARED_MAP = {
  image: person1Map,
  waypoints: [
    [240, 78], [249, 107], [269, 122], [290, 122], [307, 139], [308, 155],
    [320, 175], [345, 179], [368, 193], [374, 208], [376, 222], [397, 232],
    [413, 243], [428, 254], [430, 272], [433, 293], [432, 313], [431, 328],
    [431, 357], [426, 375], [424, 397], [436, 417], [451, 429], [460, 435],
    [463, 455], [462, 475], [463, 492], [476, 509], [492, 524], [511, 537],
    [511, 551], [514, 569],
  ],
};

function getPointAlongPath(waypoints, progress) {
  const segmentLengths = [];
  let totalLength = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [x1, y1] = waypoints[i];
    const [x2, y2] = waypoints[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    segmentLengths.push(len);
    totalLength += len;
  }

  let target = progress * totalLength;
  for (let i = 0; i < segmentLengths.length; i++) {
    if (target <= segmentLengths[i]) {
      const [x1, y1] = waypoints[i];
      const [x2, y2] = waypoints[i + 1];
      const t = segmentLengths[i] === 0 ? 0 : target / segmentLengths[i];
      return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
    }
    target -= segmentLengths[i];
  }
  return waypoints[waypoints.length - 1];
}

// Given one tracked letter, figure out where along the shared path its duck sits.
// Letters sent by DEFAULT_HOLDER walk the path forward (progress 0 -> 1);
// letters sent the other direction walk it backward (progress 1 -> 0).
function getDuckPosition(letter) {
  const isSenderDefaultHolder = letter.sender === DEFAULT_HOLDER;
  const posProgress = isSenderDefaultHolder ? letter.progress : 1 - letter.progress;
  const [x, y] = getPointAlongPath(SHARED_MAP.waypoints, posProgress);
  return {
    leftPct: (x / MAP_WIDTH) * 100,
    topPct: (y / MAP_HEIGHT) * 100,
  };
}

// Multiple letters from the same sender often share the exact same progress
// (e.g. both still "pending_pickup"), which would stack their ducks on top of
// each other. Nudge overlapping ducks into a small circle so each stays visible.
function getSpreadDuckPositions(tracked) {
  const positions = tracked.map((letter) => ({ letter, ...getDuckPosition(letter) }));

  const groups = {};
  positions.forEach((p) => {
    const key = `${p.leftPct.toFixed(1)}_${p.topPct.toFixed(1)}`;
    (groups[key] = groups[key] || []).push(p);
  });

  const OFFSET_PCT = 2.2; // how far apart overlapping ducks get nudged, in % of map size

  Object.values(groups).forEach((group) => {
    if (group.length <= 1) return;
    group.forEach((p, i) => {
      const angle = (2 * Math.PI * i) / group.length;
      p.leftPct += Math.cos(angle) * OFFSET_PCT;
      p.topPct += Math.sin(angle) * OFFSET_PCT;
    });
  });

  return positions;
}

function MapPanel({ me, onOpenLetter }) {
  const [tracked, setTracked] = useState([]);
  const [unseenNewLetter, setUnseenNewLetter] = useState(false);
  const [holder, setHolder] = useState(null);
  const [setPreviewLetter] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchTracking = async () => {
      const res = await fetch(`${API_URL}/track?viewer=${me}`);
      const data = await res.json();
      setTracked(data);
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 5000);
    return () => clearInterval(interval);
  }, [me]);

  useEffect(() => {
    const fetchDuckStatus = async () => {
      const res = await fetch(`${API_URL}/duck-status?viewer=${me}`);
      const data = await res.json();
      setHolder(data.holder);
    };
    fetchDuckStatus();
    const interval = setInterval(fetchDuckStatus, 5000);
    return () => clearInterval(interval);
  }, [me]);

  useEffect(() => {
    const checkNewLetters = async () => {
      const res = await fetch(`${API_URL}/letters?viewer=${me}`);
      const data = await res.json();
      const receivedDelivered = data.filter((l) => l.receiver === me && l.status === "Delivered");
      if (receivedDelivered.length === 0) {
        setUnseenNewLetter(false);
        return;
      }
      const maxId = Math.max(...receivedDelivered.map((l) => l.id));
      const lastSeen = parseInt(localStorage.getItem(`lastSeenLetter_${me}`) || "0", 10);
      setUnseenNewLetter(maxId > lastSeen);
    };
    checkNewLetters();
    const interval = setInterval(checkNewLetters, 5000);
    return () => clearInterval(interval);
  }, [me]);

  const active = tracked.find((t) => t.sender === me) || tracked.find((t) => t.receiver === me);
  const isViewerSender = active && active.sender === me;

  // Resting position (used only when nothing is currently in transit)
  const restProgress = holder === DEFAULT_HOLDER ? 0 : 1;
  const [restX, restY] = getPointAlongPath(SHARED_MAP.waypoints, restProgress);
  const restLeftPct = (restX / MAP_WIDTH) * 100;
  const restTopPct = (restY / MAP_HEIGHT) * 100;

  let badgeLabel = "No New Letter";
  let badgeIcon = greyButton;
  let badgeClickable = false;

  if (active) {
    if (isViewerSender) {
      badgeLabel = active.phase === "pending_pickup" ? "In Dropbox" : "Picked Up";
      badgeIcon = active.phase === "pending_pickup" ? yellowButton : greenButton;
    } else {
      badgeLabel = "On the Way";
      badgeIcon = yellowButton;
    }
  } else if (unseenNewLetter) {
    badgeLabel = "New Letter";
    badgeIcon = greenButton;
    badgeClickable = true;
  }

  const handleBadgeClick = async () => {
    if (!badgeClickable) return;
    const res = await fetch(`${API_URL}/letters?viewer=${me}`);
    const data = await res.json();
    const receivedDelivered = data.filter((l) => l.receiver === me && l.status === "Delivered");
    if (receivedDelivered.length === 0) return;
    const latest = receivedDelivered.reduce((a, b) => (a.id > b.id ? a : b));
    localStorage.setItem(`lastSeenLetter_${me}`, latest.id.toString());
    setUnseenNewLetter(false);
    onOpenLetter(latest.id);
  };


  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        onClick={handleBadgeClick}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          cursor: badgeClickable ? "pointer" : "default",
        }}
      >
        <div
          style={{
            width: 168,
            height: 46,
            background: `url(${badgeIcon})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Minecraft, sans-serif",
            fontSize: 14,
            color: "#222",
          }}
        >
          {badgeLabel}
        </div>
      </div>

      <div
        ref={mapRef}
        style={{ position: "relative", width: "100%", height: "100%", cursor: "crosshair" }}
      >
        <img
          src={SHARED_MAP.image}
          alt="Delivery route"
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />

        {tracked.length > 0 ? (
          // One duck per in-transit letter, nudged apart if they'd otherwise overlap
          getSpreadDuckPositions(tracked).map(({ letter, leftPct, topPct }) => (
            <img
              key={letter.id}
              src={duckIcon}
              alt="duck"
              style={{
                position: "absolute",
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: 32,
                height: 32,
                animation: "duckBounce 0.6s ease-in-out infinite",
                transition: "left 1s linear, top 1s linear",
              }}
            />
          ))
        ) : (
          // Nothing in transit - show a single duck resting with whoever holds it
          holder !== null && (
            <img
              src={duckIcon}
              alt="duck"
              style={{
                position: "absolute",
                left: `${restLeftPct}%`,
                top: `${restTopPct}%`,
                width: 32,
                height: 32,
                animation: "duckBounce 0.6s ease-in-out infinite",
                transition: "left 1s linear, top 1s linear",
              }}
            />
          )
        )}
      </div>
    </div>
  );
}

export default MapPanel;