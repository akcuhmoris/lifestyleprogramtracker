/**
 * Hero Mode gamification math + archetype catalog.
 *
 * Pure functions only. Safe to import from both server and client code.
 * All XP and level math is deterministic and unit-tested in
 * `gamification.test.ts`.
 */

import type { ThemeId } from "./themes";

// ---------------------------------------------------------------------------
// Archetypes
// ---------------------------------------------------------------------------

export type Archetype =
  | "warrior"
  | "sage"
  | "athlete"
  | "monk"
  | "explorer"
  | "phoenix";

/**
 * The 6 archetypes the user can pick as their "inner hero".
 *
 * `icon` is the literal lucide-react icon name as a string — consumers map it
 * themselves so this module stays free of React/lucide imports.
 */
export const ARCHETYPES: ReadonlyArray<{
  id: Archetype;
  name: string;
  tagline: string;
  icon: string;
  accent: string;
}> = [
  {
    id: "warrior",
    name: "The Disciplined",
    tagline: "Forged in repetition",
    icon: "Sword",
    accent: "#ef4444",
  },
  {
    id: "sage",
    name: "The Wise",
    tagline: "Knowledge compounds",
    icon: "BookOpenText",
    accent: "#3b82f6",
  },
  {
    id: "athlete",
    name: "The Driven",
    tagline: "Every rep counts",
    icon: "Zap",
    accent: "#eab308",
  },
  {
    id: "monk",
    name: "The Centered",
    tagline: "Stillness is strength",
    icon: "Flower2",
    accent: "#14b8a6",
  },
  {
    id: "explorer",
    name: "The Curious",
    tagline: "Find your edge",
    icon: "Compass",
    accent: "#f59e0b",
  },
  {
    id: "phoenix",
    name: "The Resilient",
    tagline: "Rise from the ashes",
    icon: "Flame",
    accent: "#f97316",
  },
] as const;

export const ARCHETYPE_IDS: ReadonlyArray<Archetype> = ARCHETYPES.map(
  (a) => a.id,
);

export function isArchetype(value: string): value is Archetype {
  return (ARCHETYPE_IDS as ReadonlyArray<string>).includes(value);
}

// ---------------------------------------------------------------------------
// Character profile
// ---------------------------------------------------------------------------

export type CharacterProfile = {
  userId: string;
  archetype: Archetype;
  xp: number;
  level: number;
  theme: ThemeId;
};

// ---------------------------------------------------------------------------
// XP rules
// ---------------------------------------------------------------------------

export const XP_RULES = {
  /** XP per task completed. */
  TASK: 5,
  /** Bonus XP when the user finishes ALL tasks for the day. */
  FULL_DAY_BONUS: 25,
  /** Day numbers that earn a milestone bonus. */
  MILESTONE_DAYS: [7, 14, 30, 50, 75, 100] as const,
  /** Bonus XP awarded on a milestone day. */
  MILESTONE_BONUS: 100,
  /** Streak bonus is `min(streakDays, STREAK_CAP)` XP. */
  STREAK_CAP: 30,
} as const;

// ---------------------------------------------------------------------------
// Level math
// ---------------------------------------------------------------------------

/**
 * Total XP required to BE at level `n`.
 *
 * Quadratic curve so each level costs progressively more:
 *   L1 = 0, L2 = 100, L3 = 300, L4 = 600, L5 = 1000, ...
 *
 * Formally: `xpForLevel(n) = 50 * (n - 1) * n`.
 */
export function xpForLevel(n: number): number {
  if (n <= 1) return 0;
  return 50 * (n - 1) * n;
}

/**
 * Largest level `n` such that `xpForLevel(n) <= xp`.
 *
 * Solves `50 * (n - 1) * n <= xp` for the largest integer n.
 */
export function levelForXp(xp: number): number {
  if (xp <= 0) return 1;
  // 50 * n^2 - 50 * n - xp <= 0  =>  n <= (1 + sqrt(1 + xp/12.5)) / 2
  const n = Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2);
  return Math.max(1, n);
}

/**
 * Progress within the current level: how many XP into it and how many needed
 * to reach the next level.
 */
export function xpToNextLevel(xp: number): {
  level: number;
  current: number;
  needed: number;
} {
  const level = levelForXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    current: xp - base,
    needed: next - base,
  };
}

// ---------------------------------------------------------------------------
// Tiers
// ---------------------------------------------------------------------------

export type Tier = 1 | 2 | 3 | 4 | 5;

export const TIERS: ReadonlyArray<{
  tier: Tier;
  name: string;
  minLevel: number;
  maxLevel: number | null;
}> = [
  { tier: 1, name: "Novice", minLevel: 1, maxLevel: 3 },
  { tier: 2, name: "Apprentice", minLevel: 4, maxLevel: 7 },
  { tier: 3, name: "Adept", minLevel: 8, maxLevel: 12 },
  { tier: 4, name: "Master", minLevel: 13, maxLevel: 19 },
  { tier: 5, name: "Legend", minLevel: 20, maxLevel: null },
] as const;

export function tierForLevel(level: number): Tier {
  if (level <= 3) return 1;
  if (level <= 7) return 2;
  if (level <= 12) return 3;
  if (level <= 19) return 4;
  return 5;
}

export function tierName(tier: Tier): string {
  return TIERS[tier - 1].name;
}

// ---------------------------------------------------------------------------
// XP awards
// ---------------------------------------------------------------------------

export type XpAwardInput = {
  /** How many tasks the user just completed in this action. */
  tasksJustCompleted: number;
  /** Whether ALL tasks for the day are now complete. */
  allTasksDoneForDay: boolean;
  /** Current consecutive-day streak (including today). */
  streakDays: number;
  /** Challenge day number (1-indexed). Used for milestone bonuses. */
  dayNumber: number;
};

/**
 * Compute the XP gained from a single completion event.
 *
 * - +TASK per task completed in this action
 * - +FULL_DAY_BONUS when this action finishes the day
 * - +min(streak, STREAK_CAP) when this action finishes the day
 * - +MILESTONE_BONUS when this action finishes a milestone day
 */
export function computeXpAward(input: XpAwardInput): number {
  const { tasksJustCompleted, allTasksDoneForDay, streakDays, dayNumber } =
    input;

  let xp = 0;

  if (tasksJustCompleted > 0) {
    xp += XP_RULES.TASK * tasksJustCompleted;
  }

  if (allTasksDoneForDay) {
    xp += XP_RULES.FULL_DAY_BONUS;

    if (streakDays > 0) {
      xp += Math.min(streakDays, XP_RULES.STREAK_CAP);
    }

    if (
      (XP_RULES.MILESTONE_DAYS as ReadonlyArray<number>).includes(dayNumber)
    ) {
      xp += XP_RULES.MILESTONE_BONUS;
    }
  }

  return xp;
}
