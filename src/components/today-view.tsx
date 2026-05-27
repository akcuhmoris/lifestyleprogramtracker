"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { findJournalTaskId, findPhotoTaskId, type Task } from "@/lib/tasks";
import { getIcon } from "@/lib/icons";
import { TaskCard } from "./task-card";
import { ProgressRing } from "./progress-ring";
import { NotesField } from "./notes-field";
import { WeightCard } from "./weight-card";
import { JournalModal } from "./journal-modal";
import { PhotoCard } from "./photo-card";
import { toggleTaskAction, saveJournalAction } from "@/app/actions";
import { bigCelebration } from "./confetti";
import { dayNumber, formatPretty } from "@/lib/date";
import { RestartBanner } from "./restart-banner";
import { DayProgressBar } from "./day-progress-bar";

type Props = {
  today: string;
  startDate: string;
  totalDays: number;
  tasks: Task[];
  initialCompleted: number[];
  initialNotes: string;
  initialJournal: string;
  initialWeight: number | null;
  previousWeight: { date: string; weight: number } | null;
  initialTaskDetails: Record<number, string>;
  initialPhoto: { filename: string; mime: string | null } | null;
  unhandledMiss: { date: string; count: number } | null;
};

export function TodayView({
  today,
  startDate,
  totalDays,
  tasks,
  initialCompleted,
  initialNotes,
  initialJournal,
  initialWeight,
  previousWeight,
  initialTaskDetails,
  initialPhoto,
  unhandledMiss,
}: Props) {
  const JOURNAL_TASK_ID = findJournalTaskId(tasks);
  const PHOTO_TASK_ID = findPhotoTaskId(tasks);

  const [completed, setCompleted] = useState<Set<number>>(new Set(initialCompleted));
  const [journal, setJournal] = useState(initialJournal);
  const [journalOpen, setJournalOpen] = useState(false);
  const [photo, setPhoto] = useState(initialPhoto);
  const [celebrated, setCelebrated] = useState(initialCompleted.length === tasks.length);

  const dayN = dayNumber(today, startDate);
  const ringValue = dayN <= 0 ? 0 : Math.min(dayN, totalDays) / totalDays;
  const completedCount = completed.size;
  const total = tasks.length;
  const allDone = total > 0 && completedCount === total;

  useEffect(() => {
    if (allDone && !celebrated) {
      bigCelebration();
      setCelebrated(true);
    } else if (!allDone && celebrated) {
      setCelebrated(false);
    }
  }, [allDone, celebrated]);

  async function handleToggle(taskId: number, next: boolean) {
    setCompleted((prev) => {
      const n = new Set(prev);
      if (next) n.add(taskId);
      else n.delete(taskId);
      return n;
    });
    const res = await toggleTaskAction(today, taskId, next);
    if (!res.ok) {
      setCompleted((prev) => {
        const n = new Set(prev);
        if (next) n.delete(taskId);
        else n.add(taskId);
        return n;
      });
    }
  }

  async function handleJournalSaved(content: string) {
    if (JOURNAL_TASK_ID == null) return;
    setJournal(content);
    const has = content.trim().length > 0;
    const isChecked = completed.has(JOURNAL_TASK_ID);
    if (has && !isChecked) {
      setCompleted((s) => new Set(s).add(JOURNAL_TASK_ID));
      await toggleTaskAction(today, JOURNAL_TASK_ID, true);
    } else if (!has && isChecked) {
      setCompleted((s) => {
        const n = new Set(s);
        n.delete(JOURNAL_TASK_ID);
        return n;
      });
      await toggleTaskAction(today, JOURNAL_TASK_ID, false);
    }
  }

  async function handleJournalToggle(next: boolean) {
    if (JOURNAL_TASK_ID == null) return;
    if (next) {
      setJournalOpen(true);
    } else {
      setCompleted((s) => {
        const n = new Set(s);
        n.delete(JOURNAL_TASK_ID);
        return n;
      });
      setJournal("");
      await saveJournalAction(today, "");
      await toggleTaskAction(today, JOURNAL_TASK_ID, false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      {unhandledMiss && (
        <RestartBanner
          missDate={unhandledMiss.date}
          missCount={unhandledMiss.count}
          taskCount={total}
        />
      )}
      <Header
        today={today}
        dayN={dayN}
        startDate={startDate}
        totalDays={totalDays}
        ringValue={ringValue}
        completedCount={completedCount}
        total={total}
        allDone={allDone}
      />

      {total > 0 && (
        <DayProgressBar completed={completedCount} total={total} />
      )}

      {total === 0 ? (
        <EmptyTasksState />
      ) : (
        <motion.div
          layout
          className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {tasks.map((t, i) => {
            const isJournal = t.kind === "journal";
            const isPhoto = t.kind === "photo";
            const isCompleted = completed.has(t.id);
            const Icon = getIcon(t.icon);
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {isPhoto ? (
                  <PhotoCard
                    date={today}
                    completed={isCompleted}
                    photo={photo}
                    onChange={(p) => {
                      setPhoto(p);
                      if (PHOTO_TASK_ID == null) return;
                      setCompleted((prev) => {
                        const n = new Set(prev);
                        if (p) n.add(PHOTO_TASK_ID);
                        else n.delete(PHOTO_TASK_ID);
                        return n;
                      });
                    }}
                  />
                ) : (
                  <TaskCard
                    id={t.id}
                    title={t.title}
                    subtitle={t.subtitle ?? undefined}
                    icon={Icon}
                    completed={isCompleted}
                    date={today}
                    detailLabel={t.detailLabel ?? undefined}
                    detailPlaceholder={t.detailPlaceholder ?? undefined}
                    initialDetail={initialTaskDetails[t.id] ?? ""}
                    requiresDetail={t.requiresDetail}
                    onActivate={isJournal ? () => setJournalOpen(true) : undefined}
                    onToggle={
                      isJournal
                        ? handleJournalToggle
                        : (next) => handleToggle(t.id, next)
                    }
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,420px)] gap-6">
        <NotesField date={today} initial={initialNotes} />
        <WeightCard
          date={today}
          initial={initialWeight}
          previous={previousWeight}
        />
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-6 text-center shadow-glow"
          >
            <div className="text-xs uppercase tracking-[0.22em] text-accent-glow">
              Day {dayN} complete
            </div>
            <div className="mt-2 text-xl font-medium">
              All {total} {total === 1 ? "task" : "tasks"} done.
            </div>
            <div className="mt-1 text-sm text-text-muted">
              That&apos;s {dayN} of {totalDays}. Keep it going.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <JournalModal
        date={today}
        initialContent={journal}
        open={journalOpen}
        onOpenChange={setJournalOpen}
        onSaved={handleJournalSaved}
      />
    </div>
  );
}

function EmptyTasksState() {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-border bg-bg-card p-10 text-center">
      <p className="text-text-muted">
        No tasks configured.{" "}
        <a href="/settings" className="text-accent-glow hover:underline">
          Add some in Settings
        </a>
        .
      </p>
    </div>
  );
}

function Header({
  today,
  dayN,
  startDate,
  totalDays,
  ringValue,
  completedCount,
  total,
  allDone,
}: {
  today: string;
  dayN: number;
  startDate: string;
  totalDays: number;
  ringValue: number;
  completedCount: number;
  total: number;
  allDone: boolean;
}) {
  const valid = dayN >= 1 && dayN <= totalDays;

  return (
    <header className="flex flex-col-reverse items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-accent-glow shadow-[0_0_18px_-4px_rgba(14,165,255,0.5)]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Active program · {totalDays} days
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          {valid ? (
            <>
              <span className="text-gradient-accent">Day {dayN}</span>
              <span className="text-text-dim"> of {totalDays}</span>
            </>
          ) : dayN < 1 ? (
            <span className="text-text-muted">
              Starts {formatPretty(startDate)}
            </span>
          ) : (
            <span className="text-text-muted">Challenge complete</span>
          )}
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          {formatPretty(today)} ·{" "}
          <span className="text-accent-glow font-medium tabular-nums">
            {completedCount}
          </span>
          <span className="text-text-dim">/{total} done</span>
          {allDone && (
            <span className="ml-2 text-accent-glow font-medium">· all tasks complete</span>
          )}
        </p>
      </div>
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -m-6 rounded-full bg-accent/25 blur-3xl"
        />
        <div className="relative">
          <ProgressRing
            value={ringValue}
            size={148}
            stroke={9}
            label={`${Math.max(0, Math.min(dayN, totalDays))}`}
            sublabel={`of ${totalDays}`}
          />
        </div>
      </div>
    </header>
  );
}
