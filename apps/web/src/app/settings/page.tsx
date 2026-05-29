import { getTasks, getTotalDays } from "@/lib/db";
import { SettingsForm } from "@/components/settings-form";
import { AccountSection } from "@/components/account/account-section";
import { DangerZone } from "@/components/account/danger-zone";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email ?? "";

  const [tasks, totalDays] = await Promise.all([getTasks(), getTotalDays()]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 lg:py-14">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-accent-glow shadow-[0_0_18px_-4px_rgba(14,165,255,0.5)]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Settings
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="text-gradient-accent">Make it yours</span>
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Length and daily requirements. Changes apply immediately. The daily notes
          field and per-day weight log are always available.
        </p>
      </header>

      <SettingsForm initialTotalDays={totalDays} initialTasks={tasks} />

      <AccountSection email={email} />
      <DangerZone email={email} />
    </main>
  );
}
