"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Scale, X, Camera, ImagePlus, Trash2, Loader2, Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { findPhotoTaskId, type Task } from "@/lib/tasks";
import { getIcon } from "@/lib/icons";
import { dayNumber, formatPretty } from "@/lib/date";
import { DayProgressBar } from "./day-progress-bar";
import {
  loadDayAction,
  saveJournalAction,
  saveNotesAction,
  saveTaskDetailAction,
  saveWeightAction,
  toggleTaskAction,
  uploadProgressPhotoAction,
  deleteProgressPhotoAction,
} from "@/app/actions";


type Props = {
  open: boolean;
  date: string | null;
  startDate: string;
  tasks: Task[];
  totalDays: number;
  onOpenChange: (open: boolean) => void;
};

type Loaded = {
  date: string;
  notes: string;
  completedTaskIds: number[];
  journal: string;
  weight: number | null;
  previousWeight: { date: string; weight: number } | null;
  taskDetails: Record<number, string>;
  photo: { filename: string; mime: string | null } | null;
};

export function DayDetailModal({
  open,
  date,
  startDate,
  tasks,
  totalDays,
  onOpenChange,
}: Props) {
  const [data, setData] = useState<Loaded | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open || !date) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadDayAction(date).then((d) => {
      if (cancelled) return;
      setData(d);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, date]);

  function handleClose() {
    onOpenChange(false);
    // Refresh server data so grid colors reflect any edits.
    router.refresh();
  }

  const completedCount = data?.completedTaskIds.length ?? 0;
  const allDone = tasks.length > 0 && completedCount === tasks.length;
  const tone: "complete" | "partial" | "miss" =
    allDone ? "complete" : completedCount === 0 ? "miss" : "partial";

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (o ? onOpenChange(true) : handleClose())}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content
              forceMount
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none focus:outline-none"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                className={cn(
                  "w-[94vw] max-w-3xl max-h-[90vh] pointer-events-auto",
                  "rounded-2xl border border-border bg-bg-card shadow-card overflow-hidden",
                  "flex flex-col"
                )}
              >
                {date && (
                  <Header
                    date={date}
                    startDate={startDate}
                    totalDays={totalDays}
                    tone={tone}
                    completedCount={completedCount}
                    taskCount={tasks.length}
                    onClose={handleClose}
                  />
                )}
                <div className="overflow-y-auto flex-1 px-6 py-6">
                  {loading || !data ? (
                    <div className="flex items-center justify-center py-12 text-sm text-text-dim">
                      Loading…
                    </div>
                  ) : (
                    <Body data={data} tasks={tasks} onChange={setData} />
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Header({
  date,
  startDate,
  totalDays,
  tone,
  completedCount,
  taskCount,
  onClose,
}: {
  date: string;
  startDate: string;
  totalDays: number;
  tone: "complete" | "partial" | "miss";
  completedCount: number;
  taskCount: number;
  onClose: () => void;
}) {
  const dayN = dayNumber(date, startDate);
  const badge =
    tone === "complete"
      ? { label: "Full day", cls: "bg-accent/20 border-accent/50 text-accent-glow shadow-glow" }
      : tone === "miss"
      ? { label: "Missed", cls: "bg-state-miss/15 border-state-miss/40 text-rose-200" }
      : { label: "Partial", cls: "bg-state-partial/15 border-state-partial/40 text-amber-200" };

  return (
    <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border-subtle">
      <div>
        <Dialog.Title className="text-xs uppercase tracking-[0.22em] text-text-dim">
          Day {dayN} of {totalDays}
        </Dialog.Title>
        <Dialog.Description className="mt-1 text-lg font-semibold tracking-tight text-text">
          {formatPretty(date)}
        </Dialog.Description>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.16em] font-medium",
              badge.cls
            )}
          >
            {badge.label}
          </span>
          <span className="text-xs text-text-muted tabular-nums">
            {completedCount}/{taskCount} tasks
          </span>
        </div>
        <div className="mt-3 max-w-xs">
          <DayProgressBar
            completed={completedCount}
            total={taskCount}
            variant="compact"
          />
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-text-muted hover:text-text rounded-md p-1.5 hover:bg-bg-hover transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </header>
  );
}

function Body({
  data,
  tasks,
  onChange,
}: {
  data: Loaded;
  tasks: Task[];
  onChange: (d: Loaded) => void;
}) {
  const photoId = findPhotoTaskId(tasks);

  const [expandedDetailId, setExpandedDetailId] = useState<number | null>(null);
  const [detailNudge, setDetailNudge] = useState(0);

  async function toggle(taskId: number, next: boolean) {
    const def = tasks.find((t) => t.id === taskId);
    if (next && def?.requiresDetail) {
      const existing = (data.taskDetails[taskId] ?? "").trim();
      if (existing.length === 0) {
        setExpandedDetailId(taskId);
        setDetailNudge((n) => n + 1);
        return;
      }
    }
    const nextSet = new Set(data.completedTaskIds);
    if (next) nextSet.add(taskId);
    else nextSet.delete(taskId);
    onChange({ ...data, completedTaskIds: [...nextSet].sort((a, b) => a - b) });
    const res = await toggleTaskAction(data.date, taskId, next);
    if (!res.ok) {
      const revertSet = new Set(data.completedTaskIds);
      if (next) revertSet.delete(taskId);
      else revertSet.add(taskId);
      onChange({ ...data, completedTaskIds: [...revertSet].sort((a, b) => a - b) });
    }
  }

  function handleDetailContentChange(taskId: number, content: string) {
    const def = tasks.find((t) => t.id === taskId);
    if (!def?.requiresDetail) {
      onChange({ ...data, taskDetails: { ...data.taskDetails, [taskId]: content } });
      return;
    }
    const wasChecked = data.completedTaskIds.includes(taskId);
    const hasContent = content.trim().length > 0;
    const nextDetails = { ...data.taskDetails, [taskId]: content };
    let nextCompleted = data.completedTaskIds;
    if (hasContent && !wasChecked) {
      nextCompleted = [...nextCompleted, taskId].sort((a, b) => a - b);
      toggleTaskAction(data.date, taskId, true);
    } else if (!hasContent && wasChecked) {
      nextCompleted = nextCompleted.filter((id) => id !== taskId);
      toggleTaskAction(data.date, taskId, false);
    }
    onChange({ ...data, taskDetails: nextDetails, completedTaskIds: nextCompleted });
  }

  return (
    <div className="space-y-7">
      <section>
        <SectionTitle>The 12 disciplines</SectionTitle>
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tasks.map((t) => {
            const isComplete = data.completedTaskIds.includes(t.id);
            const Icon = getIcon(t.icon);
            const isJournal = t.kind === "journal";
            const isPhoto = t.kind === "photo";
            if (isPhoto && photoId != null) {
              return (
                <li
                  key={t.id}
                  className={cn(
                    "sm:col-span-2 rounded-xl border transition-colors",
                    isComplete
                      ? "border-accent/40 bg-accent/10"
                      : "border-border-subtle bg-bg-elevated"
                  )}
                >
                  <PhotoRow
                    date={data.date}
                    photo={data.photo}
                    completed={isComplete}
                    onChange={(p) => {
                      const set = new Set(data.completedTaskIds);
                      if (p) set.add(photoId);
                      else set.delete(photoId);
                      onChange({
                        ...data,
                        photo: p,
                        completedTaskIds: [...set].sort((a, b) => a - b),
                      });
                    }}
                  />
                </li>
              );
            }
            return (
              <li
                key={t.id}
                className={cn(
                  "rounded-xl border transition-colors",
                  isComplete
                    ? "border-accent/40 bg-accent/10"
                    : "border-border-subtle bg-bg-elevated hover:border-accent/25"
                )}
              >
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggle(t.id, !isComplete)}
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors flex-shrink-0",
                      isComplete
                        ? "border-accent bg-accent text-bg shadow-glow"
                        : "border-border bg-bg-card hover:border-accent/60"
                    )}
                    aria-label={isComplete ? `Uncheck ${t.title}` : `Check ${t.title}`}
                  >
                    <AnimatePresence>
                      {isComplete && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 600, damping: 22 }}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isComplete ? "text-accent-glow" : "text-text-muted"
                      )}
                    />
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "text-[13.5px] font-medium leading-tight truncate",
                          isComplete ? "text-white" : "text-text"
                        )}
                      >
                        {t.title}
                      </div>
                      {t.subtitle && (
                        <div className="text-[11.5px] text-text-dim mt-0.5">
                          {t.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {t.detailPlaceholder && (
                  <DetailDrawer
                    date={data.date}
                    taskId={t.id}
                    label={t.detailLabel ?? "Add details"}
                    placeholder={t.detailPlaceholder}
                    initial={data.taskDetails[t.id] ?? ""}
                    required={t.requiresDetail}
                    forceOpen={expandedDetailId === t.id}
                    nudge={expandedDetailId === t.id ? detailNudge : 0}
                    onContentChange={(c) => handleDetailContentChange(t.id, c)}
                  />
                )}
                {isJournal && (
                  <JournalDrawer
                    date={data.date}
                    initial={data.journal}
                    onSaved={(content) => {
                      onChange({ ...data, journal: content });
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionTitle>Weight</SectionTitle>
        <WeightInline
          date={data.date}
          initial={data.weight}
          previous={data.previousWeight}
        />
      </section>

      <section>
        <SectionTitle>Notes</SectionTitle>
        <NotesInline date={data.date} initial={data.notes} />
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-medium">
      {children}
    </h3>
  );
}

function DetailDrawer({
  date,
  taskId,
  label,
  placeholder,
  initial,
  required,
  forceOpen,
  nudge,
  onContentChange,
}: {
  date: string;
  taskId: number;
  label: string;
  placeholder: string;
  initial: string;
  required?: boolean;
  forceOpen?: boolean;
  nudge?: number;
  onContentChange?: (content: string) => void;
}) {
  const [open, setOpen] = useState(Boolean(initial) || (required && forceOpen) || false);
  const [value, setValue] = useState(initial);
  const last = useRef(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [shake, setShake] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [forceOpen, nudge]);

  useEffect(() => {
    if (nudge && required && value.trim().length === 0) {
      setShake((s) => s + 1);
    }
  }, [nudge, required, value]);

  useEffect(() => {
    if (value === last.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await saveTaskDetailAction(date, taskId, value);
      if (res.ok) {
        last.current = value;
        setSavedAt(Date.now());
        onContentChange?.(value);
      }
    }, 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, date, taskId, onContentChange]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 border-t text-[11px] uppercase tracking-[0.16em] font-medium transition-colors",
          required
            ? "border-accent/20 text-accent-glow hover:bg-accent/5"
            : "border-border-subtle text-text-dim hover:text-accent-glow hover:bg-accent/5"
        )}
      >
        <span>{open ? "Hide" : label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 24 }}
        >
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <motion.textarea
                ref={textareaRef}
                rows={2}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                animate={shake > 0 ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
                key={shake}
                className={cn(
                  "w-full resize-y rounded-lg bg-bg-card border px-3 py-2 text-[13px] text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-all",
                  required && value.trim().length === 0
                    ? "border-accent/40"
                    : "border-border-subtle"
                )}
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-text-dim">
                {required && value.trim().length === 0 ? (
                  <span className="text-accent-glow">Required to mark complete</span>
                ) : (
                  <span className="tabular-nums">{value.length} chars</span>
                )}
                <SavedFlash savedAt={savedAt} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function JournalDrawer({
  date,
  initial,
  onSaved,
}: {
  date: string;
  initial: string;
  onSaved: (content: string) => void;
}) {
  const [open, setOpen] = useState(Boolean(initial));
  const [value, setValue] = useState(initial);
  const last = useRef(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (value === last.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await saveJournalAction(date, value);
      if (res.ok) {
        last.current = value;
        onSaved(value);
        setSavedAt(Date.now());
      }
    }, 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, date, onSaved]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border-t border-border-subtle text-[11px] uppercase tracking-[0.16em] font-medium text-text-dim hover:text-accent-glow hover:bg-accent/5 transition-colors"
      >
        <span>{open ? "Hide journal" : "Open journal"}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 24 }}
        >
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <textarea
                rows={4}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Reflect on the day. What went well? What was hard?"
                className="w-full resize-y rounded-lg bg-bg-card border border-border-subtle px-3 py-2 text-[13px] leading-relaxed text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-all"
              />
              <SavedFlash savedAt={savedAt} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SavedFlash({ savedAt }: { savedAt: number | null }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!savedAt) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1200);
    return () => clearTimeout(t);
  }, [savedAt]);
  return (
    <div className="mt-1.5 h-3 flex justify-end text-[11px]">
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-accent-glow"
          >
            Saved
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotesInline({ date, initial }: { date: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const last = useRef(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (value === last.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await saveNotesAction(date, value);
      if (res.ok) {
        last.current = value;
        setSavedAt(Date.now());
      }
    }, 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, date]);

  return (
    <div className="mt-3 rounded-xl border border-border-subtle bg-bg-elevated overflow-hidden">
      <textarea
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Quick capture · meals, workouts, wins, frictions…"
        className="w-full resize-y bg-transparent px-4 py-3 text-[14px] leading-relaxed text-text placeholder:text-text-dim caret-accent focus:outline-none"
      />
      <div className="px-4 py-2 border-t border-border-subtle text-right">
        <SavedFlash savedAt={savedAt} />
      </div>
    </div>
  );
}

function PhotoRow({
  date,
  photo,
  completed,
  onChange,
}: {
  date: string;
  photo: { filename: string; mime: string | null } | null;
  completed: boolean;
  onChange: (p: { filename: string; mime: string | null } | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("date", date);
    fd.append("file", file);
    const res = await uploadProgressPhotoAction(fd);
    setUploading(false);
    if (!res.ok) {
      setError(res.error ?? "Upload failed.");
      return;
    }
    onChange({ filename: res.filename, mime: file.type });
  }

  async function handleDelete() {
    const res = await deleteProgressPhotoAction(date);
    if (res.ok) onChange(null);
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          if (fileRef.current) fileRef.current.value = "";
        }}
      />
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-md border flex-shrink-0",
            completed
              ? "border-accent bg-accent text-bg shadow-glow"
              : "border-border bg-bg-card"
          )}
        >
          {completed && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        <Camera
          className={cn(
            "h-4 w-4 flex-shrink-0",
            completed ? "text-accent-glow" : "text-text-muted"
          )}
        />
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "text-[13.5px] font-medium leading-tight",
              completed ? "text-white" : "text-text"
            )}
          >
            Progress photo
          </div>
          {error ? (
            <div className="text-[11.5px] text-state-miss mt-0.5">{error}</div>
          ) : (
            <div className="text-[11.5px] text-text-dim mt-0.5">
              {photo
                ? `${photo.mime?.split("/")[1]?.toUpperCase() ?? "Image"} stored`
                : "Upload an image to mark complete"}
            </div>
          )}
        </div>
        {photo ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-muted hover:text-accent-glow hover:bg-accent/5 transition-colors"
            >
              <Eye className="h-3 w-3" />
              View
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-muted hover:text-accent-glow hover:bg-accent/5 transition-colors"
            >
              <ImagePlus className="h-3 w-3" />
              Replace
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={uploading}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-muted hover:text-state-miss hover:bg-state-miss/10 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-[12px] font-medium text-accent-glow hover:bg-accent/15 transition-colors"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        )}
      </div>
      {photo && (
        <Dialog.Root open={preview} onOpenChange={setPreview}>
          <AnimatePresence>
            {preview && (
              <Dialog.Portal forceMount>
                <Dialog.Overlay asChild>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black/85 backdrop-blur"
                  />
                </Dialog.Overlay>
                <Dialog.Content
                  forceMount
                  className="fixed inset-0 z-[60] flex items-center justify-center p-6 pointer-events-none focus:outline-none"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                    className="relative max-h-[88vh] max-w-[88vw] pointer-events-auto"
                  >
                    <Dialog.Title className="sr-only">
                      Progress photo for {date}
                    </Dialog.Title>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/progress-photos/${photo.filename}`}
                      alt={`Progress photo for ${date}`}
                      className="max-h-[88vh] max-w-[88vw] rounded-2xl border border-border bg-bg-card object-contain shadow-card"
                    />
                  </motion.div>
                </Dialog.Content>
              </Dialog.Portal>
            )}
          </AnimatePresence>
        </Dialog.Root>
      )}
    </div>
  );
}

function WeightInline({
  date,
  initial,
  previous,
}: {
  date: string;
  initial: number | null;
  previous: { date: string; weight: number } | null;
}) {
  const [raw, setRaw] = useState(initial != null ? String(initial) : "");
  const last = useRef<number | null>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const trimmed = raw.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    if (parsed != null && !Number.isFinite(parsed)) return;
    if (parsed === last.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await saveWeightAction(date, parsed);
      if (res.ok) {
        last.current = parsed;
        setSavedAt(Date.now());
      }
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [raw, date]);

  const current = (() => {
    const t = raw.trim();
    if (t === "") return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  })();
  const delta =
    current != null && previous != null
      ? Math.round((current - previous.weight) * 10) / 10
      : null;

  return (
    <div className="mt-3 flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-elevated px-4 py-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent-glow border border-accent/20">
        <Scale className="h-4 w-4" />
      </span>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="—"
          className={cn(
            "w-28 bg-bg-card rounded-lg border border-border-subtle",
            "px-3 py-2 text-xl font-semibold tracking-tight tabular-nums text-text",
            "placeholder:text-text-dim placeholder:font-normal",
            "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-all",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          )}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-dim font-mono pointer-events-none">
          lbs
        </span>
      </div>
      <div className="flex-1 text-[12px] text-text-dim">
        {delta != null ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums",
              delta < 0
                ? "border-accent/30 bg-accent/10 text-accent-glow"
                : delta > 0
                ? "border-state-partial/30 bg-state-partial/10 text-state-partial"
                : "border-border-subtle bg-bg-card text-text-muted"
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)} lbs · vs {previous!.date}
          </span>
        ) : previous ? (
          <>
            Last logged{" "}
            <span className="text-text-muted tabular-nums">
              {previous.weight}
            </span>{" "}
            on {previous.date}
          </>
        ) : (
          "No prior entries yet."
        )}
      </div>
      <SavedFlash savedAt={savedAt} />
    </div>
  );
}
