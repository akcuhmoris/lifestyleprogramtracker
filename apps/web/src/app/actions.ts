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
  type DayRow,
  type TaskInput,
} from "@/lib/db";
import { isFuture, todayLocal } from "@program/shared/date";
import { promises as fs } from "node:fs";
import path from "node:path";

const PHOTO_TASK_ID = 8;
const PHOTOS_DIR = path.join(process.cwd(), "public", "progress-photos");
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

async function ensurePhotosDir() {
  await fs.mkdir(PHOTOS_DIR, { recursive: true });
}

async function removeAnyPhotoFor(date: string) {
  try {
    const entries = await fs.readdir(PHOTOS_DIR);
    await Promise.all(
      entries
        .filter((f) => f.startsWith(`${date}.`))
        .map((f) => fs.unlink(path.join(PHOTOS_DIR, f)).catch(() => {}))
    );
  } catch {
    /* dir may not exist yet */
  }
}

export async function toggleTaskAction(
  date: string,
  taskId: number,
  completed: boolean
) {
  if (isFuture(date)) {
    return { ok: false as const, error: "Cannot check off future days." };
  }
  const day = dbToggleTask(date, taskId, completed);
  revalidatePath("/");
  revalidatePath("/calendar");
  return { ok: true as const, day };
}

export async function saveNotesAction(date: string, notes: string) {
  if (isFuture(date)) return { ok: false as const };
  dbSaveNotes(date, notes);
  return { ok: true as const };
}

export async function saveJournalAction(date: string, content: string) {
  if (isFuture(date)) return { ok: false as const };
  dbSaveJournal(date, content);
  revalidatePath("/");
  revalidatePath("/calendar");
  return { ok: true as const };
}

export async function saveTaskDetailAction(
  date: string,
  taskId: number,
  content: string
) {
  if (isFuture(date)) return { ok: false as const };
  dbSaveTaskDetail(date, taskId, content);
  return { ok: true as const };
}

export async function saveWeightAction(date: string, weightLbs: number | null) {
  if (isFuture(date)) return { ok: false as const };
  if (weightLbs != null) {
    if (!Number.isFinite(weightLbs) || weightLbs <= 0 || weightLbs > 2000) {
      return { ok: false as const, error: "Weight out of range." };
    }
  }
  dbSaveWeight(date, weightLbs);
  revalidatePath("/");
  revalidatePath("/calendar");
  return { ok: true as const };
}

export async function loadDayAction(date: string): Promise<DayRow> {
  return dbGetDay(date);
}

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

  await ensurePhotosDir();
  await removeAnyPhotoFor(date);

  const ext = extFor(file.type);
  const filename = `${date}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(PHOTOS_DIR, filename), bytes);

  dbSetProgressPhoto(date, filename, file.type);
  dbToggleTask(date, PHOTO_TASK_ID, true);

  revalidatePath("/");
  revalidatePath("/calendar");

  return { ok: true as const, filename };
}

export async function deleteProgressPhotoAction(date: string) {
  if (isFuture(date)) return { ok: false as const };
  await removeAnyPhotoFor(date);
  dbClearProgressPhoto(date);
  dbToggleTask(date, PHOTO_TASK_ID, false);
  revalidatePath("/");
  revalidatePath("/calendar");
  return { ok: true as const };
}

export async function dismissRestartAction(date: string) {
  dbDismissRestart(date);
  revalidatePath("/");
  revalidatePath("/calendar");
  return { ok: true as const };
}

export async function restartChallengeAction() {
  const today = todayLocal();
  dbStartNewChallenge(today);
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
  dbSetTotalDays(Math.floor(days));
  revalidateAll();
  return { ok: true as const };
}

export async function saveTaskAction(input: TaskInput) {
  if (!input.title.trim()) {
    return { ok: false as const, error: "Title is required." };
  }
  const id = dbUpsertTask({
    ...input,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || null,
    detailLabel: input.detailLabel?.trim() || null,
    detailPlaceholder: input.detailPlaceholder?.trim() || null,
  });
  revalidateAll();
  return { ok: true as const, id };
}

export async function deleteTaskAction(id: number) {
  dbArchiveTask(id);
  revalidateAll();
  return { ok: true as const };
}

export async function reorderTasksAction(orderedIds: number[]) {
  dbReorderTasks(orderedIds);
  revalidateAll();
  return { ok: true as const };
}
