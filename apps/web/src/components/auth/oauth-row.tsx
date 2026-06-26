"use client";

/**
 * Shared "Continue with Google" + "Continue with Apple" row used by the login
 * and signup pages.
 *
 * Preserves the exact OAuth wiring used previously across the auth pages:
 *   redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next ?? "/")}`
 *   on error -> /login?error=<msg>
 *
 * No props besides `redirectTo` (the `next` value to forward through the OAuth
 * callback). Renders MagneticButton variant="ghost" to match landing styling.
 */

import dynamic from "next/dynamic";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

import { MagneticButtonFallback } from "./lazy-fallbacks";
import { AppleIcon, GoogleIcon } from "./oauth-icons";

// Lazy-load MagneticButton — it pulls a substantial slice of framer-motion
// (springs + motion values) for the magnetic pull effect, which is pure polish
// rather than critical-path. The fallback renders a static button with the
// same `ghost` styling so the row is fully interactive (and won't shift) before
// the bundle arrives.
const MagneticButton = dynamic(
  () =>
    import("@/components/landing/magnetic-button").then((m) => m.MagneticButton),
  {
    ssr: false,
    loading: () => <MagneticButtonFallback variant="ghost" className="w-full gap-2 text-sm" />,
  },
);

type Props = {
  redirectTo?: string;
};

export function OAuthRow({ redirectTo }: Props) {
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);

  async function signInWith(provider: "google" | "apple") {
    setBusy(provider);
    const supabase = createClient();
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      redirectTo ?? "/",
    )}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirect },
    });
    if (error) {
      setBusy(null);
      window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
    }
    // If no error, the browser redirects to the OAuth provider.
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <MagneticButton
        variant="ghost"
        type="button"
        onClick={() => signInWith("google")}
        disabled={busy !== null}
        className="w-full gap-2 text-sm"
      >
        <GoogleIcon />
        <span>
          {busy === "google" ? "Connecting…" : "Continue with Google"}
        </span>
      </MagneticButton>
      <MagneticButton
        variant="ghost"
        type="button"
        onClick={() => signInWith("apple")}
        disabled={busy !== null}
        className="w-full gap-2 text-sm"
      >
        <AppleIcon />
        <span>
          {busy === "apple" ? "Connecting…" : "Continue with Apple"}
        </span>
      </MagneticButton>
    </div>
  );
}
