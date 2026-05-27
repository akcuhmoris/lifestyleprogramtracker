"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Camera,
  Check,
  Home,
  PenLine,
  RotateCcw,
  Settings as SettingsIcon,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SEEN_KEY = "lifestyleprogram_seen_welcome_v1";
export const OPEN_WELCOME_EVENT = "welcome:open";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY) !== "1") {
        setOpen(true);
      }
    } catch {
      /* localStorage not available */
    }

    function handler() {
      setOpen(true);
    }
    window.addEventListener(OPEN_WELCOME_EVENT, handler);
    return () => window.removeEventListener(OPEN_WELCOME_EVENT, handler);
  }, []);

  function handleClose() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content
              forceMount
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none focus:outline-none"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className={cn(
                  "w-[94vw] max-w-2xl max-h-[90vh] overflow-y-auto",
                  "pointer-events-auto rounded-2xl border border-border bg-bg-card shadow-card"
                )}
              >
                <Header onClose={handleClose} />
                <div className="px-6 py-6 space-y-5">
                  <Intro />
                  <StepList />
                  <Privacy />
                </div>
                <Footer onClose={handleClose} />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border-subtle">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-bg shadow-glow flex-shrink-0">
          <Target className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <Dialog.Title className="text-base font-semibold text-text">
            Welcome to Program
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-[13px] text-text-muted leading-relaxed">
            A local-first tracker for any lifestyle program — your tasks, your length, your rules. Here&apos;s how it works.
          </Dialog.Description>
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

function Intro() {
  return (
    <p className="text-[14px] text-text-muted leading-relaxed">
      You start with a 100-day default template. Customize the length and tasks any time from{" "}
      <SettingsLink />. Every check, weigh-in, photo, and journal entry is saved locally on your laptop — nothing leaves your machine.
    </p>
  );
}

function SettingsLink() {
  return (
    <Link
      href="/settings"
      className="inline-flex items-center gap-1 text-accent-glow hover:underline"
    >
      Settings
      <SettingsIcon className="h-3 w-3" strokeWidth={2.5} />
    </Link>
  );
}

function StepList() {
  return (
    <ol className="space-y-3">
      <Step
        n={1}
        icon={Home}
        title="Each day: open Today, complete your tasks"
        body="Tap a card to check it off. Cards that require text (like workouts) open a small drawer to log what you did. The progress bar fills as you go; finish them all and the page celebrates."
      />
      <Step
        n={2}
        icon={PenLine}
        title="Capture context"
        body="Below the cards you'll find a daily notes field and a weight check-in — both autosave. The Journal task opens a longer reflection modal, and the Photo task uploads a progress picture."
      />
      <Step
        n={3}
        icon={Calendar}
        title="See your run in Calendar"
        body="Every day becomes a cell colored by completion: dim (future / untouched), red (missed), yellow (partial), blue (full). Tap any past day to edit it — perfect for forgotten check-offs."
      />
      <Step
        n={4}
        icon={BarChart3}
        title="Track progress in Stats"
        body="Per-task completion rates, total water / workout minutes / pages, weight trend sparkline, and overall full / partial / missed counts."
      />
      <Step
        n={5}
        icon={RotateCcw}
        title="Miss a day? Pick a path"
        body="Top of Today shows a banner: Restart from Day 1 (strict rules — archives the current attempt and starts fresh) or Keep going (the miss stays but the counter keeps advancing)."
      />
      <Step
        n={6}
        icon={SettingsIcon}
        title="Make it yours"
        body="Settings lets you change the program length (1–365 days), add/remove/reorder tasks, swap icons, mark a task as Journal or Photo, and toggle 'requires text' on any task."
      />
    </ol>
  );
}

function Step({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-elevated p-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/30 text-accent-glow flex-shrink-0 font-semibold text-[13px] tabular-nums">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-accent-glow flex-shrink-0" strokeWidth={2.5} />
          <span className="text-[13.5px] font-semibold text-text">{title}</span>
        </div>
        <p className="mt-1 text-[12.5px] text-text-muted leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

function Privacy() {
  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 flex items-start gap-2.5">
      <Sparkles className="h-3.5 w-3.5 text-accent-glow mt-0.5 flex-shrink-0" strokeWidth={2.5} />
      <div className="text-[12.5px] text-text-muted leading-relaxed">
        <span className="text-accent-glow font-medium">100% local.</span>{" "}
        Data lives in <span className="font-mono text-text">hardtracker.db</span> in your project folder; photos live in <span className="font-mono text-text">public/progress-photos/</span>. Both are gitignored. Back up by copying those files.
      </div>
    </div>
  );
}

function Footer({ onClose }: { onClose: () => void }) {
  return (
    <footer className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-border-subtle">
      <Link
        href="/settings"
        onClick={onClose}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-bg-card px-3.5 py-2 text-[13px] font-medium text-text hover:border-accent/40 hover:text-accent-glow transition-colors"
      >
        <SettingsIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
        Customize first
      </Link>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-bg shadow-glow hover:brightness-110 transition-all"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.8} />
        Got it — start Day 1
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </footer>
  );
}

export function openWelcome() {
  window.dispatchEvent(new Event(OPEN_WELCOME_EVENT));
}
