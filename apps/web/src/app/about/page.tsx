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

export const metadata = {
  title: "Track any lifestyle program",
  description:
    "75 Hard, 100 Hard, or your own routine. A no-nonsense habit tracker with the polish to make every check feel earned.",
};

export default function AboutPage() {
  return (
    <main className="relative">
      <Hero />
      <Features />
      <Privacy />
      <CtaFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-16 pb-20 text-center">
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-bg shadow-glow">
          <Target className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="text-text">Program</span>
      </Link>

      <span className="mt-10 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-accent-glow shadow-[0_0_18px_-4px_rgba(14,165,255,0.5)]">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        Lifestyle program tracker
      </span>

      <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
        <span className="text-gradient-accent">Track any program.</span>
        <br />
        <span className="text-text">Your tasks. Your rules.</span>
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-base text-text-muted leading-relaxed sm:text-lg">
        75 Hard, 100 Hard, a 30-day reset, or a custom routine you invented
        yourself. Program gives you the structure to commit and the polish to
        make every check feel earned.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-bg shadow-glow hover:brightness-110 transition-all"
        >
          Start your program
          <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-bg-card px-6 py-3 text-sm font-medium text-text hover:border-accent/40 hover:text-accent-glow transition-colors"
        >
          Sign in
        </Link>
      </div>

      <p className="mt-5 text-xs text-text-dim">
        Free during beta · No credit card required
      </p>
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
    <section className="relative border-t border-border-subtle py-20">
      <div className="mx-auto max-w-6xl px-6">
        <header className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.22em] text-text-dim">
            What you get
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            <span className="text-gradient-accent">Eight reasons</span>{" "}
            <span className="text-text-dim">it sticks</span>
          </h2>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </div>
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
    <div className="group rounded-2xl border border-border bg-bg-card p-5 transition-colors hover:border-accent/30 hover:bg-bg-hover">
      <div className="pointer-events-none mb-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-bg-elevated text-text-muted group-hover:text-accent-glow group-hover:border-accent/30 transition-all">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <h3 className="text-[14px] font-semibold tracking-tight text-text">
        {title}
      </h3>
      <p className="mt-1.5 text-[12.5px] text-text-muted leading-relaxed">
        {body}
      </p>
    </div>
  );
}

function Privacy() {
  return (
    <section className="border-t border-border-subtle py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent-glow shadow-glow">
          <Lock className="h-5 w-5" strokeWidth={2} />
        </span>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          <span className="text-gradient-accent">Private by design</span>
        </h2>
        <p className="mt-4 text-sm text-text-muted leading-relaxed sm:text-base">
          No ads. No third-party trackers. No selling your data to anyone, ever.
          Your data syncs between your devices and lives only in your account.
          Delete it all with one tap.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4 text-[12px]">
          <Link href="/privacy" className="text-accent-glow hover:underline">
            Privacy Policy
          </Link>
          <span className="text-text-dim">·</span>
          <Link href="/terms" className="text-accent-glow hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </section>
  );
}

function CtaFooter() {
  return (
    <section className="border-t border-border-subtle py-16">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          <span className="text-text">Ready?</span>{" "}
          <span className="text-gradient-accent">Day 1 starts when you do.</span>
        </h2>
        <div className="mt-8">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-bg shadow-glow hover:brightness-110 transition-all"
          >
            Create your account
            <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
          </Link>
        </div>
        <footer className="mt-16 border-t border-border-subtle pt-6 text-[12px] text-text-dim flex items-center justify-center gap-4">
          <Link href="/about" className="hover:text-accent-glow transition-colors">
            About
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-accent-glow transition-colors">
            Privacy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-accent-glow transition-colors">
            Terms
          </Link>
        </footer>
      </div>
    </section>
  );
}
