"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { setNewPasswordAction } from "@/app/auth/actions";

type Props = { initialError?: string };

export function ResetPasswordForm({ initialError }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(initialError ?? null);

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
      // On success, the action redirects to /.
    });
  }

  return (
    <div className="space-y-3">
      {error && <ErrorBanner message={error} />}
      <form action={handleSubmit} className="space-y-3">
        <Field
          label="New password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
          autoFocus
        />
        <Field
          label="Confirm new password"
          type="password"
          name="confirm"
          autoComplete="new-password"
          placeholder="Type it again"
          minLength={8}
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xl",
            "bg-accent px-4 py-2.5 text-[14px] font-semibold text-bg shadow-glow",
            "hover:brightness-110 transition-all disabled:opacity-60"
          )}
        >
          Update password
          <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
        </button>
      </form>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em] text-text-dim font-medium">
        {label}
      </span>
      <input
        {...rest}
        className={cn(
          "mt-1.5 w-full rounded-xl bg-bg-elevated border border-border-subtle",
          "px-3.5 py-2.5 text-[14px] text-text placeholder:text-text-dim caret-accent",
          "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40",
          "transition-all"
        )}
      />
    </label>
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
