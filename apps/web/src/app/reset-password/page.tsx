"use client";

/**
 * Reset-password page — Forge HUD treatment.
 *
 * The user lands here after clicking the email reset link. Supabase's callback
 * has already exchanged the code for a session; we just capture the new
 * password and call setNewPasswordAction (which redirects to /login on success).
 *
 * Preserves the existing server-action wiring exactly:
 *   - setNewPasswordAction(formData)
 *   - Field names: `password`, `confirm`
 *
 * Visual-only rewrite of the previous /reset-password page.
 */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle, Target } from "lucide-react";
import { useState, useTransition } from "react";

import { setNewPasswordAction } from "@/app/auth/actions";
import { BackgroundFx } from "@/components/hud/background-fx";
import { HudButton } from "@/components/hud/hud-button";
import { HudHeader } from "@/components/hud/hud-header";
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

      <div className="mx-auto mt-16 w-full max-w-md">
        <HudPanel className="p-7 sm:p-8">
          <HudHeader subtitle="Choose something memorable and at least 8 characters.">
            Set a new password
          </HudHeader>

          <div className="mt-6 space-y-3">
            {error && <ErrorBanner message={error} />}
          </div>

          <form action={handleSubmit} className="mt-6 space-y-4">
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

            <HudButton
              type="submit"
              variant="primary"
              loading={isPending}
              className="w-full"
            >
              Update password
            </HudButton>
          </form>
        </HudPanel>

        <p className="mt-8 text-center text-sm font-medium text-[color:var(--text-muted)]">
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
  );
}

// ---------------------------------------------------------------------------
// Error banner (HUD-skinned)
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
