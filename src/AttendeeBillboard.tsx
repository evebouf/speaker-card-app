import React from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pageBg from "./page-bg.png";

const BG_COLOR = "#2E1F15";
const FONT = "'Martian Mono', 'Geist Mono', 'Space Mono', monospace";

// Source: confirmed Startup School 2026 RSVPs. Names obfuscated; one-liner + location only.
const ATTENDEES: { oneLiner: string; location: string }[] = [
  { oneLiner: "IPhO Gold Medalist", location: "Cambridge, MA, USA" },
  { oneLiner: "IMO Medalist", location: "High Wycombe, UK" },
  { oneLiner: "USACO Platinum Programmer", location: "Cedar Falls, IA, USA" },
  { oneLiner: "ML Research Author", location: "New York, NY, USA" },
  { oneLiner: "Security Engineer", location: "Vancouver, Canada" },
  { oneLiner: "Open-source Developer", location: "Seattle, WA, USA" },
  { oneLiner: "Open-source Developer", location: "Oxford, UK" },
  { oneLiner: "Open-source Developer", location: "Austin, TX, USA" },
  { oneLiner: "Open-source Developer", location: "Cambridge, MA, USA" },
  { oneLiner: "Hardware Engineer", location: "New York, NY, USA" },
  { oneLiner: "IMO Gold Medalist", location: "Cambridge, MA, USA" },
  { oneLiner: "Design Engineer", location: "New Haven, CT, USA" },
  { oneLiner: "Regeneron STS Finalist", location: "Austin, TX, USA" },
  { oneLiner: "IPhO Medalist", location: "Cambridge, MA, USA" },
  { oneLiner: "USACO Platinum Programmer", location: "Cambridge, MA, USA" },
  { oneLiner: "Regeneron STS Finalist", location: "Boston, MA, USA" },
  { oneLiner: "Robotics Engineer", location: "Stanford, CA, USA" },
  { oneLiner: "IMO Gold Medalist", location: "New York, NY, USA" },
  { oneLiner: "ML Researcher", location: "Cambridge, UK" },
  { oneLiner: "Design Engineer", location: "Seattle, WA, USA" },
  { oneLiner: "Regeneron STS Finalist", location: "Cambridge, MA, USA" },
  { oneLiner: "IMO Gold Medalist", location: "Tampa, FL, USA" },
  { oneLiner: "ML Research Author", location: "Potomac, MD, USA" },
  { oneLiner: "ML Research Author", location: "Cambridge, UK" },
  { oneLiner: "ML Research Author", location: "Stanford, CA, USA" },
  { oneLiner: "IOL Medalist", location: "Oxford, UK" },
  { oneLiner: "Robotics Engineer", location: "Berkeley, CA, USA" },
  { oneLiner: "Robotics Engineer", location: "Chapel Hill, NC, USA" },
  { oneLiner: "ML Engineer", location: "Waterloo, Canada" },
  { oneLiner: "Robotics Engineer", location: "Pasadena, CA, USA" },
  { oneLiner: "IMO Gold Medalist", location: "Pasadena, CA, USA" },
  { oneLiner: "Member of Technical Staff", location: "New York, NY, USA" },
  { oneLiner: "IMO Silver Medalist", location: "Tampa, FL, USA" },
  { oneLiner: "USACO Platinum Programmer", location: "Pasadena, CA, USA" },
  { oneLiner: "Founder", location: "Toronto, Canada" },
  { oneLiner: "Hardware Engineer", location: "Palo Alto, CA, USA" },
  { oneLiner: "Regeneron STS Finalist", location: "New Haven, CT, USA" },
  { oneLiner: "ML Researcher", location: "Vancouver, WA, USA" },
  { oneLiner: "ML Researcher", location: "Monte Sereno, CA, USA" },
  { oneLiner: "Member of Technical Staff", location: "San Francisco, CA, USA" },
  { oneLiner: "Founder", location: "Sammamish, WA, USA" },
  { oneLiner: "Security Engineer", location: "London, UK" },
  { oneLiner: "ML Researcher", location: "San Francisco, CA, USA" },
  { oneLiner: "Quant Researcher", location: "Chicago, IL, USA" },
  { oneLiner: "AI Researcher", location: "Ithaca, NY, USA" },
  { oneLiner: "ML Engineer", location: "Berkeley, CA, USA" },
  { oneLiner: "Quant Researcher", location: "New York, NY, USA" },
  { oneLiner: "Founder", location: "Warsaw, Poland" },
  { oneLiner: "Hardware Engineer", location: "San Jose, CA, USA" },
  { oneLiner: "Member of Technical Staff", location: "Atlanta, GA, USA" },
  { oneLiner: "ML Engineer", location: "Hangzhou, China" },
  { oneLiner: "Founder", location: "San Francisco, CA, USA" },
  { oneLiner: "Security Engineer", location: "Berkeley, CA, USA" },
  { oneLiner: "Security Engineer", location: "Atlanta, GA, USA" },
  { oneLiner: "IPhO Gold Medalist", location: "Palaiseau, France" },
  { oneLiner: "Member of Technical Staff", location: "Toronto, Canada" },
  { oneLiner: "Quant Researcher", location: "Waterloo, Canada" },
  { oneLiner: "AI Researcher", location: "Waterloo, Canada" },
  { oneLiner: "IMO Silver Medalist", location: "Cambridge, UK" },
  { oneLiner: "AI Researcher", location: "London, UK" },
  { oneLiner: "IOI Gold Medalist", location: "Kathmandu, Nepal" },
  { oneLiner: "IOI Gold Medalist", location: "Moscow, Russia" },
  { oneLiner: "Quant Researcher", location: "London, UK" },
  { oneLiner: "AI Researcher", location: "Toronto, Canada" },
  { oneLiner: "Software Engineer", location: "Waterloo, Canada" },
  { oneLiner: "National Math Olympiad Finalist", location: "Cambridge, MA, USA" },
  { oneLiner: "Robotics Engineer", location: "Paramus, NJ, USA" },
  { oneLiner: "IMO Gold Medalist", location: "Cambridge, MA, USA" },
  { oneLiner: "Regeneron STS Finalist", location: "Portland, OR, USA" },
  { oneLiner: "USACO Platinum Programmer", location: "Shenzhen, China" },
  { oneLiner: "Regeneron STS Finalist", location: "Los Altos Hills, CA, USA" },
  { oneLiner: "IMO Gold Medalist", location: "Edmonton, Canada" },
  { oneLiner: "USACO Platinum Programmer", location: "Pasadena, CA, USA" },
  { oneLiner: "IPhO Medalist", location: "San Francisco, CA, USA" },
  { oneLiner: "National Math Olympiad Finalist", location: "Berkeley, CA, USA" },
  { oneLiner: "Open-source Developer", location: "New York, NY, USA" },
  { oneLiner: "Open-source Developer", location: "Amherst, MA, USA" },
  { oneLiner: "Robotics Engineer", location: "Hyderabad, India" },
  { oneLiner: "Founder", location: "Tallinn, Estonia" },
  { oneLiner: "IMO Silver Medalist", location: "Oxford, UK" },
  { oneLiner: "Security Engineer", location: "Oxford, UK" },
  { oneLiner: "Founder", location: "Waterloo, Canada" },
  { oneLiner: "Software Engineer", location: "Waterloo, Canada" },
  { oneLiner: "Member of Technical Staff", location: "London, UK" },
  { oneLiner: "AI Researcher", location: "London, UK" },
  { oneLiner: "IPhO Gold Medalist", location: "New Delhi, India" },
  { oneLiner: "ML Research Author", location: "Waterloo, Canada" },
  { oneLiner: "ML Researcher", location: "Bhaktapur, Nepal" },
  { oneLiner: "Security Engineer", location: "Ulaanbaatar, Mongolia" },
  { oneLiner: "IPhO Gold Medalist", location: "San Francisco, CA, USA" },
  { oneLiner: "IOI Gold Medalist", location: "San Francisco, CA, USA" },
  { oneLiner: "IOI Gold Medalist", location: "Cambridge, MA, USA" },
  { oneLiner: "Putnam Fellow", location: "McLean, VA, USA" },
  { oneLiner: "ML Research Author", location: "Palo Alto, CA, USA" },
  { oneLiner: "Regeneron STS Finalist", location: "Palo Alto, CA, USA" },
  { oneLiner: "Hardware Engineer", location: "Raleigh, NC, USA" },
  { oneLiner: "Robotics Engineer", location: "San Francisco, CA, USA" },
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
