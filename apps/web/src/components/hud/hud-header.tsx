/**
 * HudHeader — page title in Inter weight 700 sentence case with optional
 * eyebrow / subtitle.
 *
 * Softened from the original ALL CAPS Orbitron treatment. The decorative left
 * accent bar is preserved but slimmed down.
 *
 * Pure presentational. No hooks. Server-component safe.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type HudHeaderProps = {
  children: ReactNode;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
};

export function HudHeader({
  children,
  subtitle,
  eyebrow,
  className,
}: HudHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-2", className)}>
      {eyebrow ? (
        <span
          className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-muted)]"
        >
          {eyebrow}
        </span>
      ) : null}

      <div className="flex items-center gap-3">
        {/* Decorative left accent bar — slimmer, no shadow. */}
        <span
          aria-hidden="true"
          className="inline-block h-6 w-1 rounded-full"
          style={{
            background: "var(--accent)",
          }}
        />

        <h1
          className={cn(
            "font-sans font-bold tracking-tight",
            "text-3xl md:text-4xl",
            "text-[color:var(--text)]",
          )}
        >
          {children}
        </h1>
      </div>

      {subtitle ? (
        <p className="text-base font-normal text-[color:var(--text-muted)]">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

export default HudHeader;
