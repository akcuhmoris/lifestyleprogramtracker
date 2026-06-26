/**
 * Structured logger with optional Sentry capture.
 *
 * Sentry integration is wired in — see `sentry.{client,server,edge}.config.ts`
 * and the `withSentryConfig` wrap in `next.config.mjs`. Until the user runs
 * `npm install @sentry/nextjs` and sets `NEXT_PUBLIC_SENTRY_DSN`, the
 * `captureToSentry` helper below silently no-ops via the try/catch — nothing
 * else in the app needs to change.
 *
 * Calling `logger.error(err, { route: "..." })` everywhere means we only have
 * to change this one file when we want to tweak how errors get reported.
 */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown> | undefined;

function emit(level: LogLevel, msg: string, ctx: LogContext) {
  if (process.env.NODE_ENV === "test") return;
  const payload = ctx ? { msg, ...ctx } : { msg };
  // Newline-delimited JSON is friendly to Vercel / Cloud logs.
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    ...payload,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/**
 * Best-effort Sentry capture. Wrapped in try/catch so:
 *   - missing `@sentry/nextjs` (before user runs `npm install`)
 *   - missing DSN (no-op init)
 *   - Sentry SDK throwing internally
 * never crash the caller.
 */
function captureToSentry(
  kind: "exception" | "message",
  payload: unknown,
  ctx: LogContext,
  level?: "warning" | "error"
) {
  if (process.env.NODE_ENV === "test") return;
  // Skip entirely until the user installs @sentry/nextjs and provides a DSN.
  // Once installed, swap this guard out and import Sentry directly at the top
  // of the file — keeping it gated keeps the build green without the package.
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  try {
    // Use eval to dodge webpack's static dependency analysis so a missing
    // @sentry/nextjs package never breaks the import graph.
    const dynamicRequire = eval("require") as NodeRequire;
    const Sentry = dynamicRequire("@sentry/nextjs");
    if (kind === "exception") {
      Sentry.captureException(payload, { extra: ctx });
    } else {
      Sentry.captureMessage(String(payload), {
        level: level ?? "warning",
        extra: ctx,
      });
    }
  } catch {
    // Sentry not installed / not initialized — that's fine.
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => emit("debug", msg, ctx),
  info: (msg: string, ctx?: LogContext) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => {
    emit("warn", msg, ctx);
    captureToSentry("message", msg, ctx, "warning");
  },
  error: (err: unknown, ctx?: LogContext) => {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    emit("error", msg, { ...ctx, stack });
    captureToSentry("exception", err, ctx, "error");
  },
};
