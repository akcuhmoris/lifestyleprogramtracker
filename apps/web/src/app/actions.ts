"use server";

import { revalidatePath } from "next/cache";
import {
  toggleTask as dbToggleTask,
  saveNotes as dbSaveNotes,
  saveJournal as dbSaveJournal,
  saveWeight as dbSaveWeight,
  saveTaskDetail as dbSaveTaskDetail,
  setProgressPhoto as dbSetProgressPhoto,
  clearProgressPhoto as dbClearProgressPhoto,
  dismissRestartFor as dbDismissRestart,
  startNewChallenge as dbStartNewChallenge,
  setTotalDays as dbSetTotalDays,
  upsertTask as dbUpsertTask,
  archiveTask as dbArchiveTask,
  reorderTasks as dbReorderTasks,
  getDay as dbGetDay,
  getTasks as dbGetTasks,
  upsertCharacterProfile as dbUpsertCharacterProfile,
  awardCharacterXp as dbAwardCharacterXp,
  type DayRow,
  type TaskInput,
} from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { isFuture, todayLocal } from "@program/shared/date";
import { findPhotoTaskId } from "@program/shared/tasks";
import { findTemplate } from "@program/shared/templates";
import {
  XP_RULES,
  isArchetype,
  type Archetype,
} from "@program/shared/gamification";
import { isThemeId, type ThemeId } from "@program/shared/themes";

const PHOTOS_BUCKET = "progress-photos";
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

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

// ---------- Day actions ----------

export async function toggleTaskAction(
  date: string,
  taskId: string,
  completed: boolean
) {
  if (isFuture(date)) {
    return { ok: false as const, error: "Cannot check off future days." };
  }
  const day = await dbToggleTask(date, taskId, completed);

  // Hero Mode: award XP per task completion (toggle ON only — un-toggling
  // doesn't refund XP). Keep this simple for now: just the per-task amount.
  // TODO(hero): also award FULL_DAY_BONUS when every task is checked.
  // TODO(hero): also award streak bonus (min(streak, STREAK_CAP)) on full day.
  // TODO(hero): also award MILESTONE_BONUS on milestone day numbers.
  if (completed) {
    try {
      await dbAwardCharacterXp(XP_RULES.TASK);
    } catch (err) {
      // XP is non-essential — never fail a task toggle on it.
      console.error("awardCharacterXp", err);
    }
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  return { ok: true as const, day };
}

export async function saveNotesAction(date: string, notes: string) {
  if (isFuture(date)) return { ok: false as const };
  await dbSaveNotes(date, notes);
  return { ok: true as const };
}

export async function saveJournalAction(date: string, content: string) {
  if (isFuture(date)) return { ok: false as const };
  await dbSaveJournal(date, content);
  revalidatePath("/");
  revalidatePath("/calendar");
  return { ok: true as const };
}

export async function saveTaskDetailAction(
  date: string,
  taskId: string,
  content: string
) {
  if (isFuture(date)) return { ok: false as const };
  await dbSaveTaskDetail(date, taskId, content);
  return { ok: true as const };
}

export async function saveWeightAction(date: string, weightLbs: number | null) {
  if (isFuture(date)) return { ok: false as const };
  if (weightLbs != null) {
    if (!Number.isFinite(weightLbs) || weightLbs <= 0 || weightLbs > 2000) {
      return { ok: false as const, error: "Weight out of range." };
    }
  }
  await dbSaveWeight(date, weightLbs);
  revalidatePath("/");
  revalidatePath("/calendar");
  return { ok: true as const };
}

export async function loadDayAction(date: string): Promise<DayRow> {
  return dbGetDay(date);
}

// ---------- Photo actions (Supabase Storage) ----------

export async function uploadProgressPhotoAction(formData: FormData) {
  const date = formData.get("date");
  const file = formData.get("file");

  if (typeof date !== "string" || !file || !(file instanceof File)) {
    return { ok: false as const, error: "Missing date or file." };
  }
  if (isFuture(date)) {
    return { ok: false as const, error: "Cannot upload for a future day." };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false as const, error: "Unsupported image format." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false as const, error: "Image is larger than 12 MB." };
  }

  const supabase = await createClient();
  const { data: userResp, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userResp.user) {
    return { ok: false as const, error: "Not authenticated." };
  }
  const userId = userResp.user.id;

  // Storage key follows `{userId}/{date}.{ext}` so the RLS policy permits it.
  const ext = extFor(file.type);
  const key = `${userId}/${date}.${ext}`;

  // Remove any prior photo for this date under this user (any extension).
  const { data: existing } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .list(userId, { search: date });
  if (existing && existing.length > 0) {
    await supabase.storage
      .from(PHOTOS_BUCKET)
      .remove(existing.filter((f) => f.name.startsWith(`${date}.`)).map((f) => `${userId}/${f.name}`));
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(key, bytes, {
      contentType: file.type,
      upsert: true,
    });
  if (upErr) {
    return { ok: false as const, error: upErr.message };
  }

  await dbSetProgressPhoto(date, key, file.type);

  // Auto-check the photo task if one exists.
  const tasks = await dbGetTasks();
  const photoTaskId = findPhotoTaskId(tasks);
  if (photoTaskId) {
    await dbToggleTask(date, photoTaskId, true);
  }

  revalidatePath("/");
  revalidatePath("/calendar");

  return { ok: true as const, key };
}

export async function deleteProgressPhotoAction(date: string) {
  if (isFuture(date)) return { ok: false as const };
  const supabase = await createClient();
  const { data: userResp } = await supabase.auth.getUser();
  if (!userResp.user) return { ok: false as const };
  const userId = userResp.user.id;

  const { data: existing } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .list(userId, { search: date });
  if (existing && existing.length > 0) {
    await supabase.storage
      .from(PHOTOS_BUCKET)
      .remove(existing.filter((f) => f.name.startsWith(`${date}.`)).map((f) => `${userId}/${f.name}`));
  }

  await dbClearProgressPhoto(date);

  const tasks = await dbGetTasks();
  const photoTaskId = findPhotoTaskId(tasks);
  if (photoTaskId) {
    await dbToggleTask(date, photoTaskId, false);
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  return { ok: true as const };
}

/**
 * Returns a short-lived signed URL the browser can use to display a photo.
 * Called from Client Components that need to render the image.
 */
export async function getPhotoUrlAction(storageKey: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(storageKey, 60 * 60); // 1 hour
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, url: data.signedUrl };
}

// ---------- Restart ----------

export async function dismissRestartAction(date: string) {
  await dbDismissRestart(date);
  revalidatePath("/");
  revalidatePath("/calendar");
  return { ok: true as const };
}

export async function restartChallengeAction() {
  const today = todayLocal();
  await dbStartNewChallenge(today);
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/stats");
  return { ok: true as const, newStartDate: today };
}

// ---------- Settings ----------

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/stats");
  revalidatePath("/settings");
}

export async function saveTotalDaysAction(days: number) {
  if (!Number.isFinite(days) || days < 1) {
    return { ok: false as const, error: "Must be at least 1." };
  }
  if (days > 365) {
    return { ok: false as const, error: "Cap is 365." };
  }
  await dbSetTotalDays(Math.floor(days));
  revalidateAll();
  return { ok: true as const };
}

export async function saveTaskAction(input: TaskInput) {
  if (!input.title.trim()) {
    return { ok: false as const, error: "Title is required." };
  }
  const id = await dbUpsertTask({
    ...input,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || null,
    detailLabel: input.detailLabel?.trim() || null,
    detailPlaceholder: input.detailPlaceholder?.trim() || null,
  });
  revalidateAll();
  return { ok: true as const, id };
}

export async function deleteTaskAction(id: string) {
  await dbArchiveTask(id);
  revalidateAll();
  return { ok: true as const };
}

export async function reorderTasksAction(orderedIds: string[]) {
  await dbReorderTasks(orderedIds);
  revalidateAll();
  return { ok: true as const };
}

/**
 * Apply a preset program template:
 *   1. Archive every current non-archived task (past completions preserved)
 *   2. Insert the template's tasks in order
 *   3. Update total_days
 *
 * Past completion rows still point at the archived task IDs — the calendar
 * counts them, but they don't appear in the today view or stats anymore.
 */
export async function applyTemplateAction(templateId: string) {
  const template = findTemplate(templateId);
  if (!template) {
    return { ok: false as const, error: "Template not found." };
  }

  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false as const, error: "Not authenticated." };
  }
  const userId = userData.user.id;

  // Archive every current non-archived task.
  const { error: archErr } = await supabase
    .from("tasks")
    .update({ archived: true })
    .eq("user_id", userId)
    .eq("archived", false);
  if (archErr) {
    return { ok: false as const, error: archErr.message };
  }

  // Insert template tasks.
  if (template.tasks.length > 0) {
    const rows = template.tasks.map((t, position) => ({
      user_id: userId,
      position,
      title: t.title,
      subtitle: t.subtitle,
      icon: t.icon,
      kind: t.kind,
      requires_detail: t.requiresDetail,
      detail_label: t.detailLabel,
      detail_placeholder: t.detailPlaceholder,
    }));
    const { error: insErr } = await supabase.from("tasks").insert(rows);
    if (insErr) {
      return { ok: false as const, error: insErr.message };
    }
  }

  // Update length.
  await dbSetTotalDays(template.totalDays);

  revalidateAll();
  return { ok: true as const, templateId, name: template.name };
}

// ---------- Hero Mode ----------

export async function pickArchetypeAction(archetype: Archetype) {
  if (!isArchetype(archetype)) {
    return { ok: false as const, error: "Unknown archetype." };
  }
  try {
    await dbUpsertCharacterProfile({ archetype });
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Could not save archetype.",
    };
  }
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function setThemeAction(theme: ThemeId) {
  if (!isThemeId(theme)) {
    return { ok: false as const, error: "Unknown theme." };
  }
  try {
    await dbUpsertCharacterProfile({ theme });
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Could not save theme.",
    };
  }
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function awardXpAction(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false as const, error: "XP amount must be positive." };
  }
  try {
    const result = await dbAwardCharacterXp(Math.floor(amount));
    revalidatePath("/", "layout");
    return { ok: true as const, ...result };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Could not award XP.",
    };
  }
}
