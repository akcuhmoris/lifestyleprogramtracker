"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, Target } from "lucide-react";

import { AnimatedHeading } from "@/components/landing/animated-heading";
import { HudPanel } from "@/components/hud/hud-panel";
import { logger } from "@/lib/logger";

/**
 * Global error boundary.
 *
 * Force-applies the Midnight palette so it stays visually cohesive with the
 * landing, auth flow, and the rest of the app. `BackgroundFx` is mounted by
 * the root layout, so we don't re-mount it here.
 */
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
    <div
      data-theme="midnight"
      className="relative min-h-screen overflow-hidden bg-[#14141d] text-[#f5f5f7]"
    >
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <Link
          href="/"
          className="mb-10 flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white"
        >
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              boxShadow: "0 0 24px -8px var(--accent-glow)",
            }}
          >
            <Target className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-base">Lifestyle Program Tracker</span>
        </Link>

        <HudPanel className="mx-auto w-full max-w-md p-10 text-center">
          <span
            className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "color-mix(in srgb, var(--accent) 14%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--accent) 40%, transparent)",
              color: "var(--accent)",
              boxShadow: "0 0 32px -8px var(--accent-glow)",
            }}
          >
            <AlertTriangle className="h-7 w-7" strokeWidth={2} />
          </span>

          <AnimatedHeading
            as="h1"
            className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-balance text-white"
          >
            Something went wrong
          </AnimatedHeading>

          <p className="mt-4 text-sm font-normal leading-relaxed text-white/60">
            An unexpected error stopped this page from rendering. Your data is
            safe — the next page load should work. If it keeps happening, copy
            the request ID below and{" "}
            <a
              href="mailto:support@program.app"
              className="font-semibold transition-colors hover:text-white"
              style={{ color: "var(--accent)" }}
            >
              drop us a note
            </a>
            .
          </p>

          {error.digest && (
            <p className="mt-4 font-mono text-[11px] text-white/50">
              request id · {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all hover:brightness-110"
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
                boxShadow: "0 0 24px -8px var(--accent-glow)",
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.8} />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              <Home className="h-3.5 w-3.5" strokeWidth={2.5} />
              Back to Today
            </Link>
          </div>
        </HudPanel>
      </main>
    </div>
  );
}
