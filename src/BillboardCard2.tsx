import React, { useCallback, useEffect, useRef, useState } from "react";
import SUS2026ConfirmationCard, { DEFAULT_GLASS_PARAMS, DEFAULT_HALFTONE_PARAMS } from "./SUS2026ConfirmationCard";

const WIDTH = 2280;
const HEIGHT = 1050;
const PAD = 60;

export default function BillboardCard2() {
  const grainRef = useRef<HTMLCanvasElement>(null);
  const [shaderSpeed, setShaderSpeed] = useState(0);

  useEffect(() => {
    const c = grainRef.current;
    if (!c) return;
    c.width = WIDTH;
    c.height = HEIGHT;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const d = ctx.createImageData(WIDTH, HEIGHT);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255;
      d.data[i] = v; d.data[i + 1] = v; d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    ctx.putImageData(d, 0, 0);
  }, []);

  const handleDownloadJpeg = useCallback(() => {
    const scale = 2;
    const w = WIDTH * scale;
    const h = HEIGHT * scale;
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#2E1F15";
    ctx.fillRect(0, 0, w, h);

    const link = document.createElement("a");
    link.download = "billboard-2-startup-school-2026.jpg";
    link.href = out.toDataURL("image/jpeg", 0.95);
    link.click();
  }, []);

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
      <div style={{
        width: WIDTH,
        height: HEIGHT,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        transform: `scale(var(--billboard-scale, 0.4))`,
        transformOrigin: "center center",
        background: "#2E1F15",
      }}>
        {/* Grain */}
        <canvas ref={grainRef} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          mixBlendMode: "overlay", opacity: 0.3, pointerEvents: "none", zIndex: 1,
        }} />

        {/* Left half: ticket */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: PAD + 280,
          transform: "translateY(-50%) rotate(-3deg) scale(1.8)",
          transformOrigin: "center center",
          zIndex: 3,
          width: 520,
          height: 280,
        }}>
          <SUS2026ConfirmationCard
            attendeeName="Startup School 2026"
            attendeeLocation="San Francisco, CA, USA"
            eventName="Startup School 2026"
            eventDate="July 25-26"
            glassParams={DEFAULT_GLASS_PARAMS}
            halftoneParams={DEFAULT_HALFTONE_PARAMS}
            meshSpeed={shaderSpeed}
          />
        </div>

        {/* Right half: text — left-aligned, staggered */}
        <div style={{
          position: "absolute",
          top: PAD,
          left: "48%",
          bottom: PAD,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          fontFamily: "'Martian Mono', monospace",
          textTransform: "uppercase",
          color: "#F2E6D0",
          zIndex: 2,
        }}>
          <div style={{
            fontSize: 100,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            wordSpacing: "-0.15em",
            whiteSpace: "nowrap",
          }}>
            <div>The best builders</div>
            <div>in the world<span style={{ letterSpacing: "-0.2em" }}>.</span></div>
            <div>In one room<span style={{ letterSpacing: "-0.2em" }}>.</span></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 30, display: "flex", alignItems: "center", gap: 12 }}>
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
        <button onClick={handleDownloadJpeg} style={{
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
        }}>
          Download JPEG
        </button>
      </div>
    </div>
  );
}
