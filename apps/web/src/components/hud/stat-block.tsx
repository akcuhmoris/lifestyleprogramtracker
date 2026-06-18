/**
 * StatBlock — compact label + big mono number, used for stat readouts.
 *
 * Optional `delta` shows a small green "+N XP" indicator next to the value.
 * Pure presentational. No hooks. Server-component safe.
 */

import { cn } from "@/lib/utils";

export type StatBlockProps = {
  label: string;
  value: string | number;
  delta?: string | number;
  emphasis?: "default" | "large";
  className?: string;
};

export function StatBlock({
  label,
  value,
  delta,
  emphasis = "default",
  className,
}: StatBlockProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[color:var(--text-muted)]">
        {label}
      </span>

      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono font-medium tabular-nums text-[color:var(--text)]",
            emphasis === "large" ? "text-3xl" : "text-2xl",
          )}
        >
          {value}
        </span>

        {delta !== undefined && delta !== null && delta !== "" ? (
          <span className="font-mono text-xs font-medium tabular-nums text-emerald-400">
            +{delta} XP
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default StatBlock;
