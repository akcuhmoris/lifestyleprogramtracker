"use client";

import { Check, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { THEMES, type Theme, type ThemeId } from "@program/shared/themes";
import { cn } from "@/lib/utils";
import { setThemeAction } from "@/app/actions";

type Props = {
  /** Currently-active theme id (from the user's character profile). */
  current: ThemeId;
};

/**
 * Responsive grid of theme cards. Clicking a card optimistically flips the
 * `data-theme` attribute on `<html>` for instant feedback, then persists the
 * choice via the `setThemeAction` server action.
 */
export function ThemePicker({ current }: Props) {
  const [selected, setSelected] = useState<ThemeId>(current);
  const [pendingId, setPendingId] = useState<ThemeId | null>(null);
  const [, startTransition] = useTransition();

  function handlePick(theme: Theme) {
    if (theme.id === selected && pendingId === null) return;

    // Optimistic UI: flip the active theme on <html> immediately so the
    // whole app recolors before the server roundtrip completes.
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme.id;
    }
    setSelected(theme.id);
    setPendingId(theme.id);

    startTransition(async () => {
      try {
        await setThemeAction(theme.id);
      } finally {
        setPendingId((prev) => (prev === theme.id ? null : prev));
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {THEMES.map((theme) => {
        const isSelected = selected === theme.id;
        const isPending = pendingId === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => handlePick(theme)}
            aria-pressed={isSelected}
            aria-label={`Use ${theme.name} theme`}
            className={cn(
              "group relative flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
              isSelected
                ? "border-white/40 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]",
            )}
            style={{
              // Subtle accent glow on the selected card, using the literal
              // accent for that theme so the swatch tells you what you're picking.
              boxShadow: isSelected
                ? `0 0 0 1px ${theme.accent}55, 0 12px 40px -10px ${theme.accentGlow}`
                : undefined,
            }}
          >
            <ThemePreview theme={theme} />

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-100">
                  {theme.name}
                </span>
                <span className="text-xs text-zinc-500">
                  {isSelected ? "Selected" : "Tap to apply"}
                </span>
              </div>

              <span
                aria-hidden="true"
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border transition-opacity",
                  isSelected
                    ? "border-transparent opacity-100"
                    : "border-white/15 opacity-40 group-hover:opacity-70",
                )}
                style={{
                  background: isSelected ? theme.accent : "transparent",
                }}
              >
                {isPending ? (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    style={{ color: isSelected ? theme.bg : theme.accent }}
                  />
                ) : isSelected ? (
                  <Check
                    className="h-3.5 w-3.5"
                    style={{ color: theme.bg }}
                  />
                ) : null}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** Stacked color bars showing bg / surface / accent for the theme. */
function ThemePreview({ theme }: { theme: Theme }) {
  return (
    <div
      className="relative h-20 w-full overflow-hidden rounded-xl border border-white/10"
      style={{ background: theme.bg }}
    >
      {/* Surface bar */}
      <div
        className="absolute inset-x-2 top-2 h-5 rounded-md"
        style={{ background: theme.surface }}
      />
      {/* Accent bar */}
      <div
        className="absolute inset-x-2 bottom-2 h-5 rounded-md"
        style={{
          background: theme.accent,
          boxShadow: `0 0 18px 0 ${theme.accentGlow}`,
        }}
      />
      {/* Three dots: bg / surface / accent legend in the middle */}
      <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full border border-white/10"
          style={{ background: theme.bg }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full border border-white/10"
          style={{ background: theme.surface }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            background: theme.accent,
            boxShadow: `0 0 8px 0 ${theme.accentGlow}`,
          }}
        />
      </div>
    </div>
  );
}
