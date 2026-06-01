"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, RotateCcw, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatPretty } from "@program/shared/date";
import {
  dismissRestartAction,
  restartChallengeAction,
} from "@/app/actions";

type Props = {
  missDate: string;
  missCount: number;
  taskCount: number;
};

export function RestartBanner({ missDate, missCount, taskCount }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const incomplete = Math.max(0, taskCount - missCount);

  async function handleDismiss() {
    setBusy(true);
    await dismissRestartAction(missDate);
    setBusy(false);
    router.refresh();
  }

  async function handleRestart() {
    setBusy(true);
    await restartChallengeAction();
    setBusy(false);
    setConfirmOpen(false);
    router.refresh();
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mb-8 rounded-2xl border border-state-miss/40 bg-state-miss/5",
          "p-5 sm:p-6"
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-state-miss/15 border border-state-miss/30 text-state-miss flex-shrink-0">
              <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <div>
              <div className="text-sm font-semibold tracking-tight text-text">
                You missed {incomplete} {incomplete === 1 ? "task" : "tasks"} on{" "}
                {formatPretty(missDate)}
              </div>
              <p className="mt-1 text-[13px] text-text-muted leading-relaxed">
                The strict rule is to restart from Day 1. Or you can keep going
                on modified rules — the miss stays on the calendar and the day
                counter advances normally.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-shrink-0">
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmOpen(true)}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2",
                "border border-state-miss/40 bg-state-miss/10 text-state-miss font-medium text-[13px]",
                "hover:bg-state-miss/20 transition-colors disabled:opacity-60"
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.5} />
              Restart from Day 1
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleDismiss}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2",
                "border border-border bg-bg-card text-text font-medium text-[13px]",
                "hover:border-accent/40 hover:text-accent-glow transition-colors disabled:opacity-60"
              )}
            >
              Keep going
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </motion.div>

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AnimatePresence>
          {confirmOpen && (
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
                onOpenAutoFocus={(e: Event) => e.preventDefault()}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  className="w-[92vw] max-w-md pointer-events-auto rounded-2xl border border-border bg-bg-card shadow-card"
                >
                  <header className="flex items-start justify-between px-6 py-5 border-b border-border-subtle">
                    <div>
                      <Dialog.Title className="text-sm font-semibold text-text">
                        Restart from Day 1?
                      </Dialog.Title>
                      <Dialog.Description className="mt-1 text-[13px] text-text-muted">
                        Your current attempt will be archived. The calendar resets to today as Day 1. All prior data stays in the database but won&apos;t appear on the new calendar.
                      </Dialog.Description>
                    </div>
                    <button
                      onClick={() => setConfirmOpen(false)}
                      className="text-text-muted hover:text-text rounded-md p-1.5 hover:bg-bg-hover transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </header>
                  <div className="flex justify-end gap-2 px-6 py-4">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirmOpen(false)}
                      className="rounded-lg border border-border bg-bg-card px-3.5 py-2 text-[13px] font-medium text-text hover:border-accent/40 transition-colors disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleRestart}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-state-miss px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_0_18px_-4px_rgba(244,63,94,0.6)] hover:brightness-110 transition-all disabled:opacity-60"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Restart
                    </button>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}
