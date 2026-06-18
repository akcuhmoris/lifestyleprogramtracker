"use client";

/**
 * Forgot-password page — Forge HUD treatment.
 *
 * Preserves the existing server-action wiring exactly:
 *   - sendPasswordResetAction(formData) -> { ok, error? }
 *
 * Visual-only rewrite of the previous /forgot-password page.
 */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle, Check, Target } from "lucide-react";
import { useState, useTransition } from "react";

import { sendPasswordResetAction } from "@/app/auth/actions";
import { BackgroundFx } from "@/components/hud/background-fx";
import { HudButton } from "@/components/hud/hud-button";
import { HudHeader } from "@/components/hud/hud-header";
import { HudInput } from "@/components/hud/hud-input";
import { HudPanel } from "@/components/hud/hud-panel";

type SearchParams = { error?: string };

export default function ForgotPasswordPage({
  searchParams: params,
}: {
  searchParams: SearchParams;
}) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(params.error ?? null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await sendPasswordResetAction(formData);
      if (!res.ok) {
        setError(res.error ?? "Couldn't send the reset email.");
        return;
      }
      setSent(String(formData.get("email") ?? "your email"));
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
          <HudHeader subtitle="Enter your email and we'll send a reset link.">
            Forgot your password?
          </HudHeader>

          {sent ? (
            <SentConfirmation email={sent} />
          ) : (
            <>
              <div className="mt-6 space-y-3">
                {error && <ErrorBanner message={error} />}
              </div>

              <form action={handleSubmit} className="mt-6 space-y-4">
                <HudInput
                  label="Email"
                  autoFocus
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />

                <HudButton
                  type="submit"
                  variant="primary"
                  loading={isPending}
                  className="w-full"
                >
                  Send reset link
                </HudButton>
              </form>
            </>
          )}
        </HudPanel>

        <p className="mt-8 text-center text-sm font-medium text-[color:var(--text-muted)]">
          Remembered it?{" "}
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
// Confirmation state after the reset email is sent
// ---------------------------------------------------------------------------

function SentConfirmation({ email }: { email: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="mt-6 rounded-2xl px-4 py-4"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
          }}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
        <div>
          <div className="text-sm font-semibold text-[color:var(--text)]">
            Check your inbox
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--text-muted)]">
            We sent a reset link to{" "}
            <span className="font-medium text-[color:var(--text)]">{email}</span>.
            It expires in 1 hour.
          </p>
        </div>
      </div>
    </motion.div>
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
