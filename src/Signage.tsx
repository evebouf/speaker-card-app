/**
 * Signage — wayfinding & informational posters for YC Startup School 2026.
 *
 * This view is a faithful rebuild of the standalone `sus-signage` repo
 * (a single index.html with 7 poster cards) brought into the speaker-card
 * app, then expanded with many more signs and grouped by purpose.
 *
 * Each poster is a 24in × 36in print piece (2:3 ratio). On screen they are
 * shown as a scrollable gallery of scaled previews; the "Print posters"
 * button (or the browser print dialog) lays each card out one-per-page at
 * full physical size with exact background colors.
 *
 * To add a new sign, append an entry to the SIGNS array below — no other
 * changes needed. Categories render in the order they first appear.
 */

const FONT = "'Martian Mono', monospace";

// ---- Brand tokens (matched to the original signage repo) ----
const GRADIENT_TOP = "#F2E8D5"; // cream
const GRADIENT_BOTTOM = "#E0621E"; // orange
const TEXT_DARK = "#1A1A1A";

type ArrowDir =
  | "up"
  | "down"
  | "left"
  | "right"
  | "up-left"
  | "up-right"
  | "down-left"
  | "down-right";

// The base arrow SVG points up-and-to-the-right. Every other direction is
// the same shape rotated in 45° steps.
const ARROW_ROTATION: Record<ArrowDir, number> = {
  "up-right": 0,
  right: 45,
  "down-right": 90,
  down: 135,
  "down-left": 180,
  left: 225,
  "up-left": 270,
  up: 315,
};

type TitleSize = "lg" | "md" | "sm";

interface Sign {
  id: string;
  category: string;
  title: string;
  /** Optional supporting copy shown beneath the title. */
  body?: string;
  /** A directional wayfinding arrow. Omit for plain entry/info signs. */
  arrow?: ArrowDir;
  /** Title size. Defaults to "lg"; use smaller sizes for longer titles. */
  size?: TitleSize;
  /** Show the "Y Combinator Presents / Startup School 2026" footer. Default true. */
  footer?: boolean;
}

// ---------------------------------------------------------------------------
// All signs. The first 7 are the original sus-signage cards (preserved
// exactly). Everything after is new.
// ---------------------------------------------------------------------------
const SIGNS: Sign[] = [
  // ---- Wayfinding (original sus-signage, with arrows) ----
  { id: "ga-arrow", category: "Wayfinding", title: "General Admission", arrow: "up-right" },
  { id: "rideshare-arrow", category: "Wayfinding", title: "Ride Share Pickup/Dropoff", arrow: "up-right", size: "md" },
  { id: "friends-arrow", category: "Wayfinding", title: "Friends of YC", arrow: "up-right" },

  // ---- Entry points (original sus-signage, no arrow) ----
  { id: "ga-enter", category: "Entry Points", title: "General Admission Enter Here" },
  { id: "rideshare-enter", category: "Entry Points", title: "Ride Share Pickup/Dropoff Here", size: "md" },
  { id: "friends-enter", category: "Entry Points", title: "Friends of YC Enter Here" },

  // ---- Notices (original sus-signage) ----
  {
    id: "friends-access-only",
    category: "Notices",
    title: "Friends of YC event access only",
    body: "General Admission accessible from 3rd Street and Warrior's Way, via the ramp by Gott's Roadside",
    size: "sm",
    footer: false,
  },

  // ---- More wayfinding ----
  { id: "registration-arrow", category: "Wayfinding", title: "Registration & Check-In", arrow: "up-right", size: "md" },
  { id: "main-stage-arrow", category: "Wayfinding", title: "Main Stage", arrow: "right" },
  { id: "workshops-arrow", category: "Wayfinding", title: "Workshops", arrow: "left" },
  { id: "expo-arrow", category: "Wayfinding", title: "Sponsor Expo", arrow: "right", size: "md" },
  { id: "restrooms-arrow", category: "Wayfinding", title: "Restrooms", arrow: "down-right" },
  { id: "coat-check-arrow", category: "Wayfinding", title: "Coat Check", arrow: "left", size: "md" },
  { id: "exit-arrow", category: "Wayfinding", title: "This Way Out", arrow: "down", size: "md" },

  // ---- More entry points ----
  { id: "speakers-enter", category: "Entry Points", title: "Speakers Enter Here", size: "md" },
  { id: "press-enter", category: "Entry Points", title: "Press & Media Check-In", size: "md" },
  { id: "staff-enter", category: "Entry Points", title: "Volunteers & Staff Entrance", size: "sm" },
  { id: "sponsors-enter", category: "Entry Points", title: "Sponsors Enter Here", size: "md" },

  // ---- Information ----
  {
    id: "wifi",
    category: "Information",
    title: "Wi-Fi",
    body: "Network: SUS2026 · Password: buildbigthings",
    size: "md",
  },
  {
    id: "schedule",
    category: "Information",
    title: "Today's Schedule",
    body: "Doors 8:30 · Keynote 9:30 · Lunch 12:00 · Workshops 1:30 · Close 5:30",
    size: "md",
  },
  {
    id: "lunch",
    category: "Information",
    title: "Lunch",
    body: "Served 12:00–1:00 on the main concourse. Dietary options labeled at each station.",
    size: "md",
  },
  {
    id: "first-aid",
    category: "Information",
    title: "First Aid & Medical",
    body: "Staffed medical station near Section 112. Find any volunteer in an orange vest for help.",
    size: "sm",
  },
  {
    id: "lost-found",
    category: "Information",
    title: "Lost & Found",
    body: "Turn in or claim items at the Registration desk. Unclaimed items held for 30 days.",
    size: "sm",
  },

  // ---- More notices ----
  { id: "badge-required", category: "Notices", title: "Badge required beyond this point", size: "sm" },
  { id: "no-reentry", category: "Notices", title: "No re-entry beyond this point", size: "sm" },
  {
    id: "photography",
    category: "Notices",
    title: "Filming in progress",
    body: "By entering this area you consent to being photographed and recorded for YC promotional use.",
    size: "sm",
  },
  {
    id: "quiet-room",
    category: "Notices",
    title: "Quiet Room",
    body: "Please silence phones and keep voices low. A calm space to reset between sessions.",
    size: "md",
  },
];

// ---- The wayfinding arrow, rotated to the requested direction ----
function Arrow({ dir }: { dir: ArrowDir }) {
  return (
    <div className="sign-arrow">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: `rotate(${ARROW_ROTATION[dir]}deg)` }}
      >
        <path
          d="M10 90 L10 30 L20 30 L20 70.5 L75 16 L82 23 L27 78 L68 78 L68 88 L10 90Z"
          fill={TEXT_DARK}
        />
      </svg>
    </div>
  );
}

function SignCard({ sign }: { sign: Sign }) {
  const showFooter = sign.footer !== false;
  const titleClass = `sign-title sign-title--${sign.size ?? "lg"}`;
  return (
    <div className="sign-card">
      <div>
        <h1 className={titleClass}>{sign.title}</h1>
        {sign.body && <p className="sign-body">{sign.body}</p>}
      </div>

      {sign.arrow ? <Arrow dir={sign.arrow} /> : <div style={{ flexGrow: 1 }} />}

      {showFooter && (
        <div className="sign-footer">
          <span>Y Combinator Presents</span>
          <span>Startup School 2026</span>
        </div>
      )}
    </div>
  );
}

export default function Signage() {
  // Preserve category order based on first appearance in SIGNS.
  const categories: string[] = [];
  for (const s of SIGNS) {
    if (!categories.includes(s.category)) categories.push(s.category);
  }

  return (
    <div className="signage-page">
      <style>{CSS}</style>

      <header className="signage-toolbar">
        <div className="signage-toolbar__titles">
          <h1 className="signage-toolbar__h1">Event Signage</h1>
          <p className="signage-toolbar__sub">
            {SIGNS.length} posters · 24″ × 36″ · YC Startup School 2026
          </p>
        </div>
        <button className="signage-print" onClick={() => window.print()}>
          Print posters
        </button>
      </header>

      {categories.map((cat) => {
        const signs = SIGNS.filter((s) => s.category === cat);
        return (
          <section key={cat} className="signage-section">
            <h2 className="signage-section__title">
              {cat} <span className="signage-section__count">{signs.length}</span>
            </h2>
            <div className="signage-grid">
              {signs.map((s) => (
                <SignCard key={s.id} sign={s} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles. Kept as a stylesheet (not inline) so the @media print rules can lay
// each poster out one-per-page at true 24×36 size, exactly like the original
// sus-signage repo.
// ---------------------------------------------------------------------------
const CSS = `
.signage-page {
  width: 100%;
  min-height: 100vh;
  background: #2A2A2A;
  font-family: ${FONT};
  box-sizing: border-box;
  padding: 56px 28px 96px;
  text-align: left;
}

.signage-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  max-width: 1180px;
  margin: 0 auto 40px;
  flex-wrap: wrap;
}
.signage-toolbar__h1 {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.01em;
  margin: 0;
}
.signage-toolbar__sub {
  font-size: 11px;
  font-weight: 400;
  color: #999;
  letter-spacing: 0.04em;
  margin: 8px 0 0;
  text-transform: uppercase;
}
.signage-print {
  font-family: ${FONT};
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #1A1A1A;
  background: ${GRADIENT_BOTTOM};
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  cursor: pointer;
}
.signage-print:hover { filter: brightness(1.08); }

.signage-section {
  max-width: 1180px;
  margin: 0 auto 56px;
}
.signage-section__title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #cfcfcf;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.12);
  display: flex;
  align-items: center;
  gap: 10px;
}
.signage-section__count {
  font-size: 10px;
  font-weight: 700;
  color: #999;
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
  padding: 2px 8px;
}

.signage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 28px;
}

/* ---- Poster card (screen preview) ---- */
.sign-card {
  aspect-ratio: 2 / 3;
  background: linear-gradient(to bottom, ${GRADIENT_TOP} 0%, ${GRADIENT_BOTTOM} 100%);
  color: ${TEXT_DARK};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 9% 8% 7%;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.35);
  container-type: inline-size;
}

/* Type scale uses container query units so previews and full-size prints
   share one definition and stay perfectly proportional. */
.sign-title {
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0;
}
.sign-title--lg { font-size: 13.3cqw; }
.sign-title--md { font-size: 10.8cqw; }
.sign-title--sm { font-size: 9.2cqw; }

.sign-body {
  font-size: 4.6cqw;
  font-weight: 700;
  line-height: 1.4;
  margin: 5cqw 0 0;
}

.sign-arrow {
  display: flex;
  align-items: flex-end;
  flex-grow: 1;
  padding-bottom: 3%;
}
.sign-arrow svg {
  width: 21cqw;
  height: 21cqw;
}

.sign-footer {
  font-size: 2.3cqw;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.5;
}
.sign-footer span { display: block; }

/* ---- Print: one true-size 24×36 poster per page ---- */
@media print {
  /* Hide app chrome and gallery layout. */
  .signage-toolbar,
  .signage-section__title,
  .app-view-menu { display: none !important; }

  html, body { background: #fff; margin: 0; overflow: visible; }
  #root { width: auto; max-width: none; border: none; margin: 0; }

  .signage-page { padding: 0; background: #fff; }
  .signage-section { max-width: none; margin: 0; }
  .signage-grid { display: block; gap: 0; }

  .sign-card {
    width: 24in;
    height: 36in;
    aspect-ratio: auto;
    border-radius: 0;
    box-shadow: none;
    page-break-after: always;
    padding: 3in 2.5in 2in;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* At true size, container units would key off 24in — pin explicit sizes. */
  .sign-title--lg { font-size: 240px; }
  .sign-title--md { font-size: 200px; }
  .sign-title--sm { font-size: 168px; }
  .sign-body { font-size: 80px; margin-top: 24px; }
  .sign-arrow svg { width: 380px; height: 380px; }
  .sign-footer { font-size: 36px; }
}
`;
