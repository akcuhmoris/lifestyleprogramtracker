"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export function CursorSpotlight() {
  const reduce = useReducedMotion();

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 30 });

  // Coalesce mousemove updates into one frame. The spotlight only repaints
  // once per frame anyway; without this, mousemove fires far more often than
  // we can use, adding pointless main-thread work on the landing page.
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) return;

    const handleMove = (e: MouseEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(() => {
        mouseX.set(clientX);
        mouseY.set(clientY);
        rafIdRef.current = null;
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [mouseX, mouseY, reduce]);

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-0 hidden md:block"
      style={{
        mixBlendMode: "screen",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          width: 600,
          height: 600,
          borderRadius: "9999px",
          background:
            "radial-gradient(circle, rgba(165,180,252,0.08) 0%, rgba(165,180,252,0) 70%)",
        }}
      />
    </motion.div>
  );
}
