import Link from "next/link";
import { redirect } from "next/navigation";
import { Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OnboardingPicker } from "./onboarding-picker";

export const metadata = {
  title: "Pick your program",
  description: "Choose a starter template — you can change everything later.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-10 sm:py-14">
      <Link
        href="/"
        className="flex items-center gap-2.5 text-sm font-semibold tracking-tight mb-10"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-bg shadow-glow">
          <Target className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <span className="text-text text-base">Lifestyle Program Tracker</span>
      </Link>

      <div className="w-full max-w-3xl">
        <header className="text-center">
          <span className="text-[11px] uppercase tracking-[0.22em] text-text-dim font-medium">
            Step 1 of 1
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            <span className="text-gradient-accent">Pick your program</span>
          </h1>
          <p className="mt-3 text-sm text-text-muted leading-relaxed mx-auto max-w-lg">
            Start with a template that matches the lifestyle you&apos;re building.
            Every task, length, and rule is editable from Settings later.
          </p>
        </header>

        <OnboardingPicker />
      </div>
    </main>
  );
}
