import { getCharacterProfile, getTasks, getTotalDays } from "@/lib/db";
import { SettingsForm } from "@/components/settings-form";
import { TemplatesSection } from "@/components/templates-section";
import { AccountSection } from "@/components/account/account-section";
import { DangerZone } from "@/components/account/danger-zone";
import { ThemePicker } from "@/components/theme/theme-picker";
import { createClient } from "@/lib/supabase/server";
import { HudHeader } from "@/components/hud/hud-header";
import { HudPanel } from "@/components/hud/hud-panel";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email ?? "";

  const [tasks, totalDays, profile] = await Promise.all([
    getTasks(),
    getTotalDays(),
    getCharacterProfile(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 lg:py-14">
      <HudHeader
        subtitle="Tune your program length, daily requirements, theme, and account. Changes apply immediately."
      >
        Settings
      </HudHeader>

      <div className="mt-10 space-y-8">
        {/* TASKS — templates + length + daily requirements */}
        <SectionPanel title="Program">
          <p className="text-sm text-[color:var(--text-muted)]">
            Choose a preset, set your program length, then shape the exact
            requirements you&apos;ll check off each day.
          </p>
          <div className="mt-6 space-y-6">
            <TemplatesSection currentTaskCount={tasks.length} />
            <SettingsForm
              initialTotalDays={totalDays}
              initialTasks={tasks}
            />
          </div>
        </SectionPanel>

        {/* THEMES — appearance / vibe */}
        <SectionPanel title="Appearance">
          <p className="text-sm text-[color:var(--text-muted)]">
            Pick the vibe that matches you. The interface recolors instantly.
          </p>
          <div className="mt-6">
            <ThemePicker current={profile.theme} />
          </div>
        </SectionPanel>

        {/* PROFILE — email / password */}
        <SectionPanel title="Account">
          <p className="text-sm text-[color:var(--text-muted)]">
            Update your sign-in email or change your password.
          </p>
          <div className="mt-6">
            <AccountSection email={email} />
          </div>
        </SectionPanel>

        {/* ACCOUNT — export + delete */}
        <SectionPanel title="Danger zone">
          <p className="text-sm text-[color:var(--text-muted)]">
            Export your records or permanently delete your account.
          </p>
          <div className="mt-6">
            <DangerZone email={email} />
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// SectionPanel — local helper. Each settings section gets its own soft
// HudPanel with an Inter sentence-case title.
// ---------------------------------------------------------------------------

function SectionPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <HudPanel className="p-6 md:p-8">
      <header className="mb-2 flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight text-[color:var(--text)] md:text-xl">
          {title}
        </h2>
      </header>
      {children}
    </HudPanel>
  );
}
