"use client";

/**
 * Signup page — Midnight cinematic treatment, unified with the landing.
 *
 * Outer chrome (Midnight wrapper + brand lockup), the OAuth row, the "or
 * continue with" divider, and the error banner come from the shared auth
 * primitives in `@/components/auth/*`.
 *
 * Preserves the existing server action exactly:
 *
 *   - signUpAction (email, password, next)
 *
 * OAuth keeps the same supabase client wiring used elsewhere:
 *   redirectTo = ${origin}/auth/callback?next=${next}
 *   on error -> /login?error=<msg>
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useTransition } from "react";

import { signUpAction } from "@/app/auth/actions";
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

// Lazy-load the heavy landing primitives. See login/page.tsx for the rationale
// — they pull a sizeable chunk of framer-motion that isn't on the critical
// path. Fallbacks render static, no-motion stand-ins so layout doesn't shift.
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
        Begin your journey
      </AnimatedHeadingFallback>
    ),
  },
);

const MagneticButton = dynamic(
  () =>
    import("@/components/landing/magnetic-button").then((m) => m.MagneticButton),
  { ssr: false, loading: () => <MagneticButtonFallback /> },
);

type SearchParams = { next?: string; error?: string };

export default function SignupPage({
  searchParams: params,
}: {
  searchParams: SearchParams;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <AuthShell>
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

        <OAuthRow redirectTo={params.next} />

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
    </AuthShell>
  );
}
