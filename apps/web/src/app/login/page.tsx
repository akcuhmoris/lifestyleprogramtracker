import Link from "next/link";
import { Check, Info, Target } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string; deleted?: string; reset?: string };
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

        {searchParams.deleted === "1" && (
          <FlashBanner
            tone="info"
            title="Account deleted."
            body="Your account and all associated data have been removed. Thanks for trying Program."
          />
        )}
        {searchParams.reset === "1" && (
          <FlashBanner
            tone="success"
            title="Password updated."
            body="Sign in with your new password."
          />
        )}

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

function FlashBanner({
  tone,
  title,
  body,
}: {
  tone: "info" | "success";
  title: string;
  body: string;
}) {
  const cls =
    tone === "success"
      ? "border-accent/40 bg-accent/5 text-accent-glow"
      : "border-border bg-bg-card text-text";
  const Icon = tone === "success" ? Check : Info;
  return (
    <div className={`mt-6 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 ${cls}`}>
      <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
      <div>
        <div className="text-[13px] font-semibold">{title}</div>
        <div className="mt-0.5 text-[12px] text-text-muted">{body}</div>
      </div>
    </div>
  );
}
