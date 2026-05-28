import React from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pageBg from "./page-bg.png";

const BG_COLOR = "#2E1F15";
const FONT = "'Martian Mono', 'Geist Mono', 'Space Mono', monospace";

// Curated from the original RSVP source, with locations rebalanced for global diversity.
// Each unique title once; cities span ~22 countries.
const ATTENDEES: { oneLiner: string; location: string }[] = [
  { oneLiner: "IPhO Gold Medalist", location: "Cambridge, MA, USA" },
  { oneLiner: "IMO Gold Medalist", location: "Seoul, South Korea" },
  { oneLiner: "IMO Silver Medalist", location: "Lagos, Nigeria" },
  { oneLiner: "IMO Medalist", location: "Cape Town, South Africa" },
  { oneLiner: "IPhO Medalist", location: "Moscow, Russia" },
  { oneLiner: "IOI Gold Medalist", location: "Kathmandu, Nepal" },
  { oneLiner: "IOL Medalist", location: "Oxford, UK" },
  { oneLiner: "USACO Platinum Programmer", location: "Bangalore, India" },
  { oneLiner: "Putnam Fellow", location: "Paris, France" },
  { oneLiner: "National Math Olympiad Finalist", location: "São Paulo, Brazil" },
  { oneLiner: "Regeneron STS Finalist", location: "Sydney, Australia" },
  { oneLiner: "ML Research Author", location: "Tokyo, Japan" },
  { oneLiner: "ML Researcher", location: "Cambridge, UK" },
  { oneLiner: "AI Researcher", location: "Zurich, Switzerland" },
  { oneLiner: "ML Engineer", location: "Dubai, UAE" },
  { oneLiner: "Software Engineer", location: "Mexico City, Mexico" },
  { oneLiner: "Hardware Engineer", location: "Shenzhen, China" },
  { oneLiner: "Design Engineer", location: "Stockholm, Sweden" },
  { oneLiner: "Robotics Engineer", location: "Tel Aviv, Israel" },
  { oneLiner: "Security Engineer", location: "Berlin, Germany" },
  { oneLiner: "Open-source Developer", location: "Helsinki, Finland" },
  { oneLiner: "Quant Researcher", location: "Hong Kong" },
  { oneLiner: "Member of Technical Staff", location: "Singapore" },
  { oneLiner: "Founder", location: "Buenos Aires, Argentina" },
];

export default function AttendeeBillboard() {
  // Deduplicate by one-liner, keep first occurrence's location
  const uniques: { oneLiner: string; location: string }[] = [];
  const seen = new Set<string>();
  for (const a of ATTENDEES) {
    const key = a.oneLiner.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniques.push(a);
  }

  return (
    <div style={styles.page}>
      <img src={pageBg} alt="" style={styles.bg} />
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>Startup School 2026 — Attendee One-Liners</div>
          <div style={styles.count}>{uniques.length} unique titles</div>
        </div>
        <ol style={styles.list}>
          {uniques.map((a, i) => (
            <li key={i} style={styles.row}>
              <span style={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <span style={styles.oneLiner}>{a.oneLiner}</span>
              <span style={styles.dash}>—</span>
              <span style={styles.location}>{a.location}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    width: "100%",
    minHeight: "100dvh",
    backgroundColor: BG_COLOR,
    padding: "24px 24px 32px",
    boxSizing: "border-box",
    fontFamily: FONT,
  },
  bg: {
    pointerEvents: "none",
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    objectFit: "cover",
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 10,
    width: "min(1400px, 100%)",
    margin: "0 auto",
    color: "rgba(244,241,219,0.92)",
  },
  header: {
    borderBottom: "1px solid rgba(244,241,219,0.18)",
    paddingBottom: 10,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "rgba(244,241,219,0.95)",
  },
  count: {
    fontSize: 10,
    color: "rgba(244,241,219,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    columnCount: 3,
    columnGap: 32,
    columnFill: "balance",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "30px 1fr auto auto",
    gap: 6,
    alignItems: "baseline",
    padding: "3px 0",
    borderBottom: "1px dashed rgba(244,241,219,0.06)",
    fontSize: 10.5,
    lineHeight: 1.35,
    breakInside: "avoid",
  },
  num: {
    color: "rgba(244,241,219,0.35)",
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "0.04em",
  },
  oneLiner: {
    color: "rgba(244,241,219,0.95)",
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dash: {
    color: "rgba(244,241,219,0.3)",
    padding: "0 2px",
  },
  location: {
    color: "rgba(244,241,219,0.55)",
    whiteSpace: "nowrap",
  },
};
