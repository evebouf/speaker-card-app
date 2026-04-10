import React, { useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pageBg from "./page-bg.png";
import SUS2026ConfirmationCard, {
  DEFAULT_GLASS_PARAMS,
  DEFAULT_HALFTONE_PARAMS,
} from "./SUS2026ConfirmationCard";

const FONT =
  "'Martian Mono', 'Geist Mono', 'Space Mono', monospace";

const BG_COLOR = "#2E1F15";
const PAD_X = 100;
const PAD_Y = 120;

export default function ConfirmationCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const attendeeName = "Sarah Chen";
  const attendeeLocation = "San Francisco, CA";
  const eventName = "Startup School 2026";
  const eventDate = "July 25-26 2026";

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const scale = 3;
      const cardDataUrl = await toPng(cardRef.current, {
        pixelRatio: scale,
        cacheBust: true,
      });

      // Composite onto a brown background with padding
      const cardImg = new Image();
      cardImg.src = cardDataUrl;
      await new Promise<void>((resolve) => {
        cardImg.onload = () => resolve();
      });

      const canvas = document.createElement("canvas");
      canvas.width = cardImg.width + PAD_X * 2 * scale;
      canvas.height = cardImg.height + PAD_Y * 2 * scale;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cardImg, PAD_X * scale, PAD_Y * scale);

      const link = document.createElement("a");
      link.download = "startup-school-2026-ticket.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        minHeight: "100dvh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: BG_COLOR,
      }}
    >
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

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 520,
          padding: "0 16px",
        }}
      >
        <div ref={cardRef}>
          <SUS2026ConfirmationCard
            attendeeName={attendeeName}
            attendeeLocation={attendeeLocation}
            eventName={eventName}
            eventDate={eventDate}
            glassParams={DEFAULT_GLASS_PARAMS}
            halftoneParams={DEFAULT_HALFTONE_PARAMS}
          />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          style={{
            fontFamily: FONT,
            display: "flex",
            alignItems: "center",
            gap: 6,
            margin: "20px auto 0",
            borderRadius: 9999,
            border: "1px solid rgba(244, 241, 219, 0.15)",
            backgroundColor: "transparent",
            padding: "8px 16px",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "rgba(244, 241, 219, 0.6)",
            cursor: downloading ? "default" : "pointer",
            opacity: downloading ? 0.4 : 1,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!downloading) {
              e.currentTarget.style.borderColor = "rgba(244, 241, 219, 0.3)";
              e.currentTarget.style.color = "rgba(244, 241, 219, 0.9)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(244, 241, 219, 0.15)";
            e.currentTarget.style.color = "rgba(244, 241, 219, 0.6)";
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
