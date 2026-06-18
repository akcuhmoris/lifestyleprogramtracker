"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";

import { tierForLevel, tierName } from "@program/shared";
import { HudPanel } from "@/components/hud/hud-panel";

const DISMISS_MS = 3800;

type LevelUpToastProps = {
  level: number;
  onDone: () => void;
};

/**
 * Centered full-screen overlay shown when the user gains a level.
 *
 * Forge HUD aesthetic: dark veil with backdrop-blur, a centered HudPanel with
 * L-bracket corners, display typography for the big LEVEL number, and a
 * staggered entrance (eyebrow → number → tier). Confetti burst on mount.
 * Auto-dismisses after ~3.8s. Respects `prefers-reduced-motion`.
 */
export function LevelUpToast({ level, onDone }: LevelUpToastProps) {
  const prefersReducedMotion = useReducedMotion();
  const tier = tierForLevel(level);
  const tierLabel = tierName(tier);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Brief celebratory burst — mirrors the pattern used in confetti.tsx.
    confetti({
      particleCount: 110,
      spread: 120,
      startVelocity: 48,
      gravity: 1.0,
      ticks: 180,
      origin: { x: 0.5, y: 0.42 },
      colors: ["#0EA5FF", "#3DBDFF", "#86E0FF", "#FFFFFF"],
      disableForReducedMotion: true,
    });

    confetti({
      particleCount: 40,
      angle: 60,
      spread: 70,
      startVelocity: 50,
      origin: { x: 0, y: 0.7 },
      colors: ["#0EA5FF", "#3DBDFF", "#86E0FF"],
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 70,
      startVelocity: 50,
      origin: { x: 1, y: 0.7 },
      colors: ["#0EA5FF", "#3DBDFF", "#86E0FF"],
      disableForReducedMotion: true,
    });

    const timer = window.setTimeout(onDone, DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  // Stagger config for the inner content (eyebrow → number → tier).
  const containerVariants = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : {
            type: "spring" as const,
            stiffness: 260,
            damping: 18, // lower damping → slight overshoot
            mass: 0.9,
            when: "beforeChildren" as const,
            staggerChildren: 0.12,
            delayChildren: 0.08,
          },
    },
    exit: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.95,
      y: prefersReducedMotion ? 0 : -8,
      transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.25 },
    },
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 14,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 320, damping: 24 },
    },
  };

  const bigNumberVariants = {
    hidden: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.6,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : {
            type: "spring" as const,
            stiffness: 360,
            damping: 16, // overshoot for drama
          },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        key="level-up-overlay"
        className="fixed inset-0 z-[100] flex items-center justify-center px-6"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
        aria-live="polite"
        role="status"
      >
        {/* Full-screen dark veil */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* HUD Panel with corners */}
        <motion.div
          className="relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <HudPanel
            corners
            tone="accent"
            className="flex flex-col items-center gap-4 px-14 py-10 text-center"
          >
            {/* Eyebrow: +1 LEVEL */}
            <motion.div
              variants={childVariants}
              className="text-[11px] uppercase tracking-[0.4em]"
              style={{
                fontFamily: "var(--font-mono), monospace",
                color: "var(--accent, #00d4ff)",
                textShadow: "0 0 12px var(--accent-glow, rgba(0,212,255,.45))",
              }}
            >
              +1 LEVEL
            </motion.div>

            {/* Big LEVEL number */}
            <motion.div
              variants={bigNumberVariants}
              className="text-6xl sm:text-7xl"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 900,
                letterSpacing: "0.08em",
                color: "var(--text, #f5f5f7)",
                textShadow:
                  "0 0 36px var(--accent-glow, rgba(0,212,255,.55)), 0 0 12px var(--accent-glow, rgba(0,212,255,.45))",
                lineHeight: 1,
              }}
            >
              LEVEL{" "}
              <span
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontWeight: 700,
                  color: "var(--accent, #00d4ff)",
                }}
              >
                {level}
              </span>
            </motion.div>

            {/* Tier label */}
            <motion.div
              variants={childVariants}
              className="text-sm uppercase tracking-[0.3em]"
              style={{
                fontFamily: "var(--font-mono), monospace",
                color: "var(--text-muted, #9ca3af)",
              }}
            >
              {tierLabel}
            </motion.div>
          </HudPanel>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
