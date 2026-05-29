"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Camera,
  Droplets,
  Dumbbell,
  PenLine,
  TrendingDown,
  TrendingUp,
  Minus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PerTaskRecord = {
  id: string;
  title: string;
  completedDays: number;
  elapsed: number;
};

type Totals = {
  waterDays: number;
  workoutCount: number;
  workoutMinutes: number;
  readingDays: number;
  totalPages: number;
  journalEntries: number;
  photoDays: number;
};

type Props = {
  elapsed: number;
  total: number;
  full: number;
  partial: number;
  missed: number;
  perTask: PerTaskRecord[];
  weightSeries: { date: string; weight: number }[];
  totals: Totals;
};

export function StatsBoard({
  elapsed,
  total,
  full,
  partial,
  missed,
  perTask,
  weightSeries,
  totals,
}: Props) {
  const remaining = Math.max(0, total - elapsed);
  const fullPct = elapsed > 0 ? Math.round((full / elapsed) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Full days" value={`${full}`} sub={`${fullPct}% of elapsed`} accent />
        <Stat label="Partial" value={`${partial}`} />
        <Stat label="Missed" value={`${missed}`} />
        <Stat label="Remaining" value={`${remaining}`} sub={`of ${total}`} />
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <SectionTitle>Totals</SectionTitle>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <Totalor
              icon={Droplets}
              label="Water"
              value={`${totals.waterDays}`}
              unit="gallons"
            />
            <Totalor
              icon={Dumbbell}
              label="Workouts"
              value={`${totals.workoutCount}`}
              unit={`sessions · ${formatHrs(totals.workoutMinutes)}`}
            />
            <Totalor
              icon={BookOpen}
              label="Reading"
              value={`${totals.totalPages}`}
              unit={`pages · ${totals.readingDays} days`}
            />
            <Totalor
              icon={PenLine}
              label="Journal"
              value={`${totals.journalEntries}`}
              unit="entries"
            />
            <Totalor
              icon={Camera}
              label="Photos"
              value={`${totals.photoDays}`}
              unit="logged"
            />
          </ul>
        </Card>

        <Card>
          <SectionTitle>Weight trend</SectionTitle>
          <WeightTrend series={weightSeries} />
        </Card>
      </div>

      {/* Per-task */}
      <Card>
        <SectionTitle>Per-task completion</SectionTitle>
        <div className="mt-4 space-y-2">
          {perTask.map((t, i) => (
            <TaskBar key={t.id} record={t} index={i} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-bg-card p-5",
        accent ? "border-accent/40 shadow-glow" : "border-border"
      )}
    >
      <div className="text-[10.5px] uppercase tracking-[0.2em] text-text-dim">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 text-3xl font-semibold tracking-tight tabular-nums",
          accent ? "text-gradient-accent" : "text-text"
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-text-dim">{sub}</div>}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-5">{children}</div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-medium">
      {children}
    </h3>
  );
}

function Totalor({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 text-accent-glow flex-shrink-0">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.16em] text-text-dim">
          {label}
        </div>
        <div className="text-xl font-semibold tracking-tight tabular-nums text-text">
          {value}
        </div>
        <div className="text-[11.5px] text-text-dim leading-tight">{unit}</div>
      </div>
    </li>
  );
}

function TaskBar({ record, index }: { record: PerTaskRecord; index: number }) {
  const pct =
    record.elapsed === 0
      ? 0
      : Math.min(100, Math.round((record.completedDays / record.elapsed) * 100));

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] text-text">{record.title}</span>
          <span className="text-[12px] text-text-dim tabular-nums">
            {record.completedDays}/{record.elapsed}
          </span>
        </div>
        <div className="mt-1.5 relative h-2 overflow-hidden rounded-full bg-bg-elevated border border-border-subtle">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{
              delay: index * 0.04,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-deep via-accent to-accent-glow shadow-[0_0_10px_rgba(14,165,255,0.55)]"
          />
        </div>
      </div>
      <span
        className={cn(
          "text-[12px] font-medium tabular-nums w-12 text-right",
          pct >= 80 ? "text-accent-glow" : pct >= 40 ? "text-text" : "text-text-dim"
        )}
      >
        {pct}%
      </span>
    </div>
  );
}

function WeightTrend({ series }: { series: { date: string; weight: number }[] }) {
  if (series.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-border-subtle bg-bg-elevated px-4 py-8 text-center">
        <p className="text-sm text-text-dim">
          No weigh-ins yet. Log one on the Today view.
        </p>
      </div>
    );
  }

  const w = series.map((s) => s.weight);
  const min = Math.min(...w);
  const max = Math.max(...w);
  const span = Math.max(0.1, max - min);
  const padding = span * 0.15;
  const lo = min - padding;
  const hi = max + padding;
  const range = hi - lo;

  const width = 100;
  const height = 36;
  const stepX = series.length > 1 ? width / (series.length - 1) : width;

  const points = series
    .map((s, i) => {
      const x = i * stepX;
      const y = height - ((s.weight - lo) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const areaPoints = [
    `0,${height}`,
    ...series.map((s, i) => {
      const x = i * stepX;
      const y = height - ((s.weight - lo) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }),
    `${(series.length - 1) * stepX},${height}`,
  ].join(" ");

  const first = series[0];
  const last = series[series.length - 1];
  const diff = last.weight - first.weight;
  const Trend = Math.abs(diff) < 0.05 ? Minus : diff < 0 ? TrendingDown : TrendingUp;
  const trendColor =
    Math.abs(diff) < 0.05
      ? "text-text-muted"
      : diff < 0
      ? "text-accent-glow"
      : "text-state-partial";

  const lowest = Math.min(...w);
  const highest = Math.max(...w);

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-text-dim">
            Current
          </div>
          <div className="text-3xl font-semibold tracking-tight tabular-nums text-text">
            {last.weight}
            <span className="ml-1 text-sm font-medium text-text-dim">lbs</span>
          </div>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-medium tabular-nums",
            diff < 0
              ? "border-accent/30 bg-accent/10 text-accent-glow"
              : diff > 0
              ? "border-state-partial/30 bg-state-partial/10 text-state-partial"
              : "border-border-subtle bg-bg-elevated text-text-muted"
          )}
        >
          <Trend className="h-3 w-3" strokeWidth={2.5} />
          {diff > 0 ? "+" : ""}
          {diff.toFixed(1)} lbs
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="mt-4 h-32 w-full"
      >
        <defs>
          <linearGradient id="trend-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0EA5FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0EA5FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trend-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3DBDFF" />
            <stop offset="100%" stopColor="#0EA5FF" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#trend-area)" />
        <polyline
          points={points}
          fill="none"
          stroke="url(#trend-line)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 0 4px rgba(14,165,255,0.55))" }}
        />
        {series.map((s, i) => {
          const x = i * stepX;
          const y = height - ((s.weight - lo) / range) * height;
          return (
            <circle
              key={s.date}
              cx={x}
              cy={y}
              r={i === series.length - 1 ? 1.6 : 1}
              fill={i === series.length - 1 ? "#3DBDFF" : "#0EA5FF"}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <Mini label="Start" value={`${first.weight}`} />
        <Mini label="Lowest" value={`${lowest}`} accent={lowest === last.weight} />
        <Mini label="Highest" value={`${highest}`} />
      </div>
    </div>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-text-dim">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          accent ? "text-accent-glow" : "text-text"
        )}
      >
        {value}
        <span className="ml-1 text-[10px] font-medium text-text-dim">lbs</span>
      </div>
    </div>
  );
}

function formatHrs(minutes: number) {
  if (minutes === 0) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} m`;
}
