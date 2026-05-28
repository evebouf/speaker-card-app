import React, { useEffect, useMemo, useRef, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pageBg from "./page-bg.png";
import SUS2026ConfirmationCard, {
  DEFAULT_GLASS_PARAMS,
  DEFAULT_HALFTONE_PARAMS,
} from "./SUS2026ConfirmationCard";

const SHADER_COLORS = ["#FF6A00", "#FC5E10", "#FF8A30", "#FFCB8E", "#FFE4C2"];

const BG_COLOR = "#2E1F15";

const ATTENDEES: { name: string; location: string }[] = [
  { name: "Sarah Chen", location: "San Francisco, CA" },
  { name: "James Park", location: "New York, NY" },
  { name: "Priya Patel", location: "London, UK" },
  { name: "Marcus Reid", location: "Berlin, Germany" },
  { name: "Yuki Tanaka", location: "Tokyo, Japan" },
  { name: "Sofia García", location: "Barcelona, Spain" },
  { name: "Alex Kim", location: "Seoul, South Korea" },
  { name: "Daniel Cohen", location: "Tel Aviv, Israel" },
  { name: "Maya Sharma", location: "Bangalore, India" },
  { name: "Olivia Brown", location: "Toronto, Canada" },
  { name: "Lucas Müller", location: "Munich, Germany" },
  { name: "Aisha Khan", location: "Dubai, UAE" },
  { name: "Theo Laurent", location: "Paris, France" },
  { name: "Emma Wilson", location: "Sydney, Australia" },
  { name: "Hassan Ali", location: "Cairo, Egypt" },
  { name: "Nora Lindberg", location: "Stockholm, Sweden" },
  { name: "Carlos Mendes", location: "São Paulo, Brazil" },
  { name: "Ivan Petrov", location: "Amsterdam, Netherlands" },
  { name: "Lila Tran", location: "Singapore" },
  { name: "Felix Hoffmann", location: "Zurich, Switzerland" },
  { name: "Asha Williams", location: "Austin, TX" },
  { name: "Diego Romero", location: "Mexico City, Mexico" },
  { name: "Ingrid Larsen", location: "Oslo, Norway" },
  { name: "Ben Carter", location: "Boston, MA" },
  { name: "Sana Iqbal", location: "Karachi, Pakistan" },
  { name: "Liam O'Brien", location: "Dublin, Ireland" },
  { name: "Hana Yamamoto", location: "Osaka, Japan" },
  { name: "Noah Schmidt", location: "Vienna, Austria" },
  { name: "Anya Volkov", location: "Vancouver, Canada" },
  { name: "Mateo Silva", location: "Lisbon, Portugal" },
  { name: "Zara Ahmed", location: "Riyadh, Saudi Arabia" },
  { name: "Otto Bergström", location: "Helsinki, Finland" },
  { name: "Camila Rojas", location: "Bogotá, Colombia" },
  { name: "Kai Nakamura", location: "Hong Kong" },
  { name: "Jules Martin", location: "Montreal, Canada" },
  { name: "Riya Desai", location: "Mumbai, India" },
];

// Render a wall of tickets. Uses staticBackground to avoid WebGL context limits.
const MAX_TILES = 600;
const NATIVE_WIDTH = 520;
const NATIVE_HEIGHT = 280;
const SCALE = 0.38;
const TILE_WIDTH = NATIVE_WIDTH * SCALE;   // ~198
const TILE_HEIGHT = NATIVE_HEIGHT * SCALE; // ~106

export default function ConfirmationWall() {
  const shaderHolderRef = useRef<HTMLDivElement>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);

  // Render the WebGL shader off-screen once, capture as data URL, reuse for all tiles
  useEffect(() => {
    if (bgImage) return;
    const t = setTimeout(() => {
      const div = shaderHolderRef.current;
      if (!div) return;
      const canvas = div.querySelector("canvas") as HTMLCanvasElement | null;
      if (!canvas) return;
      try {
        setBgImage(canvas.toDataURL("image/png"));
      } catch (e) {
        console.warn("Shader capture failed", e);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [bgImage]);

  // Use a stable shuffle so the wall doesn't reshuffle on every render
  const tiles = useMemo(() => {
    const arr = [...ATTENDEES];
    const result: { name: string; location: string }[] = [];
    for (let i = 0; result.length < MAX_TILES; i++) {
      const shuffled = arr.map((a, idx) => ({ ...a, key: (idx * 31 + i * 17) % arr.length }))
        .sort((a, b) => a.key - b.key);
      result.push(...shuffled);
    }
    return result.slice(0, MAX_TILES);
  }, []);

  // Deterministic pseudo-random transforms per index (no flicker on rerender)
  // Multi-channel hash for rotation, x-offset, y-offset, z-index, gradient variation
  const transformFor = (i: number) => {
    const h1 = ((i * 2654435761) >>> 0) / 2 ** 32;
    const h2 = ((i * 40503 + 17) >>> 0) / 2 ** 32;
    const h3 = ((i * 2246822519 + 31) >>> 0) / 2 ** 32;
    const h4 = ((i * 374761393 + 7) >>> 0) / 2 ** 32;
    const h5 = ((i * 1597463007 + 53) >>> 0) / 2 ** 32;
    const h6 = ((i * 3266489917 + 71) >>> 0) / 2 ** 32;
    const rot = (h1 - 0.5) * 40;
    const dx = (h2 - 0.5) * 40;
    const dy = (h3 - 0.5) * 40;
    const z = Math.floor(h4 * 13);
    // Bright-spot position varies across the ticket
    const gx = Math.round(h5 * 100);       // 0..100% bg position X
    const gy = Math.round(h6 * 100);       // 0..100% bg position Y
    const gradient = `radial-gradient(ellipse at ${gx}% ${gy}%, #FF6A00 0%, #FC5E10 22%, #FF8A30 45%, #FFCB8E 72%, #FFE4C2 100%)`;
    const bgPos = `${gx}% ${gy}%`;
    return { rot, dx, dy, z, gradient, bgPos };
  };

  return (
    <div style={styles.page}>
      <img src={pageBg} alt="" style={styles.bg} />

      {/* Off-screen shader to capture as bg image — only runs once */}
      {!bgImage && (
        <div
          ref={shaderHolderRef}
          style={{ position: "fixed", top: -9999, left: -9999, width: 800, height: 800 }}
        >
          <MeshGradient
            style={{ width: "100%", height: "100%" }}
            colors={SHADER_COLORS}
            distortion={0.6}
            swirl={0.3}
            speed={0}
            frame={3000}
            webGlContextAttributes={{ preserveDrawingBuffer: true }}
          />
        </div>
      )}

      <div style={styles.frame}>
       <div style={styles.grid}>
        {tiles.map((t, i) => {
          const { rot, dx, dy, z, gradient, bgPos } = transformFor(i);
          return (
          <div key={i} style={{ ...styles.tile, transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`, zIndex: z }}>
            <div style={styles.scaleWrap}>
              <SUS2026ConfirmationCard
                attendeeName={t.name}
                attendeeLocation={t.location}
                eventName="Startup School 2026"
                eventDate="July 25-26 2026"
                glassParams={DEFAULT_GLASS_PARAMS}
                halftoneParams={DEFAULT_HALFTONE_PARAMS}
                layout={1}
                maxWidth={NATIVE_WIDTH}
                meshSpeed={0}
                staticBackground
                staticGradient={gradient}
                staticBackgroundImage={bgImage ?? undefined}
                staticBackgroundPosition={bgPos}
              />
            </div>
          </div>
          );
        })}
       </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100dvh",
    width: "100%",
    overflow: "auto",
    backgroundColor: BG_COLOR,
    display: "flex",
    justifyContent: "center",
    padding: "32px 16px",
    boxSizing: "border-box",
  },
  frame: {
    position: "relative",
    zIndex: 10,
    width: "min(520px, 100%)",
    minHeight: "calc(100dvh - 64px)",
    border: "1px solid rgba(244,241,219,0.18)",
    borderRadius: 16,
    background: "rgba(0,0,0,0.18)",
    overflow: "hidden",
  },
  bg: {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  grid: {
    position: "relative",
    zIndex: 10,
    padding: 0,
    display: "grid",
    // Very tight cells so tiles overlap heavily — guarantees no gaps even with jitter
    gridTemplateColumns: `repeat(auto-fill, ${Math.round(TILE_WIDTH * 0.45)}px)`,
    gridAutoRows: `${Math.round(TILE_HEIGHT * 0.45)}px`,
    columnGap: 0,
    rowGap: 0,
    justifyContent: "center",
    justifyItems: "center",
    alignItems: "center",
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    position: "relative",
  },
  scaleWrap: {
    width: NATIVE_WIDTH,
    transform: `scale(${SCALE})`,
    transformOrigin: "top left",
  },
};
