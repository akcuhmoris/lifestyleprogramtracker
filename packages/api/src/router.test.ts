import { describe, it, expect } from "vitest";
import { appRouter, createCallerFactory } from "./index";
import { makeContext, makeMockSupabase } from "./test-helpers";
import type { Context } from "./context";

const createCaller = createCallerFactory(appRouter);

describe("appRouter shape", () => {
  it("exposes the expected top-level routers", () => {
    expect(Object.keys(appRouter._def.procedures).length).toBeGreaterThan(0);
    const top = Object.keys(appRouter._def.record);
    for (const k of ["tasks", "entries", "settings", "challenges", "media", "stats"]) {
      expect(top).toContain(k);
    }
  });
});

describe("protectedProcedure auth", () => {
  it("rejects unauthenticated requests on tasks.list", async () => {
    const ctx = makeContext({ userId: null });
    const caller = createCaller(ctx);
    await expect(caller.tasks.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects unauthenticated requests on settings.getTotalDays", async () => {
    const ctx = makeContext({ userId: null });
    const caller = createCaller(ctx);
    await expect(caller.settings.getTotalDays()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

describe("input validation", () => {
  it("rejects toggleTask with malformed date", async () => {
    const ctx = makeContext();
    const caller = createCaller(ctx);
    await expect(
      caller.entries.toggleTask({
        date: "not-a-date",
        taskId: "00000000-0000-0000-0000-000000000001",
        completed: true,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects saveWeight with non-positive weight", async () => {
    const ctx = makeContext();
    const caller = createCaller(ctx);
    await expect(
      caller.entries.saveWeight({
        date: "2026-05-29",
        weightLbs: -5,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts a valid saveWeight payload (no DB error)", async () => {
    const ctx = makeContext();
    const caller = createCaller(ctx);
    const res = await caller.entries.saveWeight({
      date: "2026-05-29",
      weightLbs: 180.5,
    });
    expect(res).toEqual({ ok: true });
  });

  it("rejects setTotalDays out of range", async () => {
    const ctx = makeContext();
    const caller = createCaller(ctx);
    await expect(
      caller.settings.setTotalDays({ totalDays: 0 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller.settings.setTotalDays({ totalDays: 999 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts setTotalDays at boundaries", async () => {
    const ctx = makeContext();
    const caller = createCaller(ctx);
    await expect(
      caller.settings.setTotalDays({ totalDays: 1 })
    ).resolves.toEqual({ ok: true });
    await expect(
      caller.settings.setTotalDays({ totalDays: 365 })
    ).resolves.toEqual({ ok: true });
  });
});

describe("media router", () => {
  it("requestPhotoUpload returns a key under the user's folder", async () => {
    const { supabase } = makeMockSupabase();
    const ctx: Context = {
      userId: "00000000-0000-0000-0000-0000000000aa",
      supabase: supabase as unknown as Context["supabase"],
    };
    const caller = createCaller(ctx);
    const res = await caller.media.requestPhotoUpload({
      date: "2026-05-29",
      mime: "image/jpeg",
    });
    expect(res.key).toBe("00000000-0000-0000-0000-0000000000aa/2026-05-29.jpg");
    expect(res.uploadUrl).toMatch(/^https:\/\//);
  });

  it("rejects unsupported mime types", async () => {
    const ctx = makeContext();
    const caller = createCaller(ctx);
    await expect(
      caller.media.requestPhotoUpload({
        date: "2026-05-29",
        // @ts-expect-error — testing runtime validation
        mime: "image/gif",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
