import { useEffect, useState } from "react";
import SpeakerCard from "./SpeakerCard";
import ConfirmationCard from "./ConfirmationCard";

type View = "speaker" | "confirmation";

function App() {
  const [view, setView] = useState<View>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "confirmation" ? "confirmation" : "speaker";
  });

  useEffect(() => {
    const updateScale = () => {
      const scale = Math.min(
        window.innerWidth / 1120,
        window.innerHeight / 1120
      );
      document.documentElement.style.setProperty(
        "--card-scale",
        String(Math.min(scale, 1))
      );
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const switchView = (v: View) => {
    setView(v);
    const url = new URL(window.location.href);
    if (v === "confirmation") {
      url.searchParams.set("view", "confirmation");
    } else {
      url.searchParams.delete("view");
    }
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <>
      {view === "speaker" ? <SpeakerCard /> : <ConfirmationCard />}

      {/* View tabs — bottom left */}
      <div style={tabContainerStyle}>
        <button
          onClick={() => switchView("speaker")}
          style={{
            ...tabBtnStyle,
            ...(view === "speaker" ? tabBtnActiveStyle : {}),
          }}
        >
          Speaker
        </button>
        <button
          onClick={() => switchView("confirmation")}
          style={{
            ...tabBtnStyle,
            ...(view === "confirmation" ? tabBtnActiveStyle : {}),
          }}
        >
          Confirmation
        </button>
      </div>
    </>
  );
}

const tabContainerStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 20,
  left: 20,
  display: "flex",
  gap: 6,
  zIndex: 30,
};

const tabBtnStyle: React.CSSProperties = {
  padding: "8px 14px",
  fontFamily: "'Martian Mono', monospace",
  fontSize: 11,
  fontWeight: 400,
  background: "rgba(255,255,255,0.08)",
  color: "#999",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  cursor: "pointer",
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  transition: "all 0.15s",
};

const tabBtnActiveStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  fontWeight: 600,
  borderColor: "rgba(255,255,255,0.2)",
};

export default App;
