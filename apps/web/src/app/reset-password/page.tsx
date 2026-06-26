"use client";

/**
 * Reset-password page — Midnight cinematic treatment, unified with the
 * landing.
 *
 * Outer chrome (Midnight wrapper + brand lockup) and the error banner come
 * from the shared auth primitives in `@/components/auth/*`.
 *
 * The user lands here after clicking the email reset link. Supabase's callback
 * has already exchanged the code for a session; we just capture the new
 * password and call setNewPasswordAction (which redirects to /login on success).
 *
 * Preserves the existing server-action wiring exactly:
 *   - setNewPasswordAction(formData)
 *   - Field names: `password`, `confirm`
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useTransition } from "react";

import { setNewPasswordAction } from "@/app/auth/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { ErrorBanner } from "@/components/auth/error-banner";
import {
  AnimatedHeadingFallback,
  MagneticButtonFallback,
} from "@/components/auth/lazy-fallbacks";
import { HudInput } from "@/components/hud/hud-input";
import { HudPanel } from "@/components/hud/hud-panel";

// See login/page.tsx for the rationale — lazy-load the landing primitives so
// /reset-password's first-load JS stays slim.
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
        Set a new password
      </AnimatedHeadingFallback>
    ),
  },
);

const MagneticButton = dynamic(
  () =>
    import("@/components/landing/magnetic-button").then((m) => m.MagneticButton),
  { ssr: false, loading: () => <MagneticButtonFallback /> },
);

type SearchParams = { error?: string };

export default function ResetPasswordPage({
  searchParams: params,
}: {
  searchParams: SearchParams;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(params.error ?? null);

  function handleSubmit(formData: FormData) {
    const pw = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (pw.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (pw !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await setNewPasswordAction(formData);
      if (res && !res.ok) {
        setError(res.error ?? "Couldn't update your password.");
      }
      // On success, the action redirects to /login?reset=1.
    });
  }

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <AnimatedHeading
          as="h1"
          className="font-sans text-4xl sm:text-5xl font-extrabold tracking-tight text-balance text-white"
        >
          Set a new password
        </AnimatedHeading>
        <p className="mt-3 font-sans text-base font-normal text-white/60">
          Choose something memorable and at least 8 characters.
        </p>
      </div>

      <HudPanel className="p-7 sm:p-8">
        <div className="space-y-3">
          {error && <ErrorBanner message={error} />}
        </div>

        <form
          action={handleSubmit}
          className={error ? "mt-6 space-y-4" : "space-y-4"}
        >
          <HudInput
            label="New password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            required
            autoFocus
          />
          <HudInput
            label="Confirm password"
            type="password"
            name="confirm"
            autoComplete="new-password"
            placeholder="Type it again"
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
              {isPending ? "Updating…" : "Update password"}
            </MagneticButton>
          </div>
        </form>
      </HudPanel>

      <p className="mt-8 text-center font-sans text-sm font-medium text-white/60">
        Changed your mind?{" "}
        <Link
          href="/login"
          className="text-[color:var(--accent)] hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
