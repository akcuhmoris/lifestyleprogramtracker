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
