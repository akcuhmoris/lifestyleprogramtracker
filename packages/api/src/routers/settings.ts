import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const settingsRouter = router({
  getTotalDays: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from("user_settings")
      .select("total_days")
      .maybeSingle();
    return (data?.total_days as number | undefined) ?? 100;
  }),

  setTotalDays: protectedProcedure
    .input(z.object({ totalDays: z.number().int().min(1).max(365) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("user_settings")
        .upsert({ user_id: ctx.userId, total_days: input.totalDays });
      return { ok: true as const };
    }),
});
