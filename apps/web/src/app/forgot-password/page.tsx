import Link from "next/link";
import { Target } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage({
  searchParams: params,
}: {
  searchParams: { error?: string };
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
        <span className="text-text text-base">Lifestyle Program Tracker</span>
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          <span className="text-gradient-accent">Reset your password</span>
        </h1>
        <p className="mt-2 text-sm text-text-muted text-center">
          We&apos;ll email you a link to set a new password.
        </p>

        <div className="mt-8">
          <ForgotPasswordForm initialError={params.error} />
        </div>

        <p className="mt-6 text-center text-xs text-text-dim">
          Remembered it?{" "}
          <Link href="/login" className="text-accent-glow hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
