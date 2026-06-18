"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { JSX } from "react";

type AnimatedHeadingProps = {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  delay?: number;
};

export function AnimatedHeading({
  children,
  className,
  as = "h1",
  delay = 0,
}: AnimatedHeadingProps) {
  const prefersReducedMotion = useReducedMotion();
  const Tag = as as keyof JSX.IntrinsicElements;

  if (prefersReducedMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  const words = children.split(" ");

  return (
    <Tag className={className}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ staggerChildren: 0.08, delayChildren: delay }}
        style={{ display: "inline" }}
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
              visible: { opacity: 1, y: 0, filter: "blur(0px)" },
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              display: "inline-block",
              willChange: "transform, opacity, filter",
            }}
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
