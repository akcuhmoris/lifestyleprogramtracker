"use client";

import { useState } from "react";
import type { Archetype } from "@program/shared/gamification";
import { Aurora } from "./aurora";
import { CursorSpotlight } from "./cursor-spotlight";
import { ScrollProgress } from "./scroll-progress";
import { Marquee } from "./marquee";
import { Hero } from "./hero";
import { Promise as PromiseSection } from "./promise";
import { LiveDemo } from "./live-demo";
import { ArchetypesSection } from "./archetypes-section";
import { ThemesSection } from "./themes-section";
import { NumbersSection } from "./numbers-section";
import { CtaFooter } from "./cta-footer";

/**
 * Composes the marketing landing page. Lifts the currently-displayed archetype
 * so hovering an archetype card swaps the hero avatar in real time.
 *
 * Force-applies the Midnight palette via data-theme so visitors see the
 * cinematic dark theme regardless of any cookie-set theme.
 */
export function LandingPage() {
  const [currentArchetype, setCurrentArchetype] = useState<Archetype>("warrior");

  const marqueeItems = [
    "100 days · 6 heroes · 7 themes · ∞ levels",
    "Built for the long haul",
    "No ads · No trackers · No upsells",
    "Pick your hero · Show up · Level up",
    "Track 75 Hard · 100 Hard · or your own",
  ];

  return (
    <div data-theme="midnight" className="relative min-h-screen bg-[#14141d] text-[#f5f5f7]">
      <ScrollProgress />
      <Aurora />
      <CursorSpotlight />
      <main className="relative z-10">
        <Hero archetype={currentArchetype} />
        <Marquee items={marqueeItems} />
        <PromiseSection />
        <LiveDemo />
        <ArchetypesSection
          selected={currentArchetype}
          onHover={(a) => {
            if (a) setCurrentArchetype(a);
          }}
        />
        <ThemesSection />
        <NumbersSection />
        <CtaFooter />
      </main>
    </div>
  );
}

export default LandingPage;
