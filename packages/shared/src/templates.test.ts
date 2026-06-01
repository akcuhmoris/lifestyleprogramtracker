import { describe, it, expect } from "vitest";
import { TEMPLATES, findTemplate } from "./templates";
import { ICONS } from "./icons";

describe("TEMPLATES", () => {
  it("has at least one template", () => {
    expect(TEMPLATES.length).toBeGreaterThan(0);
  });

  it("every template has a unique id", () => {
    const ids = TEMPLATES.map((t) => t.id);
    const dedup = new Set(ids);
    expect(dedup.size).toBe(ids.length);
  });

  it("every template has a non-empty name and tagline", () => {
    for (const t of TEMPLATES) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.tagline.length).toBeGreaterThan(0);
    }
  });

  it("every template totalDays is between 1 and 365", () => {
    for (const t of TEMPLATES) {
      expect(t.totalDays).toBeGreaterThanOrEqual(1);
      expect(t.totalDays).toBeLessThanOrEqual(365);
    }
  });

  it("at most one journal task per template", () => {
    for (const t of TEMPLATES) {
      const journals = t.tasks.filter((task) => task.kind === "journal");
      expect(journals.length).toBeLessThanOrEqual(1);
    }
  });

  it("at most one photo task per template", () => {
    for (const t of TEMPLATES) {
      const photos = t.tasks.filter((task) => task.kind === "photo");
      expect(photos.length).toBeLessThanOrEqual(1);
    }
  });

  it("every task icon references a real icon in the registry", () => {
    const iconNames = Object.keys(ICONS);
    for (const t of TEMPLATES) {
      for (const task of t.tasks) {
        expect(iconNames).toContain(task.icon);
      }
    }
  });

  it("every task kind is one of check / journal / photo", () => {
    const validKinds = new Set(["check", "journal", "photo"]);
    for (const t of TEMPLATES) {
      for (const task of t.tasks) {
        expect(validKinds.has(task.kind)).toBe(true);
      }
    }
  });

  it("includes the default 100 Hard template", () => {
    expect(findTemplate("100-hard")).toBeDefined();
    expect(findTemplate("100-hard")?.totalDays).toBe(100);
    expect(findTemplate("100-hard")?.tasks.length).toBe(12);
  });

  it("includes 75 Hard", () => {
    expect(findTemplate("75-hard")).toBeDefined();
    expect(findTemplate("75-hard")?.totalDays).toBe(75);
  });

  it("findTemplate returns undefined for unknown id", () => {
    expect(findTemplate("not-a-real-template")).toBeUndefined();
    expect(findTemplate("")).toBeUndefined();
  });
});
