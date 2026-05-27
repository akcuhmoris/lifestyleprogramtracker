import { TodayView } from "@/components/today-view";
import { CompletionScreen } from "@/components/completion-screen";
import {
  findMostRecentUnhandledMiss,
  getActiveChallenge,
  getAllDayStatuses,
  getDay,
  getPerTaskStats,
  getWeightSeries,
} from "@/lib/db";
import { CHALLENGE_START, TOTAL_DAYS, addDays, todayLocal } from "@/lib/date";

export const dynamic = "force-dynamic";

export default function Home() {
  const today = todayLocal();
  const day = getDay(today);
  const ch = getActiveChallenge();
  const startDate = ch?.start_date ?? CHALLENGE_START;

  // Detect full completion: every one of the 100 cells is 12/12.
  const statuses = getAllDayStatuses();
  const fullyComplete =
    statuses.length === TOTAL_DAYS &&
    statuses.every((s) => s.completedCount === 12);

  if (fullyComplete) {
    const perTask = getPerTaskStats();
    const perTaskMap = new Map(perTask.map((p) => [p.taskId, p.completedDays]));
    const totals = {
      waterGallons: perTaskMap.get(6) ?? 0,
      workoutMinutes: ((perTaskMap.get(4) ?? 0) + (perTaskMap.get(5) ?? 0)) * 45,
      totalPages: (perTaskMap.get(7) ?? 0) * 10,
      journalEntries: perTaskMap.get(12) ?? 0,
      photoDays: perTaskMap.get(8) ?? 0,
    };
    const weights = getWeightSeries();
    const weightChange =
      weights.length >= 2 ? weights[weights.length - 1].weight - weights[0].weight : null;
    const endDate = addDays(startDate, TOTAL_DAYS - 1);
    return (
      <main className="min-h-screen">
        <CompletionScreen
          startDate={startDate}
          endDate={endDate}
          totals={totals}
          weightChange={weightChange}
        />
      </main>
    );
  }

  const miss = findMostRecentUnhandledMiss(today);

  return (
    <main className="min-h-screen">
      <TodayView
        today={today}
        startDate={startDate}
        initialCompleted={day.completedTaskIds}
        initialNotes={day.notes}
        initialJournal={day.journal}
        initialWeight={day.weight}
        previousWeight={day.previousWeight}
        initialTaskDetails={day.taskDetails}
        initialPhoto={day.photo}
        unhandledMiss={miss}
      />
    </main>
  );
}
