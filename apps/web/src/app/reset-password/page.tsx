"use client";

/**
 * Reset-password page — Midnight cinematic treatment, unified with the
 * landing. Forces `data-theme="midnight"` on the wrapper. Reuses landing
 * primitives (AnimatedHeading, MagneticButton).
 *
 * The user lands here after clicking the email reset link. Supabase's callback
 * has already exchanged the code for a session; we just capture the new
 * password and call setNewPasswordAction (which redirects to /login on success).
 *
 * Preserves the existing server-action wiring exactly:
 *   - setNewPasswordAction(formData)
 *   - Field names: `password`, `confirm`
 */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle, Target } from "lucide-react";
import { useState, useTransition } from "react";

import { setNewPasswordAction } from "@/app/auth/actions";
import { AnimatedHeading } from "@/components/landing/animated-heading";
import { MagneticButton } from "@/components/landing/magnetic-button";
import { BackgroundFx } from "@/components/hud/background-fx";
import { HudInput } from "@/components/hud/hud-input";
import { HudPanel } from "@/components/hud/hud-panel";

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
    <div
      data-theme="midnight"
      className="relative min-h-screen bg-[#14141d] text-[#f5f5f7]"
    >
      <main className="relative min-h-screen flex flex-col items-center px-6 py-12">
        <BackgroundFx />

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
        </div>
      </main>
    </div>
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
