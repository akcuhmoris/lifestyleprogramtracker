import { HudPanel } from "@/components/hud/hud-panel";

/**
 * Server-component skeleton shown while CalendarPage is fetching the
 * day-status grid. Mirrors the real page chrome (header + legend + grid) so
 * the layout doesn't reflow when the live content arrives.
 */
export default function Loading() {
  return (
    <main
      className="mx-auto max-w-6xl px-6 py-12 lg:py-16"
      aria-busy="true"
      aria-label="Loading calendar"
    >
      {/* Header */}
      <header className="mb-10 flex flex-col gap-3">
        <Shimmer className="h-10 w-40 rounded-md sm:h-12 sm:w-48" />
        <Shimmer className="h-4 w-80 max-w-full rounded-md" />
      </header>

      <HudPanel className="p-5 md:p-7">
        <div className="mb-5 flex items-center gap-3">
          <Shimmer className="h-4 w-20 rounded" />
          <span
            aria-hidden="true"
            className="h-px flex-1"
            style={{ background: "var(--hud-border)" }}
          />
        </div>

        {/* Legend placeholder */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Shimmer className="h-3 w-16 rounded" />
            <Shimmer className="h-8 w-32 rounded" />
            <Shimmer className="h-3 w-24 rounded" />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Shimmer className="h-2.5 w-2.5 rounded-sm" />
                <Shimmer className="h-3 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Day grid — 100 cells, matches the default program length */}
        <div className="mt-8 grid grid-cols-5 gap-2.5 sm:grid-cols-10">
          {Array.from({ length: 100 }).map((_, i) => (
            <Shimmer
              key={i}
              className="aspect-square rounded-xl"
            />
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
