"use client";

/**
 * PersistentHUD — sticky chrome at the top of every authed page.
 *
 * Softened, chip-style identity strip showing the user's level + tier name, a
 * thin smooth XP bar tracking progress to the next level, and optional streak +
 * day-of-program counters.
 *
 * Two layouts:
 *   - sm+ : avatar, "Level N" chip + tier name, thin XP bar with readout,
 *           streak (flame + "N days"), day counter ("Day N of M").
 *   - <sm : compact strip with just Level + thin XP bar + day counter.
 */

import { Flame } from "lucide-react";

import { CharacterAvatar } from "@/components/character/avatar";
import { cn } from "@/lib/utils";
import {
  tierForLevel,
  tierName,
  xpToNextLevel,
  type Archetype,
  type Tier,
} from "@program/shared/gamification";

export type PersistentHudProps = {
  archetype: Archetype;
  /** Optional — if omitted we derive the tier from `level`. */
  tier?: Tier;
  level: number;
  /** Total XP. We derive (current, needed) for the bar via xpToNextLevel. */
  xp: number;
  streakDays?: number | null;
  dayNumber?: number | null;
  programLength?: number | null;
  className?: string;
};

export function PersistentHUD({
  archetype,
  tier,
  level,
  xp,
  streakDays,
  dayNumber,
  programLength,
  className,
}: PersistentHudProps) {
  const computedTier: Tier = tier ?? tierForLevel(level);
  const tName = tierName(computedTier);
  const { current, needed } = xpToNextLevel(xp);
  const pct =
    needed > 0 ? Math.min(100, Math.max(0, (current / needed) * 100)) : 0;

  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full",
        "backdrop-blur-md",
        "border-b",
        className,
      )}
      style={{
        backgroundColor: "color-mix(in srgb, var(--surface) 75%, transparent)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Full layout — sm and up                                            */}
      {/* ----------------------------------------------------------------- */}
      <div className="mx-auto hidden h-12 max-w-6xl items-center gap-4 px-4 sm:flex sm:gap-6 sm:px-6">
        {/* Left: avatar + Level chip + tier name. */}
        <div className="flex min-w-0 items-center gap-3">
          <CharacterAvatar
            archetype={archetype}
            tier={computedTier}
            size="sm"
          />
          <div className="flex flex-col leading-tight">
            <span
              className="font-sans text-sm font-semibold"
              style={{ color: "var(--text)" }}
            >
              <span
                className="font-display"
                style={{
                  color: "var(--accent)",
                  marginRight: "0.25rem",
                }}
              >
                Lvl {level}
              </span>
            </span>
            <span
              className="text-[11px] font-normal"
              style={{ color: "var(--text-muted)" }}
            >
              {tName}
            </span>
          </div>
        </div>

        {/* Middle: thin smooth XP bar + numeric readout. */}
        <div className="flex flex-1 items-center gap-3">
          <div className="min-w-0 flex-1">
            <div
              className="h-1 w-full overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  background: "var(--accent)",
                }}
              />
            </div>
          </div>
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            {current} / {needed} XP
          </span>
        </div>

        {/* Right: streak + day counter. */}
        <div className="flex items-center gap-4">
          {typeof streakDays === "number" && streakDays > 0 ? (
            <div className="flex items-center gap-1.5">
              <Flame
                className="h-3.5 w-3.5"
                style={{ color: "var(--accent)" }}
                aria-hidden="true"
              />
              <span
                className="text-[12px] font-medium"
                style={{ color: "var(--text)" }}
              >
                {streakDays} {streakDays === 1 ? "day" : "days"}
              </span>
            </div>
          ) : null}

          {typeof dayNumber === "number" ? (
            <span
              className="text-[12px] font-medium"
              style={{ color: "var(--text)" }}
            >
              Day {dayNumber}
              {typeof programLength === "number" ? ` of ${programLength}` : ""}
            </span>
          ) : null}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Compact layout — below sm                                          */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex h-12 items-center gap-3 px-3 sm:hidden">
        <span
          className="font-display text-xs font-bold"
          style={{ color: "var(--accent)" }}
        >
          Lvl {level}
        </span>
        <div className="min-w-0 flex-1">
          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${pct}%`,
                background: "var(--accent)",
              }}
            />
          </div>
        </div>
        {typeof dayNumber === "number" ? (
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Day {dayNumber}
            {typeof programLength === "number" ? `/${programLength}` : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default PersistentHUD;
