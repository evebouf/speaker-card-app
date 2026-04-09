import React, { useCallback, useEffect, useRef, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const CARD = 1080;
const PAD = 44;
const LOOP_DURATION = 2 * Math.PI; // one full trig cycle = seamless loop

interface Speaker {
  id: string;
  name: string;
  image: string;
  role: string;
  roleSecondLine?: string;
  sessionType: string;
}

const SPEAKERS: Speaker[] = [
  {
    id: "jensen",
    name: "Jensen Huang",
    image: "/jensen.png",
    role: "Founder &",
    roleSecondLine: "CEO, Nvidia",
    sessionType: "Keynote",
  },
  {
    id: "sam",
    name: "Sam Altman",
    image: "/sam.png",
    role: "Co-Founder &",
    roleSecondLine: "CEO, OpenAI",
    sessionType: "Keynote",
  },
  {
    id: "dario",
    name: "Dario Amodei",
    image: "/dario.png",
    role: "Co-Founder &",
    roleSecondLine: "CEO, Anthropic",
    sessionType: "Keynote",
  },
  {
    id: "alexandr",
    name: "Alexandr Wang",
    image: "/alexandr.png",
    role: "Chief AI",
    roleSecondLine: "Officer, Meta",
    sessionType: "Keynote",
  },
  {
    id: "jeff",
    name: "Jeff Dean",
    image: "/jeff.png",
    role: "Chief Scientist,",
    roleSecondLine: "Google DeepMind",
    sessionType: "Keynote",
  },
  {
    id: "tarek",
    name: "Tarek Mansour",
    image: "/tarek.png",
    role: "Co-Founder &",
    roleSecondLine: "CEO, Kalshi (W19)",
    sessionType: "Keynote",
  },
];

export default function SpeakerCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const meshParentRef = useRef<HTMLDivElement>(null);
  const [recording, setRecording] = useState(false);
  const [manualFrame, setManualFrame] = useState<number | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(SPEAKERS[0]);
  const [colors, setColors] = useState(["#FF6A00", "#FF8A30", "#FFCB8E", "#FFE4C2"]);
  const [distortion, setDistortion] = useState(0.6);
  const [swirl, setSwirl] = useState(0.3);
  const [speed, setSpeed] = useState(1.2);
  const [grainMixer, setGrainMixer] = useState(0);
  const [grainOverlay, setGrainOverlay] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CARD;
    canvas.height = CARD;
    drawGrain(canvas);
  }, []);

  useEffect(() => {
    const update = () => {
      const card = cardRef.current;
      if (!card) return;
      const s = Math.min(1, (window.innerHeight * 0.92) / CARD, (window.innerWidth * 0.92) / CARD);
      card.style.transform = `scale(${s})`;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const speakerImg = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    speakerImg.current = null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = activeSpeaker.image;
    img.onload = () => { speakerImg.current = img; };
  }, [activeSpeaker]);

  /** Read the WebGL canvas directly (requires preserveDrawingBuffer on the MeshGradient) */
  const readMeshGradient = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    const glCanvas = meshParentRef.current?.querySelector("canvas");
    if (!glCanvas) return;
    ctx.drawImage(glCanvas, 0, 0, size, size);
  }, []);

  const compositeFrame = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    const scale = size / CARD;

    // 1. Mesh gradient — read directly from the WebGL canvas
    readMeshGradient(ctx, size);

    // 2. Grain overlay
    const grain = canvasRef.current;
    if (grain) {
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = "overlay";
      ctx.drawImage(grain, 0, 0, size, size);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    // 3. Speaker photo
    const img = speakerImg.current;
    if (img) {
      const s = (650 * scale) / img.height;
      const w = img.width * s;
      const h = img.height * s;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    }

    // 4. Text
    const pad = PAD * scale;
    const fontSize = Math.round(18 * scale);
    ctx.fillStyle = "#4A301D";
    ctx.font = `400 ${fontSize}px 'Martian Mono', monospace`;

    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText("STARTUP SCHOOL 2026", pad, pad);
    ctx.fillText(activeSpeaker.sessionType.toUpperCase(), pad, 390 * scale);
    ctx.fillText(activeSpeaker.name.toUpperCase(), pad, 540 * scale);

    ctx.textAlign = "right";
    ctx.fillText("JULY 25-26 2026", size - pad, pad);
    ctx.fillText("SPEAKER", size - pad, 390 * scale);
    ctx.fillText(activeSpeaker.role.toUpperCase(), size - pad, 540 * scale);
    if (activeSpeaker.roleSecondLine) {
      ctx.fillText(activeSpeaker.roleSecondLine.toUpperCase(), size - pad, (540 + 18 * 1.5) * scale);
    }

    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";
    ctx.fillText("CHASE CENTER, SAN FRANCISCO", pad, size - pad);
    ctx.textAlign = "right";
    ctx.fillText("HOSTED BY Y\u2009COMBINATOR", size - pad, size - pad);
  }, [readMeshGradient, activeSpeaker]);

  const handleDownloadJpeg = useCallback(() => {
    const out = document.createElement("canvas");
    out.width = CARD;
    out.height = CARD;
    compositeFrame(out.getContext("2d")!, CARD);

    const link = document.createElement("a");
    link.download = `speaker-card-${activeSpeaker.id}.jpg`;
    link.href = out.toDataURL("image/jpeg", 0.95);
    link.click();
  }, [compositeFrame]);

  const setManualFrameRef = useRef(setManualFrame);
  setManualFrameRef.current = setManualFrame;

  const handleDownloadVideo = useCallback(async () => {
    setRecording(true);

    const RES = CARD; // 1080x1080 full resolution
    const out = document.createElement("canvas");
    out.width = RES;
    out.height = RES;
    const ctx = out.getContext("2d")!;

    const fps = 30;
    const durationSec = 3;
    const duration = durationSec * 1000;
    const totalFrames = Math.round(durationSec * fps); // 90 frames

    const stream = out.captureStream(0);
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 4_000_000, // 4 Mbps — keeps file well under 15MB for 3s
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.start();

    // Cosine ping-pong: smoothly goes 0 → peak → 0 with no discontinuities
    const peakMs = 1500;

    for (let i = 0; i < totalFrames; i++) {
      const progress = i / totalFrames;
      const frameMs = (1 - Math.cos(2 * Math.PI * progress)) / 2 * peakMs;

      setManualFrameRef.current(frameMs);
      await new Promise((r) => setTimeout(r, 50));
      await new Promise((r) => requestAnimationFrame(r));

      compositeFrame(ctx, RES);

      const track = stream.getVideoTracks()[0] as any;
      track?.requestFrame?.();

      if (i % 30 === 0) {
        console.log(`Recording frame ${i}/${totalFrames}`);
      }
    }

    recorder.stop();

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    const webmBlob = new Blob(chunks, { type: "video/webm" });

    // Convert WebM → MP4 using ffmpeg.wasm (Twitter/X requires MP4)
    console.log("Converting to MP4...");
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    await ffmpeg.writeFile("input.webm", await fetchFile(webmBlob));
    await ffmpeg.exec(["-i", "input.webm", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "output.mp4"]);
    const mp4Data = await ffmpeg.readFile("output.mp4");
    const mp4Blob = new Blob([mp4Data], { type: "video/mp4" });

    const url = URL.createObjectURL(mp4Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `speaker-card-${activeSpeaker.id}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setManualFrame(null);
    setRecording(false);
  }, [compositeFrame]);

  const meshProps = manualFrame !== null
    ? { speed: 0, frame: manualFrame }
    : { speed, frame: 0 };

  return (
    <div style={styles.page}>
      <div ref={cardRef} style={styles.card}>
        <div ref={meshParentRef} style={{ position: "absolute", inset: 0 }}>
          <MeshGradient
            style={{ width: "100%", height: "100%" }}
            colors={colors}
            distortion={distortion}
            swirl={swirl}
            grainMixer={grainMixer}
            grainOverlay={grainOverlay}
            scale={scale}
            rotation={rotation}
            offsetX={offsetX}
            offsetY={offsetY}
            webGlContextAttributes={{ preserveDrawingBuffer: true }}
            {...meshProps}
          />
        </div>

        <canvas
          ref={canvasRef}
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

        <img src={activeSpeaker.image} alt={activeSpeaker.name} style={styles.photo} />

        <div style={styles.textLayer}>
          <span style={{ ...styles.label, position: "absolute", top: PAD, left: PAD }}>
            Startup School 2026
          </span>
          <span style={{ ...styles.label, position: "absolute", top: PAD, right: PAD }}>
            July 25-26 2026
          </span>
          <span style={{ ...styles.label, position: "absolute", top: 390, left: PAD }}>
            {activeSpeaker.sessionType}
          </span>
          <span style={{ ...styles.label, position: "absolute", top: 390, right: PAD }}>
            Speaker
          </span>
          <span style={{ ...styles.label, position: "absolute", top: 540, left: PAD }}>
            {activeSpeaker.name}
          </span>
          <span style={{ ...styles.label, position: "absolute", top: 540, right: PAD, textAlign: "right" }}>
            {activeSpeaker.roleSecondLine
              ? `${activeSpeaker.role}\n${activeSpeaker.roleSecondLine}`
              : activeSpeaker.role}
          </span>
          <span style={{ ...styles.label, position: "absolute", bottom: PAD, left: PAD }}>
            Chase Center, San Francisco
          </span>
          <span style={{ ...styles.label, position: "absolute", bottom: PAD, right: PAD }}>
            {"Hosted by Y\u2009Combinator"}
          </span>
        </div>
      </div>

      <div style={styles.speakerTabs}>
        {SPEAKERS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSpeaker(s)}
            style={{
              ...styles.tabBtn,
              ...(activeSpeaker.id === s.id ? styles.tabBtnActive : {}),
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div style={styles.btnRow}>
        <button onClick={() => setShowPanel((v) => !v)} style={styles.downloadBtn}>
          {showPanel ? "Close" : "Shader"}
        </button>
        <button onClick={handleDownloadJpeg} style={styles.downloadBtn}>
          Download JPEG
        </button>
        <button onClick={handleDownloadVideo} disabled={recording} style={styles.downloadBtn}>
          {recording ? "Recording..." : "Download MP4"}
        </button>
      </div>

      {showPanel && (
        <div style={styles.panel}>
          <div style={styles.panelTitle}>Mesh Gradient</div>

          <label style={styles.sliderLabel}>
            Distortion
            <input type="range" min={0} max={1} step={0.01} value={distortion}
              onChange={(e) => setDistortion(+e.target.value)} style={styles.slider} />
            <span style={styles.sliderValue}>{distortion.toFixed(2)}</span>
          </label>

          <label style={styles.sliderLabel}>
            Swirl
            <input type="range" min={0} max={1} step={0.01} value={swirl}
              onChange={(e) => setSwirl(+e.target.value)} style={styles.slider} />
            <span style={styles.sliderValue}>{swirl.toFixed(2)}</span>
          </label>

          <label style={styles.sliderLabel}>
            Speed
            <input type="range" min={0} max={5} step={0.1} value={speed}
              onChange={(e) => setSpeed(+e.target.value)} style={styles.slider} />
            <span style={styles.sliderValue}>{speed.toFixed(1)}</span>
          </label>

          <label style={styles.sliderLabel}>
            Grain Mix
            <input type="range" min={0} max={1} step={0.01} value={grainMixer}
              onChange={(e) => setGrainMixer(+e.target.value)} style={styles.slider} />
            <span style={styles.sliderValue}>{grainMixer.toFixed(2)}</span>
          </label>

          <label style={styles.sliderLabel}>
            Grain Overlay
            <input type="range" min={0} max={1} step={0.01} value={grainOverlay}
              onChange={(e) => setGrainOverlay(+e.target.value)} style={styles.slider} />
            <span style={styles.sliderValue}>{grainOverlay.toFixed(2)}</span>
          </label>

          <div style={{ ...styles.panelTitle, marginTop: 14, marginBottom: 10 }}>Transform</div>

          <label style={styles.sliderLabel}>
            Scale
            <input type="range" min={0.01} max={4} step={0.01} value={scale}
              onChange={(e) => setScale(+e.target.value)} style={styles.slider} />
            <span style={styles.sliderValue}>{scale.toFixed(2)}</span>
          </label>

          <label style={styles.sliderLabel}>
            Rotation
            <input type="range" min={0} max={360} step={1} value={rotation}
              onChange={(e) => setRotation(+e.target.value)} style={styles.slider} />
            <span style={styles.sliderValue}>{rotation}°</span>
          </label>

          <label style={styles.sliderLabel}>
            Offset X
            <input type="range" min={-1} max={1} step={0.01} value={offsetX}
              onChange={(e) => setOffsetX(+e.target.value)} style={styles.slider} />
            <span style={styles.sliderValue}>{offsetX.toFixed(2)}</span>
          </label>

          <label style={styles.sliderLabel}>
            Offset Y
            <input type="range" min={-1} max={1} step={0.01} value={offsetY}
              onChange={(e) => setOffsetY(+e.target.value)} style={styles.slider} />
            <span style={styles.sliderValue}>{offsetY.toFixed(2)}</span>
          </label>

          <div style={{ marginTop: 12 }}>
            <div style={styles.sliderLabel}>Colors</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {colors.map((c, i) => (
                <input key={i} type="color" value={c}
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
    background: "#111",
  },
  btnRow: {
    position: "absolute",
    bottom: 20,
    right: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 10,
  },
  downloadBtn: {
    padding: "10px 20px",
    fontFamily: "'Martian Mono', monospace",
    fontSize: 12,
    fontWeight: 500,
    background: "#fff",
    color: "#111",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    letterSpacing: "0.03em",
    textTransform: "uppercase" as const,
  },
  card: {
    width: CARD,
    height: CARD,
    position: "relative",
    overflow: "hidden",
    transformOrigin: "center center",
    flexShrink: 0,
  },
  textLayer: {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    fontFamily: "'Martian Mono', monospace",
    textTransform: "uppercase",
    color: "#4A301D",
  },
  label: {
    fontSize: 18,
    fontWeight: 400,
    letterSpacing: "0.04em",
    lineHeight: 1.5,
    whiteSpace: "pre-line",
  },
  photo: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxHeight: 650,
    display: "block",
    zIndex: 1,
  },
  speakerTabs: {
    position: "fixed",
    top: 20,
    left: 20,
    width: 200,
    background: "rgba(30,30,30,0.95)",
    borderRadius: 10,
    padding: "16px 18px",
    zIndex: 20,
    backdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  tabBtn: {
    padding: "8px 12px",
    fontFamily: "'Martian Mono', monospace",
    fontSize: 11,
    fontWeight: 400,
    background: "rgba(255,255,255,0.05)",
    color: "#999",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    textAlign: "left" as const,
    letterSpacing: "0.03em",
    transition: "all 0.15s",
  },
  tabBtnActive: {
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    fontWeight: 600,
  },
  panel: {
    position: "fixed",
    top: 20,
    right: 20,
    width: 240,
    background: "rgba(30,30,30,0.95)",
    borderRadius: 10,
    padding: "16px 18px",
    zIndex: 20,
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto" as const,
  },
  panelTitle: {
    fontFamily: "'Martian Mono', monospace",
    fontSize: 11,
    fontWeight: 600,
    color: "#aaa",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginBottom: 14,
  },
  sliderLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "'Martian Mono', monospace",
    fontSize: 11,
    color: "#ccc",
    marginBottom: 10,
  },
  slider: {
    flex: 1,
    accentColor: "#FF8A30",
    height: 4,
  },
  sliderValue: {
    fontFamily: "'Martian Mono', monospace",
    fontSize: 10,
    color: "#888",
    minWidth: 32,
    textAlign: "right" as const,
  },
  colorInput: {
    width: 36,
    height: 28,
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 4,
    background: "none",
    cursor: "pointer",
    padding: 0,
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
