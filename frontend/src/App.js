import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";
import ComposePage from "./pages/ComposePage";
import HistoryPage from "./pages/HistoryPage";
import MapPanel from "./components/MapPanel";

const USERS = ["Munkie", "Chandhini"];

function App() {
  const [me, setMe] = useState(() => localStorage.getItem("letterAppUser") || null);

  const chooseIdentity = (name) => {
    localStorage.setItem("letterAppUser", name);
    setMe(name);
  };

  if (!me) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center", fontFamily: "sans-serif" }}>
        <h2>Who are you?</h2>
        <p>This only needs to be set once on this device.</p>
        {USERS.map((u) => (
          <button key={u} onClick={() => chooseIdentity(u)} style={{ margin: 8, padding: "10px 20px" }}>
            {u}
          </button>
        ))}
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