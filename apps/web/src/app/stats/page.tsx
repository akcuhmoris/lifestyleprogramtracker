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
import { HudHeader } from "@/components/hud/hud-header";
import { HudPanel } from "@/components/hud/hud-panel";
import { StatBlock } from "@/components/hud/stat-block";

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

  // Total tasks completed across all days (sum of per-task completion counts).
  const totalTasksCompleted = perTask.reduce(
    (sum, p) => sum + (p.completedDays ?? 0),
    0,
  );

  // Current streak — count consecutive past days (and today if full) where all
  // tasks were completed, walking backwards from today.
  const statusByDate = new Map(statuses.map((s) => [s.date, s.completedCount]));
  let currentStreak = 0;
  if (taskCount > 0) {
    // Walk from today backwards.
    // Use the same date math as todayLocal — iterate by subtracting days.
    let cursor = today;
    // Helper: shift YYYY-MM-DD back by 1 day in local terms.
    const shiftBack = (d: string): string => {
      const [y, m, day] = d.split("-").map(Number);
      const dt = new Date(y, m - 1, day);
      dt.setDate(dt.getDate() - 1);
      const yy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      return `${yy}-${mm}-${dd}`;
    };
    while (true) {
      const count = statusByDate.get(cursor) ?? 0;
      const isToday = cursor === today;
      if (count === taskCount) {
        currentStreak++;
        cursor = shiftBack(cursor);
      } else if (isToday) {
        // Today not yet complete — don't break the streak, just skip to yesterday.
        cursor = shiftBack(cursor);
      } else {
        break;
      }
      // Safety: don't iterate further than the program length.
      if (currentStreak > totalDays) break;
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      <HudHeader
        subtitle={`Through day ${elapsed} · started ${formatPretty(startDate)}`}
        className="mb-8"
      >
        Stats
      </HudHeader>

      {/* Top stat readout row */}
      <HudPanel className="mb-8 p-5 md:p-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-5">
          <StatBlock label="Days active" value={elapsed} />
          <StatBlock label="Perfect days" value={full} />
          <StatBlock label="Current streak" value={currentStreak} />
          <StatBlock label="Tasks cleared" value={totalTasksCompleted} />
          <StatBlock label="Days missed" value={missed} />
        </div>
      </HudPanel>

      {/* Existing charts + per-task records, wrapped in soft chrome */}
      <HudPanel className="p-5 md:p-7">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[color:var(--text)]">
            Trends
          </h2>
          <span
            aria-hidden="true"
            className="h-px flex-1"
            style={{ background: "var(--hud-border)" }}
          />
        </div>

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
      </HudPanel>
    </main>
  );
}
