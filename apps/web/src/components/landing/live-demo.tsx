"use client";

/**
 * Live demo — interactive task widget on the landing page.
 *
 * Self-contained playground. No props, no server actions, no DB. Lets
 * visitors tap mock tasks, watch an XP bar fill, and feel a level-up
 * before they ever sign up.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  BookOpen,
  Camera,
  Droplet,
  Dumbbell,
  RotateCcw,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character/avatar";
import { cn } from "@/lib/utils";
import { AnimatedHeading } from "./animated-heading";

// ---------------------------------------------------------------------------
// Mock data — kept local to this component
// ---------------------------------------------------------------------------

type DemoTask = {
  id: string;
  icon: LucideIcon;
  label: string;
  reward: number;
};

const TASKS: DemoTask[] = [
  { id: "1", icon: Dumbbell, label: "45-min workout", reward: 5 },
  { id: "2", icon: BookOpen, label: "Read 10 pages", reward: 5 },
  { id: "3", icon: Droplet, label: "Drink 1 gallon of water", reward: 5 },
  { id: "4", icon: Sun, label: "Outdoor workout", reward: 5 },
  { id: "5", icon: Camera, label: "Progress photo", reward: 5 },
];

// XP needed to reach the next level. Keep it small so visitors actually
// trigger a level-up by completing the day + bonus.
const XP_PER_LEVEL = 100;
const DAY_BONUS = 25;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LiveDemo() {
  const reduceMotion = useReducedMotion();

  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [totalXp, setTotalXp] = useState(0);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [showBonusToast, setShowBonusToast] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Used to avoid re-firing level-up confetti for the same threshold crossing.
  const lastLevelRef = useRef(1);

  // Per-task button refs let us anchor a tiny confetti burst to the row that
  // was just checked. canvas-confetti expects origin in viewport coords
  // normalized to [0,1].
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  const pct = Math.min(100, (xpInLevel / XP_PER_LEVEL) * 100);

  const completedCount = useMemo(
    () => TASKS.filter((t) => completed[t.id]).length,
    [completed],
  );
  const allDone = completedCount === TASKS.length;

  // ---------------- side effects ----------------

  // Award the day-complete bonus exactly once per "session" when every
  // task is checked off.
  useEffect(() => {
    if (allDone && !bonusClaimed) {
      setBonusClaimed(true);
      setTotalXp((xp) => xp + DAY_BONUS);
      setShowBonusToast(true);
      const t = window.setTimeout(() => setShowBonusToast(false), 2400);
      return () => window.clearTimeout(t);
    }
  }, [allDone, bonusClaimed]);

  // Fire a small confetti burst + "Level up!" badge when the level
  // increments.
  useEffect(() => {
    if (level > lastLevelRef.current) {
      lastLevelRef.current = level;
      setShowLevelUp(true);

      if (!reduceMotion && typeof window !== "undefined") {
        // Dynamic import keeps canvas-confetti out of the initial bundle.
        import("canvas-confetti")
          .then((mod) => {
            mod.default({
              particleCount: 60,
              spread: 70,
              startVelocity: 32,
              ticks: 140,
              gravity: 1.1,
              scalar: 0.9,
              origin: { y: 0.55 },
              colors: ["#818cf8", "#c084fc", "#f472b6", "#6366f1"],
              disableForReducedMotion: true,
            });
          })
          .catch(() => {
            /* confetti is decorative; ignore load failures */
          });
      }

      const t = window.setTimeout(() => setShowLevelUp(false), 2200);
      return () => window.clearTimeout(t);
    }
  }, [level, reduceMotion]);

  // ---------------- handlers ----------------

  function fireRowConfetti(taskId: string) {
    if (reduceMotion || typeof window === "undefined") return;
    const node = rowRefs.current[taskId];
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = (rect.top + rect.height / 2) / window.innerHeight;

    import("canvas-confetti")
      .then((mod) => {
        mod.default({
          particleCount: 15,
          spread: 60,
          ticks: 80,
          origin: { x: originX, y: originY },
          colors: ["#a5b4fc", "#c084fc"],
          disableForReducedMotion: true,
        });
      })
      .catch(() => {
        /* confetti is decorative; ignore load failures */
      });
  }

  function toggleTask(task: DemoTask) {
    // Compute the next state derived from current snapshots BEFORE calling any
    // setter, so each setState updater stays pure. React 18 StrictMode
    // intentionally double-invokes updaters; nesting side-effects (other
    // setters) inside the updater would over-subtract XP in development.
    const wasComplete = Boolean(completed[task.id]);
    const next = { ...completed };

    if (wasComplete) {
      delete next[task.id];
      const refundBonus = bonusClaimed;
      setCompleted(next);
      setTotalXp((xp) =>
        Math.max(0, xp - task.reward - (refundBonus ? DAY_BONUS : 0))
      );
      if (refundBonus) setBonusClaimed(false);
    } else {
      next[task.id] = true;
      setCompleted(next);
      setTotalXp((xp) => xp + task.reward);
      fireRowConfetti(task.id);
    }
  }

  function reset() {
    setCompleted({});
    setTotalXp(0);
    setBonusClaimed(false);
    setShowBonusToast(false);
    setShowLevelUp(false);
    lastLevelRef.current = 1;
  }

  // ---------------- render ----------------

  return (
    <section id="demo" className="relative py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Eyebrow + headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-3xl"
        >
          <div className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
            Try it
          </div>
          <AnimatedHeading
            as="h2"
            className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl"
          >
            Every check fills your bar.
          </AnimatedHeading>
          <p className="mt-5 text-lg font-normal text-zinc-400">
            Tap a task. Feel it.
          </p>
        </motion.div>

        {/* Demo widget */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e0e12] p-8 shadow-[0_0_60px_-20px_rgba(129,140,248,0.35)]"
        >
          {/* Header — mini hero card */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CharacterAvatar archetype="warrior" tier={1} size="sm" />
              <div className="flex flex-col">
                <span className="text-base font-semibold text-white">
                  Demo Hero
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                  Level {level}
                </span>
              </div>
            </div>

            {/* Level-up badge */}
            <AnimatePresence>
              {showLevelUp ? (
                <motion.div
                  key="levelup"
                  initial={{ opacity: 0, scale: 0.85, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -6 }}
                  transition={{
                    type: "spring",
                    stiffness: 340,
                    damping: 24,
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-200 shadow-[0_0_30px_-8px_rgba(129,140,248,0.6)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_2px_rgba(165,180,252,0.8)]" />
                  Level up!
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* XP bar */}
          <div className="mb-2 flex items-baseline justify-between font-mono text-xs uppercase tracking-wider text-zinc-400">
            <span>XP</span>
            <span>
              {xpInLevel} / {XP_PER_LEVEL}
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full border border-white/[0.06] bg-white/[0.04]">
            <motion.div
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 28,
                mass: 0.6,
              }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_0_18px_2px_rgba(129,140,248,0.55)]"
            />
          </div>

          {/* Task list */}
          <ul className="mt-8 space-y-2">
            {TASKS.map((task) => {
              const Icon = task.icon;
              const isDone = !!completed[task.id];
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    ref={(el) => {
                      rowRefs.current[task.id] = el;
                    }}
                    onClick={() => toggleTask(task)}
                    aria-pressed={isDone}
                    className={cn(
                      "group flex w-full items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-left transition-all duration-200",
                      "hover:border-indigo-400/30 hover:bg-white/[0.04]",
                      isDone &&
                        "border-indigo-400/40 bg-indigo-500/[0.08] shadow-[0_0_24px_-12px_rgba(129,140,248,0.5)]",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition-colors duration-200",
                          "group-hover:text-indigo-300",
                          isDone &&
                            "border-indigo-400/40 bg-indigo-500/10 text-indigo-300",
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                      </span>
                      <span
                        className={cn(
                          "truncate text-base font-medium transition-colors duration-200",
                          isDone
                            ? "text-zinc-400 line-through decoration-zinc-500"
                            : "text-zinc-200",
                        )}
                      >
                        {task.label}
                      </span>
                    </div>

                    <motion.span
                      animate={
                        isDone && !reduceMotion
                          ? { scale: [1, 1.18, 1] }
                          : { scale: 1 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 22,
                      }}
                      className={cn(
                        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 font-mono text-xs font-semibold tracking-wider transition-colors duration-200",
                        isDone
                          ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-200"
                          : "border-white/[0.08] bg-white/[0.03] text-zinc-400",
                      )}
                    >
                      +{task.reward} XP
                    </motion.span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Day-complete toast (inline) */}
          <AnimatePresence>
            {showBonusToast ? (
              <motion.div
                key="bonus"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 26,
                }}
                className="mt-6 inline-flex items-center gap-3 rounded-xl border border-indigo-400/40 bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-fuchsia-500/10 px-4 py-3 text-sm font-semibold text-indigo-100 shadow-[0_0_36px_-12px_rgba(129,140,248,0.6)]"
              >
                <span className="inline-flex h-2 w-2 rounded-full bg-indigo-300 shadow-[0_0_10px_2px_rgba(165,180,252,0.8)]" />
                Day complete!
                <span className="font-mono text-xs uppercase tracking-wider text-indigo-200/80">
                  +{DAY_BONUS} bonus
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Footer row — counter + reset */}
          <div className="mt-8 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              {completedCount} / {TASKS.length} complete
            </span>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-zinc-200"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
              Reset
            </button>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-sm font-normal text-zinc-400">
          No signup needed for this. The real one tracks your actual days.
        </p>
      </div>
    </section>
  );
}

export default LiveDemo;
