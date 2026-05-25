import React, { useMemo } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pageBg from "./page-bg.png";
import SUS2026ConfirmationCard, {
  DEFAULT_GLASS_PARAMS,
  DEFAULT_HALFTONE_PARAMS,
} from "./SUS2026ConfirmationCard";

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
const MAX_TILES = 240;
const NATIVE_WIDTH = 520;
const NATIVE_HEIGHT = 280;
const SCALE = 0.55;
const TILE_WIDTH = NATIVE_WIDTH * SCALE;   // 286
const TILE_HEIGHT = NATIVE_HEIGHT * SCALE; // 154

export default function ConfirmationWall() {
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

  return (
    <div style={styles.page}>
      <img src={pageBg} alt="" style={styles.bg} />

      <div style={styles.grid}>
        {tiles.map((t, i) => (
          <div key={i} style={styles.tile}>
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
                staticBackground
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100dvh",
    width: "100%",
    overflow: "hidden",
    backgroundColor: BG_COLOR,
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
    padding: 20,
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, ${TILE_WIDTH}px)`,
    gap: 14,
    justifyContent: "center",
    justifyItems: "center",
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    overflow: "hidden",
  },
  scaleWrap: {
    width: NATIVE_WIDTH,
    transform: `scale(${SCALE})`,
    transformOrigin: "top left",
  },
};
