"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Camera,
  Check,
  ChevronDown,
  Pencil,
  PenLine,
  Plus,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ICON_NAMES, ICONS, getIcon, type IconName } from "@program/shared/icons";
import type { Task } from "@program/shared/tasks";
import {
  deleteTaskAction,
  reorderTasksAction,
  saveTaskAction,
  saveTotalDaysAction,
} from "@/app/actions";

type Props = {
  initialTotalDays: number;
  initialTasks: Task[];
};

type Editing =
  | { mode: "create" }
  | { mode: "edit"; task: Task }
  | null;

export function SettingsForm({ initialTotalDays, initialTasks }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [totalDays, setTotalDaysState] = useState(initialTotalDays);
  const [days, setDays] = useState(String(initialTotalDays));
  const [daysSavedAt, setDaysSavedAt] = useState<number | null>(null);
  const [daysError, setDaysError] = useState<string | null>(null);
  const daysTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editing, setEditing] = useState<Editing>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);
  useEffect(() => {
    setTotalDaysState(initialTotalDays);
    setDays(String(initialTotalDays));
  }, [initialTotalDays]);

  useEffect(() => {
    const n = Number(days);
    if (!Number.isFinite(n)) return;
    if (n === totalDays) return;
    if (daysTimer.current) clearTimeout(daysTimer.current);
    daysTimer.current = setTimeout(async () => {
      const res = await saveTotalDaysAction(n);
      if (res.ok) {
        setTotalDaysState(n);
        setDaysSavedAt(Date.now());
        setDaysError(null);
      } else {
        setDaysError(res.error ?? "Couldn't save.");
      }
    }, 600);
    return () => {
      if (daysTimer.current) clearTimeout(daysTimer.current);
    };
  }, [days, totalDays]);

  async function handleSaveTask(input: TaskFormValue) {
    const res = await saveTaskAction({
      id: editing?.mode === "edit" ? editing.task.id : undefined,
      title: input.title,
      subtitle: input.subtitle,
      icon: input.icon,
      kind: input.kind,
      requiresDetail: input.requiresDetail,
      detailLabel: input.detailLabel,
      detailPlaceholder: input.detailPlaceholder,
    });
    if (res.ok) {
      setEditing(null);
      router.refresh();
    }
  }

  async function handleDelete(id: number) {
    await deleteTaskAction(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  }

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= tasks.length) return;
    const next = tasks.slice();
    const tmp = next[idx];
    next[idx] = next[j];
    next[j] = tmp;
    setTasks(next);
    await reorderTasksAction(next.map((t) => t.id));
    router.refresh();
  }

  const hasJournal = tasks.some((t) => t.kind === "journal");
  const hasPhoto = tasks.some((t) => t.kind === "photo");

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-bg-card p-6">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-medium">
          Challenge length
        </h2>
        <div className="mt-3 flex items-end gap-4">
          <div>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className={cn(
                  "w-32 bg-bg-elevated rounded-xl border border-border-subtle",
                  "px-4 py-3 text-3xl font-semibold tracking-tight tabular-nums text-text",
                  "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-all",
                  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-dim font-mono pointer-events-none">
                days
              </span>
            </div>
            {daysError && (
              <p className="mt-1 text-xs text-state-miss">{daysError}</p>
            )}
          </div>
          <div className="flex-1 pb-3">
            <p className="text-sm text-text-muted">
              Calendar and stats use this number. Default is 100. Range 1–365.
            </p>
            <SavedFlash savedAt={daysSavedAt} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-medium">
              Daily requirements
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Add, edit, reorder, or delete the tasks you&apos;ll check off each day.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing({ mode: "create" })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-bg shadow-glow hover:brightness-110 transition-all"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.8} />
            Add task
          </button>
        </div>

        <ul className="mt-5 space-y-2">
          {tasks.length === 0 && (
            <li className="rounded-xl border border-dashed border-border-subtle bg-bg-elevated px-4 py-8 text-center text-sm text-text-dim">
              No tasks yet. Add your first one to get started.
            </li>
          )}
          {tasks.map((t, i) => (
            <TaskRow
              key={t.id}
              task={t}
              first={i === 0}
              last={i === tasks.length - 1}
              onEdit={() => setEditing({ mode: "edit", task: t })}
              onDelete={() => handleDelete(t.id)}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
            />
          ))}
        </ul>
      </section>

      <p className="text-xs text-text-dim">
        Tip: at most one task can be marked as the <span className="text-accent-glow">Journal</span>{" "}
        and one as the <span className="text-accent-glow">Photo</span>. These get
        special UI (a modal for journaling, a file picker + thumbnail for the
        photo). Currently:{" "}
        {hasJournal ? "journal ✓" : "no journal"} ·{" "}
        {hasPhoto ? "photo ✓" : "no photo"}
      </p>

      <TaskEditor
        editing={editing}
        existingKinds={{
          journalId: tasks.find((t) => t.kind === "journal")?.id ?? null,
          photoId: tasks.find((t) => t.kind === "photo")?.id ?? null,
        }}
        onCancel={() => setEditing(null)}
        onSave={handleSaveTask}
      />
    </div>
  );
}

function TaskRow({
  task,
  first,
  last,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  task: Task;
  first: boolean;
  last: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const Icon = getIcon(task.icon);
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-elevated px-3 py-2.5">
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          disabled={first}
          onClick={onMoveUp}
          className="text-text-dim hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Move up"
        >
          <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          disabled={last}
          onClick={onMoveDown}
          className="text-text-dim hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Move down"
        >
          <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>

      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-xl border flex-shrink-0",
          task.kind === "journal"
            ? "border-accent/40 bg-accent/10 text-accent-glow"
            : task.kind === "photo"
            ? "border-accent/40 bg-accent/10 text-accent-glow"
            : "border-border-subtle bg-bg-card text-text-muted"
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium leading-tight truncate">
          {task.title}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-text-dim">
          {task.subtitle && <span className="truncate">{task.subtitle}</span>}
          {task.kind === "journal" && (
            <Pill icon={PenLine} label="Journal" />
          )}
          {task.kind === "photo" && <Pill icon={Camera} label="Photo" />}
          {task.requiresDetail && <Pill label="Requires text" />}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-text-muted hover:text-accent-glow hover:bg-accent/5 transition-colors"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
        {confirming ? (
          <>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                onDelete();
              }}
              className="inline-flex items-center gap-1 rounded-md bg-state-miss/15 border border-state-miss/40 px-2 py-1 text-[12px] font-semibold text-state-miss hover:bg-state-miss/25 transition-colors"
            >
              <Check className="h-3 w-3" />
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-md px-2 py-1 text-[12px] font-medium text-text-muted hover:text-text"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-text-muted hover:text-state-miss hover:bg-state-miss/10 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        )}
      </div>
    </li>
  );
}

function Pill({
  icon: Icon,
  label,
}: {
  icon?: LucideIcon;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-bg-card px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.12em] text-text-muted">
      {Icon && <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />}
      {label}
    </span>
  );
}

function SavedFlash({ savedAt }: { savedAt: number | null }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!savedAt) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(t);
  }, [savedAt]);
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="ml-1 text-xs text-accent-glow"
        >
          Saved
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ---------- Task editor dialog ----------

type TaskFormValue = {
  title: string;
  subtitle: string | null;
  icon: string;
  kind: Task["kind"];
  requiresDetail: boolean;
  detailLabel: string | null;
  detailPlaceholder: string | null;
};

function TaskEditor({
  editing,
  existingKinds,
  onCancel,
  onSave,
}: {
  editing: Editing;
  existingKinds: { journalId: number | null; photoId: number | null };
  onCancel: () => void;
  onSave: (value: TaskFormValue) => void;
}) {
  const open = editing !== null;
  const current = editing?.mode === "edit" ? editing.task : null;

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [icon, setIcon] = useState<IconName>("ListChecks");
  const [kind, setKind] = useState<Task["kind"]>("check");
  const [requiresDetail, setRequiresDetail] = useState(false);
  const [detailLabel, setDetailLabel] = useState("");
  const [detailPlaceholder, setDetailPlaceholder] = useState("");

  useEffect(() => {
    if (!open) return;
    if (current) {
      setTitle(current.title);
      setSubtitle(current.subtitle ?? "");
      setIcon((ICON_NAMES.includes(current.icon as IconName)
        ? current.icon
        : "ListChecks") as IconName);
      setKind(current.kind);
      setRequiresDetail(current.requiresDetail);
      setDetailLabel(current.detailLabel ?? "");
      setDetailPlaceholder(current.detailPlaceholder ?? "");
    } else {
      setTitle("");
      setSubtitle("");
      setIcon("ListChecks");
      setKind("check");
      setRequiresDetail(false);
      setDetailLabel("");
      setDetailPlaceholder("");
    }
  }, [open, current]);

  const journalTaken =
    existingKinds.journalId != null && existingKinds.journalId !== current?.id;
  const photoTaken =
    existingKinds.photoId != null && existingKinds.photoId !== current?.id;

  function handleSubmit() {
    if (!title.trim()) return;
    onSave({
      title,
      subtitle: subtitle.trim() || null,
      icon,
      kind,
      requiresDetail: kind === "check" ? requiresDetail : false,
      detailLabel:
        kind === "check" && (requiresDetail || detailLabel.trim())
          ? detailLabel.trim() || null
          : null,
      detailPlaceholder:
        kind === "check" && (requiresDetail || detailPlaceholder.trim())
          ? detailPlaceholder.trim() || null
          : null,
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
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
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                className="w-[94vw] max-w-xl max-h-[88vh] overflow-y-auto pointer-events-auto rounded-2xl border border-border bg-bg-card shadow-card"
              >
                <header className="flex items-start justify-between gap-3 px-6 py-5 border-b border-border-subtle">
                  <div>
                    <Dialog.Title className="text-sm font-semibold text-text">
                      {current ? "Edit task" : "Add task"}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-[12.5px] text-text-muted">
                      Set what shows up on the today view.
                    </Dialog.Description>
                  </div>
                  <button
                    onClick={onCancel}
                    className="text-text-muted hover:text-text rounded-md p-1.5 hover:bg-bg-hover transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>
                <div className="p-6 space-y-5">
                  <Field label="Title">
                    <input
                      autoFocus
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Drink 1 gallon of water"
                      className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-[14px] text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-all"
                    />
                  </Field>
                  <Field label="Subtitle (optional)">
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="A short hint shown under the title"
                      className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-[14px] text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-all"
                    />
                  </Field>

                  <Field label="Icon">
                    <IconPicker value={icon} onChange={setIcon} />
                  </Field>

                  <Field label="Type">
                    <div className="grid grid-cols-3 gap-2">
                      <KindOption
                        active={kind === "check"}
                        onClick={() => setKind("check")}
                        label="Checkbox"
                        hint="Standard tap-to-toggle"
                      />
                      <KindOption
                        active={kind === "journal"}
                        disabled={journalTaken}
                        onClick={() => setKind("journal")}
                        label="Journal"
                        hint={journalTaken ? "Already used" : "Opens a write modal"}
                      />
                      <KindOption
                        active={kind === "photo"}
                        disabled={photoTaken}
                        onClick={() => setKind("photo")}
                        label="Photo"
                        hint={photoTaken ? "Already used" : "Upload an image"}
                      />
                    </div>
                  </Field>

                  {kind === "check" && (
                    <>
                      <Field
                        label="Require text to mark complete"
                        hint="Like a workout — the user has to write what they did before the checkbox flips."
                      >
                        <Toggle
                          checked={requiresDetail}
                          onChange={setRequiresDetail}
                        />
                      </Field>
                      {(requiresDetail || detailLabel || detailPlaceholder) && (
                        <>
                          <Field label="Detail-drawer label">
                            <input
                              type="text"
                              value={detailLabel}
                              onChange={(e) => setDetailLabel(e.target.value)}
                              placeholder="e.g. What did you do?"
                              className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-[14px] text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-all"
                            />
                          </Field>
                          <Field label="Placeholder text">
                            <input
                              type="text"
                              value={detailPlaceholder}
                              onChange={(e) => setDetailPlaceholder(e.target.value)}
                              placeholder="e.g. Push day · bench, OHP, dips, triceps"
                              className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-[14px] text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-all"
                            />
                          </Field>
                        </>
                      )}
                    </>
                  )}
                </div>
                <footer className="flex justify-end gap-2 px-6 py-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-border bg-bg-card px-3.5 py-2 text-[13px] font-medium text-text hover:border-accent/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!title.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-bg shadow-glow hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.8} />
                    {current ? "Save changes" : "Add task"}
                  </button>
                </footer>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em] text-text-dim font-medium">
        {label}
      </span>
      {hint && <span className="block mt-0.5 text-[12px] text-text-muted">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function KindOption({
  active,
  disabled,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-xl border p-3 text-left transition-all",
        active
          ? "border-accent/60 bg-accent/10 shadow-glow"
          : "border-border-subtle bg-bg-elevated hover:border-accent/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "text-[13px] font-medium",
          active ? "text-accent-glow" : "text-text"
        )}
      >
        {label}
      </div>
      <div className="mt-0.5 text-[11.5px] text-text-dim">{hint}</div>
    </button>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors",
        checked
          ? "border-accent bg-accent shadow-glow"
          : "border-border bg-bg-elevated"
      )}
    >
      <motion.span
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "inline-block h-5 w-5 rounded-full",
          checked ? "bg-bg" : "bg-text-muted"
        )}
      />
    </button>
  );
}

function IconPicker({
  value,
  onChange,
}: {
  value: IconName;
  onChange: (name: IconName) => void;
}) {
  const [open, setOpen] = useState(false);
  const Current = ICONS[value];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 hover:border-accent/30 transition-colors"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 border border-accent/20 text-accent-glow">
          <Current className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="flex-1 text-left text-[13.5px] text-text">{value}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-text-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute z-10 mt-2 w-full rounded-xl border border-border bg-bg-card shadow-card p-2"
          >
            <div className="grid grid-cols-6 gap-1">
              {ICON_NAMES.map((name) => {
                const Icon = ICONS[name];
                const active = name === value;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                    title={name}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-lg border transition-colors",
                      active
                        ? "border-accent bg-accent/15 text-accent-glow shadow-glow"
                        : "border-border-subtle bg-bg-elevated text-text-muted hover:border-accent/40 hover:text-accent-glow"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
