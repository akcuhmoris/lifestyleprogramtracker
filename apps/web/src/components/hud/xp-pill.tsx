"use client";

/**
 * XpPill — segmented XP bar in HUD style.
 *
 * Renders N segments side-by-side. Filled segments use the accent color with
 * a soft glow; empty segments use the HUD border color. The most recently
 * filled segment is animated in via framer-motion.
 *
 * Accepts either explicit (current / needed) OR no values — in which case
 * it falls back to neutral display.
 */

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type XpPillProps = {
  /** XP within the current level. */
  current: number;
  /** XP needed to reach the next level. */
  needed: number;
  /** Number of segments to render. Defaults to 12. */
  segments?: number;
  size?: "sm" | "md";
  className?: string;
};

export function XpPill({
  current,
  needed,
  segments = 12,
  size = "md",
  className,
}: XpPillProps) {
  const reduceMotion = useReducedMotion();

  const safeNeeded = needed > 0 ? needed : 1;
  const clampedCurrent = Math.max(0, Math.min(current, safeNeeded));
  const ratio = clampedCurrent / safeNeeded;

  // How many segments should appear "filled". We always show at least 0.
  const filledCount = Math.min(segments, Math.floor(ratio * segments));

  const segmentHeight = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div
      className={cn(
        "flex w-full items-center gap-[3px]",
        className,
      )}
      aria-label={`Experience progress: ${clampedCurrent} of ${safeNeeded}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeNeeded}
      aria-valuenow={clampedCurrent}
    >
      {Array.from({ length: segments }).map((_, i) => {
        const isFilled = i < filledCount;
        const isLatest = isFilled && i === filledCount - 1;

        return (
          <motion.div
            key={i}
            className={cn(
              "flex-1 rounded-[2px]",
              segmentHeight,
            )}
            initial={false}
            animate={{
              opacity: isFilled ? 1 : 0.6,
              scale: isLatest && !reduceMotion ? [0.6, 1.08, 1] : 1,
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : isLatest
                  ? { duration: 0.45, ease: "easeOut" }
                  : { duration: 0.2 }
            }
            style={
              isFilled
                ? {
                    background: "var(--accent)",
                    boxShadow: "0 0 8px var(--accent-glow)",
                  }
                : {
                    background: "var(--hud-border)",
                  }
            }
          />
        );
      })}
    </div>
  );
}

export default XpPill;
