"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3, Calendar, Sparkles, Trophy } from "lucide-react";
import { useEffect } from "react";
import { bigCelebration } from "./confetti";

type Props = {
  startDate: string;
  endDate: string;
  totals: {
    waterGallons: number;
    workoutMinutes: number;
    totalPages: number;
    journalEntries: number;
    photoDays: number;
  };
  weightChange: number | null;
};

export function CompletionScreen({
  startDate,
  endDate,
  totals,
  weightChange,
}: Props) {
  useEffect(() => {
    bigCelebration();
    const t = setTimeout(() => bigCelebration(), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.1 }}
        className="relative mx-auto inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-accent-glow via-accent to-accent-deep shadow-glow-lg"
      >
        <div className="absolute inset-0 rounded-3xl bg-accent/40 blur-2xl" />
        <Trophy className="relative h-10 w-10 text-bg" strokeWidth={2.2} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-accent-glow shadow-[0_0_18px_-4px_rgba(14,165,255,0.5)]">
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          100 of 100
        </span>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
          <span className="text-gradient-accent">Challenge complete.</span>
        </h1>
        <p className="mt-4 text-base text-text-muted">
          {startDate} → {endDate} · every task, every day.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left"
      >
        <Stat label="Water" value={`${totals.waterGallons}`} unit="gallons" />
        <Stat label="Workouts" value={`${totals.workoutMinutes}`} unit="minutes" />
        <Stat label="Pages read" value={`${totals.totalPages}`} unit="nonfiction" />
        <Stat label="Journal" value={`${totals.journalEntries}`} unit="entries" />
        <Stat label="Photos" value={`${totals.photoDays}`} unit="captured" />
        {weightChange != null && (
          <Stat
            label="Weight"
            value={`${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}`}
            unit="lbs change"
          />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.5 }}
        className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <Link
          href="/stats"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-bg shadow-glow hover:brightness-110 transition-all"
        >
          <BarChart3 className="h-4 w-4" strokeWidth={2.5} />
          See the full breakdown
        </Link>
        <Link
          href="/calendar"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-bg-card px-5 py-3 text-sm font-semibold text-text hover:border-accent/40 hover:text-accent-glow transition-colors"
        >
          <Calendar className="h-4 w-4" strokeWidth={2.5} />
          View the 100-day calendar
        </Link>
      </motion.div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-5"
    >
      <div className="text-[10.5px] uppercase tracking-[0.2em] text-text-dim">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-text">
        {value}
      </div>
      <div className="mt-1 text-xs text-text-dim">{unit}</div>
    </motion.div>
  );
}
