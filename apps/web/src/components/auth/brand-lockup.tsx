/**
 * Brand lockup used across the auth surface (login, signup, forgot-password,
 * reset-password, check-email).
 *
 * Renders the Target icon glyph + "Lifestyle Program Tracker" wordmark as a
 * Link back to `/`. Server component — no client state.
 *
 * Variants:
 *   - default: subtle, used at the top of auth forms.
 *   - elevated: glowing icon + larger wordmark, used on /auth/check-email.
 */

import Link from "next/link";
import { Target } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  variant?: "default" | "elevated";
  className?: string;
};

export function BrandLockup({ variant = "default", className }: Props) {
  const elevated = variant === "elevated";
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 font-semibold tracking-tight",
        elevated
          ? "text-sm text-white"
          : "mt-2 text-sm text-[color:var(--text)]",
        className,
      )}
    >
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
        style={{
          background: "var(--accent)",
          color: "var(--bg)",
          ...(elevated
            ? { boxShadow: "0 0 24px -8px var(--accent-glow)" }
            : {}),
        }}
      >
        <Target className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className={elevated ? "text-base" : undefined}>
        Lifestyle Program Tracker
      </span>
    </Link>
  );
}
