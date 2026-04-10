import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

function useGyroscope(
  x: ReturnType<typeof useMotionValue>,
  y: ReturnType<typeof useMotionValue>
) {
  const [active, setActive] = useState(false);
  const listenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(
    null
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window))
      return;

    let receivedEvent = false;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (!receivedEvent) {
        receivedEvent = true;
        setActive(true);
      }
      const clamp = (v: number, min: number, max: number) =>
        Math.min(max, Math.max(min, v));
      x.set(clamp(e.gamma / 30, -0.5, 0.5));
      y.set(clamp((e.beta - 45) / 30, -0.5, 0.5));
    };

    listenerRef.current = handleOrientation;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOE = DeviceOrientationEvent as any;
    const needsPermission = typeof DOE.requestPermission === "function";

    if (!needsPermission) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, [x, y]);

  const requestPermission = async () => {
    if (active) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission !== "function") return;
    try {
      const permission = await DOE.requestPermission();
      if (permission !== "granted" || !listenerRef.current) return;
      window.addEventListener("deviceorientation", listenerRef.current);
    } catch {
      // Permission denied or unavailable
    }
  };

  return { active, requestPermission };
}

export const InteractiveCard = ({
  rotateDepth = 8,
  translateDepth = 8,
  maskStyle,
  children,
}: {
  rotateDepth?: number;
  translateDepth?: number;
  maskStyle?: React.CSSProperties;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const { active: gyroActive, requestPermission: requestGyroPermission } =
    useGyroscope(x, y);

  useEffect(() => {
    if (isHovering || gyroActive) return;
    let frame: number;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      x.set(Math.sin(t * 0.8) * 0.15);
      y.set(Math.cos(t * 0.5) * 0.1);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isHovering, gyroActive, x, y]);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [
    `-${rotateDepth}deg`,
    `${rotateDepth}deg`,
  ]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [
    `${rotateDepth}deg`,
    `-${rotateDepth}deg`,
  ]);

  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], [
    `-${translateDepth}px`,
    `${translateDepth}px`,
  ]);
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], [
    `${translateDepth}px`,
    `-${translateDepth}px`,
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || gyroActive) return;
    setIsHovering(true);

    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    if (gyroActive) return;
    setIsHovering(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={requestGyroPermission}
        style={{
          rotateX,
          rotateY,
          translateX,
          translateY,
          position: "relative",
          boxShadow:
            "rgba(0,0,0,0.15) 0px 15px 40px 0px, rgba(0,0,0,0.08) 0px 5px 15px 0px",
          ...maskStyle,
        }}
        initial={{ scale: 1, z: 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default InteractiveCard;
