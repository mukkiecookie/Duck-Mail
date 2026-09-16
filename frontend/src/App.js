import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ComposePage from "./pages/ComposePage";
import HistoryPage from "./pages/HistoryPage";
import MapPanel from "./components/MapPanel";
import mailbox from "./assets/Mail_Box.png";
import topRowDuck from "./assets/TopRow_Duck.svg";
import topRowSunflower from "./assets/TopRow_Sunflower.svg";
import grassTile from "./assets/Grass.svg";
import yellowButton from "./assets/Yellow_Button.svg";

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

  const [blinking, setBlinking] = useState(false);
  const svgRef = useRef(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  const [walkProgress, setWalkProgress] = useState(0);
  const [walkFrame, setWalkFrame] = useState(0);
  const [isReturning, setIsReturning] = useState(false);

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

  useEffect(() => {
    let blinkTimer;

    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      blinkTimer = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 100);
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();

    return () => clearTimeout(blinkTimer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width * 0.06;
      const eyeCenterY = rect.top + rect.height * 0.3;

      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);

      const maxOffset = 3;
      setEyeOffset({
        x: Math.cos(angle) * maxOffset,
        y: Math.sin(angle) * maxOffset,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
            <svg
              ref={svgRef}
              viewBox="0 0 940 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ height: "20vh", width: "auto" }}
            >
              <path d="M830.76 140V0H855.036V115.769H940V140H830.76Z" fill="black"/>
              <path d="M766.026 140V115.769H778.164V18.8461H766.026V0H814.577V18.8461H802.439V115.769H814.577V140H766.026Z" fill="black"/>
              <path d="M721.521 140V67.3077H660.832V140H636.557V18.8461H660.832V43.0769H721.521V18.8461H745.797V140H721.521ZM721.521 18.8461H660.832V0H721.521V18.8461Z" fill="black"/>
              <path d="M593.4 140V43.0769H569.125V67.3077H544.849V43.0769H569.125V18.8461H593.4V0H617.676V140H593.4ZM496.298 140V0H520.574V18.8461H544.849V43.0769H520.574V140H496.298Z" fill="black"/>
              <path d="M453.142 140V96.9231H474.72V140H453.142ZM388.407 140V0H409.986V53.8461H431.564V75.3846H453.142V96.9231H431.564V75.3846H409.986V140H388.407ZM431.564 53.8461V32.3077H453.142V53.8461H431.564ZM453.142 32.3077V0H474.72V32.3077H453.142Z" fill="#FFD500"/>
              <path d="M269.727 140V118.462H334.462V96.9231H366.829V118.462H345.251V140H269.727ZM269.727 118.462H248.149V21.5385H269.727V118.462ZM334.462 43.0769V21.5385H269.727V0H345.251V21.5385H366.829V43.0769H334.462Z" fill="#FFD500"/>
              <path d="M151.047 140V118.462H204.993V140H151.047ZM204.993 118.462V0H226.571V118.462H204.993ZM151.047 118.462H129.469V0H151.047V118.462Z" fill="#FFD500"/>
              <path d="M21.5782 107.692L21.5784 0H97.1022V10.7692H107.891V96.9231H97.1022V10.7692H32.3675V96.9231H97.1022L97.102 107.692H21.5782Z" fill="black"/>
              <path d="M97.1022 96.9231V10.7692H32.3675V96.9231H97.1022Z" fill="#FFD400"/>
              <path d="M0 43.077H43.1564V64.6154H0V43.077Z" fill="#FD743E"/>
              <path d="M0 53.8461H43.1564V64.6154H0V53.8461Z" fill="#ED5E25"/>

              <path
                d="M43.1564 21.5384H53.9455V43.0769H43.1564V21.5384Z"
                fill="black"
                style={{
                  transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px) scaleY(${blinking ? 0.15 : 1})`,
                  transformOrigin: "48px 32px",
                  transformBox: "fill-box",
                }}
              />

              <path
                d="M64.7346 32.3077H75.5237V53.8461H64.7346V32.3077Z"
                fill="black"
                style={{
                  transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px) scaleY(${blinking ? 0.15 : 1})`,
                  transformOrigin: "70px 43px",
                  transformBox: "fill-box",
                }}
              />

              <path d="M43.1564 107.692H53.9455V140H43.1564V107.692Z" fill="#FD743E"/>
              <path d="M64.7346 107.692H75.5237V140H64.7346V107.692Z" fill="#FD743E"/>
              <path d="M32.3673 129.231H43.1564V140H32.3673V129.231Z" fill="#FD743E"/>
              <path d="M75.5237 129.231H86.3127V140H75.5237V129.231Z" fill="#FD743E"/>
            </svg>

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
            padding: "16px 24px", borderBottom: "2px solid #333",
          }}>
            <span
              onClick={goToLogin}
              style={{ fontWeight: "bold", cursor: "pointer" }}
            >
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