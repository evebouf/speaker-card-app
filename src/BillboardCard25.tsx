import React, { useEffect, useRef, useState } from "react";
import SUS2026ConfirmationCard, { DEFAULT_GLASS_PARAMS, DEFAULT_HALFTONE_PARAMS } from "./SUS2026ConfirmationCard";

const WIDTH = 2280;
const HEIGHT = 1050;
const PAD = 60;

export default function BillboardCard25() {
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
        border: "1px solid rgba(255,255,255,0.15)",
      }}>
        {/* Grain */}
        <canvas ref={grainRef} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          mixBlendMode: "overlay", opacity: 0.3, pointerEvents: "none", zIndex: 1,
        }} />

        {/* "The best builders" — upper left, behind ticket */}
        <div style={{
          position: "absolute",
          top: PAD + 20,
          left: PAD,
          fontSize: 150,
          fontWeight: 700,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
          fontFamily: "'Martian Mono', monospace",
          textTransform: "uppercase",
          color: "#F2E6D0",
          zIndex: 2,
        }}>
          The best<br />
          builders
        </div>

        {/* "In the world. In one room." — lower right, in front of ticket */}
        <div style={{
          position: "absolute",
          bottom: PAD + 10,
          right: PAD,
          textAlign: "right",
          fontSize: 150,
          fontWeight: 700,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
          fontFamily: "'Martian Mono', monospace",
          textTransform: "uppercase",
          color: "#F2E6D0",
          zIndex: 4,
        }}>
          in the world<span style={{ letterSpacing: "-0.25em" }}>.</span><br />
          In one room<span style={{ letterSpacing: "-0.25em" }}>.</span>
        </div>

        {/* Ticket — centered */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(2.1) rotate(-3deg)",
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
      </div>
    </div>
  );
}
