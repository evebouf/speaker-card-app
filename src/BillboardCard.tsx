import React, { useCallback, useEffect, useRef, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import SUS2026ConfirmationCard, { DEFAULT_GLASS_PARAMS, DEFAULT_HALFTONE_PARAMS } from "./SUS2026ConfirmationCard";

const WIDTH = 2280;
const HEIGHT = 1050;
const PAD = 60;

export default function BillboardCard() {
  const grainRef = useRef<HTMLCanvasElement>(null);
  const meshParentRef = useRef<HTMLDivElement>(null);
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

  const readMeshGradient = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const glCanvas = meshParentRef.current?.querySelector("canvas");
    if (!glCanvas) return;
    ctx.drawImage(glCanvas, 0, 0, w, h);
  }, []);

  const handleDownloadJpeg = useCallback(() => {
    const scale = 2;
    const w = WIDTH * scale;
    const h = HEIGHT * scale;
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d")!;

    readMeshGradient(ctx, w, h);

    const grain = grainRef.current;
    if (grain) {
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = "overlay";
      ctx.drawImage(grain, 0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    const pad = PAD * scale;
    ctx.fillStyle = "#4A301D";
    const cornerFs = Math.round(19 * scale);
    const heroFs = Math.round(160 * scale);

    // Corner text
    ctx.font = `400 ${cornerFs}px 'Martian Mono', monospace`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText("Y\u2009COMBINATOR PRESENTS", pad, pad);
    ctx.fillText("STARTUP SCHOOL 2026", pad, pad + cornerFs * 1.5);

    ctx.textAlign = "right";
    ctx.fillText("CHASE CENTER, SF", w - pad, pad);
    ctx.fillText("JULY 25-26", w - pad, pad + cornerFs * 1.5);

    // Hero text
    ctx.font = `400 ${heroFs}px 'Martian Mono', monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const lineH = heroFs * 1.05;
    const textTop = pad + cornerFs * 3.5;
    ctx.fillText("The future is", pad, textTop);
    ctx.fillText("built by", pad, textTop + lineH);
    ctx.fillText("people like you", pad, textTop + lineH * 2);

    const link = document.createElement("a");
    link.download = "billboard-startup-school-2026.jpg";
    link.href = out.toDataURL("image/jpeg", 0.95);
    link.click();
  }, [readMeshGradient]);

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
      }}>
        {/* Mesh gradient background */}
        <div ref={meshParentRef} style={{ position: "absolute", inset: 0 }}>
          <MeshGradient
            style={{ width: "100%", height: "100%" }}
            colors={["#FF6A00", "#FC5E10", "#FF8A30", "#FFCB8E", "#FFE4C2"]}
            distortion={0.6}
            swirl={0.3}
            grainMixer={0}
            grainOverlay={0}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            speed={shaderSpeed}
            webGlContextAttributes={{ preserveDrawingBuffer: true }}
          />
        </div>

        {/* Grain */}
        <canvas ref={grainRef} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          mixBlendMode: "overlay", opacity: 0.4, pointerEvents: "none", zIndex: 1,
        }} />

        {/* "You're in." — behind ticket */}
        <div style={{
          position: "absolute",
          top: PAD + 40,
          left: PAD,
          fontSize: 190,
          fontWeight: 800,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
          fontFamily: "'Martian Mono', monospace",
          textTransform: "uppercase",
          color: "#4A301D",
          zIndex: 2,
        }}>
          {"You\u2019re"}<br />
          in<span style={{ letterSpacing: "-0.25em" }}>.</span>
        </div>

        {/* "Make it count." — in front of ticket */}
        <div style={{
          position: "absolute",
          bottom: PAD + 10,
          right: PAD,
          textAlign: "right",
          fontSize: 190,
          fontWeight: 800,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
          fontFamily: "'Martian Mono', monospace",
          textTransform: "uppercase",
          color: "#4A301D",
          zIndex: 4,
        }}>
          Make<span style={{ letterSpacing: "-0.06em" }}> </span>it<br />
          count<span style={{ letterSpacing: "-0.25em" }}>.</span>
        </div>

        {/* Golden ticket — centered */}
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
