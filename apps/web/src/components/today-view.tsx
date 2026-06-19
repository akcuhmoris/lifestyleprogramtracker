"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { findJournalTaskId, findPhotoTaskId, type Task } from "@program/shared/tasks";
import { getIcon } from "@program/shared/icons";
import { TaskCard } from "./task-card";
import { NotesField } from "./notes-field";
import { WeightCard } from "./weight-card";
import { JournalModal } from "./journal-modal";
import { PhotoCard } from "./photo-card";
import { toggleTaskAction, saveJournalAction } from "@/app/actions";
import { bigCelebration } from "./confetti";
import { dayNumber } from "@program/shared/date";
import { RestartBanner } from "./restart-banner";
import { DayProgressBar } from "./day-progress-bar";
import { HudPanel } from "./hud/hud-panel";
import { CharacterAvatar } from "./character/avatar";
import {
  ARCHETYPES,
  tierForLevel,
  type Archetype,
} from "@program/shared/gamification";

type Props = {
  today: string;
  startDate: string;
  totalDays: number;
  tasks: Task[];
  initialCompleted: string[];
  initialNotes: string;
  initialJournal: string;
  initialWeight: number | null;
  previousWeight: { date: string; weight: number } | null;
  initialTaskDetails: Record<string, string>;
  initialPhoto: { filename: string; mime: string | null } | null;
  unhandledMiss: { date: string; count: number } | null;
  /** Character identity for the hero card row. */
  archetype: Archetype;
  level: number;
  tierLabel: string;
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
  archetype,
  level,
  tierLabel,
}: Props) {
  const JOURNAL_TASK_ID = findJournalTaskId(tasks);
  const PHOTO_TASK_ID = findPhotoTaskId(tasks);

  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted));
  const [journal, setJournal] = useState(initialJournal);
  const [journalOpen, setJournalOpen] = useState(false);
  const [photo, setPhoto] = useState(initialPhoto);
  const [celebrated, setCelebrated] = useState(initialCompleted.length === tasks.length);

  const dayN = dayNumber(today, startDate);
  const completedCount = completed.size;
  const total = tasks.length;
  const allDone = total > 0 && completedCount === total;

  // Resolved character display info for the hero card.
  const tier = tierForLevel(level);
  const archetypeMeta = ARCHETYPES.find((a) => a.id === archetype);
  const archetypeName = archetypeMeta?.name ?? archetype;

  const progressPct =
    total > 0 ? Math.min(100, Math.max(0, (completedCount / total) * 100)) : 0;

  useEffect(() => {
    if (allDone && !celebrated) {
      bigCelebration();
      setCelebrated(true);
    } else if (!allDone && celebrated) {
      setCelebrated(false);
    }
  }, [allDone, celebrated]);

  async function handleToggle(taskId: string, next: boolean) {
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
    <div>
      {/* ----------------------------------------------------------------- */}
      {/* Hero card — avatar + identity + today's progress                   */}
      {/* ----------------------------------------------------------------- */}
      <HudPanel className="p-4 sm:p-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            <CharacterAvatar archetype={archetype} tier={tier} size="md" />
          </div>

          {/* Identity */}
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold tracking-tight text-[color:var(--text)] sm:text-xl">
              {archetypeName}
            </div>
            <div className="mt-0.5 text-sm text-[color:var(--text-muted)]">
              Level {level} · {tierLabel}
            </div>
          </div>

          {/* Today's progress */}
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <div className="flex items-baseline justify-between gap-3 sm:justify-end">
              <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--text-muted)] sm:hidden">
                Today
              </span>
              <span className="text-sm font-medium text-[color:var(--text)]">
                <span className="font-mono tabular-nums">
                  {completedCount}
                </span>{" "}
                of{" "}
                <span className="font-mono tabular-nums">{total}</span> complete
              </span>
            </div>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: "var(--accent)",
                }}
              />
            </div>
          </div>
        </div>
      </HudPanel>

      {/* ----------------------------------------------------------------- */}
      {/* Restart banner (if any) + chunky progress bar                      */}
      {/* ----------------------------------------------------------------- */}
      {unhandledMiss && (
        <div className="mt-6">
          <RestartBanner
            missDate={unhandledMiss.date}
            missCount={unhandledMiss.count}
            taskCount={total}
          />
        </div>
      )}

      {total > 0 && (
        <div className="mt-6">
          <DayProgressBar completed={completedCount} total={total} />
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Today's tasks                                                      */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-10">
        <h2 className="font-sans text-2xl font-extrabold tracking-tight text-[color:var(--text)] sm:text-3xl">
          Today
        </h2>
        <p className="mt-1 text-sm font-normal text-white/60">
          Check off each requirement as you finish it.
        </p>

        {total === 0 ? (
          <EmptyTasksState />
        ) : (
          <motion.div
            layout
            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Notes + Weight                                                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(320px,420px)]">
        <HudPanel className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[color:var(--text)]">
              Notes
            </span>
          </div>
          <NotesField date={today} initial={initialNotes} />
        </HudPanel>
        <HudPanel className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[color:var(--text)]">
              Weight
            </span>
          </div>
          <WeightCard
            date={today}
            initial={initialWeight}
            previous={previousWeight}
          />
        </HudPanel>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* All-done celebration banner                                        */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <HudPanel tone="accent" className="p-6 text-center">
              <div className="text-xs font-medium text-[color:var(--accent)]">
                Day {dayN} complete
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-[color:var(--text)]">
                Great work today
              </div>
              <div className="mt-2 text-sm text-[color:var(--text-muted)]">
                That&apos;s{" "}
                <span className="font-mono tabular-nums">
                  {dayN} / {totalDays}
                </span>
                . Keep the streak alive.
              </div>
            </HudPanel>
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
    <div className="mt-6 rounded-2xl border border-dashed border-border bg-bg-card p-10 text-center">
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
