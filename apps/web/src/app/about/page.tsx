import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Camera,
  Check,
  Lock,
  PenLine,
  Settings as SettingsIcon,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { AnimatedHeading } from "@/components/landing/animated-heading";
import { HudPanel } from "@/components/hud/hud-panel";

export const metadata = {
  title: "Track any lifestyle program",
  description:
    "75 Hard, 100 Hard, or your own routine. A no-nonsense habit tracker with the polish to make every check feel earned.",
};

export default function AboutPage() {
  return (
    <div
      data-theme="midnight"
      className="relative min-h-screen overflow-hidden bg-[#14141d] text-[#f5f5f7]"
    >
      <main className="relative z-10">
        <Hero />
        <Features />
        <Privacy />
        <CtaFooter />
      </main>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-12 sm:px-8 lg:pt-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white"
      >
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
            boxShadow: "0 0 24px -8px var(--accent-glow)",
          }}
        >
          <Target className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span>Lifestyle Program Tracker</span>
      </Link>

      <HudPanel className="mt-10 p-6 text-center sm:p-10">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]"
          style={{
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent) 32%, transparent)",
            color: "var(--accent)",
          }}
        >
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: "var(--accent)" }}
          />
          Lifestyle program tracker
        </span>

        <AnimatedHeading
          as="h1"
          className="mt-6 text-balance font-[Inter,sans-serif] text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
        >
          About
        </AnimatedHeading>

        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          <span className="text-white">Track any program. Your tasks. Your rules.</span>
        </p>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
          75 Hard, 100 Hard, a 30-day reset, or a custom routine you invented
          yourself. Lifestyle Program Tracker gives you the structure to commit
          and the polish to make every check feel earned.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:brightness-110"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              boxShadow: "0 0 24px -6px var(--accent-glow)",
            }}
          >
            Start your program
            <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white/[0.20] hover:bg-white/[0.06]"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-5 text-xs text-white/50">
          Free during beta · No credit card required
        </p>
      </HudPanel>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: SettingsIcon,
      title: "Configure everything",
      body: "Pick the length (1–365 days). Add, edit, reorder, and remove tasks. Pick icons. Mark a task as Journal or Photo. Anything goes.",
    },
    {
      icon: Check,
      title: "Tap to complete",
      body: "Each task is a card. Spring animation, ripple, confetti — the kind of feedback that makes you want to come back tomorrow.",
    },
    {
      icon: PenLine,
      title: "Capture the context",
      body: "Log what you did on every workout. Write a reflective journal. Save free-text notes. Track your weight day-by-day.",
    },
    {
      icon: Camera,
      title: "Daily progress photos",
      body: "Upload from your camera roll. Stored securely under your account. Browse them by day on the calendar.",
    },
    {
      icon: Calendar,
      title: "Calendar at a glance",
      body: "Every day color-coded — blue for full, yellow for partial, red for missed, dim for future. Tap any past day to edit it.",
    },
    {
      icon: BarChart3,
      title: "Stats that matter",
      body: "Per-task completion bars. Total water, workouts, pages, journal entries. Weight trend sparkline. The full picture in one view.",
    },
    {
      icon: Trophy,
      title: "Restart with grace",
      body: "Miss a day? Restart from Day 1, or keep going on modified rules. Your past attempts are archived, never lost.",
    },
    {
      icon: Sparkles,
      title: "Built for the finish line",
      body: "When every day in your program is complete, you get a celebration screen with the full run summary. Earn the moment.",
    },
  ];

  return (
    <section className="mx-auto mt-20 max-w-3xl px-6 sm:px-8">
      <header className="text-center">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">
          What you get
        </p>
        <h2 className="mt-3 font-[Inter,sans-serif] text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Eight reasons it sticks
        </h2>
      </header>

      <HudPanel className="mt-10 p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </HudPanel>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Target;
  title: string;
  body: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]">
      <div className="pointer-events-none mb-4">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
          style={{
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent) 32%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <h3 className="font-[Inter,sans-serif] text-[14px] font-bold tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/70">
        {body}
      </p>
    </div>
  );
}

function Privacy() {
  return (
    <section className="mx-auto mt-20 max-w-3xl px-6 sm:px-8">
      <HudPanel className="p-6 text-center sm:p-10">
        <span
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{
            background: "color-mix(in srgb, var(--accent) 14%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent) 38%, transparent)",
            color: "var(--accent)",
            boxShadow: "0 0 24px -6px var(--accent-glow)",
          }}
        >
          <Lock className="h-5 w-5" strokeWidth={2} />
        </span>
        <h2 className="mt-6 font-[Inter,sans-serif] text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Private by design
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
          No ads. No third-party trackers. No selling your data to anyone, ever.
          Your data syncs between your devices and lives only in your account.
          Delete it all with one tap.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4 text-[12px]">
          <Link
            href="/privacy"
            className="underline transition-colors hover:text-white"
            style={{ color: "var(--accent)" }}
          >
            Privacy Policy
          </Link>
          <span className="text-white/40">·</span>
          <Link
            href="/terms"
            className="underline transition-colors hover:text-white"
            style={{ color: "var(--accent)" }}
          >
            Terms of Service
          </Link>
        </div>
      </HudPanel>
    </section>
  );
}

function CtaFooter() {
  return (
    <section className="mx-auto mt-20 max-w-3xl px-6 pb-16 sm:px-8">
      <HudPanel className="p-6 text-center sm:p-10">
        <h2 className="font-[Inter,sans-serif] text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready? Day 1 starts when you do.
        </h2>
        <div className="mt-8">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:brightness-110"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              boxShadow: "0 0 24px -6px var(--accent-glow)",
            }}
          >
            Create your account
            <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
          </Link>
        </div>
      </HudPanel>

      <footer className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-4 border-t border-white/[0.08] pt-6 text-xs text-white/50">
        <Link href="/about" className="transition-colors hover:text-white">
          About
        </Link>
        <span className="text-white/30">·</span>
        <Link href="/help" className="transition-colors hover:text-white">
          Help
        </Link>
        <span className="text-white/30">·</span>
        <Link href="/changelog" className="transition-colors hover:text-white">
          Changelog
        </Link>
        <span className="text-white/30">·</span>
        <Link href="/privacy" className="transition-colors hover:text-white">
          Privacy
        </Link>
        <span className="text-white/30">·</span>
        <Link href="/terms" className="transition-colors hover:text-white">
          Terms
        </Link>
      </footer>
    </section>
  );
}
