import Link from "next/link";
import { Target } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
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

      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          <span className="text-gradient-accent">Welcome back</span>
        </h1>
        <p className="mt-2 text-sm text-text-muted text-center">
          Sign in to continue your program.
        </p>

        <div className="mt-8">
          <LoginForm next={searchParams.next} initialError={searchParams.error} />
        </div>

        <p className="mt-6 text-center text-xs text-text-dim">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`}
            className="text-accent-glow hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
