import { HudPanel } from "@/components/hud/hud-panel";

/**
 * Server-component skeleton shown while StatsPage is fetching aggregate data.
 * Mirrors the real page chrome (header + top stat readout + trends panel) so
 * the layout doesn't reflow when the live content arrives.
 */
export default function Loading() {
  return (
    <main
      className="mx-auto max-w-6xl px-6 py-12 lg:py-16"
      aria-busy="true"
      aria-label="Loading stats"
    >
      {/* Header */}
      <header className="mb-10 flex flex-col gap-3">
        <Shimmer className="h-10 w-32 rounded-md sm:h-12 sm:w-40" />
        <Shimmer className="h-4 w-64 rounded-md" />
      </header>

      {/* Top stat readout row */}
      <HudPanel className="mb-8 p-5 md:p-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Shimmer className="h-3 w-20 rounded" />
              <Shimmer className="h-8 w-14 rounded" />
            </div>
          ))}
        </div>
      </HudPanel>

      {/* Trends panel */}
      <HudPanel className="p-5 md:p-7">
        <div className="mb-5 flex items-center gap-3">
          <Shimmer className="h-4 w-16 rounded" />
          <span
            aria-hidden="true"
            className="h-px flex-1"
            style={{ background: "var(--hud-border)" }}
          />
        </div>

        {/* Overview row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-24 rounded-2xl" />
          ))}
        </div>

        {/* Totals + Weight cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Shimmer className="h-56 rounded-2xl" />
          <Shimmer className="h-56 rounded-2xl" />
        </div>

        {/* Per-task bars */}
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-4">
              <div>
                <Shimmer className="mb-2 h-3 w-40 rounded" />
                <Shimmer className="h-2 rounded-full" />
              </div>
              <Shimmer className="h-3 w-10 rounded" />
            </div>
          ))}
        </div>
      </HudPanel>
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
