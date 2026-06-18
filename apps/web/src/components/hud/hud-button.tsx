"use client";

/**
 * HudButton — soft, rounded CTA button used across surfaces.
 *
 * Three variants:
 *   - primary: accent background, sentence-case Inter, soft accent shadow on hover
 *   - ghost:   transparent bg, neutral border, subtle hover wash
 *   - danger:  rose-tinted
 *
 * forwardRef so it can be used inside <form action={...}> with refs and
 * formAction props. Supports `loading` for a busy state.
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export type HudButtonVariant = "primary" | "ghost" | "danger";

export type HudButtonProps = Omit<HTMLMotionProps<"button">, "ref"> & {
  children: ReactNode;
  variant?: HudButtonVariant;
  loading?: boolean;
};

// We render the button itself as a motion.button so we can press-flash it
// without needing extra wrappers.
const MotionButton = motion.button;

export const HudButton = forwardRef<HTMLButtonElement, HudButtonProps>(
  function HudButton(
    {
      children,
      variant = "primary",
      loading = false,
      className,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    const variantClass =
      variant === "primary"
        ? "text-[color:var(--bg)]"
        : variant === "ghost"
          ? "text-[color:var(--text)] hover:bg-white/[0.04]"
          : "text-rose-100";

    // Per-variant styling: bg, border, shadow.
    const variantStyle =
      variant === "primary"
        ? {
            background: "var(--accent)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 24px -10px var(--accent-glow)",
          }
        : variant === "ghost"
          ? {
              background: "transparent",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10)",
            }
          : {
              background:
                "linear-gradient(180deg, rgba(244, 63, 94, 0.85), rgba(244, 63, 94, 0.7))",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 24px -10px rgba(244, 63, 94, 0.5)",
            };

    return (
      <MotionButton
        ref={ref}
        type={type}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : { scale: 0.95 }}
        whileHover={
          isDisabled
            ? undefined
            : variant === "primary"
              ? {
                  filter: "brightness(1.06)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.16), 0 14px 32px -10px var(--accent-glow)",
                }
              : variant === "ghost"
                ? { filter: "brightness(1.05)" }
                : { filter: "brightness(1.06)" }
        }
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={cn(
          "relative inline-flex items-center justify-center gap-2",
          "rounded-xl px-5 py-2.5",
          "font-sans text-sm font-semibold",
          "transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]",
          variantClass,
          className,
        )}
        style={variantStyle}
        {...props}
      >
        {loading ? (
          <Loader2
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        ) : null}
        <span className="relative">{children}</span>
      </MotionButton>
    );
  },
);

HudButton.displayName = "HudButton";

export default HudButton;
