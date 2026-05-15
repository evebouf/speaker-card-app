import React, { useCallback, useEffect, useRef, useState } from "react";
import { MeshGradient, FlutedGlass } from "@paper-design/shaders-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";

const W = 1080;
const H = 1920;

function parseSettings(): Partial<Record<string, any>> {
  try {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("settings");
    if (!s) return {};
    return JSON.parse(atob(decodeURIComponent(s)));
  } catch {
    return {};
  }
}

export default function ShortsCard() {
  const initial = parseSettings();
  const rawMode = new URLSearchParams(window.location.search).get("raw") === "1";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const meshParentRef = useRef<HTMLDivElement>(null);
  const fluteParentRef = useRef<HTMLDivElement>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  const [colors, setColors] = useState<string[]>(initial.colors || ["#FF6A00", "#FC5E10", "#FF8A30", "#FFCB8E", "#FFE4C2"]);
  const [distortion, setDistortion] = useState<number>(initial.distortion ?? 0.6);
  const [swirl, setSwirl] = useState<number>(initial.swirl ?? 0.3);
  const [speed, setSpeed] = useState<number>(initial.speed ?? 1.8);
  const [scale, setScale] = useState<number>(initial.scale ?? 1);
  const [rotation, setRotation] = useState<number>(initial.rotation ?? 0);
  const [offsetX, setOffsetX] = useState<number>(initial.offsetX ?? 0);
  const [offsetY, setOffsetY] = useState<number>(initial.offsetY ?? 0);
  const [fluteEnabled, setFluteEnabled] = useState<boolean>(initial.fluteEnabled ?? false);
  const [fluteSize, setFluteSize] = useState<number>(initial.fluteSize ?? 0.5);
  const [fluteShadows, setFluteShadows] = useState<number>(initial.fluteShadows ?? 0.25);
  const [fluteHighlights, setFluteHighlights] = useState<number>(initial.fluteHighlights ?? 0.1);
  const [fluteDistortion, setFluteDistortion] = useState<number>(initial.fluteDistortion ?? 0.5);
  const [fluteEdges, setFluteEdges] = useState<number>(initial.fluteEdges ?? 0.25);

  const [manualFrame, setManualFrame] = useState<number | null>(null);
  const [recordMode, setRecordMode] = useState<"idle" | "countdown" | "looping">("idle");
  const recordModeRef = useRef<"idle" | "countdown" | "looping">("idle");
  const [countdown, setCountdown] = useState(0);
  const [loopProgress, setLoopProgress] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [loopSeconds, setLoopSeconds] = useState<5 | 10>(10);
  const [showText, setShowText] = useState<boolean>(initial.showText ?? true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    drawGrain(canvas);
  }, []);

  useEffect(() => {
    if (rawMode) return; // native pixel size, no scaling
    const update = () => {
      const card = cardRef.current;
      if (!card) return;
      const s = Math.min((window.innerHeight * 0.88) / H, (window.innerWidth * 0.92) / W);
      card.style.transform = `scale(${Math.min(s, 1)})`;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [rawMode]);

  const handleRecordMode = useCallback(async () => {
    if (recordModeRef.current !== "idle") {
      recordModeRef.current = "idle";
      setRecordMode("idle");
      setManualFrame(null);
      return;
    }

    recordModeRef.current = "countdown";
    setRecordMode("countdown");
    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      await new Promise((r) => setTimeout(r, 1000));
      if ((recordModeRef.current as string) === "idle") return;
    }

    recordModeRef.current = "looping";
    setRecordMode("looping");
    setLoopCount(0);
    setCountdown(0);

    const startTime = performance.now();
    const loopDurationMs = loopSeconds * 1000;
    const peakMs = loopDurationMs;

    const animate = () => {
      if (recordModeRef.current !== "looping") return;
      const elapsed = performance.now() - startTime;
      const currentLoop = Math.floor(elapsed / loopDurationMs);
      const progress = (elapsed % loopDurationMs) / loopDurationMs;
      const frameMs = (1 - Math.cos(2 * Math.PI * progress)) / 2 * peakMs;

      setManualFrame(frameMs);
      setLoopProgress(progress);
      setLoopCount(currentLoop + 1);

      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [loopSeconds]);

  const compositeFrame = useCallback((ctx: CanvasRenderingContext2D) => {
    // 1. Mesh gradient
    const meshCanvas = meshParentRef.current?.querySelector("canvas");
    if (meshCanvas) ctx.drawImage(meshCanvas, 0, 0, W, H);

    // 2. Fluted glass overlay (if enabled)
    if (fluteEnabled) {
      const fluteCanvas = fluteParentRef.current?.querySelector("canvas");
      if (fluteCanvas) ctx.drawImage(fluteCanvas, 0, 0, W, H);
    }

    // 3. Grain overlay
    const grain = canvasRef.current;
    if (grain) {
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = "overlay";
      ctx.drawImage(grain, 0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    // 4. Text
    if (showText) {
      ctx.fillStyle = "#4A301D";

      // Top-left: Y Combinator Presents (small) above the headline
      const presentsFs = 32;
      const presentsY = 180;
      ctx.font = `400 ${presentsFs}px 'Martian Mono', monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText("Y COMBINATOR PRESENTS", 90 + 12, presentsY);

      const headlineFs = 110;
      ctx.font = `400 ${headlineFs}px 'Martian Mono', monospace`;
      const headlineStartY = presentsY + presentsFs * 1.4;
      const headlineLineH = headlineFs * 1.1;
      ctx.fillText("STARTUP SCHOOL", 90, headlineStartY);
      ctx.fillText("2026", 90, headlineStartY + headlineLineH);
      ctx.fillText("JUL 25-26", 90, headlineStartY + headlineLineH * 2);

      // SF.CA and REGISTER NOW
      const otherFs = 92;
      ctx.font = `400 ${otherFs}px 'Martian Mono', monospace`;
      ctx.textAlign = "right";
      ctx.fillText("SF.CA", W - 90, H * 0.55);

      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText("REGISTER NOW", 90, H - 320);
    }
  }, [fluteEnabled, showText]);

  const handleDownloadJpeg = () => {
    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    compositeFrame(out.getContext("2d")!);

    const link = document.createElement("a");
    link.download = "shorts-card.jpg";
    link.href = out.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  const handleDownloadVideo = useCallback(async (format: "mp4" | "webm" = "mp4") => {
    if (recording) return;
    setRecording(true);
    setRecordProgress(0);

    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const ctx = out.getContext("2d")!;

    const fps = 30;
    const totalFrames = loopSeconds * fps;
    const peakMs = loopSeconds * 1000;

    const pngFrames: Uint8Array[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const progress = i / totalFrames;
      const frameMs = (1 - Math.cos(2 * Math.PI * progress)) / 2 * peakMs;

      setManualFrame(frameMs);
      await new Promise((r) => setTimeout(r, 60));
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));

      compositeFrame(ctx);

      const blob = await new Promise<Blob>((resolve) => {
        out.toBlob((b) => resolve(b!), "image/png");
      });
      pngFrames.push(new Uint8Array(await blob.arrayBuffer()));

      setRecordProgress((i + 1) / totalFrames);
    }

    setManualFrame(null);

    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    for (let i = 0; i < pngFrames.length; i++) {
      const name = `frame${String(i).padStart(4, "0")}.png`;
      await ffmpeg.writeFile(name, pngFrames[i]);
    }

    const outputName = `output.${format}`;
    const args = format === "webm"
      ? [
          "-framerate", String(fps),
          "-i", "frame%04d.png",
          "-c:v", "libvpx-vp9",
          "-b:v", "0",
          "-crf", "30",
          "-pix_fmt", "yuv420p",
          "-row-mt", "1",
          outputName,
        ]
      : [
          "-framerate", String(fps),
          "-i", "frame%04d.png",
          "-c:v", "libx264",
          "-preset", "slow",
          "-crf", "18",
          "-pix_fmt", "yuv420p",
          "-movflags", "+faststart",
          outputName,
        ];

    await ffmpeg.exec(args);

    const videoData = await ffmpeg.readFile(outputName);
    const mime = format === "webm" ? "video/webm" : "video/mp4";
    const videoBlob = new Blob([videoData as BlobPart], { type: mime });

    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shorts-card-${loopSeconds}s.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setRecording(false);
    setRecordProgress(0);
  }, [recording, loopSeconds, compositeFrame]);

  const meshProps = manualFrame !== null
    ? { speed: 0, frame: manualFrame }
    : { speed, frame: 0 };

  const handleDownloadHtml = () => {
    const settings = {
      colors, distortion, swirl, speed, scale, rotation, offsetX, offsetY,
      fluteEnabled, fluteSize, fluteShadows, fluteHighlights, fluteDistortion, fluteEdges,
      showText,
    };
    const html = generateStandaloneHtml(settings);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shorts-card.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const openRaw = () => {
    const settings = {
      colors, distortion, swirl, speed, scale, rotation, offsetX, offsetY,
      fluteEnabled, fluteSize, fluteShadows, fluteHighlights, fluteDistortion, fluteEdges,
      showText,
    };
    const encoded = encodeURIComponent(btoa(JSON.stringify(settings)));
    window.open(`${window.location.origin}${window.location.pathname}?view=shorts&raw=1&settings=${encoded}`, "_blank");
  };

  return (
    <div style={rawMode ? styles.pageRaw : styles.page}>
      <div ref={cardRef} style={rawMode ? styles.cardRaw : styles.card}>
        <div ref={meshParentRef} style={{ position: "absolute", inset: 0 }}>
          <MeshGradient
            style={{ width: "100%", height: "100%" }}
            colors={colors}
            distortion={distortion}
            swirl={swirl}
            scale={scale}
            rotation={rotation}
            offsetX={offsetX}
            offsetY={offsetY}
            webGlContextAttributes={{ preserveDrawingBuffer: true }}
            {...meshProps}
          />
        </div>

        {fluteEnabled && (
          <div ref={fluteParentRef} style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            <FlutedGlass
              style={{ width: "100%", height: "100%" }}
              colorBack="#00000000"
              colorShadow="#000000"
              colorHighlight="#ffffff"
              size={fluteSize}
              shadows={fluteShadows}
              highlights={fluteHighlights}
              shape="lines"
              angle={0}
              distortionShape="prism"
              distortion={fluteDistortion}
              shift={0}
              stretch={0}
              blur={0}
              edges={fluteEdges}
              margin={0}
              speed={0}
              webGlContextAttributes={{ preserveDrawingBuffer: true }}
            />
          </div>
        )}

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

        {showText && (
          <div style={styles.textLayer}>
            <div style={styles.headlineBlock}>
              <div style={styles.presents}>Y COMBINATOR PRESENTS</div>
              <div style={styles.headline}>STARTUP SCHOOL</div>
              <div style={styles.headline}>2026</div>
              <div style={styles.headline}>JUL 25-26</div>
            </div>
            <div style={styles.location}>SF.CA</div>
            <div style={styles.register}>REGISTER NOW</div>
          </div>
        )}
      </div>

      {!rawMode && (recordMode === "countdown" || recordMode === "looping") && (
        <div style={styles.recordPanel}>
          {recordMode === "countdown" && (
            <>
              <div style={{ ...styles.recordStatus, color: "#FF8A30" }}>GET READY</div>
              <div style={styles.countdownNumber}>{countdown}</div>
              <div style={styles.recordHint}>Start QuickTime recording now</div>
            </>
          )}
          {recordMode === "looping" && (() => {
            const nearBoundary = loopProgress > 0.92 || loopProgress < 0.08;
            const atCut = loopProgress > 0.92;
            return (
              <>
                <div style={{ ...styles.recordStatus, color: atCut ? "#4f4" : "#ff4444" }}>
                  {atCut ? "CUT HERE" : "RECORDING"}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                  <div style={{ ...styles.loopDot, ...(atCut ? { background: "#4f4", boxShadow: "0 0 8px rgba(68,255,68,0.8)" } : {}) }} />
                  <div style={{ ...styles.loopBarBg, flex: 1 }}>
                    <div style={{ ...styles.loopBarFill, width: `${loopProgress * 100}%`, ...(atCut ? { background: "#4f4" } : {}) }} />
                  </div>
                </div>

                <div style={styles.recordTimerRow}>
                  <span>Loop {loopCount}</span>
                  <span>{(loopProgress * loopSeconds).toFixed(1)}s / {loopSeconds}s</span>
                </div>

                <div style={{ ...styles.recordHint, ...(nearBoundary ? { color: "#4f4" } : {}) }}>
                  {atCut
                    ? "Stop QuickTime now for clean loop"
                    : `Next cut point in ${((1 - loopProgress) * loopSeconds).toFixed(1)}s`}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {!rawMode && (
        <div style={styles.btnRow}>
          <div style={styles.durationToggle}>
            {([5, 10] as const).map((d) => (
              <button
                key={d}
                onClick={() => setLoopSeconds(d)}
                disabled={recordMode !== "idle"}
                style={{
                  ...styles.durationBtn,
                  ...(loopSeconds === d ? styles.durationBtnActive : {}),
                }}
              >
                {d}s
              </button>
            ))}
          </div>
          <button onClick={() => setShowText((v) => !v)} style={styles.btn}>
            {showText ? "Hide Text" : "Show Text"}
          </button>
          <button onClick={() => setShowPanel((v) => !v)} style={styles.btn}>
            {showPanel ? "Close" : "Shader"}
          </button>
          <button
            onClick={handleRecordMode}
            style={{ ...styles.btn, ...(recordMode !== "idle" ? { background: "#ff4444", color: "#fff" } : {}) }}
          >
            {recordMode === "idle" ? "Screen Record" : "Stop"}
          </button>
          <button onClick={handleDownloadJpeg} style={styles.btn}>
            Download JPEG
          </button>
          <button
            onClick={() => handleDownloadVideo("mp4")}
            disabled={recording}
            style={{ ...styles.btn, ...(recording ? { background: "#888", cursor: "wait" } : {}) }}
          >
            {recording
              ? `Recording ${Math.round(recordProgress * 100)}%`
              : `Download MP4 (${loopSeconds}s)`}
          </button>
          <button
            onClick={() => handleDownloadVideo("webm")}
            disabled={recording}
            style={{ ...styles.btn, ...(recording ? { background: "#888", cursor: "wait" } : {}) }}
          >
            {recording ? "…" : `Download WebM (${loopSeconds}s)`}
          </button>
          <button onClick={handleDownloadHtml} style={styles.btn}>
            Download HTML
          </button>
          <button onClick={openRaw} style={styles.btn}>
            Open Raw 1080×1920
          </button>
        </div>
      )}

      {!rawMode && showPanel && (
        <div style={styles.panel}>
          <div style={styles.panelTitle}>Gradient</div>
          <div style={styles.controlRow}>
            <div style={styles.controlLabel}>Distortion <span style={styles.controlValue}>{distortion.toFixed(2)}</span></div>
            <input type="range" min={0} max={1} step={0.01} value={distortion}
              onChange={(e) => setDistortion(+e.target.value)} style={styles.slider} />
          </div>
          <div style={styles.controlRow}>
            <div style={styles.controlLabel}>Swirl <span style={styles.controlValue}>{swirl.toFixed(2)}</span></div>
            <input type="range" min={0} max={1} step={0.01} value={swirl}
              onChange={(e) => setSwirl(+e.target.value)} style={styles.slider} />
          </div>
          <div style={styles.controlRow}>
            <div style={styles.controlLabel}>Speed <span style={styles.controlValue}>{speed.toFixed(1)}</span></div>
            <input type="range" min={0} max={5} step={0.1} value={speed}
              onChange={(e) => setSpeed(+e.target.value)} style={styles.slider} />
          </div>
          <div style={styles.controlRow}>
            <div style={styles.controlLabel}>Scale <span style={styles.controlValue}>{scale.toFixed(2)}</span></div>
            <input type="range" min={0.01} max={4} step={0.01} value={scale}
              onChange={(e) => setScale(+e.target.value)} style={styles.slider} />
          </div>
          <div style={styles.controlRow}>
            <div style={styles.controlLabel}>Rotation <span style={styles.controlValue}>{rotation}°</span></div>
            <input type="range" min={0} max={360} step={1} value={rotation}
              onChange={(e) => setRotation(+e.target.value)} style={styles.slider} />
          </div>
          <div style={styles.controlRow}>
            <div style={styles.controlLabel}>Offset X <span style={styles.controlValue}>{offsetX.toFixed(2)}</span></div>
            <input type="range" min={-1} max={1} step={0.01} value={offsetX}
              onChange={(e) => setOffsetX(+e.target.value)} style={styles.slider} />
          </div>
          <div style={styles.controlRow}>
            <div style={styles.controlLabel}>Offset Y <span style={styles.controlValue}>{offsetY.toFixed(2)}</span></div>
            <input type="range" min={-1} max={1} step={0.01} value={offsetY}
              onChange={(e) => setOffsetY(+e.target.value)} style={styles.slider} />
          </div>

          <div style={styles.panelDivider} />
          <div style={styles.panelTitle}>Fluted Glass</div>
          <div style={styles.controlRow}>
            <label style={{ ...styles.controlLabel, cursor: "pointer" }}>
              <span>Enable</span>
              <input type="checkbox" checked={fluteEnabled}
                onChange={(e) => setFluteEnabled(e.target.checked)} />
            </label>
          </div>
          {fluteEnabled && (
            <>
              <div style={styles.controlRow}>
                <div style={styles.controlLabel}>Size <span style={styles.controlValue}>{fluteSize.toFixed(2)}</span></div>
                <input type="range" min={0.05} max={2} step={0.01} value={fluteSize}
                  onChange={(e) => setFluteSize(+e.target.value)} style={styles.slider} />
              </div>
              <div style={styles.controlRow}>
                <div style={styles.controlLabel}>Distortion <span style={styles.controlValue}>{fluteDistortion.toFixed(2)}</span></div>
                <input type="range" min={0} max={1} step={0.01} value={fluteDistortion}
                  onChange={(e) => setFluteDistortion(+e.target.value)} style={styles.slider} />
              </div>
              <div style={styles.controlRow}>
                <div style={styles.controlLabel}>Shadows <span style={styles.controlValue}>{fluteShadows.toFixed(2)}</span></div>
                <input type="range" min={0} max={1} step={0.01} value={fluteShadows}
                  onChange={(e) => setFluteShadows(+e.target.value)} style={styles.slider} />
              </div>
              <div style={styles.controlRow}>
                <div style={styles.controlLabel}>Highlights <span style={styles.controlValue}>{fluteHighlights.toFixed(2)}</span></div>
                <input type="range" min={0} max={1} step={0.01} value={fluteHighlights}
                  onChange={(e) => setFluteHighlights(+e.target.value)} style={styles.slider} />
              </div>
              <div style={styles.controlRow}>
                <div style={styles.controlLabel}>Edges <span style={styles.controlValue}>{fluteEdges.toFixed(2)}</span></div>
                <input type="range" min={0} max={1} step={0.01} value={fluteEdges}
                  onChange={(e) => setFluteEdges(+e.target.value)} style={styles.slider} />
              </div>
            </>
          )}

          <div style={styles.panelDivider} />
          <div style={styles.panelTitle}>Colors</div>
          <div style={{ display: "flex", gap: 10 }}>
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
    background: "#2E1F15",
    overflow: "hidden",
  },
  pageRaw: {
    margin: 0,
    padding: 0,
    background: "#000",
    width: W,
    height: H,
  },
  card: {
    width: W,
    height: H,
    position: "relative",
    overflow: "hidden",
    transformOrigin: "center center",
    flexShrink: 0,
  },
  cardRaw: {
    width: W,
    height: H,
    position: "relative",
    overflow: "hidden",
  },
  textLayer: {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    fontFamily: "'Martian Mono', monospace",
    color: "#4A301D",
    pointerEvents: "none",
  },
  headlineBlock: {
    position: "absolute",
    top: 180,
    left: 90,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  headline: {
    fontSize: 110,
    fontWeight: 400,
    letterSpacing: "-0.01em",
    lineHeight: 1.1,
    textTransform: "uppercase",
  },
  location: {
    position: "absolute",
    top: "55%",
    right: 90,
    transform: "translateY(-50%)",
    fontSize: 92,
    fontWeight: 400,
    letterSpacing: "-0.01em",
    textTransform: "uppercase",
  },
  register: {
    position: "absolute",
    bottom: 320,
    left: 90,
    fontSize: 92,
    fontWeight: 400,
    letterSpacing: "-0.01em",
    textTransform: "uppercase",
  },
  presents: {
    fontSize: 32,
    fontWeight: 400,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: 10,
    paddingLeft: 12,
  },
  btnRow: {
    position: "absolute",
    bottom: 8,
    right: 8,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    zIndex: 10,
    alignItems: "stretch",
  },
  durationToggle: {
    display: "flex",
    gap: 1,
    background: "rgba(24,24,24,0.92)",
    backdropFilter: "blur(8px)",
    borderRadius: 3,
    padding: 1,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  durationBtn: {
    flex: 1,
    padding: "2px 0",
    fontFamily: "'Martian Mono', monospace",
    fontSize: 6,
    fontWeight: 500,
    background: "transparent",
    color: "#888",
    border: "none",
    borderRadius: 2,
    cursor: "pointer",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  durationBtnActive: {
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
  },
  btn: {
    padding: "3px 6px",
    fontFamily: "'Martian Mono', monospace",
    fontSize: 6,
    fontWeight: 500,
    background: "rgba(255,255,255,0.88)",
    color: "#111",
    border: "none",
    borderRadius: 3,
    cursor: "pointer",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  recordPanel: {
    position: "fixed",
    top: 6,
    left: 6,
    width: 86,
    background: "rgba(24,24,24,0.92)",
    backdropFilter: "blur(8px)",
    borderRadius: 4,
    padding: "4px 6px",
    zIndex: 100,
    border: "1px solid rgba(255,255,255,0.08)",
    fontFamily: "'Martian Mono', monospace",
    fontSize: 5,
    color: "#ccc",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    alignItems: "center",
  },
  recordStatus: {
    fontSize: 5,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textAlign: "center",
  },
  countdownNumber: {
    fontFamily: "'Martian Mono', monospace",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1,
  },
  recordTimerRow: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    fontSize: 5,
    color: "#888",
  },
  recordHint: {
    fontSize: 5,
    color: "#666",
    textAlign: "center",
    lineHeight: 1.2,
  },
  loopDot: {
    width: 3,
    height: 3,
    borderRadius: "50%",
    background: "#ff4444",
    boxShadow: "0 0 3px rgba(255,68,68,0.6)",
  },
  loopBarBg: {
    width: 40,
    height: 2,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 1,
    overflow: "hidden",
  },
  loopBarFill: {
    height: "100%",
    background: "#FF8A30",
    borderRadius: 2,
    transition: "width 0.05s linear",
  },
  panel: {
    position: "fixed",
    top: 76,
    right: 20,
    width: 260,
    background: "rgba(24,24,24,0.96)",
    borderRadius: 12,
    padding: "20px 22px",
    zIndex: 20,
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.08)",
    maxHeight: "calc(100vh - 96px)",
    overflowY: "auto",
  },
  panelTitle: {
    fontFamily: "'Martian Mono', monospace",
    fontSize: 10,
    fontWeight: 600,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 16,
  },
  panelDivider: {
    height: 1,
    background: "rgba(255,255,255,0.06)",
    margin: "16px 0",
  },
  controlRow: { marginBottom: 14 },
  controlLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "'Martian Mono', monospace",
    fontSize: 11,
    color: "#bbb",
    marginBottom: 6,
  },
  controlValue: { color: "#666", fontSize: 10 },
  slider: { width: "100%", accentColor: "#FF8A30", height: 4, display: "block" },
  colorInput: {
    width: 40, height: 32,
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
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

function generateStandaloneHtml(s: Record<string, any>): string {
  const cfg = JSON.stringify(s);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Startup School 2026 — Shorts card</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; padding: 0; background: #000; overflow: hidden; font-family: 'Martian Mono', monospace; }
  #card { width: 1080px; height: 1920px; position: relative; overflow: hidden; }
  #mesh, #flute { position: absolute; inset: 0; width: 100%; height: 100%; }
  #grain { position: absolute; inset: 0; width: 100%; height: 100%; mix-blend-mode: overlay; opacity: 0.4; pointer-events: none; z-index: 1; }
  #flute { z-index: 1; }
  .text-layer { position: absolute; inset: 0; z-index: 2; color: #4A301D; pointer-events: none; }
  .headline-block { position: absolute; top: 180px; left: 90px; display: flex; flex-direction: column; gap: 4px; }
  .presents { font-size: 32px; font-weight: 400; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 10px; padding-left: 12px; }
  .headline { font-size: 110px; font-weight: 400; letter-spacing: -0.01em; line-height: 1.1; text-transform: uppercase; }
  .location { position: absolute; top: 55%; right: 90px; transform: translateY(-50%); font-size: 92px; font-weight: 400; letter-spacing: -0.01em; text-transform: uppercase; }
  .register { position: absolute; bottom: 320px; left: 90px; font-size: 92px; font-weight: 400; letter-spacing: -0.01em; text-transform: uppercase; }
</style>
</head>
<body>
<div id="card">
  <div id="mesh"></div>
  <div id="flute" style="display:none"></div>
  <canvas id="grain" width="1080" height="1920"></canvas>
  <div class="text-layer" id="text" style="display:none">
    <div class="headline-block">
      <div class="presents">Y COMBINATOR PRESENTS</div>
      <div class="headline">STARTUP SCHOOL</div>
      <div class="headline">2026</div>
      <div class="headline">JUL 25-26</div>
    </div>
    <div class="location">SF.CA</div>
    <div class="register">REGISTER NOW</div>
  </div>
</div>

<script type="module">
import React from "https://esm.sh/react@19.2.4";
import { createRoot } from "https://esm.sh/react-dom@19.2.4/client";
import { MeshGradient, FlutedGlass } from "https://esm.sh/@paper-design/shaders-react@0.0.72?deps=react@19.2.4";

const cfg = ${cfg};

// Mesh gradient
const meshRoot = createRoot(document.getElementById("mesh"));
meshRoot.render(
  React.createElement(MeshGradient, {
    style: { width: "100%", height: "100%" },
    colors: cfg.colors,
    distortion: cfg.distortion,
    swirl: cfg.swirl,
    speed: cfg.speed,
    frame: 0,
    scale: cfg.scale,
    rotation: cfg.rotation,
    offsetX: cfg.offsetX,
    offsetY: cfg.offsetY,
    webGlContextAttributes: { preserveDrawingBuffer: true },
  })
);

// Fluted glass
if (cfg.fluteEnabled) {
  const fluteEl = document.getElementById("flute");
  fluteEl.style.display = "block";
  const fluteRoot = createRoot(fluteEl);
  fluteRoot.render(
    React.createElement(FlutedGlass, {
      style: { width: "100%", height: "100%" },
      colorBack: "#00000000",
      colorShadow: "#000000",
      colorHighlight: "#ffffff",
      size: cfg.fluteSize,
      shadows: cfg.fluteShadows,
      highlights: cfg.fluteHighlights,
      shape: "lines",
      angle: 0,
      distortionShape: "prism",
      distortion: cfg.fluteDistortion,
      shift: 0,
      stretch: 0,
      blur: 0,
      edges: cfg.fluteEdges,
      margin: 0,
      speed: 0,
      webGlContextAttributes: { preserveDrawingBuffer: true },
    })
  );
}

// Grain
const grain = document.getElementById("grain");
const ctx = grain.getContext("2d");
const img = ctx.createImageData(1080, 1920);
for (let i = 0; i < img.data.length; i += 4) {
  const v = Math.random() * 255;
  img.data[i] = v;
  img.data[i + 1] = v;
  img.data[i + 2] = v;
  img.data[i + 3] = 255;
}
ctx.putImageData(img, 0, 0);

// Text
if (cfg.showText) {
  document.getElementById("text").style.display = "block";
}
</script>
</body>
</html>`;
}
