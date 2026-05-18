import puppeteer from "puppeteer";
import { execSync } from "child_process";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";

const URL = "http://localhost:5190/?view=youtube&raw=1";
const FRAMES_DIR = join(import.meta.dirname, "frames-geoff");
const JPEG_OUT = join(import.meta.dirname, "digital-sand-for-geoff.jpg");
const MP4_OUT = join(import.meta.dirname, "digital-sand-for-geoff.mp4");
const W = 1920;
const H = 1080;
const FPS = 30;
const DURATION_S = 10;
const TOTAL_FRAMES = FPS * DURATION_S;
const CAPTURE_INTERVAL_MS = 1000 / FPS;

async function main() {
  rmSync(FRAMES_DIR, { recursive: true, force: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  console.log("Launching browser…");
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--use-gl=egl", "--enable-webgl"],
  });

  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(document, "hidden", { get: () => false });
    Object.defineProperty(document, "visibilityState", { get: () => "visible" });
  });

  // 2x deviceScaleFactor → 3840×2160 capture (we encode back to 1920×1080)
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: "networkidle0" });

  await page.waitForFunction(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 2000));

  console.log("Capturing JPEG screenshot…");
  await page.screenshot({
    path: JPEG_OUT,
    type: "jpeg",
    quality: 95,
    clip: { x: 0, y: 0, width: W, height: H },
  });
  console.log(`  → ${JPEG_OUT}`);

  console.log(`Capturing ${TOTAL_FRAMES} frames @ ${W}×${H} (2x)…`);
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const frameNum = String(i).padStart(4, "0");
    const path = join(FRAMES_DIR, `frame_${frameNum}.png`);
    await page.screenshot({
      path,
      type: "png",
      clip: { x: 0, y: 0, width: W, height: H },
    });
    if (i % 30 === 0) {
      console.log(`  Frame ${i}/${TOTAL_FRAMES}`);
    }
    await new Promise((r) => setTimeout(r, CAPTURE_INTERVAL_MS));
  }

  await browser.close();

  console.log("Encoding MP4 with ffmpeg…");
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%04d.png" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -vf "scale=${W}:${H}" -movflags +faststart "${MP4_OUT}"`,
    { stdio: "inherit" }
  );

  rmSync(FRAMES_DIR, { recursive: true, force: true });

  console.log(`\n✓ JPEG: ${JPEG_OUT}`);
  console.log(`✓ MP4:  ${MP4_OUT}`);
}

main().catch(console.error);
