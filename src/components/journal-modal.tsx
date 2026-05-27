"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { saveJournalAction } from "@/app/actions";
import { cn } from "@/lib/utils";

type Props = {
  date: string;
  initialContent: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Notify parent after save so it can update its local mirror. */
  onSaved?: (content: string) => void;
  disabled?: boolean;
};

export function JournalModal({
  date,
  initialContent,
  open,
  onOpenChange,
  onSaved,
  disabled,
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, open]);

  useEffect(() => {
    if (!open) return;
    if (content === initialContent) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await saveJournalAction(date, content);
      setSavedAt(Date.now());
      onSaved?.(content);
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, open, date]);

  async function handleClose() {
    if (content !== initialContent) {
      await saveJournalAction(date, content);
      onSaved?.(content);
    }
    onOpenChange(false);
  }

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
                className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
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
                className={cn(
                  "w-[92vw] max-w-2xl pointer-events-auto",
                  "rounded-2xl border border-border bg-bg-card shadow-card overflow-hidden"
                )}
              >
                <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent-glow">
                      <PenLine className="h-4 w-4" />
                    </span>
                    <div>
                      <Dialog.Title className="text-sm font-medium">
                        Journal · {date}
                      </Dialog.Title>
                      <Dialog.Description className="text-xs text-text-dim">
                        Reflect on the day. Saves as you type.
                      </Dialog.Description>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClose()}
                    className="text-text-muted hover:text-text rounded-md p-1.5 hover:bg-bg-hover transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>
                <div className="p-6">
                  <textarea
                    autoFocus
                    disabled={disabled}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What went well? What was hard? What did you learn?"
                    className={cn(
                      "w-full min-h-[260px] resize-y rounded-xl bg-bg-elevated border border-border-subtle",
                      "px-4 py-3 text-[15px] leading-relaxed text-text placeholder:text-text-dim",
                      "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40",
                      "transition-all"
                    )}
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-text-dim">
                    <span>{content.length} characters</span>
                    <SavedIndicator savedAt={savedAt} />
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function SavedIndicator({ savedAt }: { savedAt: number | null }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!savedAt) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1400);
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
