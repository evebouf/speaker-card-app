import puppeteer from "puppeteer";
import { execSync } from "child_process";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";

const URL = "http://localhost:5190";
const FRAMES_DIR = join(import.meta.dirname, "frames");
const OUTPUT = join(import.meta.dirname, "speaker-card-jensen-huang.mp4");
const SIZE = 1080;
const FPS = 30;
const DURATION_S = 6;
const TOTAL_FRAMES = FPS * DURATION_S;
// We capture fewer frames but space them out in real-time so the animation progresses
// Then encode at desired FPS for smooth playback
const CAPTURE_INTERVAL_MS = 100; // 100ms between captures = 10 captures/sec real-time

async function main() {
  // Clean up
  rmSync(FRAMES_DIR, { recursive: true, force: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--use-gl=egl", "--enable-webgl"],
  });

  const page = await browser.newPage();

  // Override visibility API so the shader doesn't pause in headless mode
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(document, "hidden", { get: () => false });
    Object.defineProperty(document, "visibilityState", { get: () => "visible" });
  });

  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: "networkidle0" });

  // Wait for font + shader to load
  await page.waitForFunction(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 2000));

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${SIZE}x${SIZE} @2x...`);

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const frameNum = String(i).padStart(4, "0");
    const path = join(FRAMES_DIR, `frame_${frameNum}.png`);

    // Clip to just the card area
    const cardEl = await page.$('[style*="position: relative"]');
    if (cardEl) {
      await cardEl.screenshot({ path, type: "png" });
    } else {
      await page.screenshot({ path, type: "png", clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
    }

    if (i % 10 === 0) {
      console.log(`  Frame ${i}/${TOTAL_FRAMES}`);
    }

    // Wait for the animation to visibly advance
    await new Promise((r) => setTimeout(r, CAPTURE_INTERVAL_MS));
  }

  await browser.close();

  console.log("Encoding MP4 with ffmpeg...");
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%04d.png" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -vf "scale=${SIZE}:${SIZE}" "${OUTPUT}"`,
    { stdio: "inherit" }
  );

  // Clean up frames
  rmSync(FRAMES_DIR, { recursive: true, force: true });

  console.log(`Done! Video saved to: ${OUTPUT}`);
}

main().catch(console.error);
