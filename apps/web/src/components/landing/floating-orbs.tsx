"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

type FloatingOrbsProps = {
  count?: number;
  className?: string;
};

function seeded(i: number) {
  return ((i * 9301 + 49297) % 233280) / 233280;
}

export function FloatingOrbs({ count = 8, className }: FloatingOrbsProps) {
  const reduce = useReducedMotion();
  // Only animate when this region is actually in the viewport — avoids burning
  // CPU on motion loops the user can't see.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(containerRef, { amount: 0.05 });

  const orbs = Array.from({ length: count }, (_, i) => {
    const s1 = seeded(i + 1);
    const s2 = seeded(i + 2);
    const s3 = seeded(i + 3);
    const s4 = seeded(i + 4);
    const s5 = seeded(i + 5);

    const left = s1 * 100; // % across
    const top = s2 * 100; // % down
    const size = 8 + s3 * 8; // 8 - 16 px
    const drift = 30 + s4 * 30; // ±30 - 60 px
    const duration = 6 + s5 * 6; // 6 - 12 s
    const delay = -(s1 * duration); // negative delay -> stagger phases
    const opacityHigh = 0.6 + s3 * 0.3; // up to 0.9
    const opacityLow = 0.4;

    return {
      key: i,
      left,
      top,
      size,
      drift,
      duration,
      delay,
      opacityHigh,
      opacityLow,
    };
  });

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {orbs.map((orb) => {
        const style = {
          position: "absolute" as const,
          left: `${orb.left}%`,
          top: `${orb.top}%`,
          width: orb.size,
          height: orb.size,
          borderRadius: "9999px",
          background: "rgba(165,180,252,0.9)",
          boxShadow:
            "0 0 12px rgba(165,180,252,0.55), 0 0 28px rgba(165,180,252,0.35)",
        };

        if (reduce || !inView) {
          return (
            <div
              key={orb.key}
              style={{ ...style, opacity: orb.opacityLow + 0.2 }}
            />
          );
        }

        return (
          <motion.div
            key={orb.key}
            style={style}
            animate={{
              y: [0, -orb.drift, 0, orb.drift, 0],
              opacity: [
                orb.opacityLow,
                orb.opacityHigh,
                orb.opacityLow,
                orb.opacityHigh,
                orb.opacityLow,
              ],
            }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
