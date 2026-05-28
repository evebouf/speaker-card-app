import React, { useEffect, useRef } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

const BG_COLOR = "#2E1F15";
const FONT = "'Martian Mono', 'Geist Mono', 'Space Mono', monospace";
const TEXT = "rgba(244,241,219,0.85)";
const BORDER = "rgba(244,241,219,0.18)";
const SHADER_COLORS = ["#FF6A00", "#FC5E10", "#FF8A30", "#FFCB8E", "#FFE4C2"];

interface ColorEntry {
  name: string;
  hex: string;
  cmyk: string;
  use: string;
  textOnSwatch?: string;
}

const PALETTE: ColorEntry[] = [
  { name: "YC Orange (canonical)", hex: "#FF6600", cmyk: "0 / 60 / 100 / 0", use: "Y Combinator brand orange — use for logo + non-shader UI" },
  { name: "Orange Primary", hex: "#FF6A00", cmyk: "0 / 58 / 100 / 0", use: "Main orange (mesh peak)" },
  { name: "Orange Deep", hex: "#FC5E10", cmyk: "0 / 63 / 94 / 1", use: "Saturated orange (deep stops)" },
  { name: "Orange Mid", hex: "#FF8A30", cmyk: "0 / 46 / 81 / 0", use: "Warm orange (mesh blend)" },
  { name: "Peach", hex: "#FFCB8E", cmyk: "0 / 20 / 44 / 0", use: "Light orange (gradient edge)", textOnSwatch: "#4A301D" },
  { name: "Cream", hex: "#FFE4C2", cmyk: "0 / 11 / 24 / 0", use: "Highlight cream (lightest stop)", textOnSwatch: "#4A301D" },
  { name: "Text Brown", hex: "#4A301D", cmyk: "0 / 35 / 61 / 71", use: "All on-card text" },
  { name: "Page Brown", hex: "#2E1F15", cmyk: "0 / 32 / 54 / 82", use: "Deep background" },
];

interface ShaderParam {
  name: string;
  value: string;
  type: string;
  notes: string;
}

const SHADER_PARAMS: ShaderParam[] = [
  { name: "colors", value: '["#FF6A00", "#FC5E10", "#FF8A30", "#FFCB8E", "#FFE4C2"]', type: "string[]", notes: "Five-stop palette. The mesh blends between them. Order matters — first is the deepest, last is the highlight." },
  { name: "distortion", value: "0.6", type: "number 0–1", notes: "How much the mesh warps from a flat gradient. Higher gives a more organic, sand-dune feel. We landed on 0.6 for visible movement without chaos." },
  { name: "swirl", value: "0.3", type: "number 0–1", notes: "Adds rotational warp on top of distortion. 0.3 gives subtle eddies, keeps the gradient calm." },
  { name: "speed", value: "1.8", type: "number 0+", notes: "Animation speed. 0 is static. 1.0 is default. 1.8 gives a slow drift suitable for ambient signage." },
  { name: "scale", value: "1 (default)", type: "number", notes: "Zoom on the mesh pattern. We use 1." },
  { name: "rotation", value: "0 (default)", type: "degrees", notes: "Rotates the entire mesh. We use 0." },
  { name: "offsetX / offsetY", value: "0 / 0 (default)", type: "number", notes: "Pan the mesh horizontally / vertically." },
  { name: "grainMixer / grainOverlay", value: "0 / 0 (default)", type: "number 0–1", notes: "Paper-shader's built-in grain. We disable it and use a separate canvas-based grain on top (see grain layer below) for more control." },
  { name: "webGlContextAttributes", value: "{ preserveDrawingBuffer: true }", type: "object", notes: "Lets us capture the canvas to PNG/JPEG. Required if you want to export the shader as a static image." },
];

interface GrainParam {
  name: string;
  value: string;
  notes: string;
}

const GRAIN_PARAMS: GrainParam[] = [
  { name: "Canvas size", value: "matches displayed dimensions", notes: "Per-pixel monochrome noise (Math.random × 255 for R, G, B; alpha 255). Generated once on mount; redrawn on resize." },
  { name: "mix-blend-mode", value: "overlay", notes: "Blends the grain into the gradient — preserves color, adds noise texture in midtones." },
  { name: "opacity", value: "0.4", notes: "Grain intensity. Higher means more visible noise. 0.4 is the sweet spot for the digital-sand look." },
  { name: "pointer-events", value: "none", notes: "So the grain layer never intercepts clicks." },
  { name: "z-index", value: "above gradient, below content", notes: "Stack: MeshGradient (z=0) → grain (z=1) → text/photos (z=2)." },
];

interface CopyConcept {
  label: string;
  blurb: string;
  lines: string[];
}

const BILLBOARD_COPY: CopyConcept[] = [
  {
    label: "Concept A — Headline + CTA (vertical/social hero)",
    blurb: "Used on the YouTube 16:9 and Shorts 9:16 motion treatments. Three blocks: brand line, headline, callout.",
    lines: [
      "Y COMBINATOR PRESENTS",
      "STARTUP SCHOOL",
      "2026",
      "JUL 25-26",
      "SF.CA",
      "REGISTER NOW",
    ],
  },
  {
    label: "Concept B — Speaker / center-court credit",
    blurb: "Used on every speaker card (top + bottom strip). Cleaner, info-forward, no CTA.",
    lines: [
      "STARTUP SCHOOL 2026",
      "JULY 25-26",
      "CHASE CENTER, SAN FRANCISCO",
      "HOSTED BY Y COMBINATOR",
    ],
  },
];

function ShaderSample() {
  const grainRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = grainRef.current;
    if (!c) return;
    const draw = () => {
      const r = c.getBoundingClientRect();
      c.width = Math.round(r.width);
      c.height = Math.round(r.height);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const img = ctx.createImageData(c.width, c.height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  return (
    <div style={styles.shaderBox}>
      <MeshGradient
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        colors={SHADER_COLORS}
        distortion={0.6}
        swirl={0.3}
        speed={1.8}
        webGlContextAttributes={{ preserveDrawingBuffer: true }}
      />
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
        }}
      />
    </div>
  );
}

export default function BrandGuideForGeoff() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.text}>Y Combinator · Startup School 2026</div>
          <div style={styles.text}>Brand Reference — For Geoff @ InVision</div>
          <div style={styles.text}>
            Answers to your two questions from Slack:
          </div>
          <div style={styles.text}>
            01. CMYK equivalents for every color in the Branding Guide → see Section 01 below.
          </div>
          <div style={styles.text}>
            02. Billboard copy from the earlier call (for Chase Center in-space extension) → see Section 05 below.
          </div>
          <div style={styles.text}>
            Plus a live sample of the digital-sand shader (02), full implementation parameters for the gradient (03), and the grain-texture recipe (04) — so anyone on your team can rebuild it.
          </div>
        </header>

        <section style={styles.section}>
          <div style={styles.text}>01 / Color Palette — CMYK</div>
          <div style={styles.text}>
            Print-shop color profile may shift these slightly (SWOP/FOGRA). Fine-tune in your color-managed workflow. Hex values shown for reference; CMYK is the source of truth for print.
          </div>

          <div style={styles.table}>
            <div style={{ ...styles.row, ...styles.rowHead }}>
              <div>Sample</div>
              <div>Name</div>
              <div>Hex</div>
              <div>CMYK (C / M / Y / K)</div>
              <div>Use</div>
            </div>
            {PALETTE.map((c) => (
              <div key={c.hex} style={styles.row}>
                <div>
                  <div style={{ ...styles.swatch, background: c.hex, color: c.textOnSwatch ?? TEXT }}>
                    {c.hex}
                  </div>
                </div>
                <div>{c.name}</div>
                <div>{c.hex}</div>
                <div>{c.cmyk}</div>
                <div>{c.use}</div>
              </div>
            ))}
          </div>

          <div style={styles.text}>
            Need Pantone spot equivalents, or values run through a specific ICC profile your shop prefers? Let me know and I'll send those over.
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.text}>02 / Digital Sand — Live Shader</div>
          <div style={styles.text}>
            The actual animated WebGL mesh gradient + grain overlay used across the campaign — source of truth for the digital sand look. Built on Paper's{" "}
            <a href="https://shaders.paper.design/mesh-gradient" style={styles.link} target="_blank" rel="noreferrer">MeshGradient shader</a>{" "}
            (open the link to tune values live in their canonical editor). For high-res JPEG/MP4/WebM exports of our version:{" "}
            <a href="https://speaker-card-app.vercel.app/?view=geoff" style={styles.link} target="_blank" rel="noreferrer">?view=geoff</a>.
          </div>
          <ShaderSample />
        </section>

        <section style={styles.section}>
          <div style={styles.text}>03 / Shader Implementation — Parameters</div>
          <div style={styles.text}>
            Everything needed to replicate the digital sand effect. Uses{" "}
            <a href="https://github.com/paper-design/shaders" style={styles.link} target="_blank" rel="noreferrer">@paper-design/shaders-react</a>{" "}
            (npm install @paper-design/shaders-react), the MeshGradient component, plus a canvas-based grain overlay. Tune values interactively in Paper's{" "}
            <a href="https://shaders.paper.design/mesh-gradient" style={styles.link} target="_blank" rel="noreferrer">canonical MeshGradient editor</a>.
          </div>

          <div style={styles.text}>MeshGradient props</div>
          <div style={styles.table}>
            <div style={{ ...styles.paramRow, ...styles.rowHead }}>
              <div>Prop</div><div>Value</div><div>Type</div><div>Notes</div>
            </div>
            {SHADER_PARAMS.map((p) => (
              <div key={p.name} style={styles.paramRow}>
                <div>{p.name}</div>
                <div>{p.value}</div>
                <div>{p.type}</div>
                <div>{p.notes}</div>
              </div>
            ))}
          </div>

          <div style={styles.text}>Grain overlay (HTML5 canvas, layered on top)</div>
          <div style={styles.table}>
            <div style={{ ...styles.paramRow2, ...styles.rowHead }}>
              <div>Setting</div><div>Value</div><div>Notes</div>
            </div>
            {GRAIN_PARAMS.map((p) => (
              <div key={p.name} style={styles.paramRow2}>
                <div>{p.name}</div>
                <div>{p.value}</div>
                <div>{p.notes}</div>
              </div>
            ))}
          </div>

          <div style={styles.text}>Minimal React snippet</div>
          <pre style={styles.code}>{`import { MeshGradient } from "@paper-design/shaders-react";

<div style={{ position: "relative", width: 1920, height: 1080 }}>
  <MeshGradient
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    colors={["#FF6A00", "#FC5E10", "#FF8A30", "#FFCB8E", "#FFE4C2"]}
    distortion={0.6}
    swirl={0.3}
    speed={1.8}
    webGlContextAttributes={{ preserveDrawingBuffer: true }}
  />
  {/* Grain canvas (one-time monochrome noise, mix-blend-mode: overlay, opacity: 0.4) */}
</div>`}</pre>
        </section>

        <section style={styles.section}>
          <div style={styles.text}>04 / Grain Texture — Implementation</div>
          <div style={styles.text}>
            The grainy "sand" texture is not built into the shader — it's a separate HTML canvas filled with per-pixel monochrome noise, overlaid on top of the gradient with mix-blend-mode: overlay. We picked this approach over the shader's built-in grain because it gives us pixel-perfect control over density and blends predictably across browsers + when captured to MP4.
          </div>

          <div style={styles.text}>How it works</div>
          <ol style={styles.list}>
            <li>Create a canvas sized to match the displayed area (1× device pixels is enough; the grain is meant to look granular).</li>
            <li>Fill its ImageData with random luminance per pixel — R = G = B = Math.random() × 255, alpha = 255.</li>
            <li>Layer it absolutely positioned over the gradient with mix-blend-mode: overlay and opacity: 0.4.</li>
            <li>Redraw on resize so the grain stays sharp; otherwise leave it static — animating noise feels like TV static, which we don't want.</li>
          </ol>

          <div style={styles.text}>Drop-in code (React + TS)</div>
          <pre style={styles.code}>{`function GrainOverlay() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const draw = () => {
      const r = c.getBoundingClientRect();
      c.width = Math.round(r.width);
      c.height = Math.round(r.height);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const img = ctx.createImageData(c.width, c.height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={ref}
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
  );
}`}</pre>

          <div style={styles.text}>Tuning knobs</div>
          <div style={styles.table}>
            <div style={{ ...styles.paramRow2, ...styles.rowHead }}>
              <div>Knob</div><div>Default</div><div>What it changes</div>
            </div>
            <div style={styles.paramRow2}>
              <div>opacity</div>
              <div>0.4</div>
              <div>Higher means more visible grain. 0.2 is subtle, 0.6 is heavy.</div>
            </div>
            <div style={styles.paramRow2}>
              <div>mix-blend-mode</div>
              <div>overlay</div>
              <div>Try soft-light for a gentler grain, multiply for darker, screen for lighter.</div>
            </div>
            <div style={styles.paramRow2}>
              <div>Noise range</div>
              <div>0–255</div>
              <div>Tighten the range (e.g. 96 + Math.random() × 64) for finer grain with less contrast.</div>
            </div>
            <div style={styles.paramRow2}>
              <div>Canvas resolution</div>
              <div>1× displayed px</div>
              <div>Multiply by window.devicePixelRatio for retina-sharp grain at the cost of less visible noise.</div>
            </div>
            <div style={styles.paramRow2}>
              <div>Animation</div>
              <div>off (static)</div>
              <div>Wrap draw() in a requestAnimationFrame loop for a live-noise TV-static effect. Generally not what you want.</div>
            </div>
          </div>

          <div style={styles.text}>
            For print: rasterize the grain at 300 DPI in your DTP tool, or use a pre-baked noise PNG sized to the final artboard. The CSS approach is web/screen-only.
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.text}>05 / Billboard Copy</div>
          <div style={styles.text}>
            Two concepts from the earlier call. Both use Martian Mono in Text Brown #4A301D on the orange mesh gradient. Use whichever fits your in-space placement; mix-and-match lines is fine.
          </div>

          {BILLBOARD_COPY.map((c) => (
            <div key={c.label} style={styles.conceptBlock}>
              <div style={styles.text}>{c.label}</div>
              <div style={styles.text}>{c.blurb}</div>
              <div style={styles.copyBox}>
                {c.lines.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          ))}

          <div style={styles.text}>
            Live examples are at{" "}
            <a href="https://speaker-card-app.vercel.app/?view=youtube" style={styles.link} target="_blank" rel="noreferrer">speaker-card-app.vercel.app/?view=youtube</a>{" "}
            (Concept A — 16:9 motion) and{" "}
            <a href="https://speaker-card-app.vercel.app/?view=speaker" style={styles.link} target="_blank" rel="noreferrer">?view=speaker</a>{" "}
            (Concept B — speaker cards). For the digital sand motion asset:{" "}
            <a href="https://speaker-card-app.vercel.app/?view=geoff" style={styles.link} target="_blank" rel="noreferrer">?view=geoff</a>.
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.text}>Questions or tweaks → ping Eve. Last updated 2026-05-28.</div>
        </footer>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
    background: BG_COLOR,
    color: TEXT,
    fontFamily: FONT,
    padding: "48px 24px 80px",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: 880,
    margin: "0 auto",
    width: "100%",
  },
  text: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 400,
    color: TEXT,
    lineHeight: 1.6,
    margin: "0 0 12px 0",
    width: "100%",
  },
  header: {
    paddingBottom: 24,
    marginBottom: 32,
    borderBottom: `1px solid ${BORDER}`,
  },
  section: {
    marginBottom: 48,
  },
  shaderBox: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: 4,
    overflow: "hidden",
    border: `1px solid ${BORDER}`,
    marginBottom: 12,
  },
  table: {
    width: "100%",
    border: `1px solid ${BORDER}`,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "120px 1fr 100px 200px 1.4fr",
    gap: 16,
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: `1px solid ${BORDER}`,
    fontSize: 12,
    color: TEXT,
    lineHeight: 1.5,
  },
  rowHead: {
    borderBottom: `1px solid ${BORDER}`,
  },
  paramRow: {
    display: "grid",
    gridTemplateColumns: "180px 1fr 100px 1.6fr",
    gap: 16,
    alignItems: "start",
    padding: "10px 14px",
    borderBottom: `1px solid ${BORDER}`,
    fontSize: 12,
    color: TEXT,
    lineHeight: 1.5,
  },
  paramRow2: {
    display: "grid",
    gridTemplateColumns: "180px 1fr 1.6fr",
    gap: 16,
    alignItems: "start",
    padding: "10px 14px",
    borderBottom: `1px solid ${BORDER}`,
    fontSize: 12,
    color: TEXT,
    lineHeight: 1.5,
  },
  swatch: {
    width: "100%",
    height: 48,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: "0.04em",
    border: `1px solid ${BORDER}`,
  },
  code: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 400,
    padding: 14,
    borderRadius: 4,
    border: `1px solid ${BORDER}`,
    color: TEXT,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: 1.55,
    margin: "0 0 12px 0",
    width: "100%",
    boxSizing: "border-box",
    overflow: "auto",
  },
  list: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 400,
    color: TEXT,
    lineHeight: 1.6,
    paddingLeft: 20,
    margin: "0 0 12px 0",
    width: "100%",
    boxSizing: "border-box",
  },
  conceptBlock: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: 4,
    border: `1px solid ${BORDER}`,
    marginBottom: 12,
    boxSizing: "border-box",
  },
  copyBox: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 4,
    border: `1px solid ${BORDER}`,
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 400,
    color: TEXT,
    letterSpacing: "0.04em",
    lineHeight: 1.8,
    boxSizing: "border-box",
  },
  link: {
    color: TEXT,
    textDecoration: "underline",
  },
  footer: {
    borderTop: `1px solid ${BORDER}`,
    paddingTop: 18,
    marginTop: 32,
  },
};
