"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { sendPasswordResetAction } from "@/app/auth/actions";

type Props = { initialError?: string };

export function ForgotPasswordForm({ initialError }: Props) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);

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

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-4"
      >
        <div className="flex items-start gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 border border-accent/30 text-accent-glow flex-shrink-0">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div>
            <div className="text-[13.5px] font-semibold text-text">
              Email sent.
            </div>
            <p className="mt-1 text-[12.5px] text-text-muted leading-relaxed">
              We sent a password reset link to{" "}
              <span className="text-text font-medium">{sent}</span>. The link
              expires in 1 hour.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <ErrorBanner message={error} />}
      <form action={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-text-dim font-medium">
            Email
          </span>
          <input
            autoFocus
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className={cn(
              "mt-1.5 w-full rounded-xl bg-bg-elevated border border-border-subtle",
              "px-3.5 py-2.5 text-[14px] text-text placeholder:text-text-dim caret-accent",
              "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40",
              "transition-all"
            )}
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xl",
            "bg-accent px-4 py-2.5 text-[14px] font-semibold text-bg shadow-glow",
            "hover:brightness-110 transition-all disabled:opacity-60"
          )}
        >
          Send reset email
          <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
        </button>
      </form>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-2 rounded-xl border border-state-miss/40 bg-state-miss/10 px-3 py-2.5 text-[12.5px] text-state-miss"
      >
        <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
        <span>{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
