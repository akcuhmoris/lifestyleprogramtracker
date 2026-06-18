import { describe, it, expect } from "vitest";
import {
  ARCHETYPES,
  ARCHETYPE_IDS,
  TIERS,
  XP_RULES,
  computeXpAward,
  isArchetype,
  levelForXp,
  tierForLevel,
  tierName,
  xpForLevel,
  xpToNextLevel,
} from "./gamification";

describe("ARCHETYPES", () => {
  it("has exactly 6 archetypes", () => {
    expect(ARCHETYPES).toHaveLength(6);
  });
  it("ids are unique", () => {
    const ids = new Set(ARCHETYPES.map((a) => a.id));
    expect(ids.size).toBe(6);
  });
  it("exposes ARCHETYPE_IDS", () => {
    expect(ARCHETYPE_IDS).toEqual([
      "warrior",
      "sage",
      "athlete",
      "monk",
      "explorer",
      "phoenix",
    ]);
  });
  it("isArchetype narrows valid ids", () => {
    expect(isArchetype("warrior")).toBe(true);
    expect(isArchetype("nope")).toBe(false);
  });
});

describe("xpForLevel", () => {
  it("L1 = 0", () => {
    expect(xpForLevel(1)).toBe(0);
  });
  it("L2 = 100", () => {
    expect(xpForLevel(2)).toBe(100);
  });
  it("L3 = 300", () => {
    expect(xpForLevel(3)).toBe(300);
  });
  it("L4 = 600", () => {
    expect(xpForLevel(4)).toBe(600);
  });
  it("L5 = 1000", () => {
    expect(xpForLevel(5)).toBe(1000);
  });
  it("is monotonically increasing", () => {
    for (let n = 1; n < 25; n++) {
      expect(xpForLevel(n + 1)).toBeGreaterThan(xpForLevel(n));
    }
  });
});

describe("levelForXp", () => {
  it("0 XP = L1", () => {
    expect(levelForXp(0)).toBe(1);
  });
  it("99 XP still L1", () => {
    expect(levelForXp(99)).toBe(1);
  });
  it("100 XP = L2", () => {
    expect(levelForXp(100)).toBe(2);
  });
  it("299 XP still L2", () => {
    expect(levelForXp(299)).toBe(2);
  });
  it("300 XP = L3", () => {
    expect(levelForXp(300)).toBe(3);
  });
  it("1000 XP = L5", () => {
    expect(levelForXp(1000)).toBe(5);
  });
  it("round-trips with xpForLevel", () => {
    for (let n = 1; n < 25; n++) {
      expect(levelForXp(xpForLevel(n))).toBe(n);
      expect(levelForXp(xpForLevel(n + 1) - 1)).toBe(n);
    }
  });
  it("never returns less than 1", () => {
    expect(levelForXp(-50)).toBe(1);
  });
});

describe("xpToNextLevel", () => {
  it("at exact level threshold, current = 0", () => {
    const p = xpToNextLevel(100);
    expect(p.level).toBe(2);
    expect(p.current).toBe(0);
    expect(p.needed).toBe(xpForLevel(3) - xpForLevel(2));
  });
  it("midway through a level", () => {
    const p = xpToNextLevel(200);
    expect(p.level).toBe(2);
    expect(p.current).toBe(100);
    expect(p.needed).toBe(200);
  });
});

describe("tierForLevel", () => {
  it("L1-L3 → tier 1", () => {
    expect(tierForLevel(1)).toBe(1);
    expect(tierForLevel(3)).toBe(1);
  });
  it("L4 → tier 2", () => {
    expect(tierForLevel(4)).toBe(2);
  });
  it("L7 → tier 2", () => {
    expect(tierForLevel(7)).toBe(2);
  });
  it("L8 → tier 3", () => {
    expect(tierForLevel(8)).toBe(3);
  });
  it("L12 → tier 3", () => {
    expect(tierForLevel(12)).toBe(3);
  });
  it("L13 → tier 4", () => {
    expect(tierForLevel(13)).toBe(4);
  });
  it("L19 → tier 4", () => {
    expect(tierForLevel(19)).toBe(4);
  });
  it("L20 → tier 5", () => {
    expect(tierForLevel(20)).toBe(5);
  });
  it("L99 → tier 5", () => {
    expect(tierForLevel(99)).toBe(5);
  });
});

describe("tierName + TIERS", () => {
  it("names are Novice/Apprentice/Adept/Master/Legend", () => {
    expect(tierName(1)).toBe("Novice");
    expect(tierName(2)).toBe("Apprentice");
    expect(tierName(3)).toBe("Adept");
    expect(tierName(4)).toBe("Master");
    expect(tierName(5)).toBe("Legend");
  });
  it("TIERS array has 5 entries", () => {
    expect(TIERS).toHaveLength(5);
  });
});

describe("XP_RULES", () => {
  it("matches spec constants", () => {
    expect(XP_RULES.TASK).toBe(5);
    expect(XP_RULES.FULL_DAY_BONUS).toBe(25);
    expect(XP_RULES.MILESTONE_BONUS).toBe(100);
    expect(XP_RULES.STREAK_CAP).toBe(30);
    expect(XP_RULES.MILESTONE_DAYS).toEqual([7, 14, 30, 50, 75, 100]);
  });
});

describe("computeXpAward", () => {
  it("a single task = 5 XP", () => {
    expect(
      computeXpAward({
        tasksJustCompleted: 1,
        allTasksDoneForDay: false,
        streakDays: 0,
        dayNumber: 1,
      }),
    ).toBe(5);
  });

  it("full day with 3 tasks (no streak, non-milestone) = 5+5+5+25 = 40", () => {
    expect(
      computeXpAward({
        tasksJustCompleted: 3,
        allTasksDoneForDay: true,
        streakDays: 0,
        dayNumber: 1,
      }),
    ).toBe(40);
  });

  it("milestone day (day 7) adds 100 on top", () => {
    // 3 tasks (15) + full-day bonus (25) + streak 1 (1) + milestone (100) = 141
    expect(
      computeXpAward({
        tasksJustCompleted: 3,
        allTasksDoneForDay: true,
        streakDays: 1,
        dayNumber: 7,
      }),
    ).toBe(141);
  });

  it("streak adds streak XP (capped at 30)", () => {
    const base = 5 + 25; // one task that finishes the day
    expect(
      computeXpAward({
        tasksJustCompleted: 1,
        allTasksDoneForDay: true,
        streakDays: 10,
        dayNumber: 2,
      }),
    ).toBe(base + 10);
    expect(
      computeXpAward({
        tasksJustCompleted: 1,
        allTasksDoneForDay: true,
        streakDays: 100,
        dayNumber: 2,
      }),
    ).toBe(base + 30);
  });

  it("no tasks + no completion = 0", () => {
    expect(
      computeXpAward({
        tasksJustCompleted: 0,
        allTasksDoneForDay: false,
        streakDays: 5,
        dayNumber: 5,
      }),
    ).toBe(0);
  });

  it("milestone day only triggers when day finishes", () => {
    // Completed a task on day 7 but didn't finish the day → no milestone
    expect(
      computeXpAward({
        tasksJustCompleted: 1,
        allTasksDoneForDay: false,
        streakDays: 6,
        dayNumber: 7,
      }),
    ).toBe(5);
  });
});
