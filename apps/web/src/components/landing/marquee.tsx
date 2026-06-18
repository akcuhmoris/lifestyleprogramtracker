"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment, useState } from "react";

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

  return (
    <div
      className={baseClasses}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="flex w-max items-center"
        animate={paused ? { x: undefined } : { x: animateX }}
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
