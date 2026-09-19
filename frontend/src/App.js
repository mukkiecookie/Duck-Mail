import { BrowserRouter, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import ComposePage from "./pages/ComposePage";
import HistoryPage from "./pages/HistoryPage";
import MapPanel from "./components/MapPanel";
import mailbox from "./assets/Mail_Box.png";
import topRowDuck from "./assets/TopRow_Duck.svg";
import topRowSunflower from "./assets/TopRow_Sunflower.svg";
import grassTile from "./assets/Grass.svg";
import yellowButton from "./assets/Yellow_Button.svg";
import DuckMailLogo from "./components/DuckMailLogo";
import mailboxClosed from "./assets/Mail_Box_Closed.png";

import mailFrame1 from "./assets/Mail_Man_Duck_Frame_1.png";
import mailFrame2 from "./assets/Mail_Man_Duck_Frame_2.png";
import mailFrame3 from "./assets/Mail_Man_Duck_Frame_3.png";
import mailFrame4 from "./assets/Mail_Man_Duck_Frame_4.png";
import mailFrame5 from "./assets/Mail_Man_Duck_Frame_5.png";
import mailFrame6 from "./assets/Mail_Man_Duck_Frame_6.png";
import mailFrame7 from "./assets/Mail_Man_Duck_Frame_7.png";

import returnFrame1 from "./assets/Mail_Man_Duck_Return_1.png";
import returnFrame2 from "./assets/Mail_Man_Duck_Return_2.png";
import returnFrame3 from "./assets/Mail_Man_Duck_Return_3.png";
import returnFrame4 from "./assets/Mail_Man_Duck_Return_4.png";
import returnFrame5 from "./assets/Mail_Man_Duck_Return_5.png";
import returnFrame6 from "./assets/Mail_Man_Duck_Return_6.png";
import returnFrame7 from "./assets/Mail_Man_Duck_Return_7.png";

const walkFrames = [mailFrame1, mailFrame2, mailFrame3, mailFrame4, mailFrame5, mailFrame6, mailFrame7];
const returnWalkFrames = [returnFrame1, returnFrame2, returnFrame3, returnFrame4, returnFrame5, returnFrame6, returnFrame7];

const USERS = ["Mukul", "Chandhini"];

function App() {
  const [me, setMe] = useState(() => localStorage.getItem("letterAppUser") || null);

  const [walkProgress, setWalkProgress] = useState(0);
  const [walkFrame, setWalkFrame] = useState(0);
  const [isReturning, setIsReturning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const mailboxIsOpen = walkProgress >= 1;

  useEffect(() => {
    let animFrame;
    let startTime = null;
    const walkDuration = 12000;
    const pauseDuration = 1000;
    const returnDuration = 12000;
    const frameDuration = 240;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < walkDuration) {
        setIsReturning(false);
        setWalkProgress(elapsed / walkDuration);
        setWalkFrame(Math.floor(elapsed / frameDuration) % walkFrames.length);
        animFrame = requestAnimationFrame(animate);
      } else if (elapsed < walkDuration + pauseDuration) {
        setWalkProgress(1);
        setWalkFrame(0);
        animFrame = requestAnimationFrame(animate);
      } else if (elapsed < walkDuration + pauseDuration + returnDuration) {
        const returnElapsed = elapsed - walkDuration - pauseDuration;
        setIsReturning(true);
        setWalkProgress(1 - returnElapsed / returnDuration);
        setWalkFrame(Math.floor(returnElapsed / frameDuration) % returnWalkFrames.length);
        animFrame = requestAnimationFrame(animate);
      } else {
        startTime = null;
        setWalkProgress(0);
        setWalkFrame(0);
        setIsReturning(false);
        animFrame = requestAnimationFrame(animate);
      }
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const chooseIdentity = (name) => {
    localStorage.setItem("letterAppUser", name);
    setMe(name);
  };

  const goToLogin = () => {
    localStorage.removeItem("letterAppUser");
    setMe(null);
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
        {/* Top row: ducks - subtitle - sunflowers */}
        <div style={{ position: "absolute", top: "3.7vh", left: "12vw", display: "flex", gap: "0.6vw" }}>
          {[...Array(5)].map((_, i) => (
            <img
              key={i}
              src={topRowDuck}
              alt="duck"
              style={{
                height: "4.12vh",
                imageRendering: "pixelated",
                animation: `reveal${i} 3s steps(1) infinite`,
              }}
            />
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            top: "3.7vh",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "3vh",
            whiteSpace: "nowrap",
          }}
        >
          Our Personal Mailbox
        </div>

        <div style={{ position: "absolute", top: "3.7vh", right: "12vw", display: "flex", gap: "0.6vw" }}>
          {[...Array(5)].map((_, i) => (
            <img
              key={i}
              src={topRowSunflower}
              alt="sunflower"
              style={{
                height: "4.12vh",
                imageRendering: "pixelated",
                animation: `reveal${4 - i} 3s steps(1) infinite`,
              }}
            />
          ))}
        </div>

        {/* Main bordered card */}
        <div
          style={{
            position: "absolute",
            top: "9.3vh",
            left: "10vw",
            right: "10vw",
            bottom: "18vh",
            border: "4px solid #222",
            borderRadius: 30,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <DuckMailLogo height="20vh" typing={true} typeSpeed={240} />

            <p style={{ marginTop: "12vh", marginBottom: "3vh", fontSize: "3vh" }}>Log in as:</p>
            <div style={{ display: "flex", gap: "1.8vw" }}>
              {USERS.map((u) => (
                <button
                  key={u}
                  onClick={() => chooseIdentity(u)}
                  style={{
                    fontFamily: "Minecraft, sans-serif",
                    fontSize: 16,
                    width: 168,
                    height: 46,
                    border: "none",
                    background: `url(${yellowButton})`,
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
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mailman duck */}
        <img
          src={isReturning ? returnWalkFrames[walkFrame] : walkFrames[walkFrame]}
          alt="Mailman duck"
          style={{
            position: "absolute",
            bottom: "12vh",
            left: `calc(6vw + ${walkProgress} * 72vw)`,
            height: "18vh",
            imageRendering: "pixelated",
            zIndex: 2,
          }}
        />

        {/* Mailbox */}
        <img
          src={mailboxIsOpen ? mailbox : mailboxClosed}
          alt="Mailbox"
          style={{ position: "absolute", bottom: "12vh", right: "6vw", height: "18vh", imageRendering: "pixelated", zIndex: 2 }}
        />

        {/* Grass strip */}
        <img
          src={grassTile}
          alt=""
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            left: 0,
            width: "100%",
            height: "12vh",
            objectFit: "fill",
            imageRendering: "pixelated",
            display: "block",
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
            padding: "16px 24px",
            margin: "20px 24px 0",
            borderBottom: "2px solid #333",
            borderTop: "2px solid #333",
          }}>
            <span onClick={goToLogin} style={{ cursor: "pointer" }}>
              <DuckMailLogo height="18px" />
            </span>
            <div style={{ display: "flex", gap: 20 }}>
              <NavLink
                to="/"
                end
                style={{
                  color: "#000",
                  textDecoration: "none",
                  transition: "color 0.15s ease, transform 0.08s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#999")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#000")}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Typewriter
              </NavLink>
              <span
  onClick={() => setShowHistory(true)}
  style={{
    color: "#000",
    cursor: "pointer",
    transition: "color 0.15s ease, transform 0.08s ease",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.color = "#999")}
  onMouseLeave={(e) => (e.currentTarget.style.color = "#000")}
  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
>
  History
</span>
            </div>
          </nav>

          <div style={{ flex: 1, overflow: "auto" }}>
            <ComposePage me={me} other={other} />
{showHistory && <HistoryPage me={me} onClose={() => setShowHistory(false)} />}
          </div>
        </div>

        {/* RIGHT SIDE - always the map */}
        <div style={{ width: "50%", height: "100%", background: "#3381D1" }}>
          <MapPanel me={me} />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;