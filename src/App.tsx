import { useEffect, useRef, useState } from "react";
import SpeakerCard from "./SpeakerCard";
import BlankCard from "./BlankCard";
import FullScreenCard from "./FullScreenCard";
import YouTubeCard from "./YouTubeCard";
import ShortsCard from "./ShortsCard";
import GeoffCard from "./GeoffCard";
import ConfirmationWall from "./ConfirmationWall";
import ConfirmationCard from "./ConfirmationCard";
import BillboardCard from "./BillboardCard";
import BillboardCard2 from "./BillboardCard2";
import BillboardCard25 from "./BillboardCard25";
import BillboardCard3 from "./BillboardCard3";
import BillboardCard35 from "./BillboardCard35";
import BillboardCard37 from "./BillboardCard37";
import BillboardCard4 from "./BillboardCard4";

type View = "speaker" | "blank" | "fullscreen" | "youtube" | "shorts" | "geoff" | "confirmation" | "confirmation-wall" | "billboard" | "billboard2" | "billboard25" | "billboard3" | "billboard35" | "billboard37" | "billboard4";

const VIEWS: { value: View; label: string }[] = [
  { value: "speaker", label: "Speaker" },
  { value: "blank", label: "Blank" },
  { value: "fullscreen", label: "Full Screen" },
  { value: "youtube", label: "YouTube 16:9" },
  { value: "shorts", label: "Shorts 9:16" },
  { value: "geoff", label: "Geoff / Agency" },
  { value: "confirmation", label: "Confirmation" },
  { value: "confirmation-wall", label: "Confirmation Wall" },
  { value: "billboard", label: "Billboard" },
  { value: "billboard2", label: "Billboard 2" },
  { value: "billboard25", label: "BB 2.5" },
  { value: "billboard3", label: "Billboard 3" },
  { value: "billboard35", label: "BB 3.5" },
  { value: "billboard37", label: "BB 3.7" },
  { value: "billboard4", label: "Billboard 4" },
];

function App() {
  const [view, setView] = useState<View>(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("view") as View | null;
    return VIEWS.some((x) => x.value === v) ? (v as View) : "speaker";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const switchView = (v: View) => {
    setView(v);
    setMenuOpen(false);
    const url = new URL(window.location.href);
    if (v === "speaker") {
      url.searchParams.delete("view");
    } else {
      url.searchParams.set("view", v);
    }
    window.history.replaceState(null, "", url.toString());
  };

  const currentLabel = VIEWS.find((x) => x.value === view)?.label ?? "Speaker";
  const isRaw = new URLSearchParams(window.location.search).get("raw") === "1";

  return (
    <>
      {view === "speaker" ? <SpeakerCard /> : view === "blank" ? <BlankCard /> : view === "fullscreen" ? <FullScreenCard /> : view === "youtube" ? <YouTubeCard /> : view === "shorts" ? <ShortsCard /> : view === "geoff" ? <GeoffCard /> : view === "confirmation-wall" ? <ConfirmationWall /> : view === "confirmation" ? <ConfirmationCard /> : view === "billboard" ? <BillboardCard /> : view === "billboard2" ? <BillboardCard2 /> : view === "billboard25" ? <BillboardCard25 /> : view === "billboard3" ? <BillboardCard3 /> : view === "billboard35" ? <BillboardCard35 /> : view === "billboard37" ? <BillboardCard37 /> : <BillboardCard4 />}

      {!isRaw && <div ref={menuRef} style={menuContainerStyle}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={triggerStyle}
          aria-label="Switch view"
          aria-expanded={menuOpen}
        >
          <span style={iconStyle}>{menuOpen ? "×" : "☰"}</span>
          <span style={triggerLabelStyle}>{currentLabel}</span>
        </button>

        {menuOpen && (
          <div style={dropdownStyle}>
            {VIEWS.map((v) => (
              <button
                key={v.value}
                onClick={() => switchView(v.value)}
                style={{
                  ...itemStyle,
                  ...(view === v.value ? itemActiveStyle : {}),
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
      </div>}
    </>
  );
}

const menuContainerStyle: React.CSSProperties = {
  position: "fixed",
  top: 8,
  right: 8,
  zIndex: 30,
};

const triggerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "3px 6px",
  fontFamily: "'Martian Mono', monospace",
  fontSize: 6,
  fontWeight: 500,
  background: "rgba(24,24,24,0.92)",
  backdropFilter: "blur(8px)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 3,
  cursor: "pointer",
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
};

const iconStyle: React.CSSProperties = {
  fontSize: 8,
  lineHeight: 1,
  width: 8,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const triggerLabelStyle: React.CSSProperties = {
  whiteSpace: "nowrap",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 4px)",
  right: 0,
  minWidth: 130,
  background: "rgba(24,24,24,0.96)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 6,
  padding: 3,
  display: "flex",
  flexDirection: "column",
  gap: 1,
  boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
};

const itemStyle: React.CSSProperties = {
  padding: "3px 6px",
  fontFamily: "'Martian Mono', monospace",
  fontSize: 7,
  fontWeight: 400,
  background: "transparent",
  color: "#aaa",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  textAlign: "left",
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  transition: "background 0.1s, color 0.1s",
};

const itemActiveStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  fontWeight: 600,
};

export default App;
