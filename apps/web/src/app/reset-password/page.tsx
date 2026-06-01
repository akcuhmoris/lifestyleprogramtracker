import Link from "next/link";
import { Target } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

/**
 * The user lands here after clicking the email reset link. Supabase's callback
 * has already exchanged the code for a session; we just need to capture the new
 * password.
 */
export default function ResetPasswordPage({
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
        <span className="text-text text-base">Program</span>
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          <span className="text-gradient-accent">Set a new password</span>
        </h1>
        <p className="mt-2 text-sm text-text-muted text-center">
          Pick something you&apos;ll actually remember this time.
        </p>

        <div className="mt-8">
          <ResetPasswordForm initialError={params.error} />
        </div>
      </div>
    </main>
  );
}
