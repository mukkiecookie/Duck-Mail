import { useState, useEffect, useRef } from "react";
import person1Map from "../assets/Person_1_Map.png";
import person2Map from "../assets/Person_2_Map.png";

const API_URL = "https://letters-app-am1z.onrender.com";
const MAP_WIDTH = 720;
const MAP_HEIGHT = 1024;

const MAPS = {
  Chandhini: {
    image: person1Map,
    waypoints: [[258,150],[330,255],[417,355],[463,430],[463,517],[455,610],[490,655],[500,735],[548,833]],
  },
  Munkie: {
    image: person2Map,
    waypoints: [[185,800],[225,770],[258,735],[230,655],[253,610],[258,517],[253,430],[305,355],[388,255],[468,152]],
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
  const [debugCoords, setDebugCoords] = useState(null);
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

  const handleMapClick = (e) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * MAP_WIDTH);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * MAP_HEIGHT);
    setDebugCoords([x, y]);
    console.log(`[${x}, ${y}]`);
  };

  const active = tracked.find((t) => t.sender === me) || tracked.find((t) => t.receiver === me);
  const activeSender = active ? active.sender : null;
  const mapConfig = activeSender ? MAPS[activeSender] : MAPS[me]; // fallback to viewer's own map when idle

  const progress = active ? active.progress : 0;
  const phase = active ? active.phase : null;
  const [duckX, duckY] = mapConfig ? getPointAlongPath(mapConfig.waypoints, progress) : [0, 0];

  const duckLeftPct = (duckX / MAP_WIDTH) * 100;
  const duckTopPct = (duckY / MAP_HEIGHT) * 100;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {phase === "in_transit" && (
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 10,
          background: "#8fe388", border: "2px solid #333", borderRadius: 6,
          padding: "6px 14px", fontWeight: "bold",
        }}>
          Picked Up
        </div>
      )}

      <div
        ref={mapRef}
        onClick={handleMapClick}
        style={{ position: "relative", width: "100%", height: "100%", cursor: "crosshair" }}
      >
        {mapConfig && (
          <img src={mapConfig.image} alt="Delivery route" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
        )}

        {active && (
          <div
            style={{
              position: "absolute",
              left: `${duckLeftPct}%`,
              top: `${duckTopPct}%`,
              fontSize: 28,
              transform: "translate(-50%, -50%)",
              transition: "left 1s linear, top 1s linear",
            }}
          >
            🦆
          </div>
        )}
      </div>

      {debugCoords && (
        <p style={{ position: "absolute", bottom: 0, left: 0, fontSize: 11, background: "#fff", padding: 4 }}>
          Last clicked: [{debugCoords[0]}, {debugCoords[1]}]
        </p>
      )}
    </div>
  );
}

export default MapPanel;