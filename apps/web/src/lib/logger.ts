/**
 * Tiny logger stub. Swap the body for Sentry / structured logging in week 9.
 *
 * Why a stub?  Calling `logger.error(err, { route: "..." })` everywhere
 * means we only have to change one file when we wire in Sentry — no
 * grep-and-replace across the app.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown> | undefined;

function emit(level: LogLevel, msg: string, ctx: LogContext) {
  if (process.env.NODE_ENV === "test") return;
  const payload = ctx ? { msg, ...ctx } : { msg };
  // Newline-delimited JSON is friendly to Vercel / Cloud logs.
  const line = JSON.stringify({ level, time: new Date().toISOString(), ...payload });
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
    // Sentry hook lands here once configured:
    //   Sentry.captureException(err, { extra: ctx });
  },
};
