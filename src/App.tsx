import { useEffect, useRef, useState } from "react";
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

const VIEWS: { value: View; label: string }[] = [
  { value: "speaker", label: "Speaker" },
  { value: "confirmation", label: "Confirmation" },
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

  return (
    <>
      {view === "speaker" ? <SpeakerCard /> : view === "confirmation" ? <ConfirmationCard /> : view === "billboard" ? <BillboardCard /> : view === "billboard2" ? <BillboardCard2 /> : view === "billboard25" ? <BillboardCard25 /> : view === "billboard3" ? <BillboardCard3 /> : view === "billboard35" ? <BillboardCard35 /> : view === "billboard37" ? <BillboardCard37 /> : <BillboardCard4 />}

      <div ref={menuRef} style={menuContainerStyle}>
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
      </div>
    </>
  );
}

const menuContainerStyle: React.CSSProperties = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 30,
};

const triggerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 16px",
  fontFamily: "'Martian Mono', monospace",
  fontSize: 11,
  fontWeight: 500,
  background: "rgba(24,24,24,0.95)",
  backdropFilter: "blur(12px)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  cursor: "pointer",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
};

const iconStyle: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1,
  width: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const triggerLabelStyle: React.CSSProperties = {
  whiteSpace: "nowrap",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  minWidth: 180,
  background: "rgba(24,24,24,0.96)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: 6,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
};

const itemStyle: React.CSSProperties = {
  padding: "9px 12px",
  fontFamily: "'Martian Mono', monospace",
  fontSize: 11,
  fontWeight: 400,
  background: "transparent",
  color: "#aaa",
  border: "none",
  borderRadius: 6,
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
