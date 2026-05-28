"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { saveNotesAction } from "@/app/actions";
import { cn } from "@/lib/utils";

type Props = {
  date: string;
  initial: string;
  disabled?: boolean;
};

export function NotesField({ date, initial, disabled }: Props) {
  const [value, setValue] = useState(initial);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = useRef(initial);

  useEffect(() => {
    if (value === last.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await saveNotesAction(date, value);
      last.current = value;
      setSavedAt(Date.now());
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, date]);

  return (
    <div className="group rounded-2xl border border-border bg-bg-card overflow-hidden relative transition-colors focus-within:border-accent/40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-50 group-focus-within:opacity-100 transition-opacity"
      />
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <div>
          <h3 className="text-sm font-medium tracking-tight">What did you do today?</h3>
          <p className="text-xs text-text-dim mt-0.5">Quick capture · saves automatically</p>
        </div>
        <SavedHint savedAt={savedAt} />
      </div>
      <textarea
        disabled={disabled}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Workouts, meals, wins, frictions…"
        className={cn(
          "w-full min-h-[140px] resize-y bg-transparent",
          "px-5 py-4 text-[15px] leading-relaxed text-text placeholder:text-text-dim",
          "caret-accent focus:outline-none"
        )}
      />
    </div>
  );
}

function SavedHint({ savedAt }: { savedAt: number | null }) {
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
          className="text-xs text-accent-glow"
        >
          Saved
        </motion.span>
      )}
    </AnimatePresence>
  );
}
