"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";

import { AnimatedHeading } from "./animated-heading";

type Stat = {
  value: number;
  label: string;
  suffix?: string;
};

const stats: Stat[] = [
  { value: 100, label: "Days max program", suffix: "" },
  { value: 6, label: "Hero archetypes", suffix: "" },
  { value: 7, label: "Themes", suffix: "" },
  { value: 42, label: "Combinations", suffix: "+" },
];

function Counter({
  value,
  suffix = "",
  delay = 0,
  inView,
}: {
  value: number;
  suffix?: string;
  delay?: number;
  inView: boolean;
}) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, {
      duration: 1.6,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value, delay, motionValue]);

  return (
    <span className="font-mono text-4xl font-bold tracking-tight text-white tabular-nums sm:text-6xl md:text-7xl">
      {display}
      {suffix}
    </span>
  );
}

export function NumbersSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-3xl"
        >
          <div className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
            Built for the long haul
          </div>
          <AnimatedHeading
            as="h2"
            className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl"
          >
            Numbers that show up for you.
          </AnimatedHeading>
          <p className="mt-5 text-lg font-normal leading-relaxed text-zinc-400">
            Honest math, nothing inflated.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#1f1f2c] p-6 sm:p-8"
            >
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                delay={i * 0.12}
                inView={inView}
              />
              <span className="text-sm font-medium leading-relaxed text-zinc-400">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NumbersSection;
