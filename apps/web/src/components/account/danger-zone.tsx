"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Download, Loader2, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  deleteMyAccountAction,
  exportMyDataAction,
} from "@/app/account/actions";

type Props = { email: string };

export function DangerZone({ email }: Props) {
  return (
    <section
      id="danger-zone"
      className="mt-10 rounded-2xl border border-state-miss/30 bg-state-miss/5 p-6"
    >
      <header className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-state-miss/15 border border-state-miss/30 text-state-miss flex-shrink-0">
          <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-state-miss font-medium">
            Account & data
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Download a copy of everything tied to{" "}
            <span className="text-text font-medium">{email}</span>, or delete your
            account entirely.
          </p>
        </div>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ExportButton />
        <DeleteButton />
      </div>
    </section>
  );
}

function ExportButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    setError(null);
    startTransition(async () => {
      const res = await exportMyDataAction();
      if (!res.ok) {
        setError(res.error ?? "Export failed.");
        return;
      }
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `program-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-bg-card p-4">
      <h3 className="text-sm font-semibold text-text">Download my data</h3>
      <p className="mt-1 text-[12.5px] text-text-muted leading-relaxed">
        A JSON file with every check, weight, note, journal entry, and photo link
        from your account.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={handleExport}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-[13px] font-medium text-text hover:border-accent/40 hover:text-accent-glow transition-colors disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" strokeWidth={2.4} />
        )}
        {pending ? "Preparing…" : "Download JSON"}
      </button>
      {error && (
        <p className="mt-2 text-[11.5px] text-state-miss">{error}</p>
      )}
    </div>
  );
}

function DeleteButton() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteMyAccountAction(confirmation);
      if (res && !res.ok) {
        setError(res.error ?? "Delete failed.");
      }
      // On success deleteMyAccountAction calls redirect() — execution stops above.
    });
  }

  return (
    <div className="rounded-xl border border-state-miss/40 bg-state-miss/5 p-4">
      <h3 className="text-sm font-semibold text-text">Delete my account</h3>
      <p className="mt-1 text-[12.5px] text-text-muted leading-relaxed">
        Removes your account and every byte of associated data. This action
        cannot be undone.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-state-miss/50 bg-state-miss/10 px-3 py-2 text-[13px] font-medium text-state-miss hover:bg-state-miss/20 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} />
        Delete account
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
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
                  className="w-[94vw] max-w-md pointer-events-auto rounded-2xl border border-state-miss/30 bg-bg-card shadow-card"
                >
                  <header className="flex items-start justify-between px-6 py-5 border-b border-border-subtle">
                    <div>
                      <Dialog.Title className="text-sm font-semibold text-state-miss">
                        Delete your account?
                      </Dialog.Title>
                      <Dialog.Description className="mt-1 text-[13px] text-text-muted leading-relaxed">
                        This permanently removes your account, every check, every
                        photo, every weight log. There is no undo.
                      </Dialog.Description>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="text-text-muted hover:text-text rounded-md p-1.5 hover:bg-bg-hover transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </header>
                  <div className="px-6 py-4">
                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.16em] text-text-dim font-medium">
                        Type DELETE to confirm
                      </span>
                      <input
                        autoFocus
                        type="text"
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        placeholder="DELETE"
                        className={cn(
                          "mt-1.5 w-full rounded-lg bg-bg-elevated border border-border-subtle",
                          "px-3.5 py-2.5 text-[14px] text-text placeholder:text-text-dim",
                          "focus:outline-none focus:ring-2 focus:ring-state-miss/50 focus:border-state-miss/40",
                          "transition-all"
                        )}
                      />
                    </label>
                    {error && (
                      <p className="mt-2 text-[11.5px] text-state-miss">{error}</p>
                    )}
                  </div>
                  <footer className="flex justify-end gap-2 px-6 py-4 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-lg border border-border bg-bg-card px-3.5 py-2 text-[13px] font-medium text-text hover:border-accent/40 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={pending || confirmation.toUpperCase() !== "DELETE"}
                      onClick={handleDelete}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-all",
                        "bg-state-miss text-white shadow-[0_0_18px_-4px_rgba(244,63,94,0.6)]",
                        "hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {pending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.6} />
                      )}
                      {pending ? "Deleting…" : "Delete forever"}
                    </button>
                  </footer>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </div>
  );
}
