"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { TEMPLATES, type ProgramTemplate } from "@program/shared/templates";
import { getIcon } from "@program/shared/icons";
import { applyTemplateAction } from "@/app/actions";

export function OnboardingPicker() {
  const [selectedId, setSelectedId] = useState<string>("100-hard");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const selected = TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[0];

  function handleContinue() {
    setError(null);
    startTransition(async () => {
      const res = await applyTemplateAction(selected.id);
      if (!res.ok) {
        setError(res.error ?? "Couldn't apply that template.");
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <TemplateOption
            key={t.id}
            template={t}
            selected={t.id === selected.id}
            onSelect={() => setSelectedId(t.id)}
          />
        ))}
      </div>

      <SelectedPreview template={selected} />

      {error && (
        <div className="mt-4 rounded-xl border border-state-miss/40 bg-state-miss/10 px-3 py-2 text-[12px] text-state-miss">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-bg-card px-3.5 py-2 text-[13px] font-medium text-text hover:border-accent/40 hover:text-accent-glow transition-colors"
        >
          Skip — I&apos;ll set it up myself
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={handleContinue}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all",
            "bg-accent text-bg shadow-glow hover:brightness-110 disabled:opacity-60"
          )}
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" strokeWidth={2.8} />
          )}
          {pending ? "Setting up…" : `Start ${selected.name}`}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
}

function TemplateOption({
  template,
  selected,
  onSelect,
}: {
  template: ProgramTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative text-left rounded-xl border bg-bg-elevated p-4 transition-all",
        selected
          ? "border-accent/60 bg-accent/5 ring-1 ring-accent/40"
          : "border-border-subtle hover:border-accent/30"
      )}
    >
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

      {selected && (
        <motion.span
          layoutId="onboarding-selected-check"
          className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-bg shadow-glow"
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.span>
      )}
    </button>
  );
}

function SelectedPreview({ template }: { template: ProgramTemplate }) {
  if (template.tasks.length === 0) {
    return (
      <div className="mt-5 rounded-xl border border-border-subtle bg-bg-elevated p-4 text-center">
        <p className="text-[13px] text-text-muted">
          You&apos;ll land on an empty task list. Head to Settings to add your
          own — or come back here later.
        </p>
      </div>
    );
  }
  return (
    <motion.div
      key={template.id}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-5 rounded-xl border border-border-subtle bg-bg-elevated p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[11px] uppercase tracking-[0.18em] text-text-dim font-medium">
          Daily tasks · {template.name}
        </div>
        <div className="text-[11px] text-text-dim tabular-nums">
          {template.tasks.length} tasks
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        {template.tasks.map((t, i) => {
          const Icon = getIcon(t.icon);
          return (
            <li
              key={i}
              className="flex items-center gap-2 text-[12.5px] text-text"
            >
              <Icon
                className="h-3.5 w-3.5 text-text-muted flex-shrink-0"
                strokeWidth={2}
              />
              <span className="flex-1 truncate">{t.title}</span>
              {t.kind === "journal" && (
                <span className="text-[9.5px] uppercase tracking-[0.14em] text-accent-glow">
                  journal
                </span>
              )}
              {t.kind === "photo" && (
                <span className="text-[9.5px] uppercase tracking-[0.14em] text-accent-glow">
                  photo
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
