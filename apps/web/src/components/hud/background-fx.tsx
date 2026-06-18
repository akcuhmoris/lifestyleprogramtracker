/**
 * BackgroundFx — soft ambient background.
 *
 * Three stacked layers behind everything (fixed inset-0 -z-10):
 *   1) A soft radial vignette tinted with the active theme accent (low opacity).
 *   2) A few large blurred accent-colored radial gradients in the corners to
 *      create a gentle gradient mesh (static, no animation).
 *   3) A very faint SVG noise overlay for texture.
 *
 * No animated grid — softened from the original HUD look.
 * Honors `prefers-reduced-motion` automatically (no animations to suppress).
 */
export function BackgroundFx() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Layer 1 — soft radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 600px at 70% -10%, var(--hud-glow-soft), transparent 65%), radial-gradient(700px 500px at 10% 110%, var(--hud-glow-soft), transparent 70%)",
          opacity: 0.6,
        }}
      />

      {/* Layer 2 — soft gradient mesh (corner blobs) */}
      <div
        className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full blur-3xl"
        style={{
          background: "var(--accent)",
          opacity: 0.08,
        }}
      />
      <div
        className="absolute -right-32 top-1/4 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background: "var(--accent)",
          opacity: 0.06,
        }}
      />
      <div
        className="absolute -bottom-40 left-1/3 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background: "var(--accent)",
          opacity: 0.07,
        }}
      />

      {/* Layer 3 — very subtle noise */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.015] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="hud-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hud-noise)" />
      </svg>
    </div>
  );
}

export default BackgroundFx;
