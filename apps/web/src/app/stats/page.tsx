import {
  getAllDayStatuses,
  getPerTaskStats,
  getWeightSeries,
  getActiveChallenge,
  getTasks,
  getTotalDays,
} from "@/lib/db";
import {
  CHALLENGE_START,
  daysBetween,
  formatPretty,
  todayLocal,
} from "@program/shared/date";
import { StatsBoard } from "@/components/stats-board";
import { findJournalTaskId, findPhotoTaskId } from "@program/shared/tasks";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const today = todayLocal();
  const [ch, tasks, totalDays, statuses, perTask, weightSeries] = await Promise.all([
    getActiveChallenge(),
    getTasks(),
    getTotalDays(),
    getAllDayStatuses(),
    getPerTaskStats(),
    getWeightSeries(),
  ]);
  const startDate = ch?.start_date ?? CHALLENGE_START;

  const elapsedRaw = daysBetween(startDate, today) + 1;
  const elapsed = Math.max(0, Math.min(elapsedRaw, totalDays));

  const taskCount = tasks.length;
  let full = 0,
    partial = 0,
    missed = 0;
  for (const s of statuses) {
    const isPast = s.date < today;
    if (taskCount > 0 && s.completedCount === taskCount) full++;
    else if (isPast) {
      if (s.completedCount === 0) missed++;
      else partial++;
    }
  }

  // Per-task records, in the order tasks are configured.
  const perTaskMap = new Map(perTask.map((p) => [p.taskId, p.completedDays]));
  const perTaskRecords = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    completedDays: perTaskMap.get(t.id) ?? 0,
    elapsed,
  }));

  // Aggregate totals by inferring semantics from task titles where possible.
  const find = (re: RegExp) =>
    tasks.find((t) => re.test(t.title) || re.test(t.subtitle ?? ""));
  const water = find(/water|gallon/i);
  const workouts = tasks.filter((t) => /workout|run|cardio|lift|train/i.test(t.title));
  const reading = find(/read/i);
  const journalId = findJournalTaskId(tasks);
  const photoId = findPhotoTaskId(tasks);

  const waterDays = water ? perTaskMap.get(water.id) ?? 0 : 0;
  const workoutCount = workouts.reduce(
    (sum, w) => sum + (perTaskMap.get(w.id) ?? 0),
    0
  );
  const workoutMinutes = workoutCount * 45;
  const readingDays = reading ? perTaskMap.get(reading.id) ?? 0 : 0;
  const totalPages = readingDays * 10;
  const journalEntries = journalId ? perTaskMap.get(journalId) ?? 0 : 0;
  const photoDays = photoId ? perTaskMap.get(photoId) ?? 0 : 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-accent-glow shadow-[0_0_18px_-4px_rgba(14,165,255,0.5)]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Stats
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="text-gradient-accent">By the numbers</span>
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Through Day {elapsed} · started {formatPretty(startDate)}
        </p>
      </header>

      <StatsBoard
        elapsed={elapsed}
        total={totalDays}
        full={full}
        partial={partial}
        missed={missed}
        perTask={perTaskRecords}
        weightSeries={weightSeries}
        totals={{
          waterDays,
          workoutCount,
          workoutMinutes,
          readingDays,
          totalPages,
          journalEntries,
          photoDays,
        }}
      />
    </main>
  );
}
