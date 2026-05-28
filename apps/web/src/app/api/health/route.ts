import { NextResponse } from "next/server";

/**
 * Liveness/readiness endpoint for external monitoring (status page, uptime
 * checks). Returns 200 with a JSON payload when the process is up.
 *
 * Once Supabase is wired in, optionally extend this to do a 1-row `SELECT 1`
 * round trip and report degraded if the DB is unreachable.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "program-web",
      version: process.env.npm_package_version ?? "dev",
      time: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
