"use client";

/**
 * BackgroundFx — cinematic aurora ambient.
 *
 * Theme-aware ambient layer that mirrors the landing page's aurora feel while
 * staying tinted to whatever theme the user has selected (via `var(--accent)`
 * and `var(--bg)`).
 *
 * Layer stack (fixed inset-0 -z-10):
 *   1) Solid `var(--bg)` base — no transparency, so it sits cleanly under
 *      everything regardless of stacking context.
 *   2) Three large blurred radial blobs that drift slowly with framer-motion.
 *      Each blob has a different phase and amplitude (±40px) so the motion
 *      looks organic, not patterned.
 *   3) A subtle edge vignette to anchor the corners.
 *   4) A faint SVG noise overlay for tactile grain.
 *
 * Respects `prefers-reduced-motion` (blobs go static) and pauses motion when
 * the tab is hidden via `visibilitychange`.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function BackgroundFx() {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const animate = !reduce && !paused;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Blob 1 — top-left, brightest */}
      <motion.div
        className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full blur-3xl"
        style={{
          background: "var(--accent)",
          opacity: 0.2,
        }}
        animate={
          animate
            ? {
                x: [0, 40, -20, 0],
                y: [0, -30, 20, 0],
              }
            : undefined
        }
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Blob 2 — top-right */}
      <motion.div
        className="absolute -right-40 top-10 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background: "var(--accent)",
          opacity: 0.15,
        }}
        animate={
          animate
            ? {
                x: [0, -35, 25, 0],
                y: [0, 30, -20, 0],
              }
            : undefined
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
          delay: 2,
        }}
      />

      {/* Blob 3 — bottom-center */}
      <motion.div
        className="absolute -bottom-48 left-1/3 h-[640px] w-[640px] rounded-full blur-3xl"
        style={{
          background: "var(--accent)",
          opacity: 0.1,
        }}
        animate={
          animate
            ? {
                x: [0, -30, 40, 0],
                y: [0, 25, -15, 0],
              }
            : undefined
        }
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "linear",
          delay: 4,
        }}
      />

      {/* Edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* Faint noise overlay */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.02] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="bgfx-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#bgfx-noise)" />
      </svg>
    </div>
  );
}

export default BackgroundFx;
