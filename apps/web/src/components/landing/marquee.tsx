"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { Fragment, useRef, useState } from "react";

type MarqueeProps = {
  items: string[];
  speed?: number;
  direction?: "left" | "right";
  className?: string;
};

export function Marquee({
  items,
  speed = 40,
  direction = "left",
  className = "",
}: MarqueeProps) {
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { margin: "0px 0px -10% 0px" });

  if (!items || items.length === 0) {
    return null;
  }

  const renderRow = (keyPrefix: string) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={keyPrefix !== "a"}>
      {items.map((item, i) => (
        <Fragment key={`${keyPrefix}-${i}`}>
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">
            {item}
          </span>
          <span
            className="inline-block h-1 w-1 rounded-full bg-[var(--accent)]"
            aria-hidden="true"
          />
        </Fragment>
      ))}
    </div>
  );

  const baseClasses = `group relative w-full overflow-hidden py-4 border-y border-white/[0.04] ${className}`;

  if (reduceMotion) {
    return (
      <div className={baseClasses}>
        <div className="flex w-full items-center">{renderRow("a")}</div>
      </div>
    );
  }

  const animateX = direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"];
  // Animation runs only when the marquee is on-screen AND not hover-paused.
  const running = inView && !paused;

  return (
    <div
      ref={containerRef}
      className={baseClasses}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="flex w-max items-center"
        animate={running ? { x: animateX } : { x: undefined }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{ willChange: "transform" }}
      >
        {renderRow("a")}
        {renderRow("b")}
      </motion.div>
    </div>
  );
}

export default Marquee;
