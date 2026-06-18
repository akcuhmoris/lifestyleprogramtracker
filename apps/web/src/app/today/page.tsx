import { TodayView } from "@/components/today-view";
import { CompletionScreen } from "@/components/completion-screen";
import {
  findMostRecentUnhandledMiss,
  getActiveChallenge,
  getAllDayStatuses,
  getCharacterProfile,
  getDay,
  getPerTaskStats,
  getTasks,
  getTotalDays,
  getWeightSeries,
} from "@/lib/db";
import { findJournalTaskId, findPhotoTaskId } from "@program/shared/tasks";
import {
  CHALLENGE_START,
  addDays,
  dayNumber,
  parseISO,
  todayLocal,
} from "@program/shared/date";
import {
  tierForLevel,
  tierName,
  type Archetype,
} from "@program/shared/gamification";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Copy helpers — kept local so today's page stays self-explanatory.
// ---------------------------------------------------------------------------

// TODO: This greeting is computed against the server clock. Once we know the
// user's IANA timezone (Phase 7-ish) we should compute the hour in their tz so
// "Good morning" actually lines up with morning for them.
function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Friendly capitalized label for the user's archetype ("warrior" → "Warrior").
 * We use this in the greeting because the longer marketing name
 * ("The Disciplined") doesn't read naturally as a direct address.
 */
function archetypeAddress(archetype: Archetype): string {
  return archetype.charAt(0).toUpperCase() + archetype.slice(1);
}

/** Short, friendly date — e.g. "June 17". No year, no weekday. */
function formatFriendly(dateISO: string): string {
  return parseISO(dateISO).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

const MOTIVATION_LINE = "Consistency is the algorithm.";

export default async function Home() {
  const today = todayLocal();

  const [day, ch, tasks, totalDays, statuses, profile] = await Promise.all([
    getDay(today),
    getActiveChallenge(),
    getTasks(),
    getTotalDays(),
    getAllDayStatuses(),
    getCharacterProfile(),
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

  // Page header values — computed server-side.
  const dayN = dayNumber(today, startDate);
  const dayInRange = dayN >= 1 && dayN <= totalDays;

  // Time-aware greeting. Uses server clock — see TODO above.
  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);
  const address = archetypeAddress(profile.archetype);
  const friendlyDate = formatFriendly(today);

  // Day pill copy adapts to where we are in the program.
  const dayPillLabel = dayInRange
    ? `Day ${dayN} of ${totalDays} · ${friendlyDate}`
    : dayN < 1
      ? `Starts ${friendlyDate}`
      : `Program complete · ${friendlyDate}`;

  // Hero card — level + tier for the inline summary.
  const tier = tierForLevel(profile.level);
  const tierLabel = tierName(tier);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:pt-10">
        {/* ------------------------------------------------------------- */}
        {/* Warm header                                                    */}
        {/* ------------------------------------------------------------- */}
        <header className="flex flex-col gap-3">
          <h1 className="font-sans text-3xl font-bold tracking-tight text-[color:var(--text)] md:text-4xl">
            {greeting}, {address}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-muted)",
              }}
            >
              {dayPillLabel}
            </span>
          </div>

          <p className="text-sm italic text-[color:var(--text-muted)]">
            {MOTIVATION_LINE}
          </p>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* Today view (hero card + tasks + notes + weight)                */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-8">
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
            archetype={profile.archetype}
            level={profile.level}
            tierLabel={tierLabel}
          />
        </div>
      </div>
    </main>
  );
}
