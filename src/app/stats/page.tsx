import {
  getAllDayStatuses,
  getPerTaskStats,
  getWeightSeries,
  getActiveChallenge,
} from "@/lib/db";
import { TASKS } from "@/lib/tasks";
import {
  CHALLENGE_START,
  TOTAL_DAYS,
  daysBetween,
  formatPretty,
  todayLocal,
} from "@/lib/date";
import { StatsBoard } from "@/components/stats-board";

export const dynamic = "force-dynamic";

export default function StatsPage() {
  const today = todayLocal();
  const ch = getActiveChallenge();
  const startDate = ch?.start_date ?? CHALLENGE_START;

  const statuses = getAllDayStatuses();
  const perTask = getPerTaskStats();
  const weightSeries = getWeightSeries();

  const elapsedRaw = daysBetween(startDate, today) + 1;
  const elapsed = Math.max(0, Math.min(elapsedRaw, TOTAL_DAYS));

  let full = 0,
    partial = 0,
    missed = 0;
  for (const s of statuses) {
    const isPast = s.date < today;
    if (s.completedCount === 12) full++;
    else if (isPast) {
      if (s.completedCount === 0) missed++;
      else partial++;
    }
  }
  const inProgressToday = statuses.find((s) => s.date === today);
  if (inProgressToday && inProgressToday.completedCount === 12) {
    // already counted
  }

  // Per-task records
  const perTaskMap = new Map(perTask.map((p) => [p.taskId, p.completedDays]));
  const perTaskRecords = TASKS.map((t) => ({
    id: t.id,
    title: t.title,
    completedDays: perTaskMap.get(t.id) ?? 0,
    elapsed,
  }));

  // Aggregates
  const waterDays = perTaskMap.get(6) ?? 0;
  const workoutCount = (perTaskMap.get(4) ?? 0) + (perTaskMap.get(5) ?? 0);
  const workoutMinutes = workoutCount * 45;
  const readingDays = perTaskMap.get(7) ?? 0;
  const totalPages = readingDays * 10;
  const journalEntries = perTaskMap.get(12) ?? 0;
  const photoDays = perTaskMap.get(8) ?? 0;

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
        total={TOTAL_DAYS}
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
