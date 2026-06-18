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

  const selected = optimisticPick ?? current;

  const handleSelect = (id: Archetype) => {
    if (id === selected || isPending) return;
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ARCHETYPES.map((a) => {
        const Icon = ICONS[a.icon] ?? Sword;
        const isSelected = selected === a.id;
        const isLoading = pendingPick === a.id;

        return (
          <button
            key={a.id}
            type="button"
            onClick={() => handleSelect(a.id)}
            disabled={isPending}
            aria-pressed={isSelected}
            className={cn(
              "group relative block w-full text-left transition-transform",
              "hover:-translate-y-0.5",
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
                "group-focus-visible:ring-2 group-focus-visible:ring-[var(--ring-color)]",
              )}
            >
              {/* Radial archetype glow */}
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 -z-0 opacity-0 transition-opacity duration-300",
                  isSelected ? "opacity-100" : "group-hover:opacity-60",
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
                <div className="mt-1 flex h-5 items-center justify-center">
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
                  ) : (
                    <span className="text-xs text-[color:var(--text-muted)]/70">
                      Tap to switch
                    </span>
                  )}
                </div>
              </div>
            </HudPanel>
          </button>
        );
      })}
    </div>
  );
}
