"use client";

import { motion } from "framer-motion";
import { Target, Calendar, TrendingUp, type LucideIcon } from "lucide-react";

import { AnimatedHeading } from "./animated-heading";

type PromiseItem = {
  number: string;
  icon: LucideIcon;
  title: string;
  body: string;
};

const items: PromiseItem[] = [
  {
    number: "01",
    icon: Target,
    title: "Pick your program",
    body: "75 Hard, 100 Hard, or build your own from scratch.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Show up every day",
    body: "Check off your quests. Earn XP for every win.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Become legendary",
    body: "Level up across 5 tiers. Make consistency feel like a game.",
  },
];

export function Promise() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-3xl"
        >
          <div className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
            How it works
          </div>
          <AnimatedHeading
            as="h2"
            className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl"
          >
            Pick. Show up. Level up.
          </AnimatedHeading>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e0e12] p-8 transition-colors duration-300 hover:border-indigo-400/40 hover:shadow-[0_0_40px_-12px_rgba(129,140,248,0.35)]"
              >
                <span className="absolute right-6 top-6 font-mono text-sm font-semibold text-zinc-400">
                  {item.number}
                </span>

                <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-indigo-400 transition-colors duration-300 group-hover:border-indigo-400/40 group-hover:text-indigo-300">
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                </div>

                <h3 className="mb-3 text-xl font-bold tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="text-base font-normal leading-relaxed text-zinc-400">
                  {item.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Promise;
