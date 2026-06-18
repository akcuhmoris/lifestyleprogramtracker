import Link from "next/link";
import { redirect } from "next/navigation";
import { Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HudHeader } from "@/components/hud/hud-header";
import { OnboardingPicker } from "./onboarding-picker";

export const metadata = {
  title: "Pick your program",
  description: "Pick a starter program — you can change it anytime in Settings.",
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
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[color:var(--bg)]"
          style={{
            background: "var(--accent)",
          }}
        >
          <Target className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <span className="text-sm font-semibold tracking-tight text-[color:var(--text)]">
          Lifestyle Program Tracker
        </span>
      </Link>

      <div className="w-full max-w-4xl">
        <HudHeader
          subtitle="You can change this anytime in Settings."
          className="items-start"
        >
          Pick your program
        </HudHeader>

        <OnboardingPicker />
      </div>
    </main>
  );
}
