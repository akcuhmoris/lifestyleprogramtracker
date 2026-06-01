import Link from "next/link";
import { Sparkles, Target } from "lucide-react";

export const metadata = {
  title: "Changelog",
  description: "What's new in Lifestyle Program Tracker.",
};

type Entry = {
  version: string;
  date: string;
  headline: string;
  bullets: string[];
};

const entries: Entry[] = [
  {
    version: "v0.7",
    date: "2026-06-01",
    headline: "Lifestyle Program Tracker",
    bullets: [
      'Renamed product from "Program" to "Lifestyle Program Tracker" — same app, longer name, clearer in App Store search.',
      "Signup onboarding picker at /onboarding — choose one of the 6 templates (or skip) before landing on Today.",
      "Stats page shows a friendly Day-1 banner instead of a wall of zeros for brand-new users.",
      "Comprehensive CI pipeline: 7 jobs covering lint, typecheck × 3 workspaces, tests, migrations sanity, audit, and build with bundle-size check.",
      "Claude Code GitHub Action: tag @claude in issues or PRs for review + Q&A.",
    ],
  },
  {
    version: "v0.6",
    date: "2026-05-31",
    headline: "Program templates",
    bullets: [
      "6 preset templates in Settings: 100 Hard, 75 Hard, Strength Builder, 30-Day Reset, Sober 30, Custom.",
      "One-click apply: archives current tasks (past completions preserved), inserts new tasks, sets length.",
      "Confirmation dialog previews the full task list with kinds (journal / photo / requires-text) before you commit.",
    ],
  },
  {
    version: "v0.5",
    date: "2026-05-30",
    headline: "Auth polish",
    bullets: [
      "Forgot-password flow with email reset + forced re-auth.",
      "Account section in Settings: change email and password in-app.",
      "Login flash banners after account deletion or password reset.",
      "Branded HTML email templates for Supabase auth.",
      "/help FAQ page and /changelog (this page).",
      "SEO basics: robots, sitemap, OpenGraph image, Twitter cards.",
      "CLAUDE.md orientation doc at the repo root.",
      "10 new tRPC router tests with a mock Supabase client.",
    ],
  },
  {
    version: "v0.4",
    date: "2026-05-29",
    headline: "Real auth & multi-tenancy",
    bullets: [
      "Migrated the web app off local SQLite to Supabase (Postgres + Auth + Storage).",
      "Sign up / sign in (email + password, magic link, Google + Apple OAuth UI).",
      "Account menu in the nav with quick links.",
      "Download my data (JSON export with signed photo URLs).",
      "Delete my account (cascade-deletes every row + every Storage object).",
      "/about marketing landing page.",
      "/privacy and /terms full drafts.",
      "tRPC routers in packages/api ready for the future mobile app.",
      "TanStack Query wired into the layout.",
      "tools/import-from-sqlite.mjs to migrate data from local SQLite to your Supabase account.",
    ],
  },
  {
    version: "v0.3",
    date: "2026-05-28",
    headline: "Backend infrastructure",
    bullets: [
      "Monorepo restructure (apps/web, packages/shared, packages/api).",
      "Supabase SQL migrations + RLS policies + sign-up seed trigger applied.",
      "Vitest test infrastructure; 25 unit tests for date math and task helpers.",
      "Security headers, /api/health endpoint, structured logger stub.",
      "CI workflow on every PR (lint + test + build).",
      "App Store + Play Store listing drafts in plan/store-listings/.",
    ],
  },
  {
    version: "v0.2",
    date: "2026-05-27",
    headline: "Lifestyle program rebrand",
    bullets: [
      'Rebranded from "100 Hard tracker" to Program — a generic lifestyle program tracker.',
      "Settings page lets you customize the length (1–365 days) and the daily task list.",
      "Workout cards require text. Reading card supports book/chapter logging.",
      "Progress photos upload + thumbnail + full-size preview.",
      "Welcome modal walks new users through every screen.",
    ],
  },
  {
    version: "v0.1",
    date: "2026-05-26",
    headline: "Local prototype",
    bullets: [
      "First playable build: today view, calendar heatmap, day-detail modal, stats page, journal modal, restart prompt, day-100 completion celebration.",
      "Local SQLite via better-sqlite3.",
      "Dark mode, electric-blue accents, framer-motion animations, canvas-confetti celebrations.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-bg shadow-glow">
          <Target className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="text-text">Lifestyle Program Tracker</span>
      </Link>

      <header className="mt-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-accent-glow shadow-[0_0_18px_-4px_rgba(14,165,255,0.5)]">
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          Changelog
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="text-gradient-accent">What&apos;s new</span>
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Release notes. Most-recent first.
        </p>
      </header>

      <ol className="mt-12 space-y-10">
        {entries.map((e) => (
          <li key={e.version} className="relative pl-8">
            <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-accent shadow-glow" />
            <div className="absolute left-[5px] top-5 bottom-0 w-px bg-border-subtle" />
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-xl font-semibold tracking-tight">
                <span className="text-gradient-accent">{e.version}</span>{" "}
                <span className="text-text-dim">·</span>{" "}
                <span className="text-text">{e.headline}</span>
              </h2>
              <span className="text-[11px] uppercase tracking-[0.18em] text-text-dim">
                {e.date}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5 list-disc list-outside ml-5 text-[13.5px] text-text-muted leading-relaxed">
              {e.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <footer className="mt-16 flex items-center justify-between border-t border-border-subtle pt-6 text-[12px] text-text-dim">
        <Link href="/about" className="hover:text-accent-glow transition-colors">
          About
        </Link>
        <Link href="/help" className="hover:text-accent-glow transition-colors">
          Help
        </Link>
        <Link href="/privacy" className="hover:text-accent-glow transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-accent-glow transition-colors">
          Terms
        </Link>
        <Link href="/" className="hover:text-accent-glow transition-colors">
          Home
        </Link>
      </footer>
    </main>
  );
}
