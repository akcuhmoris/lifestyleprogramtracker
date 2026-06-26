import { describe, it, expect } from "vitest";
import {
  CHALLENGE_START,
  TOTAL_DAYS,
  addDays,
  dateToISO,
  dayNumber,
  daysBetween,
  formatPretty,
  isFuture,
  isPast,
  parseISO,
  todayLocal,
} from "./date";

describe("constants", () => {
  it("TOTAL_DAYS defaults to 100", () => {
    expect(TOTAL_DAYS).toBe(100);
  });
  it("CHALLENGE_START is a valid ISO date string", () => {
    expect(CHALLENGE_START).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("dateToISO + parseISO", () => {
  it("round-trips", () => {
    const d = new Date(2026, 4, 26); // local time, may 26
    expect(dateToISO(d)).toBe("2026-05-26");
    expect(dateToISO(parseISO("2026-05-26"))).toBe("2026-05-26");
  });
  it("pads single-digit months and days", () => {
    const d = new Date(2026, 0, 5);
    expect(dateToISO(d)).toBe("2026-01-05");
  });
});

describe("daysBetween", () => {
  it("is zero for the same day", () => {
    expect(daysBetween("2026-05-26", "2026-05-26")).toBe(0);
  });
  it("is positive going forward", () => {
    expect(daysBetween("2026-05-26", "2026-05-30")).toBe(4);
  });
  it("is negative going backward", () => {
    expect(daysBetween("2026-05-30", "2026-05-26")).toBe(-4);
  });
  it("handles month boundaries", () => {
    expect(daysBetween("2026-05-30", "2026-06-02")).toBe(3);
  });
  it("handles year boundaries", () => {
    expect(daysBetween("2026-12-30", "2027-01-02")).toBe(3);
  });
});

describe("dayNumber", () => {
  it("Day 1 = start_date", () => {
    expect(dayNumber("2026-05-26", "2026-05-26")).toBe(1);
  });
  it("Day 2 = start_date + 1", () => {
    expect(dayNumber("2026-05-27", "2026-05-26")).toBe(2);
  });
  it("Day 100 = start_date + 99", () => {
    expect(dayNumber("2026-09-02", "2026-05-26")).toBe(100);
  });
  it("returns 0 or negative for dates before start", () => {
    expect(dayNumber("2026-05-25", "2026-05-26")).toBe(0);
    expect(dayNumber("2026-05-20", "2026-05-26")).toBe(-5);
  });
});

describe("addDays", () => {
  it("adds positive days", () => {
    expect(addDays("2026-05-26", 5)).toBe("2026-05-31");
  });
  it("crosses month boundaries", () => {
    expect(addDays("2026-05-30", 3)).toBe("2026-06-02");
  });
  it("subtracts with negative", () => {
    expect(addDays("2026-05-26", -3)).toBe("2026-05-23");
  });
});

describe("isFuture + isPast", () => {
  it("are mutually exclusive (today is neither)", () => {
    const today = dateToISO(new Date());
    expect(isFuture(today)).toBe(false);
    expect(isPast(today)).toBe(false);
  });
  it("flags strictly future dates", () => {
    expect(isFuture(addDays(dateToISO(new Date()), 1))).toBe(true);
  });
  it("flags strictly past dates", () => {
    expect(isPast(addDays(dateToISO(new Date()), -1))).toBe(true);
  });
});

describe("formatPretty", () => {
  it("returns a string with the year", () => {
    expect(formatPretty("2026-05-26")).toMatch(/2026/);
  });
});

describe("todayLocal", () => {
  it("returns an ISO-formatted YYYY-MM-DD string", () => {
    expect(todayLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("matches dateToISO(new Date()) for the same instant", () => {
    // todayLocal() and dateToISO(new Date()) both read local time, so they
    // should agree as long as the clock doesn't tick over midnight between
    // the two calls. In practice they're identical inside a single tick.
    expect(todayLocal()).toBe(dateToISO(new Date()));
  });
  it("never returns an empty or malformed string", () => {
    const result = todayLocal();
    const parts = result.split("-");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toHaveLength(4); // year
    expect(parts[1]).toHaveLength(2); // month
    expect(parts[2]).toHaveLength(2); // day
  });
});

describe("parseISO", () => {
  it("parses to a Date with the correct local year/month/day", () => {
    const d = parseISO("2026-05-26");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4); // 0-indexed; May = 4
    expect(d.getDate()).toBe(26);
  });
  it("parses single-digit-equivalent dates correctly", () => {
    const d = parseISO("2026-01-05");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(5);
  });
  it("round-trips through dateToISO", () => {
    const original = "2026-12-31";
    expect(dateToISO(parseISO(original))).toBe(original);
  });
});

describe("addDays — ISO format", () => {
  it("returns a string in YYYY-MM-DD format", () => {
    expect(addDays("2026-05-26", 1)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(addDays("2026-05-26", -1)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(addDays("2026-05-26", 0)).toBe("2026-05-26");
  });
  it("crosses year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });
  it("handles leap-day arithmetic (2028 is a leap year)", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2028-02-29", 1)).toBe("2028-03-01");
  });
});

describe("dayNumber — boundary cases", () => {
  it("returns 1 when today === start (start IS day 1)", () => {
    expect(dayNumber("2026-05-26", "2026-05-26")).toBe(1);
  });
  it("returns 0 the day before start", () => {
    expect(dayNumber("2026-05-25", "2026-05-26")).toBe(0);
  });
  it("returns a negative number for dates well before start", () => {
    expect(dayNumber("2026-04-26", "2026-05-26")).toBeLessThan(0);
  });
  it("returns a large positive number for dates well after start", () => {
    expect(dayNumber("2027-05-26", "2026-05-26")).toBe(366);
  });
  it("uses CHALLENGE_START as the default start", () => {
    // Same date passed twice yields 1 regardless of which start we used.
    expect(dayNumber(CHALLENGE_START)).toBe(1);
  });
});
