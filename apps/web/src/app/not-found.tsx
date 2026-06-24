import Link from "next/link";
import { Compass, ArrowRight, Target } from "lucide-react";

import { AnimatedHeading } from "@/components/landing/animated-heading";
import { HudPanel } from "@/components/hud/hud-panel";

/**
 * 404 page.
 *
 * Force-applies the Midnight palette so it stays visually cohesive with the
 * landing, auth flow, and the rest of the app. `BackgroundFx` is mounted by
 * the root layout, so we don't re-mount it here.
 */
export default function NotFound() {
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
            <Compass className="h-7 w-7" strokeWidth={2} />
          </span>

          <AnimatedHeading
            as="h1"
            className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-balance text-white"
          >
            Page not found
          </AnimatedHeading>

          <p className="mt-4 text-sm font-normal leading-relaxed text-white/60">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all hover:brightness-110"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              boxShadow: "0 0 24px -8px var(--accent-glow)",
            }}
          >
            Go home
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.8} />
          </Link>
        </HudPanel>
      </main>
    </div>
  );
}
