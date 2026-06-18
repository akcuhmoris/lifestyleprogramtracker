"use client";

/**
 * Level + XP progress bar for Hero Mode — Forge HUD style.
 *
 * Three rows:
 *   1. "LVL N" badge on the left (display font), tier name on the right (mono)
 *   2. Segmented XP pill (8 segments) — fills with the active accent
 *   3. "{current} / {needed} XP" centered (mono tabular nums)
 *
 * The fill uses the active theme's accent via the CSS var `--accent`,
 * so it automatically recolors when the theme changes.
 *
 * Public prop API is intentionally unchanged: { level, xp, className? }.
 */

import {
  tierForLevel,
  tierName,
  xpToNextLevel,
} from "@program/shared/gamification";
import { cn } from "@/lib/utils";
import { XpPill } from "@/components/hud/xp-pill";

type LevelBarProps = {
  level: number;
  xp: number;
  className?: string;
};

export function LevelBar({ level, xp, className }: LevelBarProps) {
  const progress = xpToNextLevel(xp);
  const current = Math.max(0, progress.current);
  const needed = Math.max(1, progress.needed);

  const tier = tierForLevel(level);
  const tierLabel = tierName(tier);

  return (
    <div
      className={cn(
        "w-full select-none rounded-md border px-4 py-3",
        className,
      )}
      style={{
        borderColor: "var(--hud-border, rgba(255,255,255,0.1))",
        background: "var(--hud-panel-bg, rgba(255,255,255,0.02))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      {/* Row 1: level badge + tier name */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center rounded-sm border px-2.5 py-1 text-sm tracking-[0.18em] text-[color:var(--text,#f5f5f7)]"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontWeight: 700,
            borderColor: "var(--hud-border-strong, rgba(255,255,255,0.2))",
            background: "rgba(0,0,0,0.3)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset",
          }}
        >
          LVL {level}
        </span>
        <span
          className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-muted,#9ca3af)]"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          {tierLabel}
        </span>
      </div>

      {/* Row 2: segmented XP pill */}
      <div className="mt-3">
        <XpPill current={current} needed={needed} segments={8} size="md" />
      </div>

      {/* Row 3: numeric XP */}
      <div
        className="mt-2 text-center text-[11px] tabular-nums tracking-[0.12em] text-[color:var(--text-muted,#9ca3af)]"
        style={{ fontFamily: "var(--font-mono), monospace" }}
      >
        <span className="text-[color:var(--text,#f5f5f7)]">{current}</span>
        <span className="mx-1 opacity-60">/</span>
        <span>{needed} XP</span>
      </div>
    </div>
  );
}

export default LevelBar;
