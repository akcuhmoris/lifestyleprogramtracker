import { z } from "zod";

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD");
export const uuid = z.string().uuid();

export const taskKind = z.enum(["check", "journal", "photo"]);

export const taskInput = z.object({
  id: uuid.optional(),
  title: z.string().min(1).max(200),
  subtitle: z.string().nullable(),
  icon: z.string().min(1).max(64),
  kind: taskKind,
  requiresDetail: z.boolean(),
  detailLabel: z.string().nullable(),
  detailPlaceholder: z.string().nullable(),
});
export type TaskInput = z.infer<typeof taskInput>;
