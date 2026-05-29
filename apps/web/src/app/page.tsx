import { TodayView } from "@/components/today-view";
import { CompletionScreen } from "@/components/completion-screen";
import {
  findMostRecentUnhandledMiss,
  getActiveChallenge,
  getAllDayStatuses,
  getDay,
  getPerTaskStats,
  getTasks,
  getTotalDays,
  getWeightSeries,
} from "@/lib/db";
import { findJournalTaskId, findPhotoTaskId } from "@program/shared/tasks";
import { CHALLENGE_START, addDays, todayLocal } from "@program/shared/date";

export const dynamic = "force-dynamic";

export default async function Home() {
  const today = todayLocal();

  const [day, ch, tasks, totalDays, statuses] = await Promise.all([
    getDay(today),
    getActiveChallenge(),
    getTasks(),
    getTotalDays(),
    getAllDayStatuses(),
  ]);

  const startDate = ch?.start_date ?? CHALLENGE_START;
  const taskCount = tasks.length;
  const fullyComplete =
    taskCount > 0 &&
    statuses.length === totalDays &&
    statuses.every((s) => s.completedCount === taskCount);

  if (fullyComplete) {
    const [perTask, weights] = await Promise.all([
      getPerTaskStats(),
      getWeightSeries(),
    ]);
    const perTaskMap = new Map(perTask.map((p) => [p.taskId, p.completedDays]));
    const find = (re: RegExp) =>
      tasks.find((t) => re.test(t.title) || re.test(t.subtitle ?? ""));
    const water = find(/water|gallon/i);
    const workouts = tasks.filter((t) => /workout|run|cardio|lift|train/i.test(t.title));
    const reading = find(/read/i);
    const journalId = findJournalTaskId(tasks);
    const photoId = findPhotoTaskId(tasks);
    const totals = {
      waterGallons: water ? perTaskMap.get(water.id) ?? 0 : 0,
      workoutMinutes:
        workouts.reduce((sum, w) => sum + (perTaskMap.get(w.id) ?? 0), 0) * 45,
      totalPages: reading ? (perTaskMap.get(reading.id) ?? 0) * 10 : 0,
      journalEntries: journalId ? perTaskMap.get(journalId) ?? 0 : 0,
      photoDays: photoId ? perTaskMap.get(photoId) ?? 0 : 0,
    };
    const weightChange =
      weights.length >= 2 ? weights[weights.length - 1].weight - weights[0].weight : null;
    const endDate = addDays(startDate, totalDays - 1);
    return (
      <main className="min-h-screen">
        <CompletionScreen
          startDate={startDate}
          endDate={endDate}
          totalDays={totalDays}
          totals={totals}
          weightChange={weightChange}
        />
      </main>
    );
  }

  const miss = await findMostRecentUnhandledMiss(today);

  return (
    <main className="min-h-screen">
      <TodayView
        today={today}
        startDate={startDate}
        totalDays={totalDays}
        tasks={tasks}
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
