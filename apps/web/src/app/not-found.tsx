import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 border border-accent/30 text-accent-glow shadow-glow">
        <Compass className="h-6 w-6" strokeWidth={2} />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        <span className="text-gradient-accent">Page not found</span>
      </h1>
      <p className="mt-3 text-sm text-text-muted">
        That route doesn&apos;t exist — or it used to and we moved it.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-bg shadow-glow hover:brightness-110 transition-all"
      >
        Back to Today
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.8} />
      </Link>
    </main>
  );
}
