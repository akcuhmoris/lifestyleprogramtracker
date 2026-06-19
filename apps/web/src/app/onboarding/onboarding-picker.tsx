"use client";

import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TEMPLATES, type ProgramTemplate } from "@program/shared/templates";
import { getIcon } from "@program/shared/icons";
import { applyTemplateAction } from "@/app/actions";
import { markWelcomeSeen } from "@/components/welcome-modal";
import { HudPanel } from "@/components/hud/hud-panel";
import { MagneticButton } from "@/components/landing/magnetic-button";

const interFont = "Inter, ui-sans-serif, system-ui, sans-serif";

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
      <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2">
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
          className="mt-6 rounded-xl border px-4 py-3 text-[13px]"
          style={{
            borderColor: "rgba(244, 63, 94, 0.4)",
            background: "rgba(244, 63, 94, 0.08)",
            color: "rgb(252, 165, 165)",
            fontFamily: interFont,
          }}
        >
          {error}
        </div>
      )}

      <div className="mt-10 flex justify-center sm:mt-12">
        <Link
          href="/today"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
          style={{ fontFamily: interFont, fontWeight: 500 }}
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
          : { y: -6, transition: { type: "spring", stiffness: 320, damping: 24 } }
      }
      className="h-full"
    >
      <HudPanel className="flex h-full flex-col gap-5 p-6 sm:p-7">
        {/* Header: meta + badge */}
        <div className="flex items-start justify-between gap-2">
          <span
            className="text-xs font-medium text-white/50"
            style={{ fontFamily: interFont }}
          >
            {template.totalDays} days · {template.tasks.length} task
            {template.tasks.length === 1 ? "" : "s"}
          </span>
          {template.badge && (
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
              style={{
                borderColor: "rgba(165, 180, 252, 0.35)",
                background: "rgba(165, 180, 252, 0.1)",
                color: "#a5b4fc",
                fontFamily: interFont,
              }}
            >
              {template.badge === "Popular" && (
                <Sparkles className="h-2.5 w-2.5" />
              )}
              {template.badge}
            </span>
          )}
        </div>

        {/* Title + description */}
        <div>
          <h3
            className="text-2xl tracking-tight text-white"
            style={{ fontFamily: interFont, fontWeight: 700 }}
          >
            {template.name}
          </h3>
          <p
            className="mt-2 text-[14px] leading-relaxed text-white/60"
            style={{ fontFamily: interFont, fontWeight: 400 }}
          >
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
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/60"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              );
            })}
            {template.tasks.length > 8 && (
              <span
                className="inline-flex h-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 font-mono text-[11px] tabular-nums text-white/60"
              >
                +{template.tasks.length - 8}
              </span>
            )}
          </div>
        ) : (
          <div
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60"
            style={{ fontFamily: interFont }}
          >
            Blank slate — build your own.
          </div>
        )}

        {/* Task preview list */}
        {template.tasks.length > 0 && (
          <div
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3"
          >
            <div
              className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/50"
              style={{ fontFamily: interFont }}
            >
              Daily tasks · {template.tasks.length}
            </div>
            <ul className="space-y-1.5">
              {template.tasks.slice(0, 4).map((t, i) => {
                const Icon = getIcon(t.icon);
                return (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-[13px] text-white/85"
                    style={{ fontFamily: interFont }}
                  >
                    <Icon
                      className="h-3 w-3 flex-shrink-0 text-white/50"
                      strokeWidth={2}
                    />
                    <span className="flex-1 truncate">{t.title}</span>
                    {t.kind === "journal" && (
                      <span
                        className="text-[10px] font-semibold"
                        style={{ color: "#a5b4fc" }}
                      >
                        log
                      </span>
                    )}
                    {t.kind === "photo" && (
                      <span
                        className="text-[10px] font-semibold"
                        style={{ color: "#a5b4fc" }}
                      >
                        proof
                      </span>
                    )}
                  </li>
                );
              })}
              {template.tasks.length > 4 && (
                <li
                  className="pt-0.5 text-[11px] text-white/50"
                  style={{ fontFamily: interFont }}
                >
                  + {template.tasks.length - 4} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto flex justify-center pt-2 [&>span]:w-full">
          <MagneticButton
            variant="primary"
            onClick={onBegin}
            disabled={anyPending}
            aria-busy={pending}
            className="w-full"
          >
            {pending ? (
              <span
                className="inline-flex items-center gap-2"
                style={{ fontFamily: interFont }}
              >
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Setting up…
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-2"
                style={{ fontFamily: interFont }}
              >
                Begin
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
            )}
          </MagneticButton>
        </div>
      </HudPanel>
    </motion.div>
  );
}
