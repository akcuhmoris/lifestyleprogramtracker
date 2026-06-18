"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { TEMPLATES, type ProgramTemplate } from "@program/shared/templates";
import { getIcon } from "@program/shared/icons";
import { applyTemplateAction } from "@/app/actions";
import { markWelcomeSeen } from "@/components/welcome-modal";
import { HudPanel } from "@/components/hud/hud-panel";
import { HudButton } from "@/components/hud/hud-button";

export function OnboardingPicker() {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleBegin(template: ProgramTemplate) {
    if (pending) return;
    setError(null);
    setPendingId(template.id);
    startTransition(async () => {
      const res = await applyTemplateAction(template.id);
      if (!res.ok) {
        setError(res.error ?? "Couldn't apply that template.");
        setPendingId(null);
        return;
      }
      markWelcomeSeen();
      router.push("/today");
      router.refresh();
    });
  }

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onBegin={() => handleBegin(t)}
            pending={pendingId === t.id && pending}
            anyPending={pending}
          />
        ))}
      </div>

      {error && (
        <div
          className="mt-6 rounded-md border px-4 py-3 text-[12px]"
          style={{
            borderColor: "rgba(244, 63, 94, 0.4)",
            background: "rgba(244, 63, 94, 0.1)",
            color: "rgb(252, 165, 165)",
          }}
        >
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href="/today"
          className={cn(
            "inline-flex items-center gap-2",
            "text-sm font-medium",
            "text-[color:var(--text-muted)] hover:text-[color:var(--accent)]",
            "transition-colors",
          )}
        >
          Skip — I&apos;ll build my own
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </>
  );
}

function TemplateCard({
  template,
  onBegin,
  pending,
  anyPending,
}: {
  template: ProgramTemplate;
  onBegin: () => void;
  pending: boolean;
  anyPending: boolean;
}) {
  return (
    <motion.div
      whileHover={
        anyPending
          ? undefined
          : { y: -4, transition: { type: "spring", stiffness: 320, damping: 24 } }
      }
      className="h-full"
    >
      <HudPanel className="flex h-full flex-col gap-4 p-5">
        {/* Header: meta + badge */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-[color:var(--text-muted)]">
            {template.totalDays} days
          </span>
          {template.badge && (
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
              style={{
                borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)",
                background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                color: "var(--accent)",
              }}
            >
              {template.badge === "Popular" && (
                <Sparkles className="h-2.5 w-2.5" />
              )}
              {template.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[color:var(--text)]">
            {template.name}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--text-muted)]">
            {template.tagline}
          </p>
        </div>

        {/* Task icons */}
        {template.tasks.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {template.tasks.slice(0, 8).map((t, i) => {
              const Icon = getIcon(t.icon);
              return (
                <span
                  key={i}
                  title={t.title}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-[color:var(--text-muted)]"
                  style={{
                    borderColor: "var(--hud-border)",
                    background:
                      "color-mix(in srgb, var(--surface) 60%, transparent)",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              );
            })}
            {template.tasks.length > 8 && (
              <span
                className="inline-flex h-8 items-center justify-center rounded-lg border px-2 font-mono text-[11px] tabular-nums text-[color:var(--text-muted)]"
                style={{
                  borderColor: "var(--hud-border)",
                  background:
                    "color-mix(in srgb, var(--surface) 60%, transparent)",
                }}
              >
                +{template.tasks.length - 8}
              </span>
            )}
          </div>
        ) : (
          <div
            className="rounded-lg border px-3 py-2 text-xs text-[color:var(--text-muted)]"
            style={{
              borderColor: "var(--hud-border)",
              background:
                "color-mix(in srgb, var(--surface) 60%, transparent)",
            }}
          >
            Blank slate — build your own.
          </div>
        )}

        {/* Task preview list */}
        {template.tasks.length > 0 && (
          <div
            className="rounded-lg border px-3 py-2.5"
            style={{
              borderColor: "var(--hud-border)",
              background:
                "color-mix(in srgb, var(--surface) 40%, transparent)",
            }}
          >
            <div className="mb-2 text-[11px] font-semibold text-[color:var(--text-muted)]">
              Daily tasks · {template.tasks.length}
            </div>
            <ul className="space-y-1">
              {template.tasks.slice(0, 4).map((t, i) => {
                const Icon = getIcon(t.icon);
                return (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-[12px] text-[color:var(--text)]"
                  >
                    <Icon
                      className="h-3 w-3 text-[color:var(--text-muted)] flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span className="flex-1 truncate">{t.title}</span>
                    {t.kind === "journal" && (
                      <span className="text-[10px] font-semibold text-[color:var(--accent)]">
                        log
                      </span>
                    )}
                    {t.kind === "photo" && (
                      <span className="text-[10px] font-semibold text-[color:var(--accent)]">
                        proof
                      </span>
                    )}
                  </li>
                );
              })}
              {template.tasks.length > 4 && (
                <li className="pt-0.5 text-[11px] text-[color:var(--text-muted)]">
                  + {template.tasks.length - 4} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <HudButton
            variant="primary"
            onClick={onBegin}
            loading={pending}
            disabled={anyPending && !pending}
            className="w-full"
          >
            {pending ? (
              "Setting up…"
            ) : (
              <>
                Start
                <ArrowRight className="ml-1 inline h-3.5 w-3.5" strokeWidth={2.5} />
              </>
            )}
          </HudButton>
        </div>
      </HudPanel>
    </motion.div>
  );
}
