/**
 * HudPanel — base container primitive for the softer, warmer aesthetic.
 *
 * A rounded-2xl panel with a neutral subtle border and a soft inner highlight.
 * Optionally renders four small SVG L-bracket corners only when explicitly
 * requested via `corners`. Default panels have no brackets.
 *
 * Pure presentational. No hooks. Server-component safe.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type HudPanelProps = {
  children: ReactNode;
  /** Render the four small L-bracket SVG corners. Default false. */
  corners?: boolean;
  /** "soft" (default) keeps neutral border; "accent" is reserved for features. */
  tone?: "soft" | "accent" | "default";
  className?: string;
};

export function HudPanel({
  children,
  corners = false,
  tone = "soft",
  className,
}: HudPanelProps) {
  const isAccent = tone === "accent";

  return (
    <div
      className={cn(
        "relative rounded-2xl",
        "border",
        isAccent ? "border-white/[0.10]" : "border-white/[0.06]",
        className,
      )}
      style={{
        background: "var(--hud-panel-bg)",
        boxShadow: isAccent
          ? "inset 0 0 0 1px rgba(255,255,255,0.03), 0 14px 40px -28px var(--accent-glow), 0 0 20px -16px var(--accent-glow)"
          : "inset 0 0 0 1px rgba(255,255,255,0.025), 0 12px 32px -28px var(--accent-glow), 0 0 14px -16px var(--accent-glow)",
      }}
    >
      {corners ? <HudCorners /> : null}
      {children}
    </div>
  );
}

export default HudPanel;

// ---------------------------------------------------------------------------
// L-bracket corner decorations (softer, smaller, lower opacity)
// ---------------------------------------------------------------------------

function HudCorners() {
  // Each corner is a 10x10 SVG of an L-bracket in --accent at 0.4 opacity.
  const stroke = "var(--accent)";
  const size = 10;

  return (
    <g aria-hidden="true" style={{ opacity: 0.4 }}>
      {/* top-left */}
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 10 10"
        className="pointer-events-none absolute left-1 top-1"
      >
        <path
          d="M0 4 V0 H4"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {/* top-right */}
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 10 10"
        className="pointer-events-none absolute right-1 top-1"
      >
        <path
          d="M6 0 H10 V4"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {/* bottom-left */}
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 10 10"
        className="pointer-events-none absolute bottom-1 left-1"
      >
        <path
          d="M0 6 V10 H4"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {/* bottom-right */}
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 10 10"
        className="pointer-events-none absolute bottom-1 right-1"
      >
        <path
          d="M6 10 H10 V6"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </g>
  );
}
