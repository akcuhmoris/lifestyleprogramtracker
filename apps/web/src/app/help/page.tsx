import Link from "next/link";
import {
  Calendar,
  Camera,
  Download,
  HelpCircle,
  KeyRound,
  Lock,
  Mail,
  PenLine,
  RotateCcw,
  Settings,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";

export const metadata = {
  title: "Help",
  description:
    "Common questions about Program — how to restart, edit past days, delete your account, and where your data lives.",
};

type Question = {
  icon: typeof HelpCircle;
  q: string;
  a: React.ReactNode;
};

const items: { section: string; questions: Question[] }[] = [
  {
    section: "Day-to-day use",
    questions: [
      {
        icon: Calendar,
        q: "Can I edit yesterday's tasks?",
        a: (
          <>
            Yes. Open the <strong>Calendar</strong> tab, tap the day, and check
            or uncheck any of the 12 tasks. The day&apos;s color (red / yellow /
            blue) updates the moment you close the modal.
          </>
        ),
      },
      {
        icon: RotateCcw,
        q: "I missed a day. What happens?",
        a: (
          <>
            The next time you open the app, a banner appears at the top of
            Today: <em>You missed N tasks on [date]. Restart from Day 1 or keep
            going (modified rules)?</em>
            <ul className="mt-3 ml-5 list-disc">
              <li>
                <strong>Restart from Day 1.</strong> Archives the current attempt
                (data stays in the DB, just isn&apos;t shown anymore). A new
                program starts today as Day 1.
              </li>
              <li>
                <strong>Keep going (modified rules).</strong> The miss stays on
                the calendar. The day counter advances normally.
              </li>
            </ul>
          </>
        ),
      },
      {
        icon: Camera,
        q: "Where do my progress photos go?",
        a: (
          <>
            They&apos;re uploaded to your private Supabase Storage bucket under{" "}
            <code>progress-photos/[your-user-id]/[date].[ext]</code>. Only you
            (and the service-role key on the server) can read them — every URL
            we show you is signed and expires in an hour. Replace or remove a
            photo from the Today view&apos;s photo card or from the calendar
            day-detail modal.
          </>
        ),
      },
      {
        icon: PenLine,
        q: "Do workouts really require text?",
        a: (
          <>
            Yes — by default, Workout 1 and Workout 2 are marked{" "}
            <strong>requires text</strong>. The checkbox won&apos;t flip until
            you log what you did. You can toggle this on any task from{" "}
            <strong>Settings → Daily requirements</strong>.
          </>
        ),
      },
      {
        icon: Trophy,
        q: "What happens at Day 100?",
        a: (
          <>
            If every day in your program is fully complete, the Today screen
            replaces itself with a victory layout — trophy, totals (water,
            workouts, pages, journal, photos, weight change), start → end dates,
            and confetti. Otherwise the Today view says &ldquo;Challenge
            complete&rdquo; and you can review on the calendar.
          </>
        ),
      },
    ],
  },
  {
    section: "Customizing your program",
    questions: [
      {
        icon: Settings,
        q: "How do I change the length or task list?",
        a: (
          <>
            Open <strong>Settings</strong>. The first card lets you change the
            length (1–365 days). Below it, the daily requirements editor lets
            you add, edit, reorder, or delete tasks. Set any task as a{" "}
            <strong>Journal</strong> (modal write surface) or{" "}
            <strong>Photo</strong> (file picker) — at most one of each.
          </>
        ),
      },
      {
        icon: Target,
        q: "Can I run multiple programs at once?",
        a: (
          <>
            Not in v1. Only one program is active at a time. Restarting
            archives the current one and starts a new one.
          </>
        ),
      },
    ],
  },
  {
    section: "Account & data",
    questions: [
      {
        icon: KeyRound,
        q: "I forgot my password.",
        a: (
          <>
            On the sign-in screen, click <strong>Forgot password?</strong>{" "}
            Enter your email and you&apos;ll receive a reset link that expires
            in 1 hour.
          </>
        ),
      },
      {
        icon: Mail,
        q: "Can I change my email?",
        a: (
          <>
            Yes — <strong>Settings → Account → Change email</strong>. We send a
            confirmation link to the new address; until you click it, your
            existing email keeps working.
          </>
        ),
      },
      {
        icon: Download,
        q: "Can I download all my data?",
        a: (
          <>
            <strong>Settings → Account & data → Download my data</strong>{" "}
            generates a JSON file with every row tied to your account: profile,
            tasks, completions, journal entries, weights, photos (with signed
            URLs valid for 24h), and settings. One click, one file.
          </>
        ),
      },
      {
        icon: Trash2,
        q: "How do I delete my account?",
        a: (
          <>
            <strong>Settings → Account & data → Delete account</strong>. Type{" "}
            <code>DELETE</code> in the confirmation modal. We immediately remove
            your <code>auth.users</code> row, which cascade-deletes every row
            tied to you across all tables, plus we wipe every photo in your
            Storage folder. There is no undo.
          </>
        ),
      },
      {
        icon: Lock,
        q: "Who can see my data?",
        a: (
          <>
            Only you. Every Postgres table that holds your data has a row-level
            security policy that scopes reads / writes to{" "}
            <code>auth.uid() = user_id</code>. The Storage bucket has the same
            policy keyed off the user-id folder. We do not share data with
            advertisers, data brokers, or marketing networks. Full details in
            our <Link href="/privacy" className="text-accent-glow hover:underline">Privacy Policy</Link>.
          </>
        ),
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-bg shadow-glow">
          <Target className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="text-text">Program</span>
      </Link>

      <header className="mt-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-accent-glow shadow-[0_0_18px_-4px_rgba(14,165,255,0.5)]">
          <HelpCircle className="h-3 w-3" strokeWidth={2.5} />
          Help
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="text-gradient-accent">Questions you&apos;ll probably ask</span>
        </h1>
        <p className="mt-4 text-sm text-text-muted leading-relaxed">
          Couldn&apos;t find what you need? Email{" "}
          <a href="mailto:support@program.app" className="text-accent-glow hover:underline">
            support@program.app
          </a>{" "}
          and a human will reply within 72 hours.
        </p>
      </header>

      <div className="mt-12 space-y-12">
        {items.map((group) => (
          <section key={group.section}>
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-medium">
              {group.section}
            </h2>
            <div className="mt-4 space-y-3">
              {group.questions.map((qa, i) => {
                const Icon = qa.icon;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-bg-card p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/30 text-accent-glow flex-shrink-0">
                        <Icon className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-semibold text-text">
                          {qa.q}
                        </h3>
                        <div className="legal-prose mt-2 text-[13.5px] text-text-muted">
                          {qa.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-16 flex items-center justify-between border-t border-border-subtle pt-6 text-[12px] text-text-dim">
        <Link href="/about" className="hover:text-accent-glow transition-colors">
          About
        </Link>
        <Link href="/privacy" className="hover:text-accent-glow transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-accent-glow transition-colors">
          Terms
        </Link>
        <Link href="/changelog" className="hover:text-accent-glow transition-colors">
          Changelog
        </Link>
        <Link href="/" className="hover:text-accent-glow transition-colors">
          Program
        </Link>
      </footer>
    </main>
  );
}
