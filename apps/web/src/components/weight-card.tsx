"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { saveWeightAction } from "@/app/actions";
import { cn } from "@/lib/utils";

type Props = {
  date: string;
  initial: number | null;
  previous: { date: string; weight: number } | null;
  disabled?: boolean;
};

export function WeightCard({ date, initial, previous, disabled }: Props) {
  const [raw, setRaw] = useState<string>(initial != null ? String(initial) : "");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const last = useRef<number | null>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRaw(initial != null ? String(initial) : "");
    last.current = initial;
  }, [initial, date]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const trimmed = raw.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    if (parsed != null && !Number.isFinite(parsed)) return;
    if (parsed === last.current) return;

    timer.current = setTimeout(async () => {
      const res = await saveWeightAction(date, parsed);
      if (res.ok) {
        last.current = parsed;
        setSavedAt(Date.now());
      }
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [raw, date]);

  const current = (() => {
    const trimmed = raw.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  })();

  const delta =
    current != null && previous != null
      ? Math.round((current - previous.weight) * 10) / 10
      : null;

  return (
    <div className="group rounded-2xl border border-border bg-bg-card overflow-hidden relative transition-colors focus-within:border-accent/40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-50 group-focus-within:opacity-100 transition-opacity"
      />
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent-glow border border-accent/20">
            <Scale className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-medium tracking-tight">Weight</h3>
            <p className="text-xs text-text-dim mt-0.5">Daily check-in · in lbs</p>
          </div>
        </div>
        <SavedHint savedAt={savedAt} />
      </div>
      <div className="px-5 py-5 flex items-center gap-5">
        <div className="relative">
          <input
            disabled={disabled}
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="—"
            className={cn(
              "w-32 bg-bg-elevated rounded-xl border border-border-subtle",
              "px-4 py-3 text-2xl font-semibold tracking-tight tabular-nums text-text",
              "placeholder:text-text-dim placeholder:font-normal",
              "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-all",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-dim font-mono pointer-events-none">
            lbs
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {delta != null ? (
              <motion.div
                key="delta"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <DeltaBadge delta={delta} />
                <span className="text-xs text-text-dim">
                  vs {previous!.date}
                </span>
              </motion.div>
            ) : previous != null ? (
              <motion.div
                key="prev"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-text-dim"
              >
                Last logged:{" "}
                <span className="text-text-muted tabular-nums">
                  {previous.weight} lbs
                </span>{" "}
                on {previous.date}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-text-dim"
              >
                First weigh-in. Trend appears after the next entry.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  const isFlat = Math.abs(delta) < 0.05;
  const isDown = delta < 0;
  const Icon = isFlat ? Minus : isDown ? TrendingDown : TrendingUp;
  const color = isFlat
    ? "text-text-muted bg-bg-elevated border-border-subtle"
    : isDown
    ? "text-accent-glow bg-accent/10 border-accent/30"
    : "text-state-partial bg-state-partial/10 border-state-partial/30";
  const sign = isFlat ? "" : delta > 0 ? "+" : "";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1",
        "text-[12px] font-medium tabular-nums",
        color
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {sign}
      {Math.abs(delta).toFixed(1)} lbs
    </span>
  );
}

function SavedHint({ savedAt }: { savedAt: number | null }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!savedAt) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(t);
  }, [savedAt]);
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs text-accent-glow"
        >
          Saved
        </motion.span>
      )}
    </AnimatePresence>
  );
}
