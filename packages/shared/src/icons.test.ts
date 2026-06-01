import { describe, it, expect } from "vitest";
import { ICONS, ICON_NAMES, getIcon } from "./icons";

describe("icon registry", () => {
  it("ICON_NAMES is non-empty", () => {
    expect(ICON_NAMES.length).toBeGreaterThan(0);
  });

  it("every ICON_NAMES entry exists in ICONS", () => {
    for (const name of ICON_NAMES) {
      expect(ICONS[name]).toBeDefined();
    }
  });

  it("every ICONS value is a function-like component", () => {
    for (const name of ICON_NAMES) {
      const icon = ICONS[name];
      // Lucide icons are forwardRef components — their type is "object" with a $$typeof key.
      // Both function and object component shapes are valid.
      expect(["function", "object"]).toContain(typeof icon);
    }
  });

  it("getIcon returns the requested icon for a known name", () => {
    expect(getIcon("Apple")).toBe(ICONS.Apple);
    expect(getIcon("Dumbbell")).toBe(ICONS.Dumbbell);
  });

  it("getIcon falls back to ListChecks for an unknown name", () => {
    expect(getIcon("DoesNotExist")).toBe(ICONS.ListChecks);
    expect(getIcon(null)).toBe(ICONS.ListChecks);
    expect(getIcon(undefined)).toBe(ICONS.ListChecks);
    expect(getIcon("")).toBe(ICONS.ListChecks);
  });
});
