import { CalendarGrid } from "@/components/calendar-grid";
import {
  getActiveChallenge,
  getAllDayStatuses,
  getTasks,
  getTotalDays,
} from "@/lib/db";
import { CHALLENGE_START, formatPretty, todayLocal } from "@program/shared/date";
import { HudHeader } from "@/components/hud/hud-header";
import { HudPanel } from "@/components/hud/hud-panel";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const today = todayLocal();
  const [statuses, ch, totalDays, tasks] = await Promise.all([
    getAllDayStatuses(),
    getActiveChallenge(),
    getTotalDays(),
    getTasks(),
  ]);
  const startDate = ch?.start_date ?? CHALLENGE_START;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      <HudHeader
        subtitle={`Started ${formatPretty(startDate)} · ${totalDays} days total · tap any past day to edit.`}
        className="mb-8"
      >
        Calendar
      </HudHeader>

      <HudPanel className="p-5 md:p-7">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[color:var(--text)]">
            Timeline
          </h2>
          <span
            aria-hidden="true"
            className="h-px flex-1"
            style={{ background: "var(--hud-border)" }}
          />
        </div>

        <CalendarGrid
          today={today}
          startDate={startDate}
          totalDays={totalDays}
          tasks={tasks}
          statuses={statuses}
        />
      </HudPanel>
    </main>
  );
}
