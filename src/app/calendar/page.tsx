import { CalendarGrid } from "@/components/calendar-grid";
import {
  getActiveChallenge,
  getAllDayStatuses,
  getTasks,
  getTotalDays,
} from "@/lib/db";
import { CHALLENGE_START, formatPretty, todayLocal } from "@/lib/date";

export const dynamic = "force-dynamic";

export default function CalendarPage() {
  const today = todayLocal();
  const statuses = getAllDayStatuses();
  const ch = getActiveChallenge();
  const startDate = ch?.start_date ?? CHALLENGE_START;
  const totalDays = getTotalDays();
  const tasks = getTasks();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-accent-glow shadow-[0_0_18px_-4px_rgba(14,165,255,0.5)]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Calendar
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="text-gradient-accent">Your program</span>{" "}
          <span className="text-text-dim">at a glance</span>
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Started {formatPretty(startDate)} · {totalDays} days total · tap any past day to edit
        </p>
      </header>

      <CalendarGrid
        today={today}
        startDate={startDate}
        totalDays={totalDays}
        tasks={tasks}
        statuses={statuses}
      />
    </main>
  );
}
