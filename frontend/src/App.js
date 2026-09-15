import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";
import ComposePage from "./pages/ComposePage";
import HistoryPage from "./pages/HistoryPage";
import MapPanel from "./components/MapPanel";
import mailmanDuck from "./assets/Mail_Man_Duck.png";
import mailbox from "./assets/Mail_Box.png";   
import topRowDuck from "./assets/TopRow_Duck.png";
import topRowSunflower from "./assets/TopRow_Sunflower.png";  

const USERS = ["Munkie", "Chandhini"];

function App() {
  const [me, setMe] = useState(() => localStorage.getItem("letterAppUser") || null);

  const chooseIdentity = (name) => {
    localStorage.setItem("letterAppUser", name);
    setMe(name);
  };

if (!me) {
  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        background: "#f0eee9",
        fontFamily: "Minecraft, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Decorative top row */}
      <div style={{ position: "absolute", top: 30, left: 40, display: "flex", gap: 6 }}>
  {[...Array(5)].map((_, i) => (
    <img key={i} src={topRowDuck} alt="duck" style={{ height: 28, imageRendering: "pixelated" }} />
  ))}
</div>
<div style={{ position: "absolute", top: 30, right: 40, display: "flex", gap: 6 }}>
  {[...Array(5)].map((_, i) => (
    <img key={i} src={topRowSunflower} alt="sunflower" style={{ height: 32, imageRendering: "pixelated" }} />
  ))}
</div>

      {/* Main bordered card */}
      <div
        style={{
          position: "absolute",
          top: 75,
          left: 145,
          right: 145,
          bottom: 90,
          border: "3px solid #222",
          borderRadius: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ fontSize: 70, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
          <span role="img" aria-label="duck" style={{ fontSize: 60 }}>🦆</span>
          <span style={{ color: "#e8b84b" }}>UCK</span>
          <span style={{ color: "#111" }}>MAIL</span>
        </h1>

        <p style={{ marginTop: 40, marginBottom: 16, fontSize: 16 }}>Log in as:</p>

        <div style={{ display: "flex", gap: 24 }}>
          {USERS.map((u) => (
            <button
              key={u}
              onClick={() => chooseIdentity(u)}
              style={{
                fontFamily: "Minecraft, sans-serif",
                fontSize: 15,
                padding: "10px 26px",
                background: "#f0c14b",
                border: "2px solid #d98c2b",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Connecting line from card down to mailman/mailbox */}
      <div style={{ position: "absolute", bottom: 60, left: 145, width: 2, height: 30, background: "#222" }} />
      <div style={{ position: "absolute", bottom: 60, right: 145, width: 2, height: 30, background: "#222" }} />
      <div style={{ position: "absolute", bottom: 60, left: 145, right: 145, height: 2, background: "#222" }} />

      {/* Mailman duck */}
      <img
        src={mailmanDuck}
        alt="Mailman duck"
        style={{ position: "absolute", bottom: 24, left: 40, height: 90, imageRendering: "pixelated" }}
      />

      {/* Mailbox */}
      <img
        src={mailbox}
        alt="Mailbox"
        style={{ position: "absolute", bottom: 24, right: 60, height: 100, imageRendering: "pixelated" }}
      />

      {/* Grass strip */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 24,
          background: "repeating-linear-gradient(90deg, #7cb35c 0px, #7cb35c 10px, #8fc96f 10px, #8fc96f 20px)",
          borderTop: "3px solid #5a8a3c",
        }}
      />
    </div>
  );
}

  const other = USERS.find((u) => u !== me);

  return (
    <BrowserRouter>
      <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
        {/* LEFT SIDE */}
        <div style={{ width: "50%", height: "100%", display: "flex", flexDirection: "column", background: "#f0eee9" }}>
          <nav style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 24px", borderBottom: "2px solid #333",
          }}>
            <span style={{ fontWeight: "bold" }}>
              <span style={{ color: "#e8b84b" }}>DUCK</span>MAIL
            </span>
            <div style={{ display: "flex", gap: 20 }}>
              <NavLink to="/" end style={({ isActive }) => ({ textDecoration: isActive ? "underline" : "none" })}>
                Typewriter
              </NavLink>
              <NavLink to="/history" style={({ isActive }) => ({ textDecoration: isActive ? "underline" : "none" })}>
                History
              </NavLink>
            </div>
          </nav>

          <div style={{ flex: 1, overflow: "auto" }}>
            <Routes>
              <Route path="/" element={<ComposePage me={me} other={other} />} />
              <Route path="/history" element={<HistoryPage me={me} />} />
            </Routes>
          </div>
        </div>

        {/* RIGHT SIDE - always the map */}
        <div style={{ width: "50%", height: "100%" }}>
          <MapPanel me={me} />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;