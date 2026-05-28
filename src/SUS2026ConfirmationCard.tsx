import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MeshGradient, FlutedGlass } from "@paper-design/shaders-react";
import InteractiveCard from "./InteractiveCard";
import qrCodeSvg from "./assets/qr-code.svg";
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
  layout?: 1 | 2;
  maxWidth?: number;
  meshSpeed?: number;
  singleLineLocation?: boolean;
  keywordCode?: string;
  stubPct?: number;
  maxNameSize?: number;
  quote?: React.ReactNode;
  /** Replace WebGL shaders with a static CSS gradient (use when tiling many tickets). */
  staticBackground?: boolean;
  /** Override the default static gradient CSS — only used when staticBackground is true. */
  staticGradient?: string;
  /** A captured image (data URL) of the actual shader background. Takes precedence over staticGradient when set. */
  staticBackgroundImage?: string;
  /** Background-position string for the staticBackgroundImage (e.g. "30% 60%"). */
  staticBackgroundPosition?: string;
}

const FONT = "'Martian Mono', 'Geist Mono', 'Space Mono', monospace";
const MAX_NAME_SIZE = 30;
const MIN_NAME_SIZE = 16;
const TEXT_COLOR = "#3A2414";

const AutoSizeName: React.FC<{ name: string; maxSize?: number }> = ({ name, maxSize = MAX_NAME_SIZE }) => {
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
      let size = maxSize;
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
        const size = wordSizes[i] ?? maxSize;
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
  layout = 2,
  maxWidth: maxWidthProp = 520,
  meshSpeed: meshSpeedProp = 1.8,
  singleLineLocation = false,
  keywordCode,
  stubPct = 76,
  maxNameSize,
  quote,
  staticBackground = false,
  staticGradient,
  staticBackgroundImage,
  staticBackgroundPosition,
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

  // Animate FlutedGlass shader offsets (only when mesh is animating)
  useEffect(() => {
    if (meshSpeedProp === 0) return;
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
  }, [meshSpeedProp]);

  // Ticket shape constants
  const CN = 22; // corner notch radius
  const PN = 20; // perforation notch radius
  const stubWidth = `${Math.round(114 - stubPct)}%`;

  const gradients = [
    `radial-gradient(circle ${CN}px at 0 0, transparent 100%, black 100%)`,
    `radial-gradient(circle ${CN}px at 100% 0, transparent 100%, black 100%)`,
    `radial-gradient(circle ${CN}px at 0 100%, transparent 100%, black 100%)`,
    `radial-gradient(circle ${CN}px at 100% 100%, transparent 100%, black 100%)`,
    `radial-gradient(circle ${PN}px at ${stubPct}% 0, transparent 100%, black 100%)`,
    `radial-gradient(circle ${PN}px at ${stubPct}% 100%, transparent 100%, black 100%)`,
  ].join(", ");

  const ticketMaskStyle: React.CSSProperties = {
    WebkitMaskImage: gradients,
    WebkitMaskComposite: "destination-in",
    maskImage: gradients,
    maskComposite: "intersect" as React.CSSProperties["maskComposite"],
    boxShadow: "none",
  };

  const { offsetX, offsetY, glassScale } = animRef.current;

  const MESH_COLORS = ["#FF6A00", "#FC5E10", "#FF8A30", "#FFCB8E", "#FFE4C2"];

  return (
    <InteractiveCard maskStyle={ticketMaskStyle} rotateDepth={meshSpeedProp === 0 ? 0 : 8} translateDepth={meshSpeedProp === 0 ? 0 : 8}>
      <div
        style={{
          fontFamily: FONT,
          position: "relative",
          display: "flex",
          minHeight: 280,
          width: "100%",
          maxWidth: maxWidthProp,
          flexDirection: "row",
          alignItems: "stretch",
          overflow: "hidden",
          border: 0,
          padding: 12,
        }}
      >
        {/* Layer 0: Full-bleed MeshGradient (or CSS fallback when staticBackground) */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {staticBackground ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                ...(staticBackgroundImage
                  ? {
                      backgroundImage: `url(${staticBackgroundImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: staticBackgroundPosition ?? "50% 50%",
                    }
                  : {
                      background:
                        staticGradient ??
                        "radial-gradient(ellipse at 70% 50%, #FF6A00 0%, #FC5E10 22%, #FF8A30 45%, #FFCB8E 72%, #FFE4C2 100%)",
                    }),
              }}
            />
          ) : (
            <MeshGradient
              style={{ width: "100%", height: "100%" }}
              colors={MESH_COLORS}
              distortion={0.6}
              swirl={0.3}
              speed={meshSpeedProp}
              grainMixer={0}
              grainOverlay={0}
              scale={1}
              rotation={0}
              offsetX={0}
              offsetY={0}
              webGlContextAttributes={{ preserveDrawingBuffer: true }}
            />
          )}
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
            padding: quote ? "16px 8px 16px 28px" : layout === 1 ? 24 : "20px 24px",
          }}
        >
          {quote ? (
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              flex: 1,
            }}>
              <div style={{
                fontFamily: FONT,
                fontSize: 30,
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "-0.04em",
                lineHeight: 1.25,
                color: TEXT_COLOR,
                whiteSpace: "pre-line",
              }}>
                {quote}
              </div>
            </div>
          ) : layout === 1 ? (
            <>
              <div style={{ position: "relative" }}>
                <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.5, color: TEXT_COLOR }}>
                  {eventName}
                </div>
                <div style={{ fontFamily: FONT, marginTop: 2, fontSize: 11, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.5, color: TEXT_COLOR }}>
                  You're confirmed
                </div>
              </div>
              <div style={{ position: "relative", margin: "16px 0" }}>
                <AutoSizeName name={attendeeName} maxSize={maxNameSize} />
                {attendeeLocation && (
                  <div style={{ fontFamily: FONT, marginTop: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.5, color: TEXT_COLOR }}>
                    From: {attendeeLocation}
                  </div>
                )}
              </div>
              <div style={{ fontFamily: FONT, position: "relative", whiteSpace: "nowrap", fontSize: 11, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.5, color: TEXT_COLOR }}>
                Chase Center, SF · {eventDate}
              </div>
            </>
          ) : (
            <>
              <div style={{ position: "relative" }}>
                <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.4, color: TEXT_COLOR, opacity: 1 }}>
                  {"Y\u2009Combinator Presents"}
                </div>
              </div>
              <div style={{ position: "relative", margin: "12px 0" }}>
                <AutoSizeName name={attendeeName} maxSize={maxNameSize} />
              </div>
              <div style={{ fontFamily: FONT, position: "relative", fontSize: 15, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 1.4, color: TEXT_COLOR, opacity: 1, whiteSpace: "nowrap" }}>
                Chase Center {"\u00b7"} {eventDate}
              </div>
            </>
          )}
        </div>

        {/* Ticket perforation line */}
        <div
          style={{
            position: "absolute",
            top: PN + 4,
            bottom: PN + 4,
            left: `${stubPct}%`,
            zIndex: 5,
            borderLeft: "4px dashed rgba(58, 36, 20, 0.65)",
          }}
        />

        {/* Stub overlay — keyword code or ADMIT ONE */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${stubPct}%`,
            right: 0,
            zIndex: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {keywordCode ? (
            <>
              {/* QR code display */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={qrCodeSvg}
                  alt="QR code"
                  width={150}
                  height={150}
                  style={{ display: "block" }}
                />
              </div>
            </>
          ) : (
            <>
              {/* "ADMIT ONE" — foreground */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.4,
                  fontFamily: FONT,
                  color: "#4A301D",
                  writingMode: "vertical-rl",
                  fontSize: 40,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                ADMIT{"\u202F"}ONE
              </div>
              {/* "2026" — background with blend mode */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.15,
                  mixBlendMode: "overlay",
                  fontFamily: FONT,
                  color: "#ffffff",
                  writingMode: "vertical-rl",
                  fontSize: 90,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  lineHeight: 1,
                }}
              >
                2026
              </div>
            </>
          )}
        </div>

        {/* Right stub — FlutedGlass shader (hidden when keyword code shown) */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            margin: "-12px -12px -12px 0",
            width: stubWidth,
            flexShrink: 0,
            overflow: "hidden",
            borderRadius: "0 13px 13px 0",
          }}
        >
          {!keywordCode && staticBackground && (
            /* Static CSS fallback: subtle vertical ridges to hint at the fluted glass look */
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 10px), repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 5px, rgba(0,0,0,0.04) 6px, transparent 6px, transparent 10px)",
                pointerEvents: "none",
                mixBlendMode: "soft-light",
              }}
            />
          )}
          {!keywordCode && !staticBackground && (
            /* FlutedGlass — distorts the MeshGradient underneath */
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
          )}
        </div>

      </div>
    </InteractiveCard>
  );
};

export default SUS2026ConfirmationCard;
