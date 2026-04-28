import React from "react";
import qrCodeSvg from "./assets/qr-code.svg";

const WIDTH = 2280;
const HEIGHT = 1050;
const PAD = 60;
const FONT = "'Martian Mono', 'Geist Mono', 'Space Mono', monospace";

export default function BillboardCard4() {
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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: PAD,
      }}>
        {/* Left: text */}
        <div style={{
          fontFamily: FONT,
          textTransform: "uppercase",
          color: "#F2E6D0",
          fontSize: 120,
          fontWeight: 700,
          lineHeight: 1.0,
          letterSpacing: "-0.03em",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          The best builders<br />
          in the world<span style={{ letterSpacing: "-0.2em" }}>.</span><br />
          In one room<span style={{ letterSpacing: "-0.2em" }}>.</span>
        </div>

        {/* Right: QR code */}
        <div style={{
          flexShrink: 0,
          marginLeft: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <img
            src={qrCodeSvg}
            alt="QR code"
            width={680}
            height={680}
            style={{ display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
