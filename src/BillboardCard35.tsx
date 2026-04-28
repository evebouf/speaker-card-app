import React, { useState } from "react";
import SUS2026ConfirmationCard, { DEFAULT_GLASS_PARAMS, DEFAULT_HALFTONE_PARAMS } from "./SUS2026ConfirmationCard";

const WIDTH = 2280;
const HEIGHT = 1050;

export default function BillboardCard35() {
  const [shaderSpeed, setShaderSpeed] = useState(0);

  // Wider ticket (680x280) to give more room for QR stub
  const TICKET_W = 600;
  const TICKET_H = 280;
  const ticketScale = (HEIGHT * 0.85) / TICKET_H;

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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid rgba(255,255,255,0.15)",
        background: "#2E1F15",
      }}>
        <div style={{
          width: TICKET_W,
          height: TICKET_H,
          transform: `scale(${ticketScale})`,
          transformOrigin: "center center",
        }}>
          <SUS2026ConfirmationCard
            attendeeName="Startup School 2026"
            attendeeLocation="San Francisco, CA, USA"
            eventName="Startup School 2026"
            eventDate="July 25-26"
            glassParams={DEFAULT_GLASS_PARAMS}
            halftoneParams={DEFAULT_HALFTONE_PARAMS}
            meshSpeed={shaderSpeed}
            maxWidth={TICKET_W}
            stubPct={62}
            keywordCode="FUTURE"
            maxNameSize={32}
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
