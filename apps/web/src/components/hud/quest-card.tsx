// UNUSED — kept as a primitive for future quest-style UI surfaces.
/**
 * QuestCard — generic soft task-card wrapper (formerly a quest-themed wrapper).
 *
 * Built on top of HudPanel. The gamer "QUEST" eyebrow and rotated "COMPLETE"
 * stamp are gone. A reward "+N XP" pill remains but is small and subtle — only
 * visible on hover or when the task is completed.
 *
 * Pure presentational. No hooks. Server-component safe.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { HudPanel } from "./hud-panel";

export type QuestCardProps = {
  children: ReactNode;
  isComplete?: boolean;
  reward?: number;
  className?: string;
};

export function QuestCard({
  children,
  isComplete = false,
  reward,
  className,
}: QuestCardProps) {
  return (
    <HudPanel
      tone={isComplete ? "accent" : "soft"}
      className={cn("group relative overflow-hidden", className)}
    >
      {/* Soft accent tint overlay when complete. */}
      {isComplete ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--accent) 6%, transparent), transparent 60%)",
          }}
        />
      ) : null}

      {/* Subtle reward pill — only visible on hover or completion. */}
      {reward !== undefined ? (
        <div
          className={cn(
            "pointer-events-none absolute right-3 top-3 transition-opacity",
            isComplete ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            +{reward} XP
          </span>
        </div>
      ) : null}

      {/* Body — caller passes their task UI here. */}
      <div className="relative px-4 py-4">{children}</div>
    </HudPanel>
  );
}

export default QuestCard;
