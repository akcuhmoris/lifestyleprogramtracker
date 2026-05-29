import { Loader2 } from "lucide-react";

/**
 * Generic skeleton that shows while a server-component page is awaiting data.
 * Sized to match the page chrome so the layout doesn't reflow when the real
 * content arrives.
 */
export function LoadingShell({
  label = "Loading",
  height = "min-h-[40vh]",
}: {
  label?: string;
  height?: string;
}) {
  return (
    <div className={`mx-auto flex max-w-6xl items-center justify-center px-6 py-10 ${height}`}>
      <div className="flex items-center gap-2.5 text-text-dim">
        <Loader2 className="h-4 w-4 animate-spin text-accent-glow" strokeWidth={2.5} />
        <span className="text-[12.5px] uppercase tracking-[0.18em]">{label}</span>
      </div>
    </div>
  );
}
