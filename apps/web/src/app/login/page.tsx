"use client";

/**
 * Login page — Midnight cinematic treatment, unified with the landing.
 *
 * Outer chrome (Midnight wrapper + brand lockup), the OAuth row, the "or
 * continue with" divider, and the error banner are pulled from the shared
 * auth primitives in `@/components/auth/*`.
 *
 * Preserves every existing server action, field name, and query-param wiring
 * exactly:
 *
 *   - signInWithPasswordAction (email, password, next)
 *   - signInWithMagicLinkAction (email, next)
 *   - sendPasswordResetAction is reached via the /forgot-password link
 *   - OAuth (Google, Apple) via supabase client + /auth/callback redirect
 */

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Check, Info, Wand2 } from "lucide-react";
import { useState, useTransition } from "react";

import {
  signInWithMagicLinkAction,
  signInWithPasswordAction,
} from "@/app/auth/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { ErrorBanner } from "@/components/auth/error-banner";
import {
  AnimatedHeadingFallback,
  MagneticButtonFallback,
} from "@/components/auth/lazy-fallbacks";
import { OAuthRow } from "@/components/auth/oauth-row";
import { OrDivider } from "@/components/auth/or-divider";
import { HudInput } from "@/components/hud/hud-input";
import { HudPanel } from "@/components/hud/hud-panel";
import { cn } from "@/lib/utils";

// Lazy-load the heavy landing primitives. They pull a lot of framer-motion
// internals (springs, motion values, layout animations) that aren't needed on
// the critical path for auth; loading them async trims ~80 KB off the initial
// JS for /login and /signup. SSR is disabled because both components are
// animation-only — they degrade gracefully to their fallbacks until hydrated.
const HEADING_CLASS =
  "font-sans text-4xl sm:text-5xl font-extrabold tracking-tight text-balance text-white";

const AnimatedHeading = dynamic(
  () =>
    import("@/components/landing/animated-heading").then(
      (m) => m.AnimatedHeading,
    ),
  {
    ssr: false,
    loading: () => (
      <AnimatedHeadingFallback className={HEADING_CLASS}>
        Welcome back
      </AnimatedHeadingFallback>
    ),
  },
);

const MagneticButton = dynamic(
  () =>
    import("@/components/landing/magnetic-button").then((m) => m.MagneticButton),
  { ssr: false, loading: () => <MagneticButtonFallback /> },
);

type SearchParams = {
  next?: string;
  error?: string;
  deleted?: string;
  reset?: string;
};

export default function LoginPage({
  searchParams: params,
}: {
  searchParams: SearchParams;
}) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [isPending, startTransition] = useTransition();

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <AnimatedHeading
          as="h1"
          className="font-sans text-4xl sm:text-5xl font-extrabold tracking-tight text-balance text-white"
        >
          Welcome back
        </AnimatedHeading>
        <p className="mt-3 font-sans text-base font-normal text-white/60">
          Sign in to pick up where you left off.
        </p>
      </div>

      <HudPanel className="p-7 sm:p-8">
        {/* Flash banners surfaced from query params. */}
        <div className="space-y-3">
          {params.deleted === "1" && (
            <FlashBanner
              tone="info"
              title="Account deleted."
              body="Your account and all associated data have been removed."
            />
          )}
          {params.reset === "1" && (
            <FlashBanner
              tone="success"
              title="Password updated."
              body="Sign in with your new password."
            />
          )}
          {params.error && <ErrorBanner message={params.error} />}
        </div>

        <div
          className={cn(
            params.deleted === "1" ||
              params.reset === "1" ||
              params.error
              ? "mt-6"
              : "",
          )}
        >
          <ModeSwitch mode={mode} onChange={setMode} />
        </div>

        {mode === "password" ? (
          <form
            action={(fd) =>
              startTransition(() => signInWithPasswordAction(fd))
            }
            className="mt-6 space-y-4"
          >
            {params.next && (
              <input type="hidden" name="next" value={params.next} />
            )}
            <HudInput
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
            <HudInput
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="********"
              required
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="font-sans text-sm font-medium text-white/60 hover:text-[color:var(--accent)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <div className="flex justify-center pt-1">
              <MagneticButton
                variant="primary"
                type="submit"
                disabled={isPending}
                className="w-full text-sm"
              >
                {isPending ? "Signing in…" : "Sign in"}
              </MagneticButton>
            </div>
          </form>
        ) : (
          <form
            action={(fd) =>
              startTransition(() => signInWithMagicLinkAction(fd))
            }
            className="mt-6 space-y-4"
          >
            {params.next && (
              <input type="hidden" name="next" value={params.next} />
            )}
            <HudInput
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
            <div className="flex justify-center pt-1">
              <MagneticButton
                variant="primary"
                type="submit"
                disabled={isPending}
                className="w-full text-sm"
              >
                {isPending ? "Sending…" : "Email me a sign-in link"}
              </MagneticButton>
            </div>
          </form>
        )}

        <OrDivider />

        <OAuthRow redirectTo={params.next} />
      </HudPanel>

      <p className="mt-8 text-center font-sans text-sm font-medium text-white/60">
        New here?{" "}
        <Link
          href={`/signup${
            params.next ? `?next=${encodeURIComponent(params.next)}` : ""
          }`}
          className="text-[color:var(--accent)] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

// ---------------------------------------------------------------------------
// Login-mode toggle (password vs magic link)
// ---------------------------------------------------------------------------

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: "password" | "magic";
  onChange: (m: "password" | "magic") => void;
}) {
  return (
    <div
      className="relative grid grid-cols-2 gap-1 rounded-xl p-1"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {(["password", "magic"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={cn(
            "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            mode === m
              ? "text-[color:var(--bg)]"
              : "text-white/60 hover:text-white",
          )}
        >
          {mode === m && (
            <motion.span
              layoutId="auth-mode-pill"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="absolute inset-0 rounded-lg"
              style={{
                background: "var(--accent)",
              }}
            />
          )}
          <span className="relative inline-flex items-center justify-center gap-1.5">
            {m === "magic" && <Wand2 className="h-3.5 w-3.5" strokeWidth={2.5} />}
            {m === "password" ? "Password" : "Magic link"}
          </span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flash banner (info/success). The error variant is in @/components/auth/error-banner.
// ---------------------------------------------------------------------------

function FlashBanner({
  tone,
  title,
  body,
}: {
  tone: "info" | "success";
  title: string;
  body: string;
}) {
  const Icon = tone === "success" ? Check : Info;
  const borderColor =
    tone === "success"
      ? "rgba(255,255,255,0.12)"
      : "rgba(255,255,255,0.08)";
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl border px-3.5 py-3"
      style={{
        borderColor,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <Icon
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--accent)]"
        strokeWidth={2.5}
      />
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="mt-1 text-[13px] text-white/60">{body}</div>
      </div>
    </div>
  );
}
