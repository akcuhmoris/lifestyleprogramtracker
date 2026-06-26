/**
 * Sentry client-side configuration.
 *
 * Auto-loaded by `@sentry/nextjs` in the browser bundle when the Sentry
 * webpack plugin (configured in `next.config.mjs` via `withSentryConfig`)
 * is active.
 *
 * The Sentry SDK is required lazily via `eval("require")` so this file
 * type-checks and builds cleanly before the user runs
 * `npm install @sentry/nextjs`. Without `NEXT_PUBLIC_SENTRY_DSN` set,
 * the init call is skipped entirely.
 */
if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    // eval("require") hides the dependency from webpack so a missing
    // @sentry/nextjs package never breaks the import graph or the build.
    const dynamicRequire = eval("require") as NodeRequire;
    const Sentry = dynamicRequire("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      // 10% of transactions sampled for performance tracing.
      tracesSampleRate: 0.1,
      // Record a session replay on 50% of error events…
      replaysOnErrorSampleRate: 0.5,
      // …and on 1% of regular sessions, so we have a baseline.
      replaysSessionSampleRate: 0.01,
      environment: process.env.VERCEL_ENV ?? "development",
    });
  } catch {
    // Sentry not installed — no-op.
  }
}
