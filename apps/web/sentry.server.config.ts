/**
 * Sentry server-side configuration (Node runtime).
 *
 * Auto-loaded by `@sentry/nextjs` when the Sentry plugin in `next.config.mjs`
 * is active. SDK is required lazily so the build still passes before the
 * user runs `npm install @sentry/nextjs`. Without `NEXT_PUBLIC_SENTRY_DSN`,
 * init is skipped.
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const dynamicRequire = eval("require") as NodeRequire;
    const Sentry = dynamicRequire("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.VERCEL_ENV ?? "development",
    });
  } catch {
    // Sentry not installed — no-op.
  }
}
