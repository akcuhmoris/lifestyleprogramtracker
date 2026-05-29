/**
 * Tiny logger stub. Calling `logger.error(err, { route: "..." })` everywhere
 * means we only have to change one file when we wire in Sentry.
 *
 * To add Sentry later:
 *   1. `npx @sentry/wizard@latest -i nextjs`  (run inside apps/web)
 *   2. The wizard adds sentry.client.config.ts, sentry.server.config.ts,
 *      sentry.edge.config.ts, and updates next.config.mjs.
 *   3. Paste your DSN into apps/web/.env.local as SENTRY_DSN=...
 *   4. Uncomment the Sentry.captureException line below.
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

export const logger = {
  debug: (msg: string, ctx?: LogContext) => emit("debug", msg, ctx),
  info: (msg: string, ctx?: LogContext) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => emit("warn", msg, ctx),
  error: (err: unknown, ctx?: LogContext) => {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    emit("error", msg, { ...ctx, stack });
    // Sentry integration point — uncomment after running the wizard above:
    //   import * as Sentry from "@sentry/nextjs";
    //   Sentry.captureException(err, { extra: ctx });
  },
};
