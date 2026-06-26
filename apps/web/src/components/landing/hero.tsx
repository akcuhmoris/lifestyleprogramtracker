"use client";

/**
 * Hero — landing page hero section.
 *
 * Big cinematic headline + dual CTAs on the left, an interactive
 * CharacterAvatar (tier 5 for max visual impact) on the right that tilts
 * toward the cursor via a 3D transform. Aurora gradients live in the parent
 * landing page; this component layers a soft accent glow behind the avatar.
 *
 * Entrance: parent + children fade up with a small stagger on mount.
 * Tilt + entrance both honor prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

import type { Archetype } from "@program/shared";

import { CharacterAvatar } from "@/components/character/avatar";
import { AnimatedHeading } from "./animated-heading";
import { FloatingOrbs } from "./floating-orbs";
import { MagneticButton } from "./magnetic-button";

// ---------------------------------------------------------------------------
// Animation primitives
// ---------------------------------------------------------------------------

const CONTAINER_VARIANTS = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// Max tilt in degrees. Conservative — anything higher feels gimmicky.
const MAX_TILT_Y = 10;
const MAX_TILT_X = 8;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type HeroProps = {
  archetype: Archetype;
  onArchetypeChange?: (a: Archetype) => void;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Hero({ archetype }: HeroProps) {
  const reduceMotion = useReducedMotion();

  // Normalized cursor position in [-1, 1]. Default 0 (avatar at rest).
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Soft springs so the tilt eases instead of snapping to the cursor.
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  // Map normalized cursor → degrees. Note rotateX inverts Y (mouse below
  // center should tilt the bottom of the card toward you, not away).
  const rotateY = useTransform(springX, [-1, 1], [-MAX_TILT_Y, MAX_TILT_Y]);
  const rotateX = useTransform(springY, [-1, 1], [MAX_TILT_X, -MAX_TILT_X]);

  // Coalesce mousemove updates to one per animation frame. Mousemove can fire
  // 100+ times per second; the avatar tilt only ever paints once per frame, so
  // anything more is wasted work (and on lower-end laptops it bogged down the
  // main thread). The captured x/y in the closure tracks the most recent event.
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduceMotion) return;

    function handleMove(e: MouseEvent) {
      const clientX = e.clientX;
      const clientY = e.clientY;
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(() => {
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        // Clamp to [-1, 1] so wide aspect ratios don't push past the max tilt.
        const nx = Math.max(-1, Math.min(1, (clientX - halfW) / halfW));
        const ny = Math.max(-1, Math.min(1, (clientY - halfH) / halfH));
        mouseX.set(nx);
        mouseY.set(ny);
        rafIdRef.current = null;
      });
    }

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [mouseX, mouseY, reduceMotion]);

  return (
    <section
      className="relative flex min-h-[90vh] w-full items-center justify-center px-6 py-24 sm:px-10 lg:px-12"
      aria-label="Hero"
    >
      <motion.div
        className="relative mx-auto flex w-full max-w-[1280px] flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-12"
        variants={reduceMotion ? undefined : CONTAINER_VARIANTS}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "show"}
      >
        {/* ----------------------------------------------------------------- */}
        {/* Left: copy + CTAs (60%)                                            */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex w-full flex-col items-start gap-8 lg:w-[60%]">
          {/* Eyebrow chip */}
          <motion.div
            variants={reduceMotion ? undefined : ITEM_VARIANTS}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-sm"
          >
            <span className="inline-flex items-center rounded-full bg-[#818cf8]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a5b4fc]">
              New
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
              Lifestyle Program Tracker
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            variants={reduceMotion ? undefined : ITEM_VARIANTS}
            className="w-full"
          >
            <AnimatedHeading
              as="h1"
              className="text-5xl font-extrabold leading-[1.02] tracking-[-0.02em] text-white sm:text-6xl lg:text-7xl"
            >
              Build the habit that builds you.
            </AnimatedHeading>
          </motion.div>

          {/* Subline */}
          <motion.p
            variants={reduceMotion ? undefined : ITEM_VARIANTS}
            className="max-w-xl text-lg font-normal leading-relaxed text-white/60 sm:text-xl"
          >
            Track 75 Hard, 100 Hard, or any program you design. Pick a hero.
            Show up. Watch yourself level up.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={reduceMotion ? undefined : ITEM_VARIANTS}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <MagneticButton variant="primary" href="/signup">
              Start your journey
            </MagneticButton>
            <MagneticButton variant="ghost" href="#demo">
              See it in action
            </MagneticButton>
          </motion.div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Right: interactive avatar (40%)                                    */}
        {/* ----------------------------------------------------------------- */}
        <motion.div
          variants={reduceMotion ? undefined : ITEM_VARIANTS}
          className="relative flex w-full items-center justify-center lg:w-[40%]"
          style={{ perspective: "1200px" }}
        >
          {/* Soft accent glow behind the avatar. Sits within the avatar
              column so it tracks the layout, not the whole viewport. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(129,140,248,0.35) 0%, rgba(99,102,241,0.18) 40%, transparent 70%)",
            }}
          />

          {/* Floating orbs drift behind the avatar for ambient motion. */}
          <FloatingOrbs count={10} className="-z-10" />

          <motion.div
            aria-hidden="true"
            className="relative"
            style={{
              rotateX: reduceMotion ? 0 : rotateX,
              rotateY: reduceMotion ? 0 : rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            <CharacterAvatar archetype={archetype} tier={5} size="xl" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
