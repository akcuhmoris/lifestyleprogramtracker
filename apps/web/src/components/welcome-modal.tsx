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
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const WELCOME_SEEN_KEY = "lifestyleprogram_seen_welcome_v1";
export const OPEN_WELCOME_EVENT = "welcome:open";

/** Suppress the welcome modal's auto-pop on the next page load. */
export function markWelcomeSeen() {
  try {
    localStorage.setItem(WELCOME_SEEN_KEY, "1");
  } catch {
    /* storage disabled — no-op */
  }
}
// Hide the welcome modal on auth/onboarding flows AND on every public-facing
// marketing/legal surface — visitors shouldn't see an app-tour popup.
const HIDE_PATHS = [
  "/login",
  "/signup",
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/about",
  "/privacy",
  "/terms",
  "/help",
  "/changelog",
];

const PUBLIC_ROOTS = new Set(["/"]); // exact matches only — '/' shouldn't shadow '/today' etc.

export function WelcomeModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const onAuthPath =
    PUBLIC_ROOTS.has(pathname) ||
    HIDE_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );

  useEffect(() => {
    if (onAuthPath) return;
    try {
      if (localStorage.getItem(WELCOME_SEEN_KEY) !== "1") {
        setOpen(true);
      }
    } catch {
      /* localStorage not available */
    }

    function handler() {
      if (onAuthPath) return;
      setOpen(true);
    }
    window.addEventListener(OPEN_WELCOME_EVENT, handler);
    return () => window.removeEventListener(OPEN_WELCOME_EVENT, handler);
  }, [onAuthPath]);

  function handleClose() {
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o: boolean) => (o ? setOpen(true) : handleClose())}>
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
              onOpenAutoFocus={(e: Event) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className={cn(
                  "w-[94vw] max-w-2xl max-h-[90vh] overflow-y-auto",
                  "pointer-events-auto rounded-2xl border border-white/[0.08]"
                )}
                style={{
                  background: "var(--surface)",
                  boxShadow:
                    "0 30px 80px -40px rgba(0,0,0,0.7), 0 0 40px -20px var(--accent-glow)",
                }}
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
    <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/[0.06]">
      <div className="flex items-start gap-3">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
            boxShadow: "0 0 24px -8px var(--accent-glow)",
          }}
        >
          <Target className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <Dialog.Title
            className="text-base font-semibold"
            style={{ color: "var(--text)" }}
          >
            Welcome to Lifestyle Program Tracker
          </Dialog.Title>
          <Dialog.Description
            className="mt-1 text-[13px] leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            A tracker for any lifestyle program — your tasks, your length, your rules. Here&apos;s how it works.
          </Dialog.Description>
        </div>
      </div>
      <button
        onClick={onClose}
        className="rounded-md p-1.5 transition-colors hover:bg-white/[0.06]"
        style={{ color: "var(--text-muted)" }}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </header>
  );
}

function Intro() {
  return (
    <p
      className="text-[14px] leading-relaxed"
      style={{ color: "var(--text-muted)" }}
    >
      Pick a program (75 Hard, 100 Hard, or your own), tick off your tasks each day, and level up as you go. You start with a 100-day default template — customize the length, tasks, and rules any time from{" "}
      <SettingsLink />.
    </p>
  );
}

function SettingsLink() {
  return (
    <Link
      href="/settings"
      className="inline-flex items-center gap-1 hover:underline"
      style={{ color: "var(--accent)" }}
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
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <li
      className="flex items-start gap-3 rounded-xl border border-white/[0.06] p-3"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border flex-shrink-0 font-semibold text-[13px] tabular-nums"
        style={{
          background: "rgba(165,180,252,0.10)",
          borderColor: "rgba(165,180,252,0.30)",
          color: "var(--accent)",
        }}
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Icon
            className="h-3.5 w-3.5 flex-shrink-0"
            strokeWidth={2.5}
            style={{ color: "var(--accent)" }}
          />
          <span
            className="text-[13.5px] font-semibold"
            style={{ color: "var(--text)" }}
          >
            {title}
          </span>
        </div>
        <p
          className="mt-1 text-[12.5px] leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {body}
        </p>
      </div>
    </li>
  );
}

function Privacy() {
  return (
    <div
      className="rounded-xl border p-3 flex items-start gap-2.5"
      style={{
        borderColor: "rgba(165,180,252,0.25)",
        background: "rgba(165,180,252,0.05)",
      }}
    >
      <Sparkles
        className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
        strokeWidth={2.5}
        style={{ color: "var(--accent)" }}
      />
      <div
        className="text-[12.5px] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="font-medium" style={{ color: "var(--accent)" }}>
          Your data, your account.
        </span>{" "}
        Everything syncs to your account so it follows you across devices and the web. You can export or delete it anytime in{" "}
        <Link
          href="/settings"
          className="hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Settings &rarr; Account
        </Link>
        . We don&apos;t sell your data — see our{" "}
        <Link
          href="/privacy"
          className="hover:underline"
          style={{ color: "var(--accent)" }}
        >
          privacy page
        </Link>{" "}
        for details.
      </div>
    </div>
  );
}

function Footer({ onClose }: { onClose: () => void }) {
  return (
    <footer className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-white/[0.06]">
      <Link
        href="/settings"
        onClick={onClose}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] px-3.5 py-2 text-[13px] font-medium transition-colors hover:border-white/[0.18]"
        style={{ background: "rgba(255,255,255,0.02)", color: "var(--text)" }}
      >
        <SettingsIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
        Customize first
      </Link>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all hover:brightness-110"
        style={{
          background: "var(--accent)",
          color: "var(--bg)",
          boxShadow: "0 0 24px -8px var(--accent-glow)",
        }}
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
