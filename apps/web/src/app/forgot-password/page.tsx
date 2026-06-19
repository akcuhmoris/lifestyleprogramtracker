"use client";

/**
 * Forgot-password page — Midnight cinematic treatment, unified with the
 * landing. Forces `data-theme="midnight"` on the wrapper. Reuses landing
 * primitives (AnimatedHeading, MagneticButton).
 *
 * Preserves the existing server-action wiring exactly:
 *   - sendPasswordResetAction(formData) -> { ok, error? }
 */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle, Check, Target } from "lucide-react";
import { useState, useTransition } from "react";

import { sendPasswordResetAction } from "@/app/auth/actions";
import { AnimatedHeading } from "@/components/landing/animated-heading";
import { MagneticButton } from "@/components/landing/magnetic-button";
import { BackgroundFx } from "@/components/hud/background-fx";
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
              Recover your account
            </AnimatedHeading>
            <p className="mt-3 font-sans text-base font-normal text-white/60">
              Enter your email and we&apos;ll send a reset link.
            </p>
          </div>

          <HudPanel className="p-7 sm:p-8">
            {sent ? (
              <SentConfirmation email={sent} />
            ) : (
              <>
                <div className="space-y-3">
                  {error && <ErrorBanner message={error} />}
                </div>

                <form
                  action={handleSubmit}
                  className={error ? "mt-6 space-y-4" : "space-y-4"}
                >
                  <HudInput
                    label="Email"
                    autoFocus
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
                      {isPending ? "Sending…" : "Send reset link"}
                    </MagneticButton>
                  </div>
                </form>
              </>
            )}
          </HudPanel>

          <p className="mt-8 text-center font-sans text-sm font-medium text-white/60">
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
    </div>
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
      className="rounded-2xl px-4 py-4"
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
          <div className="text-sm font-semibold text-white">
            Check your inbox
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">
            We sent a reset link to{" "}
            <span className="font-medium text-white">{email}</span>. It expires
            in 1 hour.
          </p>
        </div>
      </div>
    </motion.div>
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
