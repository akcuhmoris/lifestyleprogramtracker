import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { isoDate } from "../schemas";

export const challengesRouter = router({
  active: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("challenges")
      .select("id, start_date, status")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data
      ? { id: data.id as string, startDate: data.start_date as string, status: data.status as string }
      : null;
  }),

  restart: protectedProcedure
    .input(z.object({ startDate: isoDate }))
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("challenges")
        .update({ status: "restarted" })
        .eq("status", "active");
      const { data, error } = await ctx.supabase
        .from("challenges")
        .insert({
          user_id: ctx.userId,
          start_date: input.startDate,
          status: "active",
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: data.id as string };
    }),
});
