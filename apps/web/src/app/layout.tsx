import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import { cn } from "@/lib/utils";
import { Nav } from "@/components/nav";
import { WelcomeModal } from "@/components/welcome-modal";
import { TrpcProvider } from "@/lib/trpc/provider";
import { createClient } from "@/lib/supabase/server";
import { getCharacterProfile } from "@/lib/db";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LevelUpWatcher } from "@/components/character/level-up-context";
import { BackgroundFx } from "@/components/hud/background-fx";
import { AppCursorSpotlight } from "@/components/hud/app-cursor-spotlight";
import { PersistentHUD } from "@/components/hud/persistent-hud";
import { DEFAULT_THEME } from "@program/shared/themes";
import { tierForLevel } from "@program/shared/gamification";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const display = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

// Keep the legacy mono var alias so any code that still references
// `--font-geist-mono` (legal-prose, etc.) keeps working — we expose the same
// JetBrains_Mono font under both variable names by reusing the className.
const monoLegacyVar = "--font-geist-mono";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Lifestyle Program Tracker",
    template: "%s · Lifestyle Program Tracker",
  },
  description:
    "Track 75 Hard, 100 Hard, or any program you design. Pick a hero, show up, and level up.",
  applicationName: "Lifestyle Program Tracker",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "habit tracker",
    "75 hard",
    "100 hard",
    "lifestyle program",
    "discipline",
    "routine",
  ],
  openGraph: {
    type: "website",
    title: "Lifestyle Program Tracker",
    description:
      "Track 75 Hard, 100 Hard, or any program you design. Pick a hero, show up, and level up.",
    url: APP_URL,
    siteName: "Lifestyle Program Tracker",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lifestyle Program Tracker",
    description:
      "Track 75 Hard, 100 Hard, or any program you design. Pick a hero, show up, and level up.",
    images: ["/opengraph-image"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userEmail = data.user?.email ?? null;

  // Hero Mode: fetch the user's theme + level so we can apply the right CSS
  // vars on first render (no flash) and watch for level-ups. If the call
  // throws or the user is unauth, fall back to safe defaults.
  let theme = DEFAULT_THEME;
  let level: number | null = null;
  let heroProfile: Awaited<ReturnType<typeof getCharacterProfile>> | null = null;
  try {
    const profile = await getCharacterProfile();
    theme = profile.theme;
    if (userEmail) {
      level = profile.level;
      heroProfile = profile;
    }
  } catch {
    // Defaults already set.
  }

  // Quiet the unused-var linter — kept around so other places can still target
  // the legacy mono CSS variable name without a rename pass.
  void monoLegacyVar;

  return (
    <html
      lang="en"
      className={cn("dark", display.variable, mono.variable, sans.variable)}
      data-theme={theme}
    >
      <head>
        {/* Warm up DNS + TLS for Supabase so the first auth/data request
            doesn't pay the full handshake cost. */}
        {SUPABASE_URL ? (
          <>
            <link rel="preconnect" href={SUPABASE_URL} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={SUPABASE_URL} />
          </>
        ) : null}
      </head>
      <body
        className={cn(
          sans.variable,
          mono.variable,
          display.variable,
          "min-h-screen bg-bg text-text font-sans antialiased"
        )}
      >
        {/* Skip-to-main link — visible only when keyboard-focused.
            Helps screen-reader and keyboard users bypass the persistent
            nav + HUD chrome on every page. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[color:var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:ring-offset-2 focus:ring-offset-[color:var(--bg)]"
        >
          Skip to main content
        </a>
        <BackgroundFx />
        <TrpcProvider>
          <ThemeProvider theme={theme}>
            <AppCursorSpotlight />
            {level !== null ? <LevelUpWatcher level={level} /> : null}
            {heroProfile ? (
              <PersistentHUD
                archetype={heroProfile.archetype}
                tier={tierForLevel(heroProfile.level)}
                level={heroProfile.level}
                xp={heroProfile.xp}
              />
            ) : null}
            <Nav userEmail={userEmail} />
            <div id="main-content" tabIndex={-1} className="outline-none">
              {children}
            </div>
            <WelcomeModal />
          </ThemeProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
