"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, AlertCircle, Wand2 } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  signInWithPasswordAction,
  signInWithMagicLinkAction,
} from "@/app/auth/actions";
import { OAuthButtons } from "./oauth-buttons";

type Props = {
  next?: string;
  initialError?: string;
};

export function LoginForm({ next, initialError }: Props) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <ModeSwitch mode={mode} onChange={setMode} />

      {initialError && <ErrorBanner message={initialError} />}

      {mode === "password" ? (
        <form
          action={(fd) => startTransition(() => signInWithPasswordAction(fd))}
          className="space-y-3"
        >
          {next && <input type="hidden" name="next" value={next} />}
          <Field
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <Field
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
          <SubmitButton pending={isPending} label="Sign in" />
        </form>
      ) : (
        <form
          action={(fd) => startTransition(() => signInWithMagicLinkAction(fd))}
          className="space-y-3"
        >
          {next && <input type="hidden" name="next" value={next} />}
          <Field
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <SubmitButton pending={isPending} label="Email me a sign-in link" />
        </form>
      )}

      <OAuthButtons next={next} />
    </div>
  );
}

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: "password" | "magic";
  onChange: (m: "password" | "magic") => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border-subtle bg-bg-card p-1">
      {(["password", "magic"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={cn(
            "relative flex-1 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
            mode === m ? "text-bg" : "text-text-muted hover:text-text"
          )}
        >
          {mode === m && (
            <motion.span
              layoutId="auth-pill"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="absolute inset-0 rounded-full bg-accent shadow-glow"
            />
          )}
          <span className="relative inline-flex items-center justify-center gap-1.5">
            {m === "magic" && <Wand2 className="h-3 w-3" strokeWidth={2.5} />}
            {m === "password" ? "Password" : "Magic link"}
          </span>
        </button>
      ))}
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

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xl",
        "bg-accent px-4 py-2.5 text-[14px] font-semibold text-bg shadow-glow",
        "hover:brightness-110 transition-all disabled:opacity-60"
      )}
    >
      {label}
      <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
    </button>
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
