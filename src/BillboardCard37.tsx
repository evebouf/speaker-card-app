import React, { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import SUS2026ConfirmationCard, { DEFAULT_GLASS_PARAMS, DEFAULT_HALFTONE_PARAMS } from "./SUS2026ConfirmationCard";

const WIDTH = 2280;
const HEIGHT = 1050;

export default function BillboardCard37() {
  const [shaderSpeed, setShaderSpeed] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const billboardRef = useRef<HTMLDivElement>(null);

  const TICKET_W = 670;
  const TICKET_H = 280;
  const ticketScale = (HEIGHT * 0.75) / TICKET_H;

  const handleDownload = useCallback(async () => {
    if (!billboardRef.current || downloading) return;
    setDownloading(true);
    try {
      // Remove the CSS variable scale transform and render at full size
      const el = billboardRef.current;
      const origTransform = el.style.transform;
      el.style.transform = "none";

      const dataUrl = await toPng(el, {
        width: WIDTH,
        height: HEIGHT,
        pixelRatio: 2, // 2x = 4560x2100
        cacheBust: true,
        quality: 0.9,
      });

      el.style.transform = origTransform;

      const link = document.createElement("a");
      link.download = "billboard-3.7-highres.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  return (
    <div style={{
      background: "#0D0D0D",
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <div
        ref={billboardRef}
        style={{
          width: WIDTH,
          height: HEIGHT,
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          transform: `scale(var(--billboard-scale, 0.4))`,
          transformOrigin: "center center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "#2E1F15",
        }}>
        {/* 3D perspective container */}
        <div style={{
          perspective: 1800,
          transformStyle: "preserve-3d",
        }}>
          <div style={{
            width: TICKET_W,
            height: TICKET_H,
            transform: `scale(${ticketScale}) rotateY(-6deg) rotateX(3deg)`,
            transformOrigin: "center center",
            transformStyle: "preserve-3d",
          }}>
            <SUS2026ConfirmationCard
              attendeeName="Startup School 2026"
              eventName="Startup School 2026"
              eventDate="July 25-26"
              glassParams={DEFAULT_GLASS_PARAMS}
              halftoneParams={DEFAULT_HALFTONE_PARAMS}
              meshSpeed={shaderSpeed}
              maxWidth={TICKET_W}
              stubPct={70}
              keywordCode="FUTURE"
              quote={<>The best builders{"\n"}in the worl<span style={{letterSpacing:"-0.15em"}}>d,</span>{"\n"}in one roo<span style={{letterSpacing:"-0.15em"}}>m.</span></>}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 30, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={handleDownload} style={{
          padding: "8px 14px",
          fontFamily: "'Martian Mono', monospace",
          fontSize: 11,
          fontWeight: 400,
          background: downloading ? "rgba(255,106,0,0.2)" : "rgba(255,255,255,0.08)",
          color: downloading ? "#FF6A00" : "#999",
          border: `1px solid ${downloading ? "rgba(255,106,0,0.3)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 6,
          cursor: downloading ? "wait" : "pointer",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}>
          {downloading ? "Exporting..." : "Download 2x"}
        </button>
        <button onClick={() => setShaderSpeed(shaderSpeed > 0 ? 0 : 1.8)} style={{
          padding: "8px 14px",
          fontFamily: "'Martian Mono', monospace",
          fontSize: 11,
          fontWeight: 400,
          background: shaderSpeed > 0 ? "rgba(255,106,0,0.2)" : "rgba(255,255,255,0.08)",
          color: shaderSpeed > 0 ? "#FF6A00" : "#999",
          border: `1px solid ${shaderSpeed > 0 ? "rgba(255,106,0,0.3)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 6,
          cursor: "pointer",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}>
          {shaderSpeed > 0 ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}
