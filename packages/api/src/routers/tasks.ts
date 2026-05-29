import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { taskInput, uuid } from "../schemas";
import type { Task } from "@program/shared/tasks";

const TASK_COLS =
  "id, position, title, subtitle, icon, kind, requires_detail, detail_label, detail_placeholder";

function rowToTask(r: Record<string, any>): Task {
  return {
    id: r.id,
    position: r.position,
    title: r.title,
    subtitle: r.subtitle,
    icon: r.icon,
    kind: ["check", "journal", "photo"].includes(r.kind) ? r.kind : "check",
    requiresDetail: Boolean(r.requires_detail),
    detailLabel: r.detail_label,
    detailPlaceholder: r.detail_placeholder,
  };
}

export const tasksRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("tasks")
      .select(TASK_COLS)
      .eq("archived", false)
      .order("position", { ascending: true })
      .order("id", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToTask);
  }),

  upsert: protectedProcedure.input(taskInput).mutation(async ({ ctx, input }) => {
    const payload = {
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      icon: input.icon,
      kind: input.kind,
      requires_detail: input.requiresDetail,
      detail_label: input.detailLabel?.trim() || null,
      detail_placeholder: input.detailPlaceholder?.trim() || null,
    };
    if (input.id) {
      const { error } = await ctx.supabase
        .from("tasks")
        .update(payload)
        .eq("id", input.id);
      if (error) throw new Error(error.message);
      return { id: input.id };
    }
    const { data: maxRow } = await ctx.supabase
      .from("tasks")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = ((maxRow?.position as number | null) ?? -1) + 1;
    const { data, error } = await ctx.supabase
      .from("tasks")
      .insert({ ...payload, user_id: ctx.userId, position })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as string };
  }),

  archive: protectedProcedure
    .input(z.object({ id: uuid }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("tasks")
        .update({ archived: true })
        .eq("id", input.id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    }),

  reorder: protectedProcedure
    .input(z.object({ ids: z.array(uuid) }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.ids.map((id, i) =>
          ctx.supabase.from("tasks").update({ position: i }).eq("id", id)
        )
      );
      return { ok: true as const };
    }),
});
