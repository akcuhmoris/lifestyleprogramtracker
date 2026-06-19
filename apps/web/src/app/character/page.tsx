import { redirect } from "next/navigation";
import {
  ARCHETYPES,
  tierForLevel,
  tierName,
  xpToNextLevel,
} from "@program/shared/gamification";
import { createClient } from "@/lib/supabase/server";
import { getCharacterProfile } from "@/lib/db";
import { CharacterAvatar } from "@/components/character/avatar";
import { HudPanel } from "@/components/hud/hud-panel";
import { StatBlock } from "@/components/hud/stat-block";
import { AnimatedHeading } from "@/components/landing/animated-heading";
import { ArchetypePicker } from "./archetype-picker";

export const dynamic = "force-dynamic";

export default async function CharacterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCharacterProfile();
  const { archetype, xp, level } = profile;

  const tier = tierForLevel(level);
  const tierLabel = tierName(tier);
  const progress = xpToNextLevel(xp);
  const xpRemaining = Math.max(progress.needed - progress.current, 0);
  const archetypeMeta =
    ARCHETYPES.find((a) => a.id === archetype) ?? ARCHETYPES[0];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
      <header className="mb-10 flex flex-col gap-3">
        <AnimatedHeading
          as="h1"
          className="text-balance font-sans text-4xl font-extrabold tracking-tight text-[color:var(--text)] sm:text-5xl"
        >
          {archetypeMeta.name}
        </AnimatedHeading>
        <p className="max-w-2xl text-base font-normal text-white/60">
          {archetypeMeta.tagline}
        </p>
      </header>

      <HudPanel tone="accent" className="mb-14 overflow-hidden">
        <div className="flex flex-col gap-10 px-6 py-10 md:flex-row md:items-stretch md:gap-12 md:px-10 md:py-12">
          {/* LEFT — Character sheet */}
          <div className="relative flex flex-1 flex-col items-center justify-center gap-6">
            {/* Radial backdrop glow in archetype accent */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-0 opacity-70 blur-3xl"
              style={{
                background: `radial-gradient(circle at center, ${archetypeMeta.accent}44 0%, transparent 65%)`,
              }}
            />

            <div className="relative z-10 flex flex-col items-center gap-5">
              <CharacterAvatar archetype={archetype} tier={tier} size="xl" />

              <div className="flex flex-col items-center gap-1.5 text-center">
                {/* Hero moment: keep the display Orbitron treatment on the
                    archetype name. */}
                <h2
                  className="font-display text-2xl uppercase tracking-[0.22em] text-[color:var(--text)] md:text-3xl"
                >
                  {archetypeMeta.name}
                </h2>
                <p className="text-sm font-semibold text-[color:var(--text-muted)]">
                  {tierLabel} tier
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            aria-hidden
            className="hidden w-px shrink-0 md:block"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--hud-border-strong), transparent)",
            }}
          />

          {/* RIGHT — Stat panel */}
          <div className="relative z-10 flex flex-1 flex-col justify-center gap-6">
            <h3 className="text-sm font-semibold text-[color:var(--text-muted)]">
              Character stats
            </h3>

            <StatBlock label="Total XP" value={xp.toLocaleString()} />
            {/* Hero moment: keep the big Orbitron number on Level. */}
            <StatBlock label="Level" value={level} emphasis="large" />
            <StatBlock label="Tier" value={tierLabel} />
            <StatBlock
              label="To next level"
              value={`${xpRemaining.toLocaleString()} XP`}
            />
          </div>
        </div>
      </HudPanel>

      <section>
        <header className="mb-8 flex flex-col gap-3">
          <AnimatedHeading
            as="h2"
            className="text-balance font-sans text-3xl font-extrabold tracking-tight text-[color:var(--text)] sm:text-4xl"
          >
            Switch your path
          </AnimatedHeading>
          <p className="max-w-2xl text-base font-normal text-white/60">
            Pick the archetype that fits the version of you you&apos;re
            building. You can switch any time.
          </p>
        </header>

        <ArchetypePicker current={archetype} />
      </section>
    </main>
  );
}
