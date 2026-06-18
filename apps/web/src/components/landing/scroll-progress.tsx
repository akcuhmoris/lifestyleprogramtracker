"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 60,
        width,
        background: "linear-gradient(90deg, #a5b4fc 0%, #c084fc 100%)",
        transformOrigin: "0% 50%",
      }}
    />
  );
}
