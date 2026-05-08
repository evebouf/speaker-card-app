import React, { useEffect, useRef, useState } from "react";
import { MeshGradient, FlutedGlass } from "@paper-design/shaders-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pageBg from "./page-bg.png";

const CARD = 1080;

export default function BlankCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const meshParentRef = useRef<HTMLDivElement>(null);
  const [showPanel, setShowPanel] = useState(false);

  const [colors, setColors] = useState(["#FF6A00", "#FC5E10", "#FF8A30", "#FFCB8E", "#FFE4C2"]);
  const [distortion, setDistortion] = useState(0.6);
  const [swirl, setSwirl] = useState(0.3);
  const [speed, setSpeed] = useState(1.8);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [fluteEnabled, setFluteEnabled] = useState(false);
  const [fluteSize, setFluteSize] = useState(0.5);
  const [fluteShadows, setFluteShadows] = useState(0.25);
  const [fluteHighlights, setFluteHighlights] = useState(0.1);
  const [fluteDistortion, setFluteDistortion] = useState(0.5);
  const [fluteEdges, setFluteEdges] = useState(0.25);

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

  const handleDownloadJpeg = () => {
    const RES = CARD * 2;
    const out = document.createElement("canvas");
    out.width = RES;
    out.height = RES;
    const ctx = out.getContext("2d")!;

    const glCanvas = meshParentRef.current?.querySelector("canvas");
    if (glCanvas) ctx.drawImage(glCanvas, 0, 0, RES, RES);

    const grain = canvasRef.current;
    if (grain) {
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = "overlay";
      ctx.drawImage(grain, 0, 0, RES, RES);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    const link = document.createElement("a");
    link.download = "blank-card.jpg";
    link.href = out.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  return (
    <div style={styles.page}>
      <img
        src={pageBg}
        alt=""
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <div ref={cardRef} style={styles.card}>
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
            speed={speed}
            frame={0}
            webGlContextAttributes={{ preserveDrawingBuffer: true }}
          />
        </div>

        {fluteEnabled && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
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
      </div>

      <div style={styles.btnRow}>
        <button onClick={() => setShowPanel((v) => !v)} style={styles.btn}>
          {showPanel ? "Close" : "Shader"}
        </button>
        <button onClick={handleDownloadJpeg} style={styles.btn}>
          Download JPEG
        </button>
      </div>

      {showPanel && (
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
    position: "relative",
  },
  card: {
    width: CARD,
    height: CARD,
    position: "relative",
    overflow: "hidden",
    transformOrigin: "center center",
    flexShrink: 0,
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
  btn: {
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
    textTransform: "uppercase",
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
  controlRow: {
    marginBottom: 14,
  },
  controlLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "'Martian Mono', monospace",
    fontSize: 11,
    color: "#bbb",
    marginBottom: 6,
  },
  controlValue: {
    color: "#666",
    fontSize: 10,
  },
  slider: {
    width: "100%",
    accentColor: "#FF8A30",
    height: 4,
    display: "block",
  },
  colorInput: {
    width: 40,
    height: 32,
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
