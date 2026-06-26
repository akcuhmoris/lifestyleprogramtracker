/**
 * "or continue with" divider used between the primary auth form and the OAuth
 * row. Server component.
 */

export function OrDivider() {
  return (
    <div className="relative my-6 flex items-center gap-3">
      <span
        className="h-px flex-1"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
      <span className="text-xs font-medium text-white/50">
        or continue with
      </span>
      <span
        className="h-px flex-1"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
    </div>
  );
}
