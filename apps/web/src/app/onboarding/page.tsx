import Link from "next/link";
import { redirect } from "next/navigation";
import { Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AnimatedHeading } from "@/components/landing/animated-heading";
import { BackgroundFx } from "@/components/hud/background-fx";
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
    <div
      data-theme="midnight"
      className="relative min-h-screen bg-[#14141d] text-[#f5f5f7]"
    >
      <BackgroundFx />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-tight"
          style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
        >
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#14141d]"
            style={{
              background: "#a5b4fc",
            }}
          >
            <Target className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">
            Lifestyle Program Tracker
          </span>
        </Link>

        <div className="mx-auto mt-14 w-full max-w-5xl sm:mt-16">
          <div className="flex flex-col items-start gap-4">
            <AnimatedHeading
              as="h1"
              className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
            >
              Pick your program
            </AnimatedHeading>
            <p
              className="max-w-2xl text-base font-normal text-white/60 sm:text-lg"
              style={{
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
              }}
            >
              You can change this anytime in Settings.
            </p>
          </div>

          <OnboardingPicker />
        </div>
      </main>
    </div>
  );
}
