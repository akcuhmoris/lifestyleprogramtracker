import Link from "next/link";
import { Target } from "lucide-react";

type Props = {
  title: string;
  updated: string;
  children: React.ReactNode;
};

/**
 * Shared chrome for /privacy and /terms.
 * Uses a constrained, readable prose width with our typography tokens.
 */
export function LegalPage({ title, updated, children }: Props) {
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
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="text-gradient-accent">{title}</span>
        </h1>
        <p className="mt-3 text-sm text-text-muted">Last updated: {updated}</p>
      </header>

      <article className="legal-prose mt-10 text-text">{children}</article>

      <footer className="mt-16 flex items-center justify-between border-t border-border-subtle pt-6 text-[12px] text-text-dim">
        <Link href="/about" className="hover:text-accent-glow transition-colors">
          About
        </Link>
        <Link href="/help" className="hover:text-accent-glow transition-colors">
          Help
        </Link>
        <Link href="/changelog" className="hover:text-accent-glow transition-colors">
          Changelog
        </Link>
        <Link href="/privacy" className="hover:text-accent-glow transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-accent-glow transition-colors">
          Terms
        </Link>
      </footer>
    </main>
  );
}
