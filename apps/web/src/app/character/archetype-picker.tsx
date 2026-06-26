"use client";

import { useState, useTransition } from "react";
import {
  BookOpenText,
  Compass,
  Flame,
  Flower2,
  Sword,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { ARCHETYPES, type Archetype } from "@program/shared/gamification";
import { pickArchetypeAction } from "@/app/actions";
import { HudPanel } from "@/components/hud/hud-panel";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Sword,
  BookOpenText,
  Zap,
  Flower2,
  Compass,
  Flame,
};

type Props = {
  current: Archetype;
};

export function ArchetypePicker({ current }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticPick, setOptimisticPick] = useState<Archetype | null>(null);
  const [pendingPick, setPendingPick] = useState<Archetype | null>(null);
  const [confirmingPick, setConfirmingPick] = useState<Archetype | null>(null);

  const selected = optimisticPick ?? current;

  const handleCardClick = (id: Archetype) => {
    if (id === selected || isPending) return;
    // Open a confirmation step instead of switching immediately.
    setConfirmingPick(id);
  };

  const handleConfirm = (id: Archetype) => {
    if (id === selected || isPending) return;
    setConfirmingPick(null);
    setOptimisticPick(id);
    setPendingPick(id);
    startTransition(async () => {
      try {
        await pickArchetypeAction(id);
      } catch {
        setOptimisticPick(null);
      } finally {
        setPendingPick(null);
      }
    });
  };

  const handleCancel = () => {
    setConfirmingPick(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ARCHETYPES.map((a) => {
        const Icon = ICONS[a.icon] ?? Sword;
        const isSelected = selected === a.id;
        const isLoading = pendingPick === a.id;
        const isConfirming = confirmingPick === a.id;

        return (
          <button
            key={a.id}
            type="button"
            onClick={() => handleCardClick(a.id)}
            disabled={isPending || isSelected}
            aria-pressed={isSelected}
            aria-haspopup={!isSelected ? "dialog" : undefined}
            aria-expanded={isConfirming}
            className={cn(
              "group relative block w-full text-left transition-transform",
              !isSelected && "hover:-translate-y-0.5",
              "focus-visible:outline-none",
              isPending && !isLoading && "opacity-60",
            )}
            style={
              {
                ["--ring-color" as string]: a.accent,
              } as React.CSSProperties
            }
          >
            <HudPanel
              tone={isSelected ? "accent" : "soft"}
              className={cn(
                "overflow-hidden px-5 py-5 transition-all",
                isSelected
                  ? "ring-2 ring-[var(--ring-color)] shadow-[0_0_24px_-10px_var(--ring-color)]"
                  : "group-hover:border-[var(--ring-color)]",
                isConfirming &&
                  "ring-2 ring-[var(--ring-color)] shadow-[0_0_24px_-10px_var(--ring-color)]",
                "group-focus-visible:ring-2 group-focus-visible:ring-[var(--ring-color)]",
              )}
            >
              {/* Radial archetype glow */}
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 -z-0 opacity-0 transition-opacity duration-300",
                  isSelected || isConfirming
                    ? "opacity-100"
                    : "group-hover:opacity-60",
                )}
                style={{
                  background: `radial-gradient(circle at 30% 0%, ${a.accent}33 0%, transparent 65%)`,
                }}
              />

              <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                {/* Icon */}
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border"
                  style={{
                    borderColor: `${a.accent}55`,
                    background: `${a.accent}1a`,
                    boxShadow: isSelected
                      ? `0 0 22px -6px ${a.accent}99, inset 0 0 10px -4px ${a.accent}55`
                      : `inset 0 0 8px -4px ${a.accent}33`,
                  }}
                >
                  <Icon
                    className="h-7 w-7"
                    style={{ color: a.accent }}
                    strokeWidth={1.75}
                  />
                </span>

                {/* Name + tagline */}
                <div className="flex flex-col items-center gap-1.5">
                  <h3 className="text-base font-semibold tracking-tight text-[color:var(--text)]">
                    {a.name}
                  </h3>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    {a.tagline}
                  </p>
                </div>

                {/* Status row */}
                <div className="mt-1 flex min-h-5 items-center justify-center">
                  {isLoading ? (
                    <span className="text-xs text-[color:var(--text-muted)]">
                      Switching…
                    </span>
                  ) : isSelected ? (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{
                        background: `${a.accent}26`,
                        color: a.accent,
                        boxShadow: `inset 0 0 0 1px ${a.accent}55`,
                      }}
                    >
                      Active
                    </span>
                  ) : isConfirming ? null : (
                    <span className="text-xs text-[color:var(--text-muted)]/70">
                      Tap to switch
                    </span>
                  )}
                </div>

                {/* Inline confirmation pill */}
                {isConfirming && (
                  <div
                    role="dialog"
                    aria-label={`Confirm switching to ${a.name}`}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      // Don't let space/enter bubble to the parent button.
                      e.stopPropagation();
                    }}
                    className="relative z-20 mt-1 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-left backdrop-blur"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${a.accent}33`,
                    }}
                  >
                    <p className="text-xs text-[color:var(--text)]">
                      Switch to{" "}
                      <span className="font-semibold" style={{ color: a.accent }}>
                        {a.name}
                      </span>
                      ? Your XP and level stay the same — only the look changes.
                    </p>
                    <div className="mt-2.5 flex items-center justify-end gap-2">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCancel();
                          }
                        }}
                        className="cursor-pointer rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium text-[color:var(--text-muted)] hover:bg-white/5 hover:text-[color:var(--text)]"
                      >
                        Cancel
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirm(a.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            handleConfirm(a.id);
                          }
                        }}
                        className="cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold"
                        style={{
                          background: `${a.accent}26`,
                          color: a.accent,
                          boxShadow: `inset 0 0 0 1px ${a.accent}55`,
                        }}
                      >
                        Yes, switch
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </HudPanel>
          </button>
        );
      })}
    </div>
  );
}
