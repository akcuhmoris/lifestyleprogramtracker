"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { signUpAction } from "@/app/auth/actions";
import { OAuthButtons } from "./oauth-buttons";

type Props = {
  next?: string;
  initialError?: string;
};

export function SignupForm({ next, initialError }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {initialError && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-xl border border-state-miss/40 bg-state-miss/10 px-3 py-2.5 text-[12.5px] text-state-miss"
          >
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
            <span>{initialError}</span>
          </motion.div>
        </AnimatePresence>
      )}

      <form
        action={(fd) => startTransition(() => signUpAction(fd))}
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
          Create account
          <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
        </button>
      </form>

      <OAuthButtons next={next} />

      <p className="text-[11.5px] text-text-dim leading-relaxed">
        By creating an account you agree to our{" "}
        <a href="/terms" className="text-accent-glow hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-accent-glow hover:underline">
          Privacy Policy
        </a>
        .
      </p>
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
