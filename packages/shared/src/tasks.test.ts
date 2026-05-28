import { describe, it, expect } from "vitest";
import { findJournalTaskId, findPhotoTaskId, type Task } from "./tasks";

function mkTask(over: Partial<Task> = {}): Task {
  return {
    id: 1,
    position: 0,
    title: "Task",
    subtitle: null,
    icon: "Apple",
    kind: "check",
    requiresDetail: false,
    detailLabel: null,
    detailPlaceholder: null,
    ...over,
  };
}

describe("findJournalTaskId", () => {
  it("returns the id of the journal task", () => {
    const tasks = [
      mkTask({ id: 1, kind: "check" }),
      mkTask({ id: 2, kind: "journal" }),
      mkTask({ id: 3, kind: "check" }),
    ];
    expect(findJournalTaskId(tasks)).toBe(2);
  });
  it("returns null when no journal task is configured", () => {
    expect(findJournalTaskId([mkTask({ kind: "check" })])).toBeNull();
  });
  it("returns the first journal task when multiple exist (defensive)", () => {
    const tasks = [
      mkTask({ id: 1, kind: "journal" }),
      mkTask({ id: 2, kind: "journal" }),
    ];
    expect(findJournalTaskId(tasks)).toBe(1);
  });
});

describe("findPhotoTaskId", () => {
  it("returns the id of the photo task", () => {
    const tasks = [
      mkTask({ id: 1, kind: "check" }),
      mkTask({ id: 7, kind: "photo" }),
    ];
    expect(findPhotoTaskId(tasks)).toBe(7);
  });
  it("returns null when no photo task is configured", () => {
    expect(findPhotoTaskId([mkTask({ kind: "check" })])).toBeNull();
  });
});
