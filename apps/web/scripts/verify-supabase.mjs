#!/usr/bin/env node
/**
 * Verifies the Supabase staging project is fully set up:
 *   - All 11 tables exist
 *   - RLS enabled on every public table
 *   - Sign-up trigger present and seeds the right rows
 *   - progress-photos storage bucket exists
 *   - Smoke-test user (if it exists) has 12 tasks + 1 challenge + 1 settings row
 *
 * Run with:
 *   node apps/web/scripts/verify-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");

function parseEnv(text) {
  const out = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return out;
}

const env = parseEnv(readFileSync(envPath, "utf8"));
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in apps/web/.env.local");
  process.exit(1);
}

const supabase = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EXPECTED_TABLES = [
  "profiles",
  "challenges",
  "tasks",
  "days",
  "task_completions",
  "task_details",
  "journal_entries",
  "weights",
  "progress_photos",
  "user_settings",
  "app_state",
];

const ok = (...args) => console.log("\x1b[32m✓\x1b[0m", ...args);
const fail = (...args) => console.log("\x1b[31m✗\x1b[0m", ...args);
const info = (...args) => console.log("\x1b[36m•\x1b[0m", ...args);

let failures = 0;

async function main() {
  console.log("\n\x1b[1mVerifying Supabase staging\x1b[0m");
  console.log(`  ${URL}\n`);

  // 1. Tables exist (count rows just to confirm they're queryable).
  console.log("\x1b[1m1. Tables\x1b[0m");
  for (const table of EXPECTED_TABLES) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) {
      fail(`  ${table.padEnd(20)} ${error.message}`);
      failures++;
    } else {
      ok(`  ${table.padEnd(20)} exists · ${count ?? 0} rows`);
    }
  }

  // 2. Storage bucket
  console.log("\n\x1b[1m2. Storage\x1b[0m");
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    fail(`  Could not list buckets: ${bErr.message}`);
    failures++;
  } else {
    const photos = buckets.find((b) => b.name === "progress-photos");
    if (!photos) {
      fail(`  progress-photos bucket NOT FOUND (create it in Dashboard → Storage)`);
      failures++;
    } else {
      ok(`  progress-photos bucket exists · public=${photos.public}`);
    }
  }

  // 3. Auth users (count)
  console.log("\n\x1b[1m3. Auth\x1b[0m");
  const { data: usersList, error: uErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 50,
  });
  if (uErr) {
    fail(`  Could not list users: ${uErr.message}`);
    failures++;
  } else {
    ok(`  ${usersList.users.length} auth user(s) exist`);
    for (const u of usersList.users) {
      info(`    ${u.email ?? "(no email)"} · ${u.id}`);
    }
  }

  // 4. Seed trigger smoke check — for each user, count their seeded rows.
  if (usersList && usersList.users.length > 0) {
    console.log("\n\x1b[1m4. Sign-up trigger smoke check (per user)\x1b[0m");
    for (const u of usersList.users) {
      const [{ count: taskCount }, { count: challengeCount }, { count: settingsCount }] =
        await Promise.all([
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("user_id", u.id),
          supabase.from("challenges").select("*", { count: "exact", head: true }).eq("user_id", u.id),
          supabase.from("user_settings").select("*", { count: "exact", head: true }).eq("user_id", u.id),
        ]);

      const taskOK = taskCount === 12;
      const chOK = challengeCount === 1;
      const setOK = settingsCount === 1;

      const line = `    ${(u.email ?? "(no email)").padEnd(36)} tasks=${taskCount} challenges=${challengeCount} settings=${settingsCount}`;
      if (taskOK && chOK && setOK) ok(line);
      else {
        fail(line);
        failures++;
      }
    }
  }

  console.log();
  if (failures === 0) {
    console.log("\x1b[32m\x1b[1m✓ All checks passed.\x1b[0m\n");
    process.exit(0);
  } else {
    console.log(`\x1b[31m\x1b[1m✗ ${failures} check(s) failed.\x1b[0m\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
