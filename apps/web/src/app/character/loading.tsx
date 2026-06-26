import { HudPanel } from "@/components/hud/hud-panel";

/**
 * Server-component skeleton shown while CharacterPage is fetching the
 * character profile. Mirrors the real page chrome (hero panel with avatar +
 * stats column, and archetype picker grid) so the layout doesn't reflow when
 * the live content arrives.
 */
export default function Loading() {
  return (
    <main
      className="mx-auto max-w-5xl px-6 py-12 lg:py-16"
      aria-busy="true"
      aria-label="Loading character"
    >
      {/* Header */}
      <header className="mb-10 flex flex-col gap-3">
        <Shimmer className="h-10 w-48 rounded-md sm:h-12 sm:w-64" />
        <Shimmer className="h-4 w-80 max-w-full rounded-md" />
      </header>

      {/* Hero panel: avatar on left, stat blocks on right */}
      <HudPanel tone="accent" className="mb-14 overflow-hidden">
        <div className="flex flex-col gap-10 px-6 py-10 md:flex-row md:items-stretch md:gap-12 md:px-10 md:py-12">
          {/* LEFT — avatar + name + tier */}
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <Shimmer className="h-40 w-40 rounded-full sm:h-48 sm:w-48" />
            <Shimmer className="h-7 w-44 rounded-md" />
            <Shimmer className="h-4 w-28 rounded-md" />
          </div>

          {/* Divider */}
          <div
            aria-hidden="true"
            className="hidden w-px shrink-0 md:block"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--hud-border-strong), transparent)",
            }}
          />

          {/* RIGHT — stat blocks (incl. the big level number) */}
          <div className="flex flex-1 flex-col justify-center gap-6">
            <Shimmer className="h-4 w-32 rounded" />

            {/* Total XP */}
            <div className="flex flex-col gap-2">
              <Shimmer className="h-3 w-20 rounded" />
              <Shimmer className="h-8 w-24 rounded" />
            </div>

            {/* Level (big) — analogous to the level bar / hero stat */}
            <div className="flex flex-col gap-2">
              <Shimmer className="h-3 w-16 rounded" />
              <Shimmer className="h-12 w-32 rounded" />
              <Shimmer className="mt-2 h-2 w-full rounded-full" />
            </div>

            {/* Tier */}
            <div className="flex flex-col gap-2">
              <Shimmer className="h-3 w-14 rounded" />
              <Shimmer className="h-8 w-28 rounded" />
            </div>

            {/* To next level */}
            <div className="flex flex-col gap-2">
              <Shimmer className="h-3 w-24 rounded" />
              <Shimmer className="h-8 w-32 rounded" />
            </div>
          </div>
        </div>
      </HudPanel>

      {/* Switch your path */}
      <section>
        <header className="mb-8 flex flex-col gap-3">
          <Shimmer className="h-8 w-56 rounded-md sm:h-10 sm:w-64" />
          <Shimmer className="h-4 w-72 max-w-full rounded-md" />
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </section>
    </main>
  );
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-white/[0.04] ${className ?? ""}`}
    />
  );
}
