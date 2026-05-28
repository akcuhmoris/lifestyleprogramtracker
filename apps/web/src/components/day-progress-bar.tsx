"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  completed: number;
  total: number;
  /** "today" puts the prominent treatment on; "compact" is for the modal header */
  variant?: "today" | "compact";
};

export function DayProgressBar({ completed, total, variant = "today" }: Props) {
  const pct = total === 0 ? 0 : Math.min(100, (completed / total) * 100);
  const allDone = total > 0 && completed === total;

  if (variant === "compact") {
    return (
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated border border-border-subtle">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 30 }}
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            allDone
              ? "bg-gradient-to-r from-accent-deep via-accent to-accent-glow shadow-[0_0_10px_rgba(14,165,255,0.7)]"
              : "bg-gradient-to-r from-accent-deep via-accent to-accent-glow shadow-[0_0_6px_rgba(14,165,255,0.5)]"
          )}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-border bg-bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-2xl font-semibold tracking-tight tabular-nums",
              allDone ? "text-gradient-accent" : "text-text"
            )}
          >
            {completed}
          </span>
          <span className="text-sm text-text-dim tabular-nums">/ {total} today</span>
        </div>
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            allDone ? "text-accent-glow" : "text-text-muted"
          )}
        >
          {Math.round(pct)}%
        </span>
      </div>
      <div className="mt-3 relative h-2.5 w-full overflow-hidden rounded-full bg-bg-elevated border border-border-subtle">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 30 }}
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-deep via-accent to-accent-glow",
            allDone
              ? "shadow-[0_0_18px_rgba(14,165,255,0.65)]"
              : "shadow-[0_0_10px_rgba(14,165,255,0.45)]"
          )}
        />
        {/* shimmer */}
        {!allDone && pct > 0 && (
          <motion.div
            className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "400%" }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 0.6,
            }}
            style={{ left: 0 }}
          />
        )}
      </div>
    </div>
  );
}
