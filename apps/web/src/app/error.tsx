"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { logger } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error(error, { digest: error.digest, scope: "app/error" });
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <div className="rounded-2xl border border-state-miss/40 bg-state-miss/5 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-state-miss/15 border border-state-miss/30 text-state-miss flex-shrink-0">
            <AlertTriangle className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text">
              Something broke.
            </h1>
            <p className="mt-2 text-[14px] text-text-muted leading-relaxed">
              An unexpected error stopped this page from rendering. Your data is
              fine — the next page load should work. If it keeps happening, copy
              the request ID below and{" "}
              <a
                href="mailto:support@program.app"
                className="text-accent-glow hover:underline"
              >
                drop us a note
              </a>
              .
            </p>
            {error.digest && (
              <p className="mt-3 font-mono text-[11px] text-text-dim">
                request id · {error.digest}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-bg shadow-glow hover:brightness-110 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.8} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-bg-card px-4 py-2 text-[13px] font-medium text-text hover:border-accent/40 hover:text-accent-glow transition-colors"
          >
            <Home className="h-3.5 w-3.5" strokeWidth={2.5} />
            Back to Today
          </Link>
        </div>
      </div>
    </main>
  );
}
