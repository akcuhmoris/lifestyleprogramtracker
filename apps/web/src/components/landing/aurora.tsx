"use client";

/**
 * Aurora — cinematic dark background for the landing page.
 *
 * Pure black base, four large blurred radial gradient blobs that drift
 * slowly and asynchronously, a faint SVG noise layer, and a vignette ring.
 *
 * Honors `prefers-reduced-motion`: when reduced motion is preferred, blobs
 * stay in place but their static positions still look composed.
 */

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type AuroraProps = {
  className?: string;
};

export function Aurora({ className }: AuroraProps) {
  const prefersReducedMotion = useReducedMotion();

  // Pause animations when the tab is hidden (saves CPU/battery without
  // affecting perceived UX). Aurora is fixed-position so it doesn't benefit
  // from useInView, but it does benefit from skipping work on hidden tabs.
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const handler = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // Each blob drifts independently. Linear easing + offset durations so
  // the four blobs never synchronize into a single visible "pulse".
  const drift = (dx: number, dy: number, duration: number) =>
    prefersReducedMotion || !tabVisible
      ? undefined
      : {
          animate: {
            x: [0, dx, 0, -dx, 0],
            y: [0, dy, 0, -dy, 0],
          },
          transition: {
            duration,
            ease: "linear" as const,
            repeat: Infinity,
            repeatType: "loop" as const,
          },
        };

  const blob1 = drift(60, 40, 14);
  const blob2 = drift(-50, 60, 17);
  const blob3 = drift(50, -60, 13);
  const blob4 = drift(-60, -40, 18);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className ?? ""}`}
    >
      {/* Layer 0 — pure black base */}
      <div
        className="absolute inset-0"
        style={{ background: "#14141d" }}
      />

      {/* Layer 1 — aurora blobs */}
      <motion.div
        className="absolute h-[600px] w-[600px] rounded-full blur-3xl mix-blend-screen"
        style={{
          top: "-10%",
          left: "-8%",
          background:
            "radial-gradient(circle at center, #818cf8 0%, rgba(129,140,248,0.6) 35%, transparent 70%)",
          opacity: 0.38,
        }}
        animate={blob1?.animate}
        transition={blob1?.transition}
      />
      <motion.div
        className="absolute h-[500px] w-[500px] rounded-full blur-3xl mix-blend-screen"
        style={{
          top: "-6%",
          right: "-6%",
          background:
            "radial-gradient(circle at center, #c084fc 0%, rgba(192,132,252,0.6) 35%, transparent 70%)",
          opacity: 0.32,
        }}
        animate={blob2?.animate}
        transition={blob2?.transition}
      />
      <motion.div
        className="absolute h-[700px] w-[700px] rounded-full blur-3xl mix-blend-screen"
        style={{
          bottom: "-12%",
          left: "-10%",
          background:
            "radial-gradient(circle at center, #f472b6 0%, rgba(244,114,182,0.6) 35%, transparent 70%)",
          opacity: 0.24,
        }}
        animate={blob3?.animate}
        transition={blob3?.transition}
      />
      <motion.div
        className="absolute h-[500px] w-[500px] rounded-full blur-3xl mix-blend-screen"
        style={{
          bottom: "-8%",
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle at center, #06b6d4 0%, rgba(6,182,212,0.6) 35%, transparent 70%)",
          opacity: 0.2,
        }}
        animate={blob4?.animate}
        transition={blob4?.transition}
      />

      {/* Layer 2 — vignette (darkens edges, opens the center) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* Layer 3 — faint SVG noise overlay */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.025] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="aurora-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#aurora-noise)" />
      </svg>
    </div>
  );
}

export default Aurora;
