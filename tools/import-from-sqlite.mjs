#!/usr/bin/env node
/**
 * Imports your old local SQLite data (apps/web/hardtracker.db) into a target
 * Supabase user account.
 *
 * Why this exists:
 *   You used the app in local-only mode on the `main` branch and accumulated
 *   task completions, weights, notes, journal entries, task details, etc.
 *   When you switched to multi-user Supabase on `production`, your new
 *   account starts empty. This script bridges that gap.
 *
 * What it does:
 *   1. Reads every row from `apps/web/hardtracker.db` (the SQLite file)
 *   2. Finds your Supabase user account by email
 *   3. Maps each old (numeric) task ID to your new (UUID) task by position
 *      — only works if your new account still has the default 12 tasks in
 *      their default positions (which is the case if you haven't customized
 *      the task list since signing up).
 *   4. Inserts everything into Supabase using the service-role key (bypasses
 *      RLS so we can write on the user's behalf).
 *   5. Photos are NOT migrated — the local file path doesn't translate to
 *      Supabase Storage cleanly. You can re-upload them manually if needed,
 *      or extend this script to do bulk upload.
 *
 * Idempotent: safe to run twice. Uses upserts everywhere.
 *
 * Usage:
 *   node tools/import-from-sqlite.mjs --email YOUR_EMAIL
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * apps/web/.env.local.
 */

import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const args = process.argv.slice(2);
let targetEmail = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--email" || args[i] === "-e") {
    targetEmail = args[i + 1];
  }
}

if (!targetEmail) {
  console.error(
    "\n  Usage: node tools/import-from-sqlite.mjs --email YOUR_EMAIL\n"
  );
  process.exit(1);
}

// Load .env.local
const envPath = join(repoRoot, "apps/web/.env.local");
if (!existsSync(envPath)) {
  console.error(`\n  ✗ Could not find ${envPath}`);
  console.error("    Run Phase 3 (set up Supabase) first.\n");
  process.exit(1);
}
const env = parseEnv(readFileSync(envPath, "utf8"));
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("\n  ✗ Missing Supabase keys in apps/web/.env.local\n");
  process.exit(1);
}

const dbPath = join(repoRoot, "apps/web/hardtracker.db");
if (!existsSync(dbPath)) {
  console.error(`\n  ✗ SQLite file not found at ${dbPath}\n`);
  process.exit(1);
}

const sqlite = new Database(dbPath, { readonly: true });
const supabase = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const log = {
  ok: (...a) => console.log("  \x1b[32m✓\x1b[0m", ...a),
  info: (...a) => console.log("  \x1b[36m•\x1b[0m", ...a),
  warn: (...a) => console.log("  \x1b[33m!\x1b[0m", ...a),
  fail: (...a) => console.log("  \x1b[31m✗\x1b[0m", ...a),
};

console.log("\n\x1b[1mProgram — import from SQLite\x1b[0m");
console.log(`  Source : ${dbPath}`);
console.log(`  Target : ${URL}`);
console.log(`  Email  : ${targetEmail}\n`);

// 1. Find the target user
console.log("\x1b[1m1. Find user\x1b[0m");
const { data: users, error: usersErr } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});
if (usersErr) {
  log.fail("auth listUsers:", usersErr.message);
  process.exit(1);
}
const target = users.users.find(
  (u) => (u.email ?? "").toLowerCase() === targetEmail.toLowerCase()
);
if (!target) {
  log.fail(`No Supabase user with email ${targetEmail}`);
  log.info("Did you sign up yet at http://localhost:3000/signup ?");
  process.exit(1);
}
log.ok(`Found ${target.email} · ${target.id}`);
const userId = target.id;

// 2. Load existing tasks from Supabase (the seed trigger created them)
console.log("\n\x1b[1m2. Map task IDs\x1b[0m");
const { data: supaTasks, error: tErr } = await supabase
  .from("tasks")
  .select("id, position, title")
  .eq("user_id", userId)
  .eq("archived", false)
  .order("position", { ascending: true });
if (tErr) {
  log.fail("Failed to load Supabase tasks:", tErr.message);
  process.exit(1);
}
log.info(`Supabase user has ${supaTasks.length} tasks`);

// Map old SQLite task id -> new Supabase UUID by position (with title fallback).
const sqliteTasks = sqlite
  .prepare("SELECT id, position, title FROM tasks WHERE archived = 0 ORDER BY position")
  .all();
log.info(`SQLite has ${sqliteTasks.length} tasks`);

const taskIdMap = new Map(); // sqlite.id (number) -> supabase.id (uuid)
for (const old of sqliteTasks) {
  const byPos = supaTasks.find((s) => s.position === old.position);
  const byTitle = supaTasks.find((s) => s.title === old.title);
  const target = byPos ?? byTitle;
  if (!target) {
    log.warn(
      `Could not map old task id=${old.id} title="${old.title}" — skipping its rows`
    );
    continue;
  }
  taskIdMap.set(old.id, target.id);
}
log.ok(`Mapped ${taskIdMap.size}/${sqliteTasks.length} tasks`);

// 3. Get/create active challenge
console.log("\n\x1b[1m3. Active challenge\x1b[0m");
let { data: activeCh } = await supabase
  .from("challenges")
  .select("id, start_date")
  .eq("user_id", userId)
  .eq("status", "active")
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();
if (!activeCh) {
  // Reuse the start_date from the SQLite active challenge if we have one
  const oldCh = sqlite
    .prepare("SELECT start_date FROM challenges WHERE status='active' LIMIT 1")
    .get();
  const startDate =
    oldCh?.start_date ?? new Date().toISOString().slice(0, 10);
  const { data: newCh, error: chErr } = await supabase
    .from("challenges")
    .insert({ user_id: userId, start_date: startDate, status: "active" })
    .select("id, start_date")
    .single();
  if (chErr) {
    log.fail("Failed to create challenge:", chErr.message);
    process.exit(1);
  }
  activeCh = newCh;
}
log.ok(`Active challenge ${activeCh.id} starting ${activeCh.start_date}`);

// 4. Days (notes)
console.log("\n\x1b[1m4. Days + notes\x1b[0m");
const sqliteDays = sqlite
  .prepare("SELECT date, notes FROM days WHERE notes != ''")
  .all();
let nDays = 0;
for (const d of sqliteDays) {
  const { error } = await supabase
    .from("days")
    .upsert(
      {
        user_id: userId,
        challenge_id: activeCh.id,
        date: d.date,
        notes: d.notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    );
  if (!error) nDays++;
}
log.ok(`Days with notes: ${nDays}`);

// 5. Task completions
console.log("\n\x1b[1m5. Task completions\x1b[0m");
const sqliteCompletions = sqlite
  .prepare("SELECT date, task_id, completed_at FROM task_completions")
  .all();
let nC = 0;
let nCSkipped = 0;
for (const c of sqliteCompletions) {
  const newTaskId = taskIdMap.get(c.task_id);
  if (!newTaskId) {
    nCSkipped++;
    continue;
  }
  const { error } = await supabase
    .from("task_completions")
    .upsert(
      {
        user_id: userId,
        date: c.date,
        task_id: newTaskId,
        completed_at: toIso(c.completed_at),
      },
      { onConflict: "user_id,date,task_id", ignoreDuplicates: true }
    );
  if (!error) nC++;
}
log.ok(`Completions: ${nC} migrated, ${nCSkipped} skipped`);

// 6. Task details (workouts, reading)
console.log("\n\x1b[1m6. Task details\x1b[0m");
const sqliteDetails = sqlite
  .prepare("SELECT date, task_id, content, updated_at FROM task_details")
  .all();
let nDet = 0;
let nDetSkipped = 0;
for (const d of sqliteDetails) {
  const newTaskId = taskIdMap.get(d.task_id);
  if (!newTaskId) {
    nDetSkipped++;
    continue;
  }
  const { error } = await supabase
    .from("task_details")
    .upsert(
      {
        user_id: userId,
        date: d.date,
        task_id: newTaskId,
        content: d.content,
        updated_at: toIso(d.updated_at),
      },
      { onConflict: "user_id,date,task_id" }
    );
  if (!error) nDet++;
}
log.ok(`Task details: ${nDet} migrated, ${nDetSkipped} skipped`);

// 7. Journal entries
console.log("\n\x1b[1m7. Journal entries\x1b[0m");
const sqliteJournal = sqlite
  .prepare("SELECT date, content, created_at, updated_at FROM journal_entries")
  .all();
let nJ = 0;
for (const j of sqliteJournal) {
  const { error } = await supabase
    .from("journal_entries")
    .upsert(
      {
        user_id: userId,
        date: j.date,
        content: j.content,
        created_at: toIso(j.created_at),
        updated_at: toIso(j.updated_at),
      },
      { onConflict: "user_id,date" }
    );
  if (!error) nJ++;
}
log.ok(`Journal entries: ${nJ}`);

// 8. Weights
console.log("\n\x1b[1m8. Weights\x1b[0m");
const sqliteWeights = sqlite
  .prepare("SELECT date, weight_lbs, created_at, updated_at FROM weights")
  .all();
let nW = 0;
for (const w of sqliteWeights) {
  const { error } = await supabase
    .from("weights")
    .upsert(
      {
        user_id: userId,
        date: w.date,
        weight_lbs: w.weight_lbs,
        created_at: toIso(w.created_at),
        updated_at: toIso(w.updated_at),
      },
      { onConflict: "user_id,date" }
    );
  if (!error) nW++;
}
log.ok(`Weights: ${nW}`);

// 9. Photos — NOT migrated (would need bulk re-upload to Storage)
console.log("\n\x1b[1m9. Photos\x1b[0m");
const sqlitePhotos = sqlite.prepare("SELECT COUNT(*) AS c FROM progress_photos").get();
if (sqlitePhotos.c > 0) {
  log.warn(
    `${sqlitePhotos.c} photo row(s) in SQLite are NOT migrated automatically.`
  );
  log.info("Photos in apps/web/public/progress-photos/ are still on disk.");
  log.info("Re-upload them via the app's UI on whichever days you'd like.");
} else {
  log.info("No photos in SQLite. Nothing to migrate.");
}

console.log("\n\x1b[32m\x1b[1m✓ Import complete.\x1b[0m");
console.log("  Open http://localhost:3000 to see your data.\n");
sqlite.close();

// ---------- helpers ----------

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

function toIso(s) {
  if (!s) return new Date().toISOString();
  // SQLite stores "YYYY-MM-DD HH:MM:SS"; convert to ISO.
  if (typeof s === "string" && s.includes(" ") && !s.includes("T")) {
    return s.replace(" ", "T") + "Z";
  }
  return s;
}
