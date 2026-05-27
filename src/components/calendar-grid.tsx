"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DayDetailModal } from "./day-detail-modal";
import type { Task } from "@/lib/tasks";

export type DayStatus = {
  date: string;
  completedCount: number;
  isFuture: boolean;
};

type Props = {
  today: string;
  startDate: string;
  totalDays: number;
  tasks: Task[];
  statuses: DayStatus[];
};

type Tone = "future" | "miss" | "partial" | "complete";

function toneFor(s: DayStatus, today: string, taskCount: number): Tone {
  if (s.isFuture) return "future";
  if (taskCount > 0 && s.completedCount === taskCount) return "complete";
  // For "today", don't classify as a miss until the day is over.
  if (s.date === today) {
    if (s.completedCount === 0) return "future";
    return "partial";
  }
  if (s.completedCount === 0) return "miss";
  return "partial";
}

const cellStyles: Record<Tone, string> = {
  future:
    "bg-bg-card border-border-subtle text-text-dim hover:border-accent/30 hover:text-text-muted",
  miss: "bg-state-miss/15 border-state-miss/40 text-rose-100 hover:border-state-miss",
  partial:
    "bg-state-partial/15 border-state-partial/40 text-amber-100 hover:border-state-partial",
  complete:
    "bg-accent/25 border-accent/60 text-white shadow-[0_0_18px_-4px_rgba(14,165,255,0.55)] hover:shadow-[0_0_24px_-2px_rgba(14,165,255,0.75)] hover:border-accent",
};

export function CalendarGrid({
  today,
  startDate,
  totalDays,
  tasks,
  statuses,
}: Props) {
  const [openDate, setOpenDate] = useState<string | null>(null);
  const taskCount = tasks.length;

  const counts = {
    complete: 0,
    partial: 0,
    miss: 0,
    future: 0,
  };
  for (const s of statuses) counts[toneFor(s, today, taskCount)]++;

  return (
    <>
      <Legend counts={counts} totalDays={totalDays} taskCount={taskCount} />

      <div className="mt-8 grid grid-cols-5 gap-2.5 sm:grid-cols-10">
        {statuses.map((s, i) => {
          const tone = toneFor(s, today, taskCount);
          const isToday = s.date === today;
          const dayN = i + 1;
          const disabled = s.isFuture;

          return (
            <motion.button
              key={s.date}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setOpenDate(s.date)}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: Math.min(i * 0.008, 0.5),
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={disabled ? undefined : { y: -2, scale: 1.04 }}
              whileTap={disabled ? undefined : { scale: 0.96 }}
              className={cn(
                "relative aspect-square rounded-xl border text-left transition-colors",
                "flex flex-col justify-between p-2",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
                cellStyles[tone],
                disabled && "cursor-not-allowed opacity-60"
              )}
              aria-label={`Day ${dayN} · ${s.date} · ${s.completedCount}/${taskCount} done`}
            >
              {isToday && (
                <span
                  aria-hidden
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent shadow-glow ring-2 ring-bg"
                />
              )}

              <span className="text-[11px] font-mono text-current opacity-60">
                {String(dayN).padStart(2, "0")}
              </span>
              <span className="self-end text-[11px] font-medium tabular-nums">
                {s.isFuture ? "—" : `${s.completedCount}/${taskCount}`}
              </span>
            </motion.button>
          );
        })}
      </div>

      <DayDetailModal
        open={openDate !== null}
        date={openDate}
        startDate={startDate}
        tasks={tasks}
        totalDays={totalDays}
        onOpenChange={(o) => {
          if (!o) setOpenDate(null);
        }}
      />
    </>
  );
}

function Legend({
  counts,
  totalDays,
  taskCount,
}: {
  counts: { complete: number; partial: number; miss: number; future: number };
  totalDays: number;
  taskCount: number;
}) {
  const items: { label: string; sw: string; count: number }[] = [
    { label: "Complete", sw: "bg-accent shadow-glow", count: counts.complete },
    { label: "Partial", sw: "bg-state-partial", count: counts.partial },
    { label: "Missed", sw: "bg-state-miss", count: counts.miss },
    {
      label: "Untouched",
      sw: "bg-bg-card border border-border-subtle",
      count: counts.future,
    },
  ];

  const done = counts.complete;
  const pct = totalDays > 0 ? Math.round((done / totalDays) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-text-dim">
          Full days
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-gradient-accent tabular-nums">
            {done}
          </span>
          <span className="text-sm text-text-dim">/ {totalDays}</span>
          <span className="ml-2 text-xs text-accent-glow tabular-nums">{pct}%</span>
        </div>
        <div className="mt-1 text-xs text-text-dim">
          {totalDays} days · {taskCount} {taskCount === 1 ? "task" : "tasks"} per day
        </div>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-2 text-xs">
            <span className={cn("h-2.5 w-2.5 rounded-sm", i.sw)} />
            <span className="text-text-muted">{i.label}</span>
            <span className="text-text-dim tabular-nums">{i.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
