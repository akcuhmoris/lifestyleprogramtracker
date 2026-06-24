"use client";

/**
 * Signup page — Midnight cinematic treatment, unified with the landing.
 *
 * Forces the Midnight palette via `data-theme="midnight"` on the wrapper so the
 * auth flow always feels cinematic regardless of the user's saved theme cookie.
 * Reuses landing primitives (AnimatedHeading, MagneticButton).
 *
 * Preserves the existing server action exactly:
 *
 *   - signUpAction (email, password, next)
 *
 * OAuth (Google, Apple) keeps the same supabase client wiring used elsewhere:
 *   redirectTo = ${origin}/auth/callback?next=${next}
 *   on error -> /login?error=<msg>
 */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle, Target } from "lucide-react";
import { useState, useTransition } from "react";

import { signUpAction } from "@/app/auth/actions";
import { AnimatedHeading } from "@/components/landing/animated-heading";
import { MagneticButton } from "@/components/landing/magnetic-button";
import { HudInput } from "@/components/hud/hud-input";
import { HudPanel } from "@/components/hud/hud-panel";
import { createClient } from "@/lib/supabase/client";

type SearchParams = { next?: string; error?: string };

export default function SignupPage({
  searchParams: params,
}: {
  searchParams: SearchParams;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      data-theme="midnight"
      className="relative min-h-screen bg-[#14141d] text-[#f5f5f7]"
    >
      <main className="relative min-h-screen flex flex-col items-center px-6 py-12">
        <Link
          href="/"
          className="mt-2 flex items-center gap-2.5 text-sm font-semibold tracking-tight text-[color:var(--text)]"
        >
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
            }}
          >
            <Target className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span>Lifestyle Program Tracker</span>
        </Link>

        <div className="mx-auto mt-14 w-full max-w-md">
          <div className="mb-8 text-center">
            <AnimatedHeading
              as="h1"
              className="font-sans text-4xl sm:text-5xl font-extrabold tracking-tight text-balance text-white"
            >
              Begin your journey
            </AnimatedHeading>
            <p className="mt-3 font-sans text-base font-normal text-white/60">
              Track any structured program — your way.
            </p>
          </div>

          <HudPanel className="p-7 sm:p-8">
            <div className="space-y-3">
              {params.error && <ErrorBanner message={params.error} />}
            </div>

            <form
              action={(fd) => startTransition(() => signUpAction(fd))}
              className={params.error ? "mt-6 space-y-4" : "space-y-4"}
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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />

              <div className="flex justify-center pt-1">
                <MagneticButton
                  variant="primary"
                  type="submit"
                  disabled={isPending}
                  className="w-full text-sm"
                >
                  {isPending ? "Creating account…" : "Create account"}
                </MagneticButton>
              </div>
            </form>

            <OrDivider />

            <OAuthRow next={params.next} />

            <p className="mt-6 text-[13px] leading-relaxed text-white/60">
              By creating an account you agree to our{" "}
              <Link
                href="/terms"
                className="text-[color:var(--accent)] hover:underline"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-[color:var(--accent)] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </HudPanel>

          <p className="mt-8 text-center font-sans text-sm font-medium text-white/60">
            Already have an account?{" "}
            <Link
              href={`/login${
                params.next ? `?next=${encodeURIComponent(params.next)}` : ""
              }`}
              className="text-[color:var(--accent)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// "or continue with" divider
// ---------------------------------------------------------------------------

function OrDivider() {
  return (
    <div className="relative my-6 flex items-center gap-3">
      <span
        className="h-px flex-1"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
      <span className="text-xs font-medium text-white/50">
        or continue with
      </span>
      <span
        className="h-px flex-1"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// OAuth: Google + Apple. Same wiring as the original OAuthButtons component.
// ---------------------------------------------------------------------------

function OAuthRow({ next }: { next?: string }) {
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);

  async function signInWith(provider: "google" | "apple") {
    setBusy(provider);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next ?? "/",
    )}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) {
      setBusy(null);
      window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <MagneticButton
        variant="ghost"
        type="button"
        onClick={() => signInWith("google")}
        disabled={busy !== null}
        className="w-full gap-2 text-sm"
      >
        <GoogleIcon />
        <span>
          {busy === "google" ? "Connecting…" : "Continue with Google"}
        </span>
      </MagneticButton>
      <MagneticButton
        variant="ghost"
        type="button"
        onClick={() => signInWith("apple")}
        disabled={busy !== null}
        className="w-full gap-2 text-sm"
      >
        <AppleIcon />
        <span>
          {busy === "apple" ? "Connecting…" : "Continue with Apple"}
        </span>
      </MagneticButton>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M16.365 1.43c0 1.14-.39 2.18-1.17 3.13c-.94 1.13-2.06 1.79-3.27 1.69c-.15-1.11.4-2.27 1.17-3.05c.76-.78 2.05-1.62 3.27-1.77zM20.79 17.21c-.6 1.4-1.32 2.78-2.45 4.18c-1.04 1.27-2.14 1.91-3.31 1.91c-1.12 0-1.92-.59-3.06-.59c-1.18 0-2.04.62-3.12.62c-1.16 0-2.27-.72-3.31-2.04c-2.18-2.78-3.85-7.84-1.61-11.26c1.1-1.68 3.07-2.74 5.13-2.74c1.18 0 2.27.69 3.12.69c.85 0 2.21-.78 3.74-.68c.62.03 2.4.27 3.55 2.01c-3.13 1.7-2.65 6.03.32 7.9z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Error banner
// ---------------------------------------------------------------------------

function ErrorBanner({ message }: { message: string }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-[13px]"
        style={{
          border: "1px solid rgba(244, 63, 94, 0.35)",
          background: "rgba(244, 63, 94, 0.07)",
          color: "#fda4af",
        }}
      >
        <AlertCircle
          className="mt-0.5 h-4 w-4 flex-shrink-0"
          strokeWidth={2.5}
        />
        <span>{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
