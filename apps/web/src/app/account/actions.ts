"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { redirect } from "next/navigation";

const PHOTOS_BUCKET = "progress-photos";

/**
 * Returns a structured JSON snapshot of every row tied to the signed-in user.
 * Photos are included as signed read URLs valid for 24 hours.
 *
 * The client will turn this into a downloadable file.
 */
export async function exportMyDataAction() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { ok: false as const, error: "Not authenticated." };
  }

  const [
    profile,
    settings,
    challenges,
    tasks,
    days,
    completions,
    journal,
    weights,
    taskDetails,
    photos,
    appState,
  ] = await Promise.all([
    supabase.from("profiles").select("*").maybeSingle(),
    supabase.from("user_settings").select("*").maybeSingle(),
    supabase.from("challenges").select("*"),
    supabase.from("tasks").select("*"),
    supabase.from("days").select("*"),
    supabase.from("task_completions").select("*"),
    supabase.from("journal_entries").select("*"),
    supabase.from("weights").select("*"),
    supabase.from("task_details").select("*"),
    supabase.from("progress_photos").select("*"),
    supabase.from("app_state").select("*"),
  ]);

  // Sign each photo's storage key into a 24h URL.
  const photoEntries: Array<{
    date: string;
    storage_key: string;
    mime: string | null;
    downloadUrl: string | null;
  }> = [];
  for (const row of photos.data ?? []) {
    const { data: signed } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .createSignedUrl(row.storage_key as string, 60 * 60 * 24);
    photoEntries.push({
      date: row.date as string,
      storage_key: row.storage_key as string,
      mime: (row.mime as string) ?? null,
      downloadUrl: signed?.signedUrl ?? null,
    });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
    },
    profile: profile.data ?? null,
    settings: settings.data ?? null,
    challenges: challenges.data ?? [],
    tasks: tasks.data ?? [],
    days: days.data ?? [],
    taskCompletions: completions.data ?? [],
    journalEntries: journal.data ?? [],
    weights: weights.data ?? [],
    taskDetails: taskDetails.data ?? [],
    progressPhotos: photoEntries,
    appState: appState.data ?? [],
  };

  return { ok: true as const, data: payload };
}

/**
 * Permanently deletes the signed-in user's account and every byte of their data:
 * - All Postgres rows cascade-delete via FK CASCADE when the auth.users row is removed.
 * - All storage objects under `progress-photos/{userId}/` are removed.
 *
 * v1 ships hard delete (no 30-day grace) for simplicity. Add grace later if needed.
 */
export async function deleteMyAccountAction(confirmation: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { ok: false as const, error: "Not authenticated." };
  }

  if (confirmation.trim().toUpperCase() !== "DELETE") {
    return { ok: false as const, error: 'Type "DELETE" to confirm.' };
  }

  // 1. Delete the user's photos from Supabase Storage.
  try {
    const { data: files } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .list(user.id, { limit: 1000 });
    if (files && files.length > 0) {
      const paths = files.map((f) => `${user.id}/${f.name}`);
      await supabase.storage.from(PHOTOS_BUCKET).remove(paths);
    }
  } catch (err) {
    logger.error(err, { scope: "deleteMyAccount.storage" });
    // Continue — the auth.users delete is the source of truth.
  }

  // 2. Delete the auth.users row via the service role. FK CASCADE handles every
  //    public.* table.
  const admin = createServiceClient();
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) {
    logger.error(delErr, { scope: "deleteMyAccount.adminDelete", userId: user.id });
    return { ok: false as const, error: delErr.message };
  }

  // 3. Sign out the current session and bounce to /login.
  await supabase.auth.signOut();
  redirect("/login?deleted=1");
}
