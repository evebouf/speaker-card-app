import React, { useCallback, useEffect, useRef, useState } from "react";
import { MeshGradient, FlutedGlass } from "@paper-design/shaders-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pageBg from "./page-bg.png";

const CARD = 1080;
const PAD = 44;

interface Speaker {
  id: string;
  name: string;
  image: string;
  roleLines: string[];
  smallRole?: boolean;
  sessionType: string;
  frameOffset: number;
}

const SPEAKERS: Speaker[] = [
  {
    id: "jensen",
    name: "Jensen Huang",
    image: "/jensen.png",
    roleLines: ["Founder &", "CEO, Nvidia"],
    sessionType: "Fireside Chat",
    frameOffset: 0,
  },
  {
    id: "sam",
    name: "Sam Altman",
    image: "/sam.png",
    roleLines: ["Co-Founder &", "CEO, OpenAI"],
    sessionType: "Keynote",
    frameOffset: 3200,
  },
  {
    id: "dario",
    name: "Dario Amodei",
    image: "/dario.png",
    roleLines: ["Co-Founder &", "CEO, Anthropic"],
    sessionType: "Keynote",
    frameOffset: 6800,
  },
  {
    id: "alexandr",
    name: "Alexandr Wang",
    image: "/alexandr.png",
    roleLines: ["Chief AI", "Officer, Meta"],
    sessionType: "Keynote",
    frameOffset: 1400,
  },
  {
    id: "jeff",
    name: "Jeff Dean",
    image: "/jeff.png",
    roleLines: ["Chief Scientist,", "Google DeepMind", "& Google Research"],
    smallRole: true,
    sessionType: "Speaker",
    frameOffset: 5100,
  },
  {
    id: "tarek",
    name: "Tarek Mansour",
    image: "/tarek.png",
    roleLines: ["Co-Founder", "& CEO, Kalshi", "(W19)"],
    sessionType: "Speaker",
    frameOffset: 8500,
  },
  {
    id: "blake",
    name: "Blake Scholl",
    image: "/blake.png",
    roleLines: ["Founder & CEO,", "Boom Supersonic", "(W16)"],
    sessionType: "Speaker",
    frameOffset: 2700,
  },
  {
    id: "max",
    name: "Max Junestrand",
    image: "/max.png",
    roleLines: ["Co-Founder &", "CEO, Legora", "(W24)"],
    sessionType: "Speaker",
    frameOffset: 7300,
  },
  {
    id: "chelsea",
    name: "Chelsea Finn",
    image: "/chelsea.png",
    roleLines: ["Stanford", "Assistant", "Professor", "& Co-Founder,", "Physical", "Intelligence"],
    smallRole: false,
    sessionType: "Speaker",
    frameOffset: 4400,
  },
  {
    id: "dmitri",
    name: "Dmitri Dolgov",
    image: "/dmitri.png",
    roleLines: ["Co-CEO,", "Waymo"],
    sessionType: "Speaker",
    frameOffset: 9200,
  },
];

export default function SpeakerCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const meshParentRef = useRef<HTMLDivElement>(null);
  const [recording, setRecording] = useState(false);
  const [manualFrame, setManualFrame] = useState<number | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [recordMode, setRecordMode] = useState<"idle" | "countdown" | "looping">("idle");
  const [countdown, setCountdown] = useState(0);
  const [loopProgress, setLoopProgress] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const recordModeRef = useRef<"idle" | "countdown" | "looping">("idle");
  const [textLayout, setTextLayout] = useState<1 | 2 | 3 | 4>(3);
  const allSpeakerImgs = useRef<Map<string, HTMLImageElement>>(new Map());
  const [activeSpeaker, setActiveSpeakerState] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("speaker");
    return SPEAKERS.find((s) => s.id === id) || SPEAKERS[0];
  });

  const setActiveSpeaker = useCallback((s: Speaker) => {
    setActiveSpeakerState(s);
    const url = new URL(window.location.href);
    url.searchParams.set("speaker", s.id);
    window.history.replaceState(null, "", url.toString());
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const idx = SPEAKERS.findIndex((s) => s.id === activeSpeaker.id);
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSpeaker(SPEAKERS[(idx - 1 + SPEAKERS.length) % SPEAKERS.length]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSpeaker(SPEAKERS[(idx + 1) % SPEAKERS.length]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeSpeaker]);

  const [colors, setColors] = useState(["#FF6A00", "#FC5E10", "#FF8A30", "#FFCB8E", "#FFE4C2"]);
  const [distortion, setDistortion] = useState(0.6);
  const [swirl, setSwirl] = useState(0.3);
  const [speed, setSpeed] = useState(1.8);
  const [grainMixer, setGrainMixer] = useState(0);
  const [grainOverlay, setGrainOverlay] = useState(0);
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

  const speakerImg = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    speakerImg.current = null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = activeSpeaker.image;
    img.onload = () => { speakerImg.current = img; };
  }, [activeSpeaker]);

  // Preload all speaker images for Layout 4 lineup grid
  useEffect(() => {
    SPEAKERS.forEach((s) => {
      if (!allSpeakerImgs.current.has(s.id)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = s.image;
        img.onload = () => { allSpeakerImgs.current.set(s.id, img); };
      }
    });
  }, []);

  /** Read the WebGL canvas directly (requires preserveDrawingBuffer on the MeshGradient) */
  const readMeshGradient = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    const glCanvas = meshParentRef.current?.querySelector("canvas");
    if (!glCanvas) return;
    ctx.drawImage(glCanvas, 0, 0, size, size);
  }, []);

  const compositeFrame = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    const scale = size / CARD;
    const pad = PAD * scale;

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

    // 3. Speaker photo(s)
    if (textLayout === 4) {
      // Layout 4: draw all speaker photos in a 2x5 grid
      const gridTop = 120 * scale;
      const gridGap = 24 * scale;
      const colGap = 8 * scale;
      const cols = 5;
      const availW = size - pad * 2;
      const cellW = (availW - colGap * (cols - 1)) / cols;
      const photoH = 280 * scale;
      const rowH = photoH + 40 * scale; // photo + text space
      const totalGridH = rowH * 2 + gridGap;
      const gridStartY = gridTop + (size - gridTop - pad - totalGridH) / 2;

      const nameFs = Math.round(15 * scale);
      const roleFs = Math.round(12 * scale);

      [SPEAKERS.slice(0, 5), SPEAKERS.slice(5, 10)].forEach((row, rowIdx) => {
        row.forEach((s, colIdx) => {
          const x = pad + colIdx * (cellW + colGap);
          const y = gridStartY + rowIdx * (rowH + gridGap);

          const sImg = allSpeakerImgs.current.get(s.id);
          if (sImg) {
            // Draw grayscale by using a temp canvas
            const tmpC = document.createElement("canvas");
            tmpC.width = Math.round(cellW);
            tmpC.height = Math.round(photoH);
            const tmpCtx = tmpC.getContext("2d")!;
            tmpCtx.filter = "none";
            // Cover: scale to fill width, crop from top
            const imgScale = cellW / sImg.width;
            tmpCtx.drawImage(sImg, 0, 0, sImg.width, Math.min(sImg.height, photoH / imgScale), 0, 0, cellW, photoH);
            ctx.drawImage(tmpC, x, y);
          }

          // Name
          ctx.font = `500 ${nameFs}px 'Martian Mono', monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(s.name.toUpperCase(), x + cellW / 2, y + photoH + 8 * scale);

          // Role
          ctx.font = `400 ${roleFs}px 'Martian Mono', monospace`;
          ctx.globalAlpha = 0.7;
          const roleText = `${s.roleLines[0]}${s.roleLines[1] ? ` ${s.roleLines[1]}` : ""}`.toUpperCase();
          ctx.fillText(roleText, x + cellW / 2, y + photoH + 8 * scale + nameFs * 1.4);
          ctx.globalAlpha = 1;
        });
      });
    } else {
      const img = speakerImg.current;
      if (img) {
        const s = (650 * scale) / img.height;
        const w = img.width * s;
        const h = img.height * s;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      }
    }

    // 4. Text
    ctx.fillStyle = "#4A301D";

    if (textLayout === 1) {
      const fontSize = Math.round(21 * scale);
      ctx.font = `400 ${fontSize}px 'Martian Mono', monospace`;

      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText("STARTUP SCHOOL 2026", pad, pad);
      ctx.fillText(activeSpeaker.sessionType.toUpperCase(), pad, 390 * scale);
      ctx.fillText(activeSpeaker.name.toUpperCase(), pad, 540 * scale);

      ctx.textAlign = "right";
      ctx.fillText("JULY 25-26 2026", size - pad, pad);
      ctx.fillText("SPEAKER", size - pad, 390 * scale);

      const roleFontSize = activeSpeaker.smallRole ? 17 : 21;
      const roleFs = Math.round(roleFontSize * scale);
      ctx.font = `400 ${roleFs}px 'Martian Mono', monospace`;
      activeSpeaker.roleLines.forEach((line, i) => {
        ctx.fillText(line.toUpperCase(), size - pad, (540 + roleFontSize * 1.5 * i) * scale);
      });

      ctx.font = `400 ${fontSize}px 'Martian Mono', monospace`;
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText("CHASE CENTER, SAN FRANCISCO", pad, size - pad);
      ctx.textAlign = "right";
      ctx.fillText("HOSTED BY Y\u2009COMBINATOR", size - pad, size - pad);
    } else if (textLayout === 2) {
      const smallFs = Math.round(21 * scale);
      const nameFs = Math.round(64 * scale);

      ctx.globalAlpha = 0.8;
      ctx.font = `400 ${smallFs}px 'Martian Mono', monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText("STARTUP SCHOOL", pad, pad);
      ctx.fillText("2026", pad, pad + smallFs * 1.5);

      ctx.textAlign = "right";
      ctx.fillText("JULY 25-26", size - pad, pad);
      ctx.fillText("CHASE CENTER, SF", size - pad, pad + smallFs * 1.5);

      const byFs = Math.round(16 * scale);
      ctx.font = `400 ${byFs}px 'Martian Mono', monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText("BY Y\u2009COMBINATOR", pad, pad + smallFs * 1.5 * 2 + 5 * scale);

      ctx.font = `400 ${smallFs}px 'Martian Mono', monospace`;
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText(activeSpeaker.sessionType.toUpperCase(), pad, size - pad - nameFs * 1.1 - 10 * scale);
      ctx.globalAlpha = 1;

      ctx.font = `500 ${nameFs}px 'Martian Mono', monospace`;
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText(activeSpeaker.name.toUpperCase(), pad, size - pad);

      ctx.globalAlpha = 0.8;
      const roleFontSize = activeSpeaker.smallRole ? 17 : 21;
      const roleFs = Math.round(roleFontSize * scale);
      ctx.font = `400 ${roleFs}px 'Martian Mono', monospace`;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      activeSpeaker.roleLines.forEach((line, i) => {
        ctx.fillText(line.toUpperCase(), size - pad, size - pad - (activeSpeaker.roleLines.length - 1 - i) * roleFs * 1.5);
      });
      ctx.globalAlpha = 1;
    } else if (textLayout === 3) {
      // Layout 3: centered photo, corners + flanking text
      const cornerFs = Math.round(19 * scale);
      const nameFs = Math.round(48 * scale);
      const roleFs = Math.round(19 * scale);

      // Top left: Y Combinator Presents
      ctx.font = `400 ${cornerFs}px 'Martian Mono', monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText("Y\u2009COMBINATOR PRESENTS", pad, pad);

      // Top right: Startup School 2026
      ctx.textAlign = "right";
      ctx.fillText("STARTUP SCHOOL 2026", size - pad, pad);

      // Middle left: speaker name — stacked by word
      ctx.font = `400 ${nameFs}px 'Martian Mono', monospace`;
      ctx.textAlign = "left";
      const nameParts = activeSpeaker.name.toUpperCase().split(" ");
      const nameBlockH = nameParts.length * nameFs * 1.05;
      const nameStartY = (size - nameBlockH) / 2;
      nameParts.forEach((part, i) => {
        ctx.fillText(part, pad, nameStartY + i * nameFs * 1.05);
      });

      // Middle right: role — vertically centered
      ctx.font = `400 ${roleFs}px 'Martian Mono', monospace`;
      ctx.globalAlpha = 0.9;
      ctx.textAlign = "right";
      const roleBlockH = activeSpeaker.roleLines.length * roleFs * 1.5;
      const roleStartY = (size - roleBlockH) / 2;
      activeSpeaker.roleLines.forEach((line, i) => {
        ctx.fillText(line.toUpperCase(), size - pad, roleStartY + i * roleFs * 1.5);
      });
      ctx.globalAlpha = 1;

      // Below photo: session type — centered
      ctx.font = `400 ${cornerFs}px 'Martian Mono', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(activeSpeaker.sessionType.toUpperCase(), size / 2, size / 2 + 340 * scale);

      // Bottom left: location
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText("CHASE CENTER, SF", pad, size - pad);

      // Bottom right: dates
      ctx.textAlign = "right";
      ctx.fillText("JULY 25-26", size - pad, size - pad);
    } else if (textLayout === 4) {
      // Layout 4: lineup grid — corner text only (photos drawn above)
      const cornerFs = Math.round(19 * scale);

      ctx.font = `400 ${cornerFs}px 'Martian Mono', monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText("Y\u2009COMBINATOR PRESENTS", pad, pad);
      ctx.fillText("STARTUP SCHOOL 2026", pad, pad + cornerFs * 1.5);

      ctx.textAlign = "right";
      ctx.fillText("CHASE CENTER, SF", size - pad, pad);
      ctx.fillText("JULY 25-26", size - pad, pad + cornerFs * 1.5);
    }
  }, [readMeshGradient, activeSpeaker, textLayout]);

  const handleDownloadJpeg = useCallback(() => {
    const RES = CARD * 2; // 2160x2160 for high-res export
    const out = document.createElement("canvas");
    out.width = RES;
    out.height = RES;
    compositeFrame(out.getContext("2d")!, RES);

    const link = document.createElement("a");
    link.download = `speaker-card-${activeSpeaker.id}.jpg`;
    link.href = out.toDataURL("image/jpeg", 0.95);
    link.click();
  }, [compositeFrame]);

  const setManualFrameRef = useRef(setManualFrame);
  setManualFrameRef.current = setManualFrame;

  const handleDownloadVideo = useCallback(async () => {
    setRecording(true);

    const RES = CARD * 2; // 2160x2160 for high-res export
    const out = document.createElement("canvas");
    out.width = RES;
    out.height = RES;
    const ctx = out.getContext("2d")!;

    const fps = 30;
    const durationSec = 4;
    const totalFrames = Math.round(durationSec * fps);

    // Cosine ping-pong: smoothly goes 0 → peak → 0
    const peakMs = 1500;

    // Collect PNG frames
    const pngFrames: Uint8Array[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const progress = i / totalFrames;
      const frameMs = (1 - Math.cos(2 * Math.PI * progress)) / 2 * peakMs;

      setManualFrameRef.current(frameMs);

      // Wait for shader to render
      await new Promise((r) => setTimeout(r, 80));
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));

      compositeFrame(ctx, RES);

      // Export frame as PNG blob
      const blob = await new Promise<Blob>((resolve) => {
        out.toBlob((b) => resolve(b!), "image/png");
      });
      const arrayBuf = await blob.arrayBuffer();
      pngFrames.push(new Uint8Array(arrayBuf));

      if (i % 10 === 0) {
        console.log(`Capturing frame ${i + 1}/${totalFrames}`);
      }
    }

    // Encode PNG frames → MP4 using ffmpeg.wasm
    console.log("Encoding MP4...");
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    for (let i = 0; i < pngFrames.length; i++) {
      const name = `frame${String(i).padStart(4, "0")}.png`;
      await ffmpeg.writeFile(name, pngFrames[i]);
    }

    await ffmpeg.exec([
      "-framerate", String(fps),
      "-i", "frame%04d.png",
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", "18",
      "-pix_fmt", "yuv420p",
      "-vf", "scale=1080:1080",
      "-movflags", "+faststart",
      "output.mp4",
    ]);

    const mp4Data = await ffmpeg.readFile("output.mp4");
    const mp4Blob = new Blob([mp4Data as BlobPart], { type: "video/mp4" });

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

  const LOOP_SECONDS = 4;
  const PEAK_MS = 4000;

  const handleRecordMode = useCallback(async () => {
    if (recordModeRef.current !== "idle") {
      // Stop
      recordModeRef.current = "idle";
      setRecordMode("idle");
      setManualFrame(null);
      return;
    }

    // Countdown 3, 2, 1
    recordModeRef.current = "countdown";
    setRecordMode("countdown");
    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      await new Promise((r) => setTimeout(r, 1000));
      if ((recordModeRef.current as string) === "idle") return;
    }

    // Start looping
    recordModeRef.current = "looping";
    setRecordMode("looping");
    setLoopCount(0);
    setCountdown(0);

    const startTime = performance.now();

    const animate = () => {
      if (recordModeRef.current !== "looping") return;

      const elapsed = performance.now() - startTime;
      const loopDuration = LOOP_SECONDS * 1000;
      const currentLoop = Math.floor(elapsed / loopDuration);
      const progress = (elapsed % loopDuration) / loopDuration;

      // Cosine ping-pong
      const frameMs = (1 - Math.cos(2 * Math.PI * progress)) / 2 * PEAK_MS;

      setManualFrame(frameMs);
      setLoopProgress(progress);
      setLoopCount(currentLoop + 1);

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  const meshProps = manualFrame !== null
    ? { speed: 0, frame: manualFrame + activeSpeaker.frameOffset }
    : { speed, frame: activeSpeaker.frameOffset };

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

        {textLayout !== 4 && (
          <img src={activeSpeaker.image} alt={activeSpeaker.name} style={{
            ...styles.photo,
            ...(textLayout === 3 ? {
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              maxHeight: 650,
            } : {}),
          }} />
        )}

        <div style={styles.textLayer}>
          {textLayout === 1 ? (
            <>
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
              <span style={{
                ...styles.label,
                position: "absolute",
                top: 540,
                right: PAD,
                textAlign: "right",
                ...(activeSpeaker.smallRole ? { fontSize: 17 } : {}),
              }}>
                {activeSpeaker.roleLines.join("\n")}
              </span>
              <span style={{ ...styles.label, position: "absolute", bottom: PAD, left: PAD }}>
                Chase Center, San Francisco
              </span>
              <span style={{ ...styles.label, position: "absolute", bottom: PAD, right: PAD }}>
                {"Hosted by Y\u2009Combinator"}
              </span>
            </>
          ) : textLayout === 2 ? (
            <>
              {/* Layout 2: top line + bottom credit strip */}
              <span style={{ ...styles.label, position: "absolute", top: PAD, left: PAD, fontSize: 21, opacity: 0.8 }}>
                {"Startup School\n2026"}
              </span>
              <span style={{
                ...styles.label,
                position: "absolute",
                bottom: PAD,
                left: PAD,
                fontSize: 64,
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}>
                {activeSpeaker.name}
              </span>
              <span style={{
                ...styles.label,
                position: "absolute",
                bottom: PAD + 155,
                left: PAD,
                fontSize: 21,
                opacity: 0.8,
              }}>
                {activeSpeaker.sessionType}
              </span>
              <span style={{
                ...styles.label,
                position: "absolute",
                bottom: PAD,
                right: PAD,
                textAlign: "right",
                fontSize: 21,
                opacity: 0.8,
                ...(activeSpeaker.smallRole ? { fontSize: 17 } : {}),
              }}>
                {activeSpeaker.roleLines.join("\n")}
              </span>
              <span style={{
                ...styles.label,
                position: "absolute",
                top: PAD,
                right: PAD,
                fontSize: 21,
                opacity: 0.8,
                textAlign: "right",
              }}>
                {"July 25-26\nChase Center, SF"}
              </span>
              <span style={{
                ...styles.label,
                position: "absolute",
                top: PAD + 65,
                left: PAD,
                fontSize: 16,
                opacity: 0.8,
                letterSpacing: "0.06em",
              }}>
                {"by Y\u2009Combinator"}
              </span>
            </>
          ) : textLayout === 3 ? (
            <>
              {/* Layout 3: centered photo with corner text */}
              {/* Top left: Y Combinator Presents / Startup School 2026 */}
              <div style={{ position: "absolute", top: PAD, left: PAD, zIndex: 2 }}>
                <span style={{ ...styles.label, fontSize: 19, opacity: 1, letterSpacing: "0.06em", display: "block" }}>
                  {"Y\u2009Combinator Presents"}
                </span>
                <span style={{ ...styles.label, fontSize: 19, opacity: 1, letterSpacing: "0.06em", display: "block" }}>
                  Startup School 2026
                </span>
              </div>

              {/* Top right: Chase Center, SF / July 25-26 */}
              <div style={{ position: "absolute", top: PAD, right: PAD, zIndex: 2, textAlign: "right" }}>
                <span style={{ ...styles.label, fontSize: 19, opacity: 1, letterSpacing: "0.06em", display: "block" }}>
                  Chase Center, SF
                </span>
                <span style={{ ...styles.label, fontSize: 19, opacity: 1, letterSpacing: "0.06em", display: "block" }}>
                  July 25-26
                </span>
              </div>

              {/* Middle left: speaker name */}
              <span style={{ ...styles.label, position: "absolute", top: "50%", left: PAD, transform: "translateY(-50%)", fontSize: 48, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.03em", zIndex: 2 }}>
                {activeSpeaker.name.split(" ").join("\n")}
              </span>

              {/* Middle right: role */}
              <span style={{ ...styles.label, position: "absolute", top: "50%", right: PAD, transform: "translateY(-50%)", fontSize: 19, opacity: 0.9, lineHeight: 1.5, fontWeight: 400, letterSpacing: "0.04em", textAlign: "right", zIndex: 2 }}>
                {activeSpeaker.roleLines.join("\n")}
              </span>


              {/* Below photo: session type — centered */}
              <span style={{ ...styles.label, position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, 340px)", fontSize: 19, opacity: 1, letterSpacing: "0.06em", textAlign: "center", zIndex: 2 }}>
                {activeSpeaker.sessionType}
              </span>
            </>
          ) : textLayout === 4 ? (
            <>
              {/* Layout 4: Full lineup grid — 2 rows of 5 */}
              {/* Top left: Y Combinator Presents / Startup School 2026 */}
              <div style={{ position: "absolute", top: PAD, left: PAD, zIndex: 2 }}>
                <span style={{ ...styles.label, fontSize: 19, opacity: 1, letterSpacing: "0.06em", display: "block" }}>
                  {"Y\u2009Combinator Presents"}
                </span>
                <span style={{ ...styles.label, fontSize: 19, opacity: 1, letterSpacing: "0.06em", display: "block" }}>
                  Startup School 2026
                </span>
              </div>

              {/* Top right: Chase Center, SF / July 25-26 */}
              <div style={{ position: "absolute", top: PAD, right: PAD, zIndex: 2, textAlign: "right" }}>
                <span style={{ ...styles.label, fontSize: 19, opacity: 1, letterSpacing: "0.06em", display: "block" }}>
                  Chase Center, SF
                </span>
                <span style={{ ...styles.label, fontSize: 19, opacity: 1, letterSpacing: "0.06em", display: "block" }}>
                  July 25-26
                </span>
              </div>

              {/* Speaker grid */}
              <div style={{
                position: "absolute",
                top: 120,
                left: PAD,
                right: PAD,
                bottom: PAD,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 24,
                zIndex: 2,
              }}>
                {[SPEAKERS.slice(0, 5), SPEAKERS.slice(5, 10)].map((row, rowIdx) => (
                  <div key={rowIdx} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    {row.map((s) => (
                      <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "18.5%" }}>
                        <img
                          src={s.image}
                          alt={s.name}
                          style={{
                            width: "100%",
                            height: 280,
                            objectFit: "cover",
                            objectPosition: "top center",
                            filter: "none",
                            display: "block",
                          }}
                        />
                        <span style={{
                          ...styles.label,
                          fontSize: 15,
                          fontWeight: 500,
                          marginTop: 10,
                          textAlign: "center",
                          lineHeight: 1.2,
                          letterSpacing: "0.04em",
                        }}>
                          {s.name}
                        </span>
                        <span style={{
                          ...styles.label,
                          fontSize: 12,
                          opacity: 0.7,
                          marginTop: 3,
                          textAlign: "center",
                          lineHeight: 1.2,
                          letterSpacing: "0.03em",
                        }}>
                          {s.roleLines[0]}{s.roleLines[1] ? ` ${s.roleLines[1]}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div style={styles.speakerTabs}>
        <div style={styles.sectionLabel}>Speaker</div>
        {SPEAKERS.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveSpeaker(s);
              if (textLayout === 4) setTextLayout(3);
            }}
            disabled={textLayout === 4}
            style={{
              ...styles.tabBtn,
              ...(activeSpeaker.id === s.id && textLayout !== 4 ? styles.tabBtnActive : {}),
              ...(textLayout === 4 ? { opacity: 0.35, cursor: "not-allowed" } : {}),
            }}
          >
            {s.name}
          </button>
        ))}

        <div style={styles.sectionDivider} />
        <div style={styles.sectionLabel}>Layout</div>
        {([
          { value: 3, label: "Main" },
          { value: 1, label: "Alt 1" },
          { value: 2, label: "Alt 2" },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTextLayout(value)}
            style={{
              ...styles.tabBtn,
              ...(textLayout === value ? styles.tabBtnActive : {}),
            }}
          >
            {label}
          </button>
        ))}

        <div style={styles.sectionDivider} />
        <div style={styles.sectionLabel}>Lineup</div>
        <button
          onClick={() => setTextLayout(4)}
          style={{
            ...styles.tabBtn,
            ...(textLayout === 4 ? styles.tabBtnActive : {}),
          }}
        >
          All Speakers
        </button>
      </div>

      {(recordMode === "countdown" || recordMode === "looping") && (
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
                <div style={{
                  ...styles.recordStatus,
                  color: atCut ? "#4f4" : "#ff4444",
                }}>
                  {atCut ? "CUT HERE" : "RECORDING"}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                  <div style={{
                    ...styles.loopDot,
                    ...(atCut ? { background: "#4f4", boxShadow: "0 0 8px rgba(68,255,68,0.8)" } : {}),
                  }} />
                  <div style={{ ...styles.loopBarBg, flex: 1 }}>
                    <div style={{
                      ...styles.loopBarFill,
                      width: `${loopProgress * 100}%`,
                      ...(atCut ? { background: "#4f4" } : {}),
                    }} />
                  </div>
                </div>

                <div style={styles.recordTimerRow}>
                  <span>Loop {loopCount}</span>
                  <span>{(loopProgress * LOOP_SECONDS).toFixed(1)}s / {LOOP_SECONDS}s</span>
                </div>

                <div style={{
                  ...styles.recordHint,
                  ...(nearBoundary ? { color: "#4f4" } : {}),
                }}>
                  {atCut
                    ? "Stop QuickTime now for clean loop"
                    : `Next cut point in ${((1 - loopProgress) * LOOP_SECONDS).toFixed(1)}s`}
                </div>
              </>
            );
          })()}
        </div>
      )}

      <div style={styles.menuWrap}>
        {showMenu && (
          <div style={styles.menuItems}>
            <button
              onClick={() => { setShowPanel((v) => !v); setShowMenu(false); }}
              style={styles.menuItem}
            >
              {showPanel ? "Close shader" : "Shader controls"}
            </button>
            <button
              onClick={() => { handleRecordMode(); setShowMenu(false); }}
              style={{
                ...styles.menuItem,
                ...(recordMode !== "idle" ? { color: "#ff5555" } : {}),
              }}
            >
              {recordMode === "idle" ? "Screen record" : "Stop recording"}
            </button>
            <button
              onClick={() => { handleDownloadJpeg(); setShowMenu(false); }}
              style={styles.menuItem}
            >
              Download JPEG
            </button>
            <button
              onClick={() => { handleDownloadVideo(); setShowMenu(false); }}
              disabled={recording}
              style={styles.menuItem}
            >
              {recording ? "Recording…" : "Download MP4"}
            </button>
          </div>
        )}
        <button
          onClick={() => setShowMenu((v) => !v)}
          style={{
            ...styles.menuTrigger,
            ...(recordMode !== "idle" ? { background: "#ff4444", color: "#fff" } : {}),
          }}
          aria-label="Actions"
        >
          {showMenu ? "×" : "≡"}
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
            <div style={styles.controlLabel}>Grain Mix <span style={styles.controlValue}>{grainMixer.toFixed(2)}</span></div>
            <input type="range" min={0} max={1} step={0.01} value={grainMixer}
              onChange={(e) => setGrainMixer(+e.target.value)} style={styles.slider} />
          </div>

          <div style={styles.controlRow}>
            <div style={styles.controlLabel}>Grain Overlay <span style={styles.controlValue}>{grainOverlay.toFixed(2)}</span></div>
            <input type="range" min={0} max={1} step={0.01} value={grainOverlay}
              onChange={(e) => setGrainOverlay(+e.target.value)} style={styles.slider} />
          </div>

          <div style={{ ...styles.panelDivider }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ ...styles.panelTitle, marginBottom: 0 }}>Fluted Glass</div>
            <button
              onClick={() => setFluteEnabled((v) => !v)}
              style={{
                fontFamily: "'Martian Mono', monospace",
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer",
                transition: "all 0.15s",
                background: fluteEnabled ? "rgba(255,138,48,0.2)" : "rgba(255,255,255,0.05)",
                color: fluteEnabled ? "#FF8A30" : "#666",
              }}
            >
              {fluteEnabled ? "On" : "Off"}
            </button>
          </div>

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

          <div style={{ ...styles.panelDivider }} />
          <div style={styles.panelTitle}>Transform</div>

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

          <div style={{ ...styles.panelDivider }} />
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
  },
  menuWrap: {
    position: "absolute",
    bottom: 20,
    right: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 10,
    zIndex: 10,
  },
  menuTrigger: {
    width: 44,
    height: 44,
    borderRadius: 22,
    background: "#fff",
    color: "#111",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Martian Mono', monospace",
    fontSize: 20,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    transition: "transform 0.15s, background 0.15s",
  },
  menuItems: {
    background: "rgba(24,24,24,0.96)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 6,
    display: "flex",
    flexDirection: "column" as const,
    minWidth: 180,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
  menuItem: {
    padding: "10px 14px",
    fontFamily: "'Martian Mono', monospace",
    fontSize: 11,
    fontWeight: 400,
    background: "transparent",
    color: "#ddd",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    textAlign: "left" as const,
    letterSpacing: "0.03em",
    textTransform: "uppercase" as const,
    transition: "background 0.1s",
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
    fontSize: 21,
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
  sectionLabel: {
    fontFamily: "'Martian Mono', monospace",
    fontSize: 9,
    fontWeight: 600,
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    padding: "0 4px",
    marginBottom: 2,
  },
  sectionDivider: {
    height: 1,
    background: "rgba(255,255,255,0.06)",
    margin: "10px 0 6px",
  },
  panel: {
    position: "fixed",
    top: 20,
    right: 20,
    width: 260,
    background: "rgba(24,24,24,0.96)",
    borderRadius: 12,
    padding: "20px 22px",
    zIndex: 20,
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.08)",
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto" as const,
  },
  panelTitle: {
    fontFamily: "'Martian Mono', monospace",
    fontSize: 10,
    fontWeight: 600,
    color: "#666",
    textTransform: "uppercase" as const,
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
  recordPanel: {
    position: "fixed",
    top: 20,
    right: 20,
    width: 220,
    background: "rgba(24,24,24,0.96)",
    backdropFilter: "blur(16px)",
    borderRadius: 12,
    padding: "16px 18px",
    zIndex: 100,
    border: "1px solid rgba(255,255,255,0.08)",
    fontFamily: "'Martian Mono', monospace",
    fontSize: 11,
    color: "#ccc",
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    alignItems: "center",
  },
  recordStatus: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textAlign: "center" as const,
  },
  countdownNumber: {
    fontFamily: "'Martian Mono', monospace",
    fontSize: 48,
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1,
  },
  recordTimerRow: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    fontSize: 10,
    color: "#888",
  },
  recordHint: {
    fontSize: 9,
    color: "#666",
    textAlign: "center" as const,
    lineHeight: 1.4,
  },
  loopDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#ff4444",
    boxShadow: "0 0 6px rgba(255,68,68,0.6)",
  },
  loopBarBg: {
    width: 100,
    height: 4,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  loopBarFill: {
    height: "100%",
    background: "#FF8A30",
    borderRadius: 2,
    transition: "width 0.05s linear",
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
