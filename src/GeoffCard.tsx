import React, { useCallback, useEffect, useRef, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";

type Aspect = "16:9" | "9:16" | "1:1";
const DIMS: Record<Aspect, { w: number; h: number }> = {
  "16:9": { w: 1920, h: 1080 },
  "9:16": { w: 1080, h: 1920 },
  "1:1": { w: 1080, h: 1080 },
};

export default function GeoffCard() {
  const grainRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const meshParentRef = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState<Aspect>("16:9");
  const [showControls, setShowControls] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  const [colors, setColors] = useState(["#FF6A00", "#FC5E10", "#FF8A30", "#FFCB8E", "#FFE4C2"]);
  const [distortion, setDistortion] = useState(0.6);
  const [swirl, setSwirl] = useState(0.3);
  const [speed, setSpeed] = useState(1.8);
  const [manualFrame, setManualFrame] = useState<number | null>(null);

  const { w: W, h: H } = DIMS[aspect];

  // Grain canvas matches selected dimensions
  useEffect(() => {
    const c = grainRef.current;
    if (!c) return;
    c.width = W;
    c.height = H;
    drawGrain(c);
  }, [W, H]);

  // Scale-to-fit so the chosen aspect fills the viewport
  useEffect(() => {
    const update = () => {
      const card = cardRef.current;
      if (!card) return;
      const s = Math.min(window.innerWidth / W, window.innerHeight / H);
      card.style.transform = `scale(${s})`;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [W, H]);

  const downloadJpeg = () => {
    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const ctx = out.getContext("2d")!;
    const glCanvas = meshParentRef.current?.querySelector("canvas");
    if (glCanvas) ctx.drawImage(glCanvas, 0, 0, W, H);
    const grain = grainRef.current;
    if (grain) {
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = "overlay";
      ctx.drawImage(grain, 0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    const link = document.createElement("a");
    link.download = `digital-sand-${aspect.replace(":", "x")}.jpg`;
    link.href = out.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  const downloadVideo = useCallback(async (format: "mp4" | "webm") => {
    if (recording) return;
    setRecording(true);
    setRecordProgress(0);

    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const ctx = out.getContext("2d")!;

    const fps = 30;
    const seconds = 10;
    const totalFrames = seconds * fps;
    const peakMs = seconds * 1000;

    const pngFrames: Uint8Array[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const progress = i / totalFrames;
      const frameMs = (1 - Math.cos(2 * Math.PI * progress)) / 2 * peakMs;
      setManualFrame(frameMs);
      await new Promise((r) => setTimeout(r, 60));
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));

      const glCanvas = meshParentRef.current?.querySelector("canvas");
      if (glCanvas) ctx.drawImage(glCanvas, 0, 0, W, H);
      const grain = grainRef.current;
      if (grain) {
        ctx.globalAlpha = 0.4;
        ctx.globalCompositeOperation = "overlay";
        ctx.drawImage(grain, 0, 0, W, H);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }

      const blob = await new Promise<Blob>((resolve) => out.toBlob((b) => resolve(b!), "image/png"));
      pngFrames.push(new Uint8Array(await blob.arrayBuffer()));
      setRecordProgress((i + 1) / totalFrames);
    }

    setManualFrame(null);

    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    for (let i = 0; i < pngFrames.length; i++) {
      await ffmpeg.writeFile(`frame${String(i).padStart(4, "0")}.png`, pngFrames[i]);
    }

    const outputName = `output.${format}`;
    const args = format === "webm"
      ? ["-framerate", String(fps), "-i", "frame%04d.png", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30", "-pix_fmt", "yuv420p", "-row-mt", "1", outputName]
      : ["-framerate", String(fps), "-i", "frame%04d.png", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", outputName];

    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputName);
    const mime = format === "webm" ? "video/webm" : "video/mp4";
    const blob = new Blob([data as BlobPart], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `digital-sand-${aspect.replace(":", "x")}-10s.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setRecording(false);
    setRecordProgress(0);
  }, [recording, W, H, aspect]);

  const meshProps = manualFrame !== null
    ? { speed: 0, frame: manualFrame }
    : { speed, frame: 0 };

  return (
    <div style={styles.page}>
      <div ref={cardRef} style={{ ...styles.card, width: W, height: H }}>
        <div ref={meshParentRef} style={{ position: "absolute", inset: 0 }}>
          <MeshGradient
            style={{ width: "100%", height: "100%" }}
            colors={colors}
            distortion={distortion}
            swirl={swirl}
            webGlContextAttributes={{ preserveDrawingBuffer: true }}
            {...meshProps}
          />
        </div>
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

      <div style={styles.toolbar}>
        <div style={styles.toolbarSection}>
          <div style={styles.label}>Size</div>
          <div style={styles.aspectGroup}>
            {(["16:9", "9:16", "1:1"] as Aspect[]).map((a) => (
              <button
                key={a}
                onClick={() => setAspect(a)}
                style={{ ...styles.aspectBtn, ...(aspect === a ? styles.aspectBtnActive : {}) }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.toolbarSection}>
          <div style={styles.label}>Download</div>
          <div style={styles.downloadGroup}>
            <button onClick={downloadJpeg} style={styles.downloadBtn}>JPEG</button>
            <button
              onClick={() => downloadVideo("mp4")}
              disabled={recording}
              style={{ ...styles.downloadBtn, ...(recording ? styles.downloadBtnBusy : {}) }}
            >
              {recording ? `${Math.round(recordProgress * 100)}%` : "MP4 (10s)"}
            </button>
            <button
              onClick={() => downloadVideo("webm")}
              disabled={recording}
              style={{ ...styles.downloadBtn, ...(recording ? styles.downloadBtnBusy : {}) }}
            >
              {recording ? "…" : "WebM (10s)"}
            </button>
          </div>
        </div>

        <div style={styles.toolbarSection}>
          <button onClick={() => setShowControls((v) => !v)} style={styles.linkBtn}>
            {showControls ? "Hide controls ▴" : "Customize colors ▾"}
          </button>
        </div>
      </div>

      {showControls && (
        <div style={styles.panel}>
          <div style={styles.row}>
            <span style={styles.rowLabel}>Distortion</span>
            <input type="range" min={0} max={1} step={0.01} value={distortion} onChange={(e) => setDistortion(+e.target.value)} style={styles.slider} />
            <span style={styles.rowValue}>{distortion.toFixed(2)}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.rowLabel}>Swirl</span>
            <input type="range" min={0} max={1} step={0.01} value={swirl} onChange={(e) => setSwirl(+e.target.value)} style={styles.slider} />
            <span style={styles.rowValue}>{swirl.toFixed(2)}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.rowLabel}>Speed</span>
            <input type="range" min={0} max={5} step={0.1} value={speed} onChange={(e) => setSpeed(+e.target.value)} style={styles.slider} />
            <span style={styles.rowValue}>{speed.toFixed(1)}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.rowLabel}>Colors</span>
            <div style={{ display: "flex", gap: 6, flex: 1 }}>
              {colors.map((c, i) => (
                <input
                  key={i}
                  type="color"
                  value={c}
                  onChange={(e) => {
                    const next = [...colors];
                    next[i] = e.target.value;
                    setColors(next);
                  }}
                  style={styles.colorInput}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#1a0f08",
    overflow: "hidden",
    fontFamily: "'Martian Mono', monospace",
  },
  card: {
    position: "relative",
    overflow: "hidden",
    transformOrigin: "center center",
    flexShrink: 0,
    boxShadow: "0 12px 60px rgba(0,0,0,0.5)",
  },
  toolbar: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 28,
    alignItems: "center",
    padding: "14px 22px",
    background: "rgba(20,20,20,0.92)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    zIndex: 20,
  },
  toolbarSection: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: 600,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  aspectGroup: {
    display: "flex",
    gap: 4,
    background: "rgba(255,255,255,0.04)",
    padding: 3,
    borderRadius: 6,
  },
  aspectBtn: {
    padding: "6px 12px",
    fontSize: 11,
    fontWeight: 500,
    background: "transparent",
    color: "#888",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontFamily: "'Martian Mono', monospace",
    textTransform: "uppercase",
  },
  aspectBtnActive: {
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
  },
  downloadGroup: {
    display: "flex",
    gap: 6,
  },
  downloadBtn: {
    padding: "8px 14px",
    fontSize: 11,
    fontWeight: 600,
    background: "#fff",
    color: "#111",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Martian Mono', monospace",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  downloadBtnBusy: {
    background: "#666",
    color: "#ccc",
    cursor: "wait",
  },
  linkBtn: {
    padding: "8px 12px",
    fontSize: 10,
    background: "transparent",
    color: "#999",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Martian Mono', monospace",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginTop: 16,
  },
  panel: {
    position: "fixed",
    bottom: 110,
    left: "50%",
    transform: "translateX(-50%)",
    width: 480,
    padding: "14px 18px",
    background: "rgba(20,20,20,0.95)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    zIndex: 21,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 11,
    color: "#bbb",
  },
  rowLabel: {
    width: 80,
    fontSize: 10,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  rowValue: {
    width: 40,
    textAlign: "right",
    fontSize: 10,
    color: "#666",
  },
  slider: {
    flex: 1,
    accentColor: "#FF8A30",
    height: 4,
  },
  colorInput: {
    width: 32,
    height: 28,
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 4,
    background: "none",
    cursor: "pointer",
    padding: 0,
    flex: 1,
  },
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
