import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { isoDate, uuid } from "../schemas";

async function ensureDay(ctx: { supabase: any; userId: string }, date: string) {
  // Look up the active challenge to attach the day to.
  const { data: ch } = await ctx.supabase
    .from("challenges")
    .select("id")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!ch) throw new Error("No active challenge.");
  await ctx.supabase
    .from("days")
    .upsert(
      { user_id: ctx.userId, challenge_id: ch.id, date, notes: "" },
      { onConflict: "user_id,date", ignoreDuplicates: true }
    );
}

export const entriesRouter = router({
  /** Full state for a single day — used by the today/calendar detail screens. */
  getDay: protectedProcedure
    .input(z.object({ date: isoDate }))
    .query(async ({ ctx, input }) => {
      const date = input.date;
      const [
        { data: dayRow },
        { data: completions },
        { data: journalRow },
        { data: wRow },
        { data: prevW },
        { data: detailRows },
        { data: photoRow },
      ] = await Promise.all([
        ctx.supabase.from("days").select("notes").eq("date", date).maybeSingle(),
        ctx.supabase
          .from("task_completions")
          .select("task_id")
          .eq("date", date)
          .order("task_id"),
        ctx.supabase
          .from("journal_entries")
          .select("content")
          .eq("date", date)
          .maybeSingle(),
        ctx.supabase
          .from("weights")
          .select("weight_lbs")
          .eq("date", date)
          .maybeSingle(),
        ctx.supabase
          .from("weights")
          .select("date, weight_lbs")
          .lt("date", date)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        ctx.supabase.from("task_details").select("task_id, content").eq("date", date),
        ctx.supabase
          .from("progress_photos")
          .select("storage_key, mime")
          .eq("date", date)
          .maybeSingle(),
      ]);

      const taskDetails: Record<string, string> = {};
      for (const r of detailRows ?? []) {
        taskDetails[r.task_id as string] = r.content as string;
      }
      return {
        date,
        notes: (dayRow?.notes as string) ?? "",
        completedTaskIds: (completions ?? []).map((c: any) => c.task_id as string),
        journal: (journalRow?.content as string) ?? "",
        weight: (wRow?.weight_lbs as number | undefined) ?? null,
        previousWeight: prevW
          ? { date: prevW.date as string, weight: prevW.weight_lbs as number }
          : null,
        taskDetails,
        photo: photoRow
          ? { storageKey: photoRow.storage_key as string, mime: photoRow.mime as string | null }
          : null,
      };
    }),

  toggleTask: protectedProcedure
    .input(z.object({ date: isoDate, taskId: uuid, completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ensureDay({ supabase: ctx.supabase, userId: ctx.userId }, input.date);
      if (input.completed) {
        await ctx.supabase
          .from("task_completions")
          .upsert(
            { user_id: ctx.userId, date: input.date, task_id: input.taskId },
            { onConflict: "user_id,date,task_id", ignoreDuplicates: true }
          );
      } else {
        await ctx.supabase
          .from("task_completions")
          .delete()
          .eq("date", input.date)
          .eq("task_id", input.taskId);
      }
      return { ok: true as const };
    }),

  saveNotes: protectedProcedure
    .input(z.object({ date: isoDate, notes: z.string().max(10_000) }))
    .mutation(async ({ ctx, input }) => {
      const { data: ch } = await ctx.supabase
        .from("challenges")
        .select("id")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!ch) throw new Error("No active challenge.");
      await ctx.supabase
        .from("days")
        .upsert(
          {
            user_id: ctx.userId,
            challenge_id: ch.id,
            date: input.date,
            notes: input.notes,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,date" }
        );
      return { ok: true as const };
    }),

  saveJournal: protectedProcedure
    .input(z.object({ date: isoDate, content: z.string().max(50_000) }))
    .mutation(async ({ ctx, input }) => {
      await ensureDay({ supabase: ctx.supabase, userId: ctx.userId }, input.date);
      await ctx.supabase
        .from("journal_entries")
        .upsert(
          {
            user_id: ctx.userId,
            date: input.date,
            content: input.content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,date" }
        );
      return { ok: true as const };
    }),

  saveTaskDetail: protectedProcedure
    .input(z.object({ date: isoDate, taskId: uuid, content: z.string().max(10_000) }))
    .mutation(async ({ ctx, input }) => {
      await ensureDay({ supabase: ctx.supabase, userId: ctx.userId }, input.date);
      if (input.content.trim() === "") {
        await ctx.supabase
          .from("task_details")
          .delete()
          .eq("date", input.date)
          .eq("task_id", input.taskId);
        return { ok: true as const };
      }
      await ctx.supabase
        .from("task_details")
        .upsert(
          {
            user_id: ctx.userId,
            date: input.date,
            task_id: input.taskId,
            content: input.content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,date,task_id" }
        );
      return { ok: true as const };
    }),

  saveWeight: protectedProcedure
    .input(
      z.object({
        date: isoDate,
        weightLbs: z.number().positive().max(2000).nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.weightLbs == null) {
        await ctx.supabase.from("weights").delete().eq("date", input.date);
        return { ok: true as const };
      }
      await ctx.supabase
        .from("weights")
        .upsert(
          {
            user_id: ctx.userId,
            date: input.date,
            weight_lbs: input.weightLbs,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,date" }
        );
      return { ok: true as const };
    }),
});
