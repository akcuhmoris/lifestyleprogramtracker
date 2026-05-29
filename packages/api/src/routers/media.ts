import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { isoDate } from "../schemas";

const PHOTOS_BUCKET = "progress-photos";
const ALLOWED_MIME = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function extFor(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "bin";
  }
}

export const mediaRouter = router({
  /**
   * Returns a signed PUT URL the client uses to upload bytes directly to
   * Storage. The client then calls `confirmPhoto` to record the metadata.
   * Use this from mobile or any other client that doesn't post FormData.
   */
  requestPhotoUpload: protectedProcedure
    .input(z.object({ date: isoDate, mime: ALLOWED_MIME }))
    .mutation(async ({ ctx, input }) => {
      const key = `${ctx.userId}/${input.date}.${extFor(input.mime)}`;
      const { data, error } = await ctx.supabase.storage
        .from(PHOTOS_BUCKET)
        .createSignedUploadUrl(key);
      if (error) throw new Error(error.message);
      return { key, uploadUrl: data.signedUrl, token: data.token };
    }),

  confirmPhoto: protectedProcedure
    .input(z.object({ date: isoDate, key: z.string(), mime: ALLOWED_MIME }))
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("progress_photos")
        .upsert(
          {
            user_id: ctx.userId,
            date: input.date,
            storage_key: input.key,
            mime: input.mime,
            uploaded_at: new Date().toISOString(),
          },
          { onConflict: "user_id,date" }
        );
      return { ok: true as const };
    }),

  deletePhoto: protectedProcedure
    .input(z.object({ date: isoDate }))
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase.storage
        .from(PHOTOS_BUCKET)
        .list(ctx.userId, { search: input.date });
      if (existing && existing.length > 0) {
        await ctx.supabase.storage
          .from(PHOTOS_BUCKET)
          .remove(
            existing
              .filter((f: any) => f.name.startsWith(`${input.date}.`))
              .map((f: any) => `${ctx.userId}/${f.name}`)
          );
      }
      await ctx.supabase.from("progress_photos").delete().eq("date", input.date);
      return { ok: true as const };
    }),

  signedReadUrl: protectedProcedure
    .input(z.object({ key: z.string(), ttlSeconds: z.number().int().min(60).max(86400).default(3600) }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.storage
        .from(PHOTOS_BUCKET)
        .createSignedUrl(input.key, input.ttlSeconds);
      if (error) throw new Error(error.message);
      return { url: data.signedUrl };
    }),
});
