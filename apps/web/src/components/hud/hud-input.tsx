/**
 * HudInput — soft, rounded text input primitive.
 *
 * Renders an optional small sentence-case label above a rounded-xl input box.
 * Uses neutral border with accent focus ring. forwardRef so it works inside
 * forms with action handlers and uncontrolled refs.
 */

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type HudInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  /** Optional extra class on the outer wrapper. */
  wrapperClassName?: string;
};

export const HudInput = forwardRef<HTMLInputElement, HudInputProps>(
  function HudInput(
    { label, className, wrapperClassName, id, ...props },
    ref,
  ) {
    const inputId = id ?? props.name;

    return (
      <label
        htmlFor={inputId}
        className={cn("flex flex-col gap-1.5", wrapperClassName)}
      >
        {label ? (
          <span className="font-sans text-xs font-medium tracking-wide text-[color:var(--text-muted)]">
            {label}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          {...props}
          className={cn(
            "block w-full rounded-xl",
            "border border-white/[0.08] bg-white/[0.03]",
            "px-4 py-2.5",
            "font-sans text-sm text-[color:var(--text)]",
            "placeholder:font-sans placeholder:text-[color:var(--text-muted)]",
            "outline-none transition-colors",
            "focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/30",
            "disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
        />
      </label>
    );
  },
);

HudInput.displayName = "HudInput";

export default HudInput;
