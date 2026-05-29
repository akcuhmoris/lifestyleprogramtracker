import { protectedProcedure, router } from "../trpc";

function addDaysISO(start: string, n: number) {
  const [y, m, dd] = start.split("-").map(Number);
  const date = new Date(y, m - 1, dd + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

async function activeRange(ctx: { supabase: any }) {
  const { data: ch } = await ctx.supabase
    .from("challenges")
    .select("start_date")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!ch) return null;
  const { data: settings } = await ctx.supabase
    .from("user_settings")
    .select("total_days")
    .maybeSingle();
  const total = (settings?.total_days as number | undefined) ?? 100;
  const start = ch.start_date as string;
  return { start, endExclusive: addDaysISO(start, total), total };
}

export const statsRouter = router({
  /**
   * Per-task completion counts within the active challenge window.
   * Returns a list of { taskId, completedDays }.
   */
  perTask: protectedProcedure.query(async ({ ctx }) => {
    const r = await activeRange(ctx);
    if (!r) return [];
    const { data, error } = await ctx.supabase
      .from("task_completions")
      .select("task_id")
      .gte("date", r.start)
      .lt("date", r.endExclusive);
    if (error) throw new Error(error.message);
    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const id = row.task_id as string;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([taskId, completedDays]) => ({
      taskId,
      completedDays,
    }));
  }),

  /**
   * Per-day status (completion count) for every day in the active challenge.
   * Used to render the calendar heatmap.
   */
  dayStatuses: protectedProcedure.query(async ({ ctx }) => {
    const r = await activeRange(ctx);
    if (!r) return [];
    const { data, error } = await ctx.supabase
      .from("task_completions")
      .select("date")
      .gte("date", r.start)
      .lt("date", r.endExclusive);
    if (error) throw new Error(error.message);
    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const d = row.date as string;
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }

    const today = new Date();
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;

    const out: { date: string; completedCount: number; isFuture: boolean }[] = [];
    for (let i = 0; i < r.total; i++) {
      const d = addDaysISO(r.start, i);
      out.push({
        date: d,
        completedCount: counts.get(d) ?? 0,
        isFuture: d > todayISO,
      });
    }
    return out;
  }),

  /**
   * Weight series for the active challenge window — used by the sparkline.
   */
  weightSeries: protectedProcedure.query(async ({ ctx }) => {
    const r = await activeRange(ctx);
    if (!r) return [];
    const { data, error } = await ctx.supabase
      .from("weights")
      .select("date, weight_lbs")
      .gte("date", r.start)
      .lt("date", r.endExclusive)
      .order("date", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({
      date: row.date as string,
      weight: row.weight_lbs as number,
    }));
  }),
});
