"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Layers,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TEMPLATES, type ProgramTemplate } from "@program/shared/templates";
import { getIcon } from "@program/shared/icons";
import { applyTemplateAction } from "@/app/actions";

type Props = {
  currentTaskCount: number;
};

export function TemplatesSection({ currentTaskCount }: Props) {
  const [selected, setSelected] = useState<ProgramTemplate | null>(null);

  return (
    <section className="mt-10 rounded-2xl border border-border bg-bg-card p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 border border-accent/30 text-accent-glow flex-shrink-0">
            <Layers className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-medium">
              Program templates
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Don&apos;t want to build your task list from scratch? Pick a
              preset. You can still edit anything afterward.
            </p>
          </div>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onApply={() => setSelected(t)}
          />
        ))}
      </div>

      <ApplyDialog
        template={selected}
        currentTaskCount={currentTaskCount}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

function TemplateCard({
  template,
  onApply,
}: {
  template: ProgramTemplate;
  onApply: () => void;
}) {
  return (
    <div className="group relative rounded-xl border border-border-subtle bg-bg-elevated p-4 transition-colors hover:border-accent/30">
      {template.badge && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-accent-glow">
          {template.badge === "Popular" && <Sparkles className="h-2.5 w-2.5" />}
          {template.badge}
        </span>
      )}

      <div className="flex items-baseline gap-2">
        <h3 className="text-[15px] font-semibold tracking-tight text-text">
          {template.name}
        </h3>
        <span className="text-[11px] uppercase tracking-[0.16em] text-text-dim font-medium tabular-nums">
          {template.totalDays}d
        </span>
      </div>
      <p className="mt-1 text-[12.5px] text-text-muted leading-relaxed">
        {template.tagline}
      </p>

      {/* Task icon strip */}
      {template.tasks.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.tasks.slice(0, 8).map((t, i) => {
            const Icon = getIcon(t.icon);
            return (
              <span
                key={i}
                title={t.title}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border-subtle bg-bg-card text-text-muted"
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            );
          })}
          {template.tasks.length > 8 && (
            <span className="inline-flex h-7 items-center justify-center rounded-lg border border-border-subtle bg-bg-card px-2 text-[11px] text-text-dim tabular-nums">
              +{template.tasks.length - 8}
            </span>
          )}
        </div>
      ) : (
        <div className="mt-3 text-[11.5px] text-text-dim italic">
          Blank — add your own tasks
        </div>
      )}

      <button
        type="button"
        onClick={onApply}
        className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-[13px] font-medium text-accent-glow hover:bg-accent/10 hover:border-accent/50 transition-colors"
      >
        Apply
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function ApplyDialog({
  template,
  currentTaskCount,
  onClose,
}: {
  template: ProgramTemplate | null;
  currentTaskCount: number;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleApply() {
    if (!template) return;
    setError(null);
    startTransition(async () => {
      const res = await applyTemplateAction(template.id);
      if (!res.ok) {
        setError(res.error ?? "Couldn't apply that template.");
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Dialog.Root open={template !== null} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {template && (
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
                      Apply {template.name}?
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-[12.5px] text-text-muted leading-relaxed">
                      {template.description}
                    </Dialog.Description>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text rounded-md p-1.5 hover:bg-bg-hover transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div className="px-6 py-5 space-y-4">
                  <div className="rounded-xl border border-border-subtle bg-bg-elevated p-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-text-dim mb-2">
                      You&apos;ll get
                    </div>
                    <div className="flex items-baseline gap-3 text-[13px]">
                      <span>
                        <span className="tabular-nums text-text font-medium">
                          {template.totalDays}
                        </span>{" "}
                        <span className="text-text-muted">days</span>
                      </span>
                      <span className="text-text-dim">·</span>
                      <span>
                        <span className="tabular-nums text-text font-medium">
                          {template.tasks.length}
                        </span>{" "}
                        <span className="text-text-muted">daily tasks</span>
                      </span>
                    </div>
                    {template.tasks.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {template.tasks.map((t, i) => {
                          const Icon = getIcon(t.icon);
                          return (
                            <li
                              key={i}
                              className="flex items-center gap-2.5 text-[13px] text-text"
                            >
                              <Icon className="h-3.5 w-3.5 text-text-muted flex-shrink-0" strokeWidth={2} />
                              <span className="flex-1">{t.title}</span>
                              {t.kind === "journal" && (
                                <span className="text-[10px] uppercase tracking-[0.14em] text-accent-glow">
                                  journal
                                </span>
                              )}
                              {t.kind === "photo" && (
                                <span className="text-[10px] uppercase tracking-[0.14em] text-accent-glow">
                                  photo
                                </span>
                              )}
                              {t.requiresDetail && (
                                <span className="text-[10px] uppercase tracking-[0.14em] text-text-dim">
                                  requires text
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {currentTaskCount > 0 && (
                    <div className="rounded-xl border border-state-partial/40 bg-state-partial/5 px-3 py-2.5 text-[12px] text-state-partial flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                      <div className="text-text-muted">
                        Your current{" "}
                        <span className="text-text">{currentTaskCount}</span>{" "}
                        tasks will be archived. Past completions stay on the
                        calendar — only the active task list changes.
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl border border-state-miss/40 bg-state-miss/10 px-3 py-2 text-[12px] text-state-miss flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <footer className="flex justify-end gap-2 px-6 py-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-border bg-bg-card px-3.5 py-2 text-[13px] font-medium text-text hover:border-accent/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={handleApply}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-all",
                      "bg-accent text-bg shadow-glow hover:brightness-110 disabled:opacity-60"
                    )}
                  >
                    {pending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" strokeWidth={2.8} />
                    )}
                    {pending ? "Applying…" : `Apply ${template.name}`}
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
