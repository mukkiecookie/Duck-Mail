import { useState, useEffect} from "react";
import person1Map from "../assets/Person_1_Map.png";
import person2Map from "../assets/Person_2_Map.png";
import duckIcon from "../assets/TopRow_Duck.svg";

import yellowButton from "../assets/Yellow_Button.svg";
import greenButton from "../assets/Green_Button.svg";

const API_URL = "http://127.0.0.1:8000";
const MAP_WIDTH = 720;
const MAP_HEIGHT = 712;

const MAPS = {
  Chandhini: {
    image: person1Map,
    waypoints: [
      [240, 78], [249, 107], [269, 122], [290, 122], [307, 139], [308, 155],
      [320, 175], [345, 179], [368, 193], [374, 208], [376, 222], [397, 232],
      [413, 243], [428, 254], [430, 272], [433, 293], [432, 313], [431, 328],
      [431, 357], [426, 375], [424, 397], [436, 417], [451, 429], [460, 435],
      [463, 455], [462, 475], [463, 492], [476, 509], [492, 524], [511, 537],
      [511, 551], [514, 569],
    ]
  },
  Mukul: {
    image: person2Map,
    waypoints: [
      [207, 562], [210, 546], [210, 533], [226, 518], [246, 507], [254, 492],
      [258, 471], [258, 438], [280, 419], [296, 403], [296, 377], [287, 360],
      [288, 332], [287, 302], [288, 272], [293, 257], [308, 242], [329, 232],
      [346, 222], [346, 202], [361, 189], [383, 177], [412, 160], [418, 134],
      [435, 118], [456, 120], [471, 106], [479, 95], [479, 81],
    ]
  },
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

function MapPanel({ me }) {
  const [tracked, setTracked] = useState([]);
  // const [debugCoords, setDebugCoords] = useState(null);
  const [unseenNewLetter, setUnseenNewLetter] = useState(false);
  // const mapRef = useRef(null);

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

  // const handleMapClick = (e) => {
  //   const rect = mapRef.current.getBoundingClientRect();
  //   const x = Math.round(((e.clientX - rect.left) / rect.width) * MAP_WIDTH);
  //   const y = Math.round(((e.clientY - rect.top) / rect.height) * MAP_HEIGHT);
  //   setDebugCoords([x, y]);
  //   console.log(`[${x}, ${y}]`);
  // };

  const active = tracked.find((t) => t.sender === me) || tracked.find((t) => t.receiver === me);
  const mapConfig = MAPS[me];

  const progress = active ? active.progress : 0;
  const phase = active ? active.phase : null;
  const [duckX, duckY] = mapConfig ? getPointAlongPath(mapConfig.waypoints, progress) : [0, 0];

  const duckLeftPct = (duckX / MAP_WIDTH) * 100;
  const duckTopPct = (duckY / MAP_HEIGHT) * 100;

  const isViewerSender = active && active.sender === me;

  let badgeLabel = null;
  let badgeIcon = null;

  if (active) {
    if (isViewerSender) {
      badgeLabel = phase === "pending_pickup" ? "In Dropbox" : "Picked Up";
      badgeIcon = phase === "pending_pickup" ? yellowButton : greenButton;
    } else {
      badgeLabel = "On the Way";
      badgeIcon = yellowButton;
    }
  } else if (unseenNewLetter) {
    badgeLabel = "New Letter";
    badgeIcon = greenButton;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {badgeLabel && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 140,
              height: 44,
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
      )}

      <div
        // ref={mapRef}
        // onClick={handleMapClick}
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        {mapConfig && (
          <img src={mapConfig.image} alt="Delivery route" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
        )}

        {active && (
          <img
            src={duckIcon}
            alt="duck"
            style={{
              position: "absolute",
              left: `${duckLeftPct}%`,
              top: `${duckTopPct}%`,
              width: 32,
              height: 32,
              transform: "translate(-50%, -50%)",
              transition: "left 1s linear, top 1s linear",
              imageRendering: "pixelated",
            }}
          />
        )}
      </div>

      {/* {debugCoords && (
        <p style={{ position: "absolute", bottom: 0, left: 0, fontSize: 11, background: "#fff", padding: 4 }}>
          Last clicked: [{debugCoords[0]}, {debugCoords[1]}]
        </p>
      )} */}
    </div>
  );
}

export default MapPanel;