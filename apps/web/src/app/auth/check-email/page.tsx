import Link from "next/link";
import { Mail, Target } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CheckEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email;
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="flex items-center gap-2.5 text-sm font-semibold tracking-tight mb-10"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-bg shadow-glow">
          <Target className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <span className="text-text text-base">Program</span>
      </Link>

      <div className="w-full max-w-md text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-accent-glow shadow-glow">
          <Mail className="h-6 w-6" strokeWidth={2} />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="mt-3 text-sm text-text-muted leading-relaxed">
          We sent a sign-in link to{" "}
          <span className="text-text font-medium">
            {email ?? "your inbox"}
          </span>
          . Click it to continue. The link expires in one hour.
        </p>
        <p className="mt-6 text-xs text-text-dim">
          Wrong email?{" "}
          <Link href="/login" className="text-accent-glow hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
