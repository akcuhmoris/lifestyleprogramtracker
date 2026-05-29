import { describe, it, expect } from "vitest";
import { findJournalTaskId, findPhotoTaskId, type Task } from "./tasks";

function mkTask(over: Partial<Task> = {}): Task {
  return {
    id: "00000000-0000-0000-0000-000000000001",
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

const A = "00000000-0000-0000-0000-000000000001";
const B = "00000000-0000-0000-0000-000000000002";
const C = "00000000-0000-0000-0000-000000000003";
const D = "00000000-0000-0000-0000-000000000007";

describe("findJournalTaskId", () => {
  it("returns the id of the journal task", () => {
    const tasks = [
      mkTask({ id: A, kind: "check" }),
      mkTask({ id: B, kind: "journal" }),
      mkTask({ id: C, kind: "check" }),
    ];
    expect(findJournalTaskId(tasks)).toBe(B);
  });
  it("returns null when no journal task is configured", () => {
    expect(findJournalTaskId([mkTask({ kind: "check" })])).toBeNull();
  });
  it("returns the first journal task when multiple exist (defensive)", () => {
    const tasks = [
      mkTask({ id: A, kind: "journal" }),
      mkTask({ id: B, kind: "journal" }),
    ];
    expect(findJournalTaskId(tasks)).toBe(A);
  });
});

describe("findPhotoTaskId", () => {
  it("returns the id of the photo task", () => {
    const tasks = [
      mkTask({ id: A, kind: "check" }),
      mkTask({ id: D, kind: "photo" }),
    ];
    expect(findPhotoTaskId(tasks)).toBe(D);
  });
  it("returns null when no photo task is configured", () => {
    expect(findPhotoTaskId([mkTask({ kind: "check" })])).toBeNull();
  });
});
