import { useEffect, useState } from "react";
import SpeakerCard from "./SpeakerCard";
import ConfirmationCard from "./ConfirmationCard";
import BillboardCard from "./BillboardCard";
import BillboardCard2 from "./BillboardCard2";
import BillboardCard25 from "./BillboardCard25";
import BillboardCard3 from "./BillboardCard3";
import BillboardCard35 from "./BillboardCard35";
import BillboardCard37 from "./BillboardCard37";
import BillboardCard4 from "./BillboardCard4";

type View = "speaker" | "confirmation" | "billboard" | "billboard2" | "billboard25" | "billboard3" | "billboard35" | "billboard37" | "billboard4";

function App() {
  const [view, setView] = useState<View>(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("view");
    return v === "confirmation" ? "confirmation" : v === "billboard" ? "billboard" : v === "billboard2" ? "billboard2" : v === "billboard25" ? "billboard25" : v === "billboard3" ? "billboard3" : v === "billboard35" ? "billboard35" : v === "billboard37" ? "billboard37" : v === "billboard4" ? "billboard4" : "speaker";
  });

  useEffect(() => {
    const updateScale = () => {
      const cardScale = Math.min(window.innerWidth / 1120, window.innerHeight / 1120);
      document.documentElement.style.setProperty("--card-scale", String(Math.min(cardScale, 1)));

      const bbScale = Math.min(window.innerWidth / 2600, window.innerHeight / 1300);
      document.documentElement.style.setProperty("--billboard-scale", String(Math.min(bbScale, 1)));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const switchView = (v: View) => {
    setView(v);
    const url = new URL(window.location.href);
    if (v === "speaker") {
      url.searchParams.delete("view");
    } else {
      url.searchParams.set("view", v);
    }
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <>
      {view === "speaker" ? <SpeakerCard /> : view === "confirmation" ? <ConfirmationCard /> : view === "billboard" ? <BillboardCard /> : view === "billboard2" ? <BillboardCard2 /> : view === "billboard25" ? <BillboardCard25 /> : view === "billboard3" ? <BillboardCard3 /> : view === "billboard35" ? <BillboardCard35 /> : view === "billboard37" ? <BillboardCard37 /> : <BillboardCard4 />}

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
        <button
          onClick={() => switchView("billboard")}
          style={{
            ...tabBtnStyle,
            ...(view === "billboard" ? tabBtnActiveStyle : {}),
          }}
        >
          Billboard
        </button>
        <button
          onClick={() => switchView("billboard2")}
          style={{
            ...tabBtnStyle,
            ...(view === "billboard2" ? tabBtnActiveStyle : {}),
          }}
        >
          Billboard 2
        </button>
        <button
          onClick={() => switchView("billboard25")}
          style={{
            ...tabBtnStyle,
            ...(view === "billboard25" ? tabBtnActiveStyle : {}),
          }}
        >
          BB 2.5
        </button>
        <button
          onClick={() => switchView("billboard3")}
          style={{
            ...tabBtnStyle,
            ...(view === "billboard3" ? tabBtnActiveStyle : {}),
          }}
        >
          Billboard 3
        </button>
        <button
          onClick={() => switchView("billboard35")}
          style={{
            ...tabBtnStyle,
            ...(view === "billboard35" ? tabBtnActiveStyle : {}),
          }}
        >
          BB 3.5
        </button>
        <button
          onClick={() => switchView("billboard37")}
          style={{
            ...tabBtnStyle,
            ...(view === "billboard37" ? tabBtnActiveStyle : {}),
          }}
        >
          BB 3.7
        </button>
        <button
          onClick={() => switchView("billboard4")}
          style={{
            ...tabBtnStyle,
            ...(view === "billboard4" ? tabBtnActiveStyle : {}),
          }}
        >
          Billboard 4
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
