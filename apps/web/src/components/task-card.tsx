"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { smallBurst } from "./confetti";
import { saveTaskDetailAction } from "@/app/actions";

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  completed: boolean;
  disabled?: boolean;
  onToggle: (next: boolean) => Promise<void> | void;
  onActivate?: () => void;

  /** Optional detail drawer (workouts / reading). */
  date?: string;
  detailLabel?: string;
  detailPlaceholder?: string;
  initialDetail?: string;
  /** If true, the checkbox is driven by detail content (non-empty = checked). */
  requiresDetail?: boolean;
};

export function TaskCard({
  id,
  title,
  subtitle,
  icon: Icon,
  completed,
  disabled,
  onToggle,
  onActivate,
  date,
  detailLabel,
  detailPlaceholder,
  initialDetail = "",
  requiresDetail = false,
}: Props) {
  const hasDrawer = Boolean(detailPlaceholder && date);

  const [isPending, startTransition] = useTransition();
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [open, setOpen] = useState(Boolean(initialDetail) || (requiresDetail && completed));
  const [nudge, setNudge] = useState(0);
  const rippleId = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleMainClick() {
    if (disabled || isPending) return;
    if (onActivate) {
      onActivate();
      return;
    }
    if (requiresDetail) {
      // Open drawer + focus textarea. Don't toggle directly.
      setOpen(true);
      setNudge((n) => n + 1);
      setTimeout(() => textareaRef.current?.focus(), 60);
      return;
    }
    flipState();
  }

  function handleDetailContentChange(content: string) {
    if (!requiresDetail) return;
    const hasContent = content.trim().length > 0;
    if (hasContent && !completed) {
      startTransition(async () => {
        await onToggle(true);
      });
    } else if (!hasContent && completed) {
      startTransition(async () => {
        await onToggle(false);
      });
    }
  }

  function flipState() {
    const next = !completed;
    if (next && requiresDetail) {
      // Block direct toggle when text is required.
      setOpen(true);
      setNudge((n) => n + 1);
      setTimeout(() => textareaRef.current?.focus(), 60);
      return;
    }
    if (next && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const cx = (rect.left + rect.width / 2) / window.innerWidth;
      const cy = (rect.top + rect.height / 2) / window.innerHeight;
      smallBurst(cx, cy);

      const rid = ++rippleId.current;
      setRipples((r) => [...r, { id: rid, x: rect.width / 2, y: rect.height / 2 }]);
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== rid)), 700);
    }
    startTransition(async () => {
      await onToggle(next);
    });
  }

  return (
    <motion.div
      ref={cardRef}
      whileHover={disabled ? undefined : { y: -2 }}
      animate={{ scale: pressed ? 0.98 : 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-colors",
        "focus-within:ring-2 focus-within:ring-accent/60",
        disabled && "opacity-40",
        completed
          ? "bg-gradient-to-br from-accent/20 via-accent/8 to-transparent border-accent/50 shadow-glow"
          : "bg-bg-card border-border hover:border-accent/30 hover:bg-bg-hover"
      )}
    >
      {/* Top accent line — subtle blue when uncompleted, brighter when done */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity",
          completed ? "bg-accent/80 opacity-100" : "bg-accent/30 opacity-40 group-hover:opacity-80"
        )}
      />

      <button
        type="button"
        disabled={disabled}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onClick={handleMainClick}
        className={cn(
          "relative w-full text-left px-5 py-5 min-h-[124px] flex flex-col gap-3",
          "focus:outline-none",
          disabled && "cursor-not-allowed"
        )}
      >
        {/* Ripple layer */}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ scale: 0, opacity: 0.55 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute rounded-full bg-accent/35"
              style={{
                left: r.x - 40,
                top: r.y - 40,
                width: 80,
                height: 80,
              }}
            />
          ))}
        </AnimatePresence>

        <div className="flex items-start justify-between gap-3 relative">
          <div
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all",
              completed
                ? "border-accent/50 bg-accent/15 text-accent-glow shadow-[0_0_18px_rgba(14,165,255,0.25)]"
                : "border-border-subtle bg-bg-elevated text-text-muted group-hover:text-accent-glow group-hover:border-accent/30"
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>

          <Checkbox completed={completed} />
        </div>

        <div className="flex-1 flex flex-col justify-end relative">
          <div
            className={cn(
              "text-[15px] font-medium leading-tight tracking-tight transition-colors",
              completed ? "text-white" : "text-text"
            )}
          >
            {title}
          </div>
          {subtitle && (
            <div
              className={cn(
                "text-[12.5px] mt-1 transition-colors",
                completed ? "text-accent-glow/90" : "text-text-dim"
              )}
            >
              {subtitle}
            </div>
          )}
        </div>
      </button>

      {hasDrawer && (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "relative w-full flex items-center justify-between gap-2 px-5 py-2.5",
              "text-[11.5px] uppercase tracking-[0.16em] font-medium",
              "border-t transition-colors",
              completed
                ? "border-accent/25 text-accent-glow hover:bg-accent/5"
                : "border-border-subtle text-text-dim hover:text-accent-glow hover:bg-accent/5"
            )}
          >
            <span>{open ? "Hide details" : detailLabel ?? "Add details"}</span>
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
                key="drawer"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <TaskDetailInput
                    date={date!}
                    taskId={id}
                    initial={initialDetail}
                    placeholder={detailPlaceholder!}
                    disabled={disabled}
                    required={requiresDetail}
                    onContentChange={handleDetailContentChange}
                    textareaRef={textareaRef}
                    nudge={nudge}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

function Checkbox({ completed }: { completed: boolean }) {
  return (
    <motion.span
      animate={{ scale: completed ? [1, 1.25, 1] : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
      className={cn(
        "relative inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
        completed
          ? "border-accent bg-accent text-bg shadow-glow"
          : "border-border bg-bg-elevated group-hover:border-accent/50"
      )}
    >
      <AnimatePresence>
        {completed && (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}

function TaskDetailInput({
  date,
  taskId,
  initial,
  placeholder,
  disabled,
  required,
  onContentChange,
  textareaRef,
  nudge,
}: {
  date: string;
  taskId: string;
  initial: string;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  onContentChange?: (content: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  nudge?: number;
}) {
  const [value, setValue] = useState(initial);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [shake, setShake] = useState(0);
  const last = useRef(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (nudge && required && value.trim().length === 0) {
      setShake((s) => s + 1);
    }
  }, [nudge, required, value]);

  return (
    <div>
      <motion.textarea
        ref={textareaRef}
        disabled={disabled}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={2}
        animate={
          shake > 0
            ? { x: [0, -6, 6, -4, 4, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.35 }}
        key={shake}
        className={cn(
          "w-full resize-y rounded-xl bg-bg-elevated border",
          "px-3.5 py-2.5 text-[13.5px] leading-relaxed text-text placeholder:text-text-dim",
          "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40",
          "transition-all",
          required && value.trim().length === 0
            ? "border-accent/40"
            : "border-border-subtle"
        )}
      />
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-text-dim">
        <span className="tabular-nums">
          {required && value.trim().length === 0 ? (
            <span className="text-accent-glow">Required to mark complete</span>
          ) : (
            `${value.length} chars`
          )}
        </span>
        <SavedHint savedAt={savedAt} />
      </div>
    </div>
  );
}

function SavedHint({ savedAt }: { savedAt: number | null }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!savedAt) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1300);
    return () => clearTimeout(t);
  }, [savedAt]);
  return (
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
  );
}
