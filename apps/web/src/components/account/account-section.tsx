"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  KeyRound,
  Loader2,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  updateEmailAction,
  updatePasswordAction,
} from "@/app/auth/actions";

type Props = { email: string };

export function AccountSection({ email }: Props) {
  return (
    <section
      id="account"
      className="mt-10 rounded-2xl border border-border bg-bg-card p-6"
    >
      <header className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 border border-accent/30 text-accent-glow flex-shrink-0">
          <UserIcon className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-medium">
            Account
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            You&apos;re signed in as{" "}
            <span className="text-text font-medium">{email}</span>.
          </p>
        </div>
      </header>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <ChangeEmailCard currentEmail={email} />
        <ChangePasswordCard />
      </div>
    </section>
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
          "mt-1.5 w-full rounded-lg bg-bg-elevated border border-border-subtle",
          "px-3 py-2 text-[13.5px] text-text placeholder:text-text-dim caret-accent",
          "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40",
          "transition-all"
        )}
      />
    </label>
  );
}

function ChangeEmailCard({ currentEmail }: { currentEmail: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    setPendingEmail(String(formData.get("email") ?? ""));
    startTransition(async () => {
      const res = await updateEmailAction(formData);
      if (!res.ok) {
        setError(res.error ?? "Couldn't update your email.");
        return;
      }
      setSuccess(res.message ?? "Confirmation email sent.");
    });
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
      <div className="flex items-center gap-2">
        <Mail className="h-3.5 w-3.5 text-text-muted" strokeWidth={2.4} />
        <h3 className="text-sm font-semibold text-text">Change email</h3>
      </div>
      <p className="mt-1 text-[12px] text-text-muted leading-relaxed">
        We&apos;ll email a confirmation link to the new address. Your existing
        email keeps working until you click it.
      </p>

      {success ? (
        <Notice tone="success" message={success} />
      ) : (
        <form action={handleSubmit} className="mt-3 space-y-2.5">
          <Field
            label="New email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder={currentEmail}
            required
          />
          {error && <Notice tone="error" message={error} />}
          <button
            type="submit"
            disabled={pending}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-[13px] font-medium text-accent-glow hover:bg-accent/15 transition-colors disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            {pending ? "Sending…" : "Send confirmation"}
          </button>
        </form>
      )}
    </div>
  );
}

function ChangePasswordCard() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    const newPw = String(formData.get("password") ?? "");
    const confirmPw = String(formData.get("confirm") ?? "");
    if (newPw.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setError("Passwords don't match.");
      return;
    }
    startTransition(async () => {
      const res = await updatePasswordAction(formData);
      if (!res.ok) {
        setError(res.error ?? "Couldn't update your password.");
        return;
      }
      setSuccess(res.message ?? "Password updated.");
    });
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
      <div className="flex items-center gap-2">
        <KeyRound className="h-3.5 w-3.5 text-text-muted" strokeWidth={2.4} />
        <h3 className="text-sm font-semibold text-text">Change password</h3>
      </div>
      <p className="mt-1 text-[12px] text-text-muted leading-relaxed">
        Confirm your current password, then pick a new one.
      </p>
      <form action={handleSubmit} className="mt-3 space-y-2.5">
        <Field
          label="Current password"
          type="password"
          name="current"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
        <Field
          label="New password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
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
        {error && <Notice tone="error" message={error} />}
        {success && <Notice tone="success" message={success} />}
        <button
          type="submit"
          disabled={pending}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-[13px] font-medium text-accent-glow hover:bg-accent/15 transition-colors disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

function Notice({
  tone,
  message,
}: {
  tone: "success" | "error";
  message: string;
}) {
  const color =
    tone === "success"
      ? "border-accent/40 bg-accent/5 text-accent-glow"
      : "border-state-miss/40 bg-state-miss/10 text-state-miss";
  const Icon = tone === "success" ? Check : AlertCircle;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 text-[11.5px] ${color}`}
      >
        <Icon className="h-3 w-3 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
        <span>{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
