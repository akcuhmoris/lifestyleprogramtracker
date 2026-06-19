import Link from "next/link";
import { Mail, Target } from "lucide-react";

import { AnimatedHeading } from "@/components/landing/animated-heading";
import { BackgroundFx } from "@/components/hud/background-fx";
import { HudPanel } from "@/components/hud/hud-panel";

export const dynamic = "force-dynamic";

/**
 * Post-magic-link / post-signup confirmation screen.
 *
 * Force-applies the Midnight palette so the auth flow stays visually cohesive
 * with /login, /signup, /forgot-password, /reset-password and the landing.
 */
export default function CheckEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email;

  return (
    <div
      data-theme="midnight"
      className="relative min-h-screen overflow-hidden bg-[#14141d] text-[#f5f5f7]"
    >
      <BackgroundFx />

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

        <HudPanel className="w-full max-w-md p-10 text-center">
          <span
            className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "color-mix(in srgb, var(--accent) 14%, transparent)",
              border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)",
              color: "var(--accent)",
              boxShadow: "0 0 32px -8px var(--accent-glow)",
            }}
          >
            <Mail className="h-7 w-7" strokeWidth={2} />
          </span>

          <AnimatedHeading
            as="h1"
            className="mt-6 text-balance text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
          >
            Check your email
          </AnimatedHeading>

          <p className="mt-4 text-sm font-normal leading-relaxed text-white/60">
            We sent a sign-in link to{" "}
            <span className="font-medium text-white">
              {email ?? "your inbox"}
            </span>
            . Click it to continue — the link expires in one hour.
          </p>

          <p className="mt-8 text-xs font-medium text-white/50">
            Wrong email?{" "}
            <Link
              href="/login"
              className="font-semibold transition-colors hover:text-white"
              style={{ color: "var(--accent)" }}
            >
              Back to sign in
            </Link>
          </p>
        </HudPanel>
      </main>
    </div>
  );
}
