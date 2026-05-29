import "server-only";
import { createClient } from "@/lib/supabase/server";
import { TOTAL_DAYS as DEFAULT_TOTAL_DAYS, todayLocal } from "@program/shared/date";
import type { Task } from "@program/shared/tasks";

export const TOTAL_DAYS = DEFAULT_TOTAL_DAYS;

// ---------- Types ----------

export type DayRow = {
  date: string;
  notes: string;
  completedTaskIds: string[];
  journal: string;
  weight: number | null;
  previousWeight: { date: string; weight: number } | null;
  taskDetails: Record<string, string>;
  photo: { filename: string; mime: string | null } | null;
};

export type TaskKind = "check" | "journal" | "photo";
export type TaskRow = Task;

export type TaskInput = {
  id?: string;
  title: string;
  subtitle: string | null;
  icon: string;
  kind: TaskKind;
  requiresDetail: boolean;
  detailLabel: string | null;
  detailPlaceholder: string | null;
};

export type PerTaskStat = {
  taskId: string;
  completedDays: number;
};

export type DayStatusEntry = {
  date: string;
  completedCount: number;
  isFuture: boolean;
};

// ---------- Helpers ----------

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("Not authenticated");
  }
  return data.user.id;
}

function addDaysISO(start: string, n: number) {
  const [y, m, dd] = start.split("-").map(Number);
  const date = new Date(y, m - 1, dd + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

// ---------- Settings ----------

export async function getTotalDays(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("total_days")
    .maybeSingle();
  if (error) {
    console.error("getTotalDays", error);
    return DEFAULT_TOTAL_DAYS;
  }
  const n = data?.total_days ?? DEFAULT_TOTAL_DAYS;
  return Math.min(365, Math.max(1, n));
}

export async function setTotalDays(n: number) {
  const userId = await requireUserId();
  const v = Math.min(365, Math.max(1, Math.floor(n)));
  const supabase = await createClient();
  await supabase
    .from("user_settings")
    .upsert({ user_id: userId, total_days: v });
}

// ---------- Tasks ----------

export async function getTasks(): Promise<TaskRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, position, title, subtitle, icon, kind, requires_detail, detail_label, detail_placeholder"
    )
    .eq("archived", false)
    .order("position", { ascending: true })
    .order("id", { ascending: true });
  if (error) {
    console.error("getTasks", error);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id as string,
    position: r.position as number,
    title: r.title as string,
    subtitle: r.subtitle as string | null,
    icon: r.icon as string,
    kind: (["check", "journal", "photo"].includes(r.kind as string)
      ? r.kind
      : "check") as TaskKind,
    requiresDetail: Boolean(r.requires_detail),
    detailLabel: r.detail_label as string | null,
    detailPlaceholder: r.detail_placeholder as string | null,
  }));
}

export async function upsertTask(input: TaskInput): Promise<string> {
  const userId = await requireUserId();
  const supabase = await createClient();

  if (input.id) {
    const { error } = await supabase
      .from("tasks")
      .update({
        title: input.title,
        subtitle: input.subtitle,
        icon: input.icon,
        kind: input.kind,
        requires_detail: input.requiresDetail,
        detail_label: input.detailLabel,
        detail_placeholder: input.detailPlaceholder,
      })
      .eq("id", input.id);
    if (error) throw error;
    return input.id;
  }

  // New task — compute position as max + 1.
  const { data: maxRow } = await supabase
    .from("tasks")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const pos = (maxRow?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      position: pos,
      title: input.title,
      subtitle: input.subtitle,
      icon: input.icon,
      kind: input.kind,
      requires_detail: input.requiresDetail,
      detail_label: input.detailLabel,
      detail_placeholder: input.detailPlaceholder,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function archiveTask(id: string) {
  const supabase = await createClient();
  await supabase.from("tasks").update({ archived: true }).eq("id", id);
}

export async function reorderTasks(ordering: string[]) {
  const supabase = await createClient();
  // Run updates sequentially. Could be parallelized, but order errors are easier to read this way.
  await Promise.all(
    ordering.map((id, i) =>
      supabase.from("tasks").update({ position: i }).eq("id", id)
    )
  );
}

// ---------- Challenges ----------

export async function getActiveChallenge(): Promise<
  { id: string; start_date: string; status: string } | undefined
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("id, start_date, status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getActiveChallenge", error);
    return undefined;
  }
  return data ? { id: data.id, start_date: data.start_date, status: data.status } : undefined;
}

export async function startNewChallenge(startDate: string): Promise<string> {
  const userId = await requireUserId();
  const supabase = await createClient();
  await supabase
    .from("challenges")
    .update({ status: "restarted" })
    .eq("status", "active");
  const { data, error } = await supabase
    .from("challenges")
    .insert({ user_id: userId, start_date: startDate, status: "active" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function activeRange(): Promise<{ start: string; endExclusive: string } | null> {
  const ch = await getActiveChallenge();
  if (!ch) return null;
  const total = await getTotalDays();
  return { start: ch.start_date, endExclusive: addDaysISO(ch.start_date, total) };
}

// ---------- Day reads ----------

export async function getDay(date: string): Promise<DayRow> {
  const supabase = await createClient();
  const [
    { data: dayRow },
    { data: completions },
    { data: journalRow },
    { data: wRow },
    { data: prevW },
    { data: detailRows },
    { data: photoRow },
  ] = await Promise.all([
    supabase.from("days").select("notes").eq("date", date).maybeSingle(),
    supabase
      .from("task_completions")
      .select("task_id")
      .eq("date", date)
      .order("task_id"),
    supabase
      .from("journal_entries")
      .select("content")
      .eq("date", date)
      .maybeSingle(),
    supabase
      .from("weights")
      .select("weight_lbs")
      .eq("date", date)
      .maybeSingle(),
    supabase
      .from("weights")
      .select("date, weight_lbs")
      .lt("date", date)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("task_details")
      .select("task_id, content")
      .eq("date", date),
    supabase
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
    completedTaskIds: (completions ?? []).map((c) => c.task_id as string),
    journal: (journalRow?.content as string) ?? "",
    weight: (wRow?.weight_lbs as number | undefined) ?? null,
    previousWeight: prevW
      ? { date: prevW.date as string, weight: prevW.weight_lbs as number }
      : null,
    taskDetails,
    photo: photoRow
      ? { filename: photoRow.storage_key as string, mime: photoRow.mime as string | null }
      : null,
  };
}

// ---------- Day writes ----------

async function ensureDay(supabase: Awaited<ReturnType<typeof createClient>>, date: string) {
  const userId = await requireUserId();
  const ch = await getActiveChallenge();
  if (!ch) throw new Error("No active challenge");
  await supabase
    .from("days")
    .upsert(
      { user_id: userId, challenge_id: ch.id, date, notes: "" },
      { onConflict: "user_id,date", ignoreDuplicates: true }
    );
}

export async function toggleTask(
  date: string,
  taskId: string,
  completed: boolean
): Promise<DayRow> {
  const supabase = await createClient();
  const userId = await requireUserId();
  await ensureDay(supabase, date);
  if (completed) {
    await supabase
      .from("task_completions")
      .upsert(
        { user_id: userId, date, task_id: taskId },
        { onConflict: "user_id,date,task_id", ignoreDuplicates: true }
      );
  } else {
    await supabase
      .from("task_completions")
      .delete()
      .eq("date", date)
      .eq("task_id", taskId);
  }
  return getDay(date);
}

export async function saveNotes(date: string, notes: string) {
  const supabase = await createClient();
  const userId = await requireUserId();
  const ch = await getActiveChallenge();
  if (!ch) throw new Error("No active challenge");
  await supabase
    .from("days")
    .upsert(
      {
        user_id: userId,
        challenge_id: ch.id,
        date,
        notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    );
}

export async function saveJournal(date: string, content: string) {
  const supabase = await createClient();
  const userId = await requireUserId();
  await ensureDay(supabase, date);
  await supabase
    .from("journal_entries")
    .upsert(
      {
        user_id: userId,
        date,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    );
}

export async function saveTaskDetail(date: string, taskId: string, content: string) {
  const supabase = await createClient();
  const userId = await requireUserId();
  await ensureDay(supabase, date);
  if (content.trim() === "") {
    await supabase
      .from("task_details")
      .delete()
      .eq("date", date)
      .eq("task_id", taskId);
    return;
  }
  await supabase
    .from("task_details")
    .upsert(
      {
        user_id: userId,
        date,
        task_id: taskId,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date,task_id" }
    );
}

// ---------- Weights ----------

export async function saveWeight(date: string, weightLbs: number | null) {
  const supabase = await createClient();
  const userId = await requireUserId();
  if (weightLbs == null || Number.isNaN(weightLbs)) {
    await supabase.from("weights").delete().eq("date", date);
    return;
  }
  await supabase
    .from("weights")
    .upsert(
      {
        user_id: userId,
        date,
        weight_lbs: weightLbs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    );
}

export async function getWeightSeries(): Promise<{ date: string; weight: number }[]> {
  const supabase = await createClient();
  const r = await activeRange();
  if (!r) return [];
  const { data, error } = await supabase
    .from("weights")
    .select("date, weight_lbs")
    .gte("date", r.start)
    .lt("date", r.endExclusive)
    .order("date", { ascending: true });
  if (error) {
    console.error("getWeightSeries", error);
    return [];
  }
  return (data ?? []).map((r) => ({
    date: r.date as string,
    weight: r.weight_lbs as number,
  }));
}

// ---------- Progress photos ----------

export async function setProgressPhoto(date: string, storageKey: string, mime: string) {
  const supabase = await createClient();
  const userId = await requireUserId();
  await ensureDay(supabase, date);
  await supabase
    .from("progress_photos")
    .upsert(
      {
        user_id: userId,
        date,
        storage_key: storageKey,
        mime,
        uploaded_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    );
}

export async function clearProgressPhoto(date: string) {
  const supabase = await createClient();
  await supabase.from("progress_photos").delete().eq("date", date);
}

// ---------- Stats ----------

export async function getPerTaskStats(): Promise<PerTaskStat[]> {
  const supabase = await createClient();
  const r = await activeRange();
  if (!r) return [];
  const { data, error } = await supabase
    .from("task_completions")
    .select("task_id")
    .gte("date", r.start)
    .lt("date", r.endExclusive);
  if (error) {
    console.error("getPerTaskStats", error);
    return [];
  }
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.task_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([taskId, completedDays]) => ({
    taskId,
    completedDays,
  }));
}

export async function getAllDayStatuses(): Promise<DayStatusEntry[]> {
  const supabase = await createClient();
  const ch = await getActiveChallenge();
  if (!ch) return [];
  const total = await getTotalDays();

  const { data, error } = await supabase
    .from("task_completions")
    .select("date")
    .gte("date", ch.start_date)
    .lt("date", addDaysISO(ch.start_date, total));
  if (error) {
    console.error("getAllDayStatuses", error);
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const d = row.date as string;
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }

  const today = todayLocal();
  const out: DayStatusEntry[] = [];
  for (let i = 0; i < total; i++) {
    const d = addDaysISO(ch.start_date, i);
    out.push({
      date: d,
      completedCount: counts.get(d) ?? 0,
      isFuture: d > today,
    });
  }
  return out;
}

// ---------- Restart bookkeeping ----------

export async function findMostRecentUnhandledMiss(
  today: string
): Promise<{ date: string; count: number } | null> {
  const supabase = await createClient();
  const r = await activeRange();
  if (!r) return null;
  const tasks = await getTasks();
  const required = tasks.length;
  if (required === 0) return null;

  // Pull every completion in the active window strictly before today.
  const { data, error } = await supabase
    .from("task_completions")
    .select("date")
    .gte("date", r.start)
    .lt("date", today);
  if (error) {
    console.error("findMostRecentUnhandledMiss", error);
    return null;
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const d = row.date as string;
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }

  // Also pull `days` rows that have notes — those count as "touched" days
  // even with 0 completions and may be missed.
  const { data: daysData } = await supabase
    .from("days")
    .select("date")
    .gte("date", r.start)
    .lt("date", today);
  for (const row of daysData ?? []) {
    const d = row.date as string;
    if (!counts.has(d)) counts.set(d, 0);
  }

  // Find dismissed dates so we exclude them.
  const { data: dismissed } = await supabase
    .from("app_state")
    .select("key")
    .like("key", "restart_dismissed:%");
  const dismissedSet = new Set(
    (dismissed ?? []).map((r) => (r.key as string).replace("restart_dismissed:", ""))
  );

  // Sort dates descending, return the first one with count < required and not dismissed.
  const dates = Array.from(counts.keys()).sort((a, b) => (a < b ? 1 : -1));
  for (const d of dates) {
    const c = counts.get(d) ?? 0;
    if (c < required && !dismissedSet.has(d)) {
      return { date: d, count: c };
    }
  }
  return null;
}

export async function getDismissedRestartFor(date: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_state")
    .select("value")
    .eq("key", `restart_dismissed:${date}`)
    .maybeSingle();
  return data?.value === "1";
}

export async function dismissRestartFor(date: string) {
  const supabase = await createClient();
  const userId = await requireUserId();
  await supabase
    .from("app_state")
    .upsert(
      {
        user_id: userId,
        key: `restart_dismissed:${date}`,
        value: "1",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,key" }
    );
}
