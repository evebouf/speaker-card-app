import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MeshGradient, FlutedGlass } from "@paper-design/shaders-react";
import InteractiveCard from "./InteractiveCard";
import "./fonts.css";

export interface FlutedGlassParams {
  size: number;
  shadows: number;
  highlights: number;
  angle: number;
  distortion: number;
  shift: number;
  stretch: number;
  blur: number;
  edges: number;
  margin: number;
  grainMixer: number;
  grainOverlay: number;
  shape: "lines" | "pattern" | "wave" | "linesIrregular" | "zigzag";
  distortionShape: "prism" | "lens" | "contour" | "cascade";
}

export const DEFAULT_GLASS_PARAMS: FlutedGlassParams = {
  size: 0.86,
  shadows: 0,
  highlights: 0,
  angle: 0,
  distortion: 0.39,
  shift: 0,
  stretch: 0,
  blur: 0,
  edges: 0.25,
  margin: 0,
  grainMixer: 0,
  grainOverlay: 0,
  shape: "lines",
  distortionShape: "prism",
};

// Keep HalftoneParams export for backwards compat with ConfirmationCard.tsx props
export interface HalftoneParams {
  size: number;
  gridNoise: number;
  type: "dots" | "ink" | "sharp";
  softness: number;
  contrast: number;
  gainC: number;
  gainM: number;
  gainY: number;
  gainK: number;
  floodC: number;
  floodM: number;
  floodY: number;
  floodK: number;
  grainMixer: number;
  grainSize: number;
  grainOverlay: number;
}

export const DEFAULT_HALFTONE_PARAMS: HalftoneParams = {
  size: 0.49,
  gridNoise: 0,
  type: "ink",
  softness: 1,
  contrast: 2,
  gainC: 1,
  gainM: -0.64,
  gainY: -0.77,
  gainK: -1,
  floodC: 0,
  floodM: 0.15,
  floodY: 0,
  floodK: 0,
  grainMixer: 0,
  grainSize: 0.17,
  grainOverlay: 0,
};

interface SUS2026ConfirmationCardProps {
  attendeeName: string;
  attendeeLocation?: string | null;
  eventName: string;
  eventDate: string;
  glassParams?: FlutedGlassParams;
  halftoneParams?: HalftoneParams;
}

const FONT = "'Martian Mono', 'Geist Mono', 'Space Mono', monospace";
const MAX_NAME_SIZE = 28;
const MIN_NAME_SIZE = 12;
const TEXT_COLOR = "#4A301D";

const AutoSizeName: React.FC<{ name: string }> = ({ name }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wordSizes, setWordSizes] = useState<number[]>([]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const words = name.toUpperCase().split(" ");
    const sizes = words.map((word) => {
      let size = MAX_NAME_SIZE;
      while (size > MIN_NAME_SIZE) {
        ctx.font = `500 ${size}px ${FONT}`;
        ctx.letterSpacing = `${0.02 * size}px`;
        if (ctx.measureText(word).width <= containerWidth) break;
        size -= 1;
      }
      return size;
    });

    setWordSizes(sizes);
  }, [name]);

  const words = name.toUpperCase().split(" ");

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        columnGap: 8,
        rowGap: 4,
      }}
    >
      {words.map((word, i) => {
        const size = wordSizes[i] ?? MAX_NAME_SIZE;
        return (
          <span
            key={`${word}-${i}`}
            style={{
              fontFamily: FONT,
              fontSize: `${size}px`,
              fontWeight: 400,
              textTransform: "uppercase",
              lineHeight: 1.1,
              letterSpacing: "0.04em",
              color: TEXT_COLOR,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

function drawGrain(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

export const SUS2026ConfirmationCard: React.FC<
  SUS2026ConfirmationCardProps
> = ({
  attendeeName,
  attendeeLocation,
  eventName,
  eventDate,
  glassParams = DEFAULT_GLASS_PARAMS,
}) => {
  const grainRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef({ offsetX: 0.15, offsetY: -0.21, glassScale: 2.2 });
  const [, forceUpdate] = useState(0);

  // Grain texture
  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;
    canvas.width = 800;
    canvas.height = 400;
    drawGrain(canvas);
  }, []);

  // Animate FlutedGlass shader offsets
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    let lastUpdate = 0;
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      animRef.current.offsetY = -0.21 + Math.sin(t * 0.5) * 0.2;
      animRef.current.offsetX = 0.15 + Math.cos(t * 0.35) * 0.15;
      animRef.current.glassScale = 2.2 + Math.sin(t * 0.3) * 0.3;
      if (now - lastUpdate > 33) {
        lastUpdate = now;
        forceUpdate((n) => n + 1);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Ticket mask — same shape as before
  const CORNER_NOTCH = 16;
  const PERF_NOTCH = 14;
  const STUB_PCT = 76;

  const gradients = [
    `radial-gradient(circle ${CORNER_NOTCH}px at 0 0, transparent 99%, black 100%)`,
    `radial-gradient(circle ${CORNER_NOTCH}px at 100% 0, transparent 99%, black 100%)`,
    `radial-gradient(circle ${CORNER_NOTCH}px at 0 100%, transparent 99%, black 100%)`,
    `radial-gradient(circle ${CORNER_NOTCH}px at 100% 100%, transparent 99%, black 100%)`,
    `radial-gradient(circle ${PERF_NOTCH}px at ${STUB_PCT}% 0, transparent 99%, black 100%)`,
    `radial-gradient(circle ${PERF_NOTCH}px at ${STUB_PCT}% 100%, transparent 99%, black 100%)`,
  ].join(", ");

  const ticketMaskStyle: React.CSSProperties = {
    WebkitMaskImage: gradients,
    WebkitMaskComposite: "destination-in",
    maskImage: gradients,
    maskComposite: "intersect" as React.CSSProperties["maskComposite"],
  };

  const { offsetX, offsetY, glassScale } = animRef.current;

  const MESH_COLORS = ["#FF6A00", "#FC5E10", "#FF8A30", "#FFCB8E", "#FFE4C2"];

  return (
    <InteractiveCard maskStyle={ticketMaskStyle}>
      <div
        style={{
          fontFamily: FONT,
          position: "relative",
          display: "flex",
          minHeight: 280,
          width: "100%",
          maxWidth: 520,
          flexDirection: "row",
          alignItems: "stretch",
          overflow: "hidden",
          border: 0,
          padding: 12,
        }}
      >
        {/* Layer 0: Full-bleed MeshGradient (from speaker card) */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <MeshGradient
            style={{ width: "100%", height: "100%" }}
            colors={MESH_COLORS}
            distortion={0.6}
            swirl={0.3}
            speed={1.8}
            grainMixer={0}
            grainOverlay={0}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            webGlContextAttributes={{ preserveDrawingBuffer: true }}
          />
        </div>

        {/* Layer 1: Grain overlay (from speaker card) */}
        <canvas
          ref={grainRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            mixBlendMode: "overlay",
            opacity: 0.4,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Left text section */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 24,
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                lineHeight: 1.5,
                color: TEXT_COLOR,
              }}
            >
              {eventName}
            </div>
            <div
              style={{
                fontFamily: FONT,
                marginTop: 2,
                fontSize: 11,
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                lineHeight: 1.5,
                color: TEXT_COLOR,
              }}
            >
              You're confirmed
            </div>
          </div>

          <div style={{ position: "relative", margin: "16px 0" }}>
            <AutoSizeName name={attendeeName} />
            {attendeeLocation && (
              <div
                style={{
                  fontFamily: FONT,
                  marginTop: 8,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  lineHeight: 1.5,
                  color: TEXT_COLOR,
                }}
              >
                From: {attendeeLocation}
              </div>
            )}
          </div>

          <div
            style={{
              fontFamily: FONT,
              position: "relative",
              whiteSpace: "nowrap",
              fontSize: 11,
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 1.5,
              color: TEXT_COLOR,
            }}
          >
            Chase Center, SF · {eventDate}
          </div>
        </div>

        {/* Ticket perforation line */}
        <div
          style={{
            position: "absolute",
            top: PERF_NOTCH + 4,
            bottom: PERF_NOTCH + 4,
            left: `${STUB_PCT}%`,
            zIndex: 5,
            borderLeft: "1.5px dashed rgba(74, 48, 29, 0.2)",
          }}
        />

        {/* Right stub — FlutedGlass shader (kept from original) */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            margin: "-12px -12px -12px 0",
            width: "38%",
            flexShrink: 0,
            overflow: "hidden",
            borderRadius: "0 13px 13px 0",
          }}
        >
          {/* 2026 watermark */}
          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              zIndex: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              opacity: 0.15,
              mixBlendMode: "overlay",
              fontFamily: FONT,
              fontSize: 90,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.05em",
              lineHeight: 1,
              writingMode: "vertical-rl",
            }}
          >
            2026
          </div>
          {/* FlutedGlass — distorts the MeshGradient underneath */}
          <div style={{ position: "absolute", inset: -2 }}>
            <FlutedGlass
              width="100%"
              height="100%"
              colorBack="#00000000"
              colorShadow="#000000"
              colorHighlight="#ffffff"
              size={glassParams.size}
              shadows={glassParams.shadows}
              highlights={glassParams.highlights}
              shape={glassParams.shape}
              angle={glassParams.angle}
              distortionShape={glassParams.distortionShape}
              distortion={glassParams.distortion}
              shift={glassParams.shift}
              stretch={glassParams.stretch}
              blur={glassParams.blur}
              edges={glassParams.edges}
              margin={glassParams.margin}
              grainMixer={glassParams.grainMixer}
              grainOverlay={glassParams.grainOverlay}
              offsetX={offsetX}
              offsetY={offsetY}
              scale={glassScale}
              fit="cover"
            />
          </div>
        </div>

        {/* Presented by — rotated along right edge */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 6,
            top: 0,
            zIndex: 6,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              whiteSpace: "nowrap",
              fontSize: 9,
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 1.5,
              color: "rgba(74, 48, 29, 0.7)",
              writingMode: "vertical-rl",
            }}
          >
            Presented by Y Combinator
          </div>
        </div>
      </div>
    </InteractiveCard>
  );
};

export default SUS2026ConfirmationCard;
