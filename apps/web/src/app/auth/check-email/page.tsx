import Link from "next/link";
import { Mail } from "lucide-react";

import { BrandLockup } from "@/components/auth/brand-lockup";
import { CheckEmailHeading } from "@/components/auth/check-email-heading";
import { HudPanel } from "@/components/hud/hud-panel";

export const dynamic = "force-dynamic";

/**
 * Post-magic-link / post-signup confirmation screen.
 *
 * Force-applies the Midnight palette so the auth flow stays visually cohesive
 * with /login, /signup, /forgot-password, /reset-password and the landing.
 *
 * Doesn't use AuthShell because this view is centered vertically (the rest of
 * the auth pages anchor their column near the top). Still shares the brand
 * lockup via the `elevated` variant so the wordmark + glowing icon match the
 * rest of the auth surface visually.
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
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <BrandLockup variant="elevated" className="mb-10" />

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

          <CheckEmailHeading />

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
