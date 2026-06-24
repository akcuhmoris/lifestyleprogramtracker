"use client";

/**
 * CharacterAvatar — the visual centerpiece of Hero Mode.
 *
 * Renders the user's archetype icon inside a circular surface, layered with
 * tier-specific embellishments (glow, pulse, orbiting particles, corona,
 * crown, halo, rays). Each tier composes ONTO the previous tier's visuals.
 *
 * Pure presentational component — accepts archetype + tier + size and draws.
 */

import {
  BookOpenText,
  Compass,
  Crown,
  Flame,
  Flower2,
  Sword,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type CSSProperties } from "react";

import type { Archetype, Tier } from "@program/shared";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Archetype → icon + accent maps
// ---------------------------------------------------------------------------

const ARCHETYPE_ICON: Record<Archetype, LucideIcon> = {
  warrior: Sword,
  sage: BookOpenText,
  athlete: Zap,
  monk: Flower2,
  explorer: Compass,
  phoenix: Flame,
};

const ARCHETYPE_ACCENT: Record<Archetype, string> = {
  warrior: "#ef4444",
  sage: "#3b82f6",
  athlete: "#eab308",
  monk: "#14b8a6",
  explorer: "#f59e0b",
  phoenix: "#f97316",
};

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<Size, number> = {
  sm: 48,
  md: 80,
  lg: 128,
  xl: 192,
};

// Icon takes ~50% of container so the surface + glow read clearly.
const ICON_RATIO = 0.5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a #rrggbb hex to an rgba() string with the supplied alpha. */
function hexToRgba(hex: string, alpha: number): string {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export type CharacterAvatarProps = {
  archetype: Archetype;
  tier: Tier;
  size?: Size;
  className?: string;
};

export function CharacterAvatar({
  archetype,
  tier,
  size = "md",
  className,
}: CharacterAvatarProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { margin: "0px 0px -10% 0px" });
  // Freeze infinite loops when the avatar is off-screen OR the user prefers
  // reduced motion. `animate` is undefined in either case so framer skips the
  // RAF tick entirely.
  const animate = !reduceMotion && inView;

  const Icon = ARCHETYPE_ICON[archetype];
  const accent = ARCHETYPE_ACCENT[archetype];
  const accentGlow = hexToRgba(accent, 0.45);
  const accentSoft = hexToRgba(accent, 0.18);
  const accentFaint = hexToRgba(accent, 0.08);

  const px = SIZE_PX[size];
  const iconPx = Math.round(px * ICON_RATIO);

  // Glow strength climbs with tier so higher levels visibly "burn brighter".
  // Intensified for higher tiers — layered drop-shadows give a richer halo.
  const glowSpread = 4 + tier * 4; // px (was tier*3)
  const glowBlur = 12 + tier * 10; // px (was tier*8)
  const innerBlur = 6 + tier * 4;
  const baseShadow = `0 0 ${glowBlur}px ${glowSpread}px ${accentGlow}, 0 0 ${innerBlur}px ${Math.round(glowSpread / 2)}px ${accentGlow}, inset 0 0 ${Math.round(glowBlur / 2)}px ${accentSoft}`;

  const containerStyle: CSSProperties = {
    width: px,
    height: px,
    background: `radial-gradient(circle at 50% 45%, ${accentSoft} 0%, ${accentFaint} 55%, rgba(255,255,255,0.02) 100%)`,
    boxShadow: baseShadow,
  };

  // Crown size relative to container.
  const crownPx = Math.max(14, Math.round(px * 0.22));

  // `freeze` mirrors the old `reduceMotion` semantics in sub-components: when
  // true, infinite loops are skipped. It now also covers the off-screen case.
  const freeze = !animate;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      {/* Tier 5: outgoing rays (sit behind everything else). */}
      {tier >= 5 ? (
        <Rays
          accent={accent}
          accentGlow={accentGlow}
          containerPx={px}
          reduceMotion={freeze}
        />
      ) : null}

      {/* Tier 5: slowly-rotating outer hex SVG outline (HUD frame). */}
      {tier >= 5 ? (
        <HexFrame
          accent={accent}
          accentGlow={accentGlow}
          containerPx={px}
          reduceMotion={freeze}
        />
      ) : null}

      {/* Tier 4/5: corona ring / halo. */}
      {tier >= 4 ? (
        <Corona
          accent={accent}
          accentGlow={accentGlow}
          containerPx={px}
          reduceMotion={freeze}
          full={tier >= 5}
        />
      ) : null}

      {/* Tier 3: orbiting particles. */}
      {tier >= 3 ? (
        <Particles
          accent={accent}
          accentGlow={accentGlow}
          containerPx={px}
          reduceMotion={freeze}
        />
      ) : null}

      {/* Base disc. Tier 2 adds a pulsing glow on top of it. */}
      <motion.div
        className="relative flex items-center justify-center rounded-full border"
        style={{
          ...containerStyle,
          borderColor: hexToRgba(accent, 0.35),
        }}
        animate={
          tier >= 2 && animate
            ? {
                boxShadow: [
                  baseShadow,
                  `0 0 ${glowBlur + 10}px ${glowSpread + 3}px ${accentGlow}`,
                  baseShadow,
                ],
                scale: [1, 1.05, 1],
              }
            : undefined
        }
        transition={
          tier >= 2 && animate
            ? {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : undefined
        }
      >
        <Icon
          size={iconPx}
          color={accent}
          strokeWidth={2}
          style={{
            filter: `drop-shadow(0 0 ${Math.round(iconPx * 0.18)}px ${accentGlow})`,
          }}
        />
      </motion.div>

      {/* Tier 4/5: crown overlay on top. */}
      {tier >= 4 ? (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: -Math.round(crownPx * 0.55),
            filter: `drop-shadow(0 0 ${Math.round(crownPx * 0.4)}px ${accentGlow})`,
          }}
        >
          <Crown
            size={crownPx}
            color={accent}
            strokeWidth={2.25}
            fill={hexToRgba(accent, 0.18)}
          />
        </div>
      ) : null}
    </div>
  );
}

export default CharacterAvatar;

// ---------------------------------------------------------------------------
// Tier 3: orbiting particles
// ---------------------------------------------------------------------------

function Particles({
  accent,
  accentGlow,
  containerPx,
  reduceMotion,
}: {
  accent: string;
  accentGlow: string;
  containerPx: number;
  reduceMotion: boolean;
}) {
  const orbitPx = Math.round(containerPx * 1.18);
  const particlePx = Math.max(4, Math.round(containerPx * 0.07));

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{
        width: orbitPx,
        height: orbitPx,
        left: "50%",
        top: "50%",
        marginLeft: -orbitPx / 2,
        marginTop: -orbitPx / 2,
      }}
      animate={reduceMotion ? undefined : { rotate: 360 }}
      transition={
        reduceMotion
          ? undefined
          : { duration: 8, repeat: Infinity, ease: "linear" }
      }
    >
      {[0, 120, 240].map((deg) => (
        <div
          key={deg}
          className="absolute rounded-full"
          style={{
            width: particlePx,
            height: particlePx,
            background: accent,
            boxShadow: `0 0 ${particlePx * 2}px ${particlePx / 2}px ${accentGlow}`,
            left: "50%",
            top: "50%",
            transform: `rotate(${deg}deg) translate(0, -${orbitPx / 2}px) translate(-50%, -50%)`,
          }}
        />
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Tier 4/5: corona ring + halo
// ---------------------------------------------------------------------------

function Corona({
  accent,
  accentGlow,
  containerPx,
  reduceMotion,
  full,
}: {
  accent: string;
  accentGlow: string;
  containerPx: number;
  reduceMotion: boolean;
  full: boolean;
}) {
  const coronaPx = Math.round(containerPx * 1.35);
  const ringWidth = Math.max(2, Math.round(containerPx * 0.025));

  // Tier 4: a rotating conic-gradient ring (visible accent arcs around the
  // disc). Tier 5: a fuller, more opaque halo with two layered rings.
  const ringBackground = full
    ? `conic-gradient(from 0deg, ${accent} 0deg, ${accentGlow} 90deg, ${accent} 180deg, ${accentGlow} 270deg, ${accent} 360deg)`
    : `conic-gradient(from 0deg, ${accentGlow} 0deg, ${accent} 60deg, transparent 120deg, ${accent} 240deg, transparent 300deg, ${accentGlow} 360deg)`;

  return (
    <>
      <motion.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: coronaPx,
          height: coronaPx,
          left: "50%",
          top: "50%",
          marginLeft: -coronaPx / 2,
          marginTop: -coronaPx / 2,
          padding: ringWidth,
          background: ringBackground,
          // Mask out the centre so we get a ring, not a filled disc.
          WebkitMask:
            "radial-gradient(circle, transparent calc(50% - " +
            ringWidth +
            "px), #000 calc(50% - " +
            ringWidth +
            "px))",
          mask:
            "radial-gradient(circle, transparent calc(50% - " +
            ringWidth +
            "px), #000 calc(50% - " +
            ringWidth +
            "px))",
          opacity: full ? 0.95 : 0.8,
          filter: `drop-shadow(0 0 ${Math.round(containerPx * 0.1)}px ${accentGlow})`,
        }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={
          reduceMotion
            ? undefined
            : { duration: full ? 18 : 12, repeat: Infinity, ease: "linear" }
        }
      />

      {/* Tier 5: inner halo ring for extra weight. */}
      {full ? (
        <motion.div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: Math.round(containerPx * 1.18),
            height: Math.round(containerPx * 1.18),
            left: "50%",
            top: "50%",
            marginLeft: -Math.round(containerPx * 1.18) / 2,
            marginTop: -Math.round(containerPx * 1.18) / 2,
            border: `${Math.max(1, Math.round(containerPx * 0.012))}px solid ${accent}`,
            boxShadow: `0 0 ${Math.round(containerPx * 0.2)}px ${Math.round(containerPx * 0.05)}px ${accentGlow}, inset 0 0 ${Math.round(containerPx * 0.12)}px ${accentGlow}`,
            opacity: 0.85,
          }}
          animate={
            reduceMotion ? undefined : { rotate: -360, opacity: [0.7, 0.95, 0.7] }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  rotate: { duration: 24, repeat: Infinity, ease: "linear" },
                  opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }
          }
        />
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tier 5: rotating hex frame (HUD aesthetic)
// ---------------------------------------------------------------------------

function HexFrame({
  accent,
  accentGlow,
  containerPx,
  reduceMotion,
}: {
  accent: string;
  accentGlow: string;
  containerPx: number;
  reduceMotion: boolean;
}) {
  // Hex frame sits outside the corona / halo (which extends to ~1.35x).
  const framePx = Math.round(containerPx * 1.55);
  const stroke = Math.max(1.5, Math.round(containerPx * 0.018));

  // Regular hexagon points centered in a 100x100 viewBox.
  // Pointy-top orientation feels more "shield/badge".
  const points = "50,4 92,27 92,73 50,96 8,73 8,27";

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{
        width: framePx,
        height: framePx,
        left: "50%",
        top: "50%",
        marginLeft: -framePx / 2,
        marginTop: -framePx / 2,
        opacity: 0.4,
        filter: `drop-shadow(0 0 ${Math.round(containerPx * 0.08)}px ${accentGlow})`,
      }}
      animate={reduceMotion ? undefined : { rotate: 360 }}
      transition={
        reduceMotion
          ? undefined
          : { duration: 60, repeat: Infinity, ease: "linear" }
      }
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width={framePx}
        height={framePx}
        style={{ display: "block" }}
      >
        <polygon
          points={points}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinejoin="miter"
        />
        {/* Tiny vertex pips at each corner for extra HUD detail. */}
        {points.split(" ").map((p, i) => {
          const [cx, cy] = p.split(",").map(Number);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={stroke * 0.9}
              fill={accent}
            />
          );
        })}
      </svg>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Tier 5: outgoing rays
// ---------------------------------------------------------------------------

function Rays({
  accent,
  accentGlow,
  containerPx,
  reduceMotion,
}: {
  accent: string;
  accentGlow: string;
  containerPx: number;
  reduceMotion: boolean;
}) {
  const rayLength = Math.round(containerPx * 0.55);
  const rayWidth = Math.max(2, Math.round(containerPx * 0.022));
  const offset = Math.round(containerPx * 0.62);
  const rayCount = 5;

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        width: containerPx,
        height: containerPx,
        left: 0,
        top: 0,
      }}
    >
      {Array.from({ length: rayCount }).map((_, i) => {
        const angle = (360 / rayCount) * i;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: rayWidth,
              height: rayLength,
              left: "50%",
              top: "50%",
              borderRadius: rayWidth,
              background: `linear-gradient(to top, ${accent}, ${accentGlow}, transparent)`,
              transformOrigin: "50% 0%",
              transform: `translate(-50%, 0) rotate(${angle}deg) translate(0, ${offset}px)`,
              filter: `drop-shadow(0 0 ${rayWidth * 2}px ${accentGlow})`,
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    scaleY: [0.7, 1.15, 0.7],
                    opacity: [0.55, 0.95, 0.55],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.18,
                  }
            }
          />
        );
      })}
    </div>
  );
}
