import "server-only";
import Database from "better-sqlite3";
import path from "node:path";
import { CHALLENGE_START, TOTAL_DAYS, todayLocal } from "./date";

const DB_PATH = path.join(process.cwd(), "hardtracker.db");

declare global {
  // eslint-disable-next-line no-var
  var __hardtracker_db: Database.Database | undefined;
}

function open(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS days (
      date TEXT PRIMARY KEY,
      challenge_id INTEGER NOT NULL,
      notes TEXT DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (challenge_id) REFERENCES challenges(id)
    );

    CREATE TABLE IF NOT EXISTS task_completions (
      date TEXT NOT NULL,
      task_id INTEGER NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (date, task_id)
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      date TEXT PRIMARY KEY,
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS weights (
      date TEXT PRIMARY KEY,
      weight_lbs REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS task_details (
      date TEXT NOT NULL,
      task_id INTEGER NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (date, task_id)
    );

    CREATE TABLE IF NOT EXISTS progress_photos (
      date TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      mime TEXT,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed the initial challenge if none exists.
  const row = db.prepare(`SELECT id FROM challenges ORDER BY id ASC LIMIT 1`).get() as
    | { id: number }
    | undefined;
  if (!row) {
    db.prepare(`INSERT INTO challenges (start_date, status) VALUES (?, 'active')`).run(
      CHALLENGE_START
    );
  }

  return db;
}

export function getDB(): Database.Database {
  if (!global.__hardtracker_db) {
    global.__hardtracker_db = open();
  }
  return global.__hardtracker_db;
}

// ---------- Types ----------

export type DayRow = {
  date: string;
  notes: string;
  completedTaskIds: number[];
  journal: string;
  weight: number | null;
  previousWeight: { date: string; weight: number } | null;
  taskDetails: Record<number, string>;
  photo: { filename: string; mime: string | null } | null;
};

// ---------- Reads ----------

export function getActiveChallenge() {
  const db = getDB();
  return db
    .prepare(`SELECT * FROM challenges WHERE status = 'active' ORDER BY id DESC LIMIT 1`)
    .get() as { id: number; start_date: string; status: string } | undefined;
}

export function getDay(date: string): DayRow {
  const db = getDB();
  const dayRow = db.prepare(`SELECT notes FROM days WHERE date = ?`).get(date) as
    | { notes: string }
    | undefined;
  const completions = db
    .prepare(`SELECT task_id FROM task_completions WHERE date = ? ORDER BY task_id`)
    .all(date) as { task_id: number }[];
  const journalRow = db
    .prepare(`SELECT content FROM journal_entries WHERE date = ?`)
    .get(date) as { content: string } | undefined;
  const wRow = db
    .prepare(`SELECT weight_lbs FROM weights WHERE date = ?`)
    .get(date) as { weight_lbs: number } | undefined;
  const prev = db
    .prepare(
      `SELECT date, weight_lbs FROM weights WHERE date < ? ORDER BY date DESC LIMIT 1`
    )
    .get(date) as { date: string; weight_lbs: number } | undefined;
  const detailRows = db
    .prepare(`SELECT task_id, content FROM task_details WHERE date = ?`)
    .all(date) as { task_id: number; content: string }[];
  const taskDetails: Record<number, string> = {};
  for (const r of detailRows) taskDetails[r.task_id] = r.content;
  const photoRow = db
    .prepare(`SELECT filename, mime FROM progress_photos WHERE date = ?`)
    .get(date) as { filename: string; mime: string | null } | undefined;

  return {
    date,
    notes: dayRow?.notes ?? "",
    completedTaskIds: completions.map((c) => c.task_id),
    journal: journalRow?.content ?? "",
    weight: wRow?.weight_lbs ?? null,
    previousWeight: prev ? { date: prev.date, weight: prev.weight_lbs } : null,
    taskDetails,
    photo: photoRow ? { filename: photoRow.filename, mime: photoRow.mime } : null,
  };
}

export function setProgressPhoto(date: string, filename: string, mime: string) {
  const db = getDB();
  ensureDay(date);
  db.prepare(
    `INSERT INTO progress_photos (date, filename, mime) VALUES (?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET filename = excluded.filename, mime = excluded.mime, uploaded_at = datetime('now')`
  ).run(date, filename, mime);
}

export function clearProgressPhoto(date: string) {
  const db = getDB();
  db.prepare(`DELETE FROM progress_photos WHERE date = ?`).run(date);
}

export function saveTaskDetail(date: string, taskId: number, content: string) {
  const db = getDB();
  ensureDay(date);
  if (content.trim() === "") {
    db.prepare(`DELETE FROM task_details WHERE date = ? AND task_id = ?`).run(date, taskId);
    return;
  }
  db.prepare(
    `INSERT INTO task_details (date, task_id, content) VALUES (?, ?, ?)
     ON CONFLICT(date, task_id) DO UPDATE SET content = excluded.content, updated_at = datetime('now')`
  ).run(date, taskId, content);
}

export function saveWeight(date: string, weightLbs: number | null) {
  const db = getDB();
  if (weightLbs == null || Number.isNaN(weightLbs)) {
    db.prepare(`DELETE FROM weights WHERE date = ?`).run(date);
    return;
  }
  db.prepare(
    `INSERT INTO weights (date, weight_lbs) VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET weight_lbs = excluded.weight_lbs, updated_at = datetime('now')`
  ).run(date, weightLbs);
}

export function getWeightSeries(): { date: string; weight: number }[] {
  const db = getDB();
  const r = activeRange();
  if (!r) return [];
  return db
    .prepare(
      `SELECT date, weight_lbs as weight FROM weights
       WHERE date >= ? AND date < ?
       ORDER BY date ASC`
    )
    .all(r.start, r.endExclusive) as { date: string; weight: number }[];
}

// ---------- Aggregations for stats ----------

export type PerTaskStat = {
  taskId: number;
  completedDays: number;
};

function activeRange(): { start: string; endExclusive: string } | null {
  const ch = getActiveChallenge();
  if (!ch) return null;
  const start = ch.start_date;
  const endExclusive = addDaysISO(start, TOTAL_DAYS);
  return { start, endExclusive };
}

export function getPerTaskStats(): PerTaskStat[] {
  const db = getDB();
  const r = activeRange();
  if (!r) return [];
  const rows = db
    .prepare(
      `SELECT task_id as taskId, COUNT(*) as completedDays
       FROM task_completions
       WHERE date >= ? AND date < ?
       GROUP BY task_id
       ORDER BY task_id`
    )
    .all(r.start, r.endExclusive) as PerTaskStat[];
  return rows;
}

export type DailyTotalsRow = {
  fullDays: number;
  partialDays: number;
  missedDays: number;
  totalElapsed: number;
};

export function findMostRecentUnhandledMiss(today: string): {
  date: string;
  count: number;
} | null {
  const db = getDB();
  const r = activeRange();
  if (!r) return null;
  // Past days within the active challenge window with < 12 completions and no dismissed flag.
  const row = db
    .prepare(
      `WITH d AS (
         SELECT date FROM days WHERE date >= ? AND date < ? AND date < ?
         UNION
         SELECT date FROM task_completions WHERE date >= ? AND date < ? AND date < ?
       ),
       counts AS (
         SELECT d.date,
                COALESCE((SELECT COUNT(*) FROM task_completions tc WHERE tc.date = d.date), 0) AS c
         FROM d
       )
       SELECT counts.date as date, counts.c as count
       FROM counts
       LEFT JOIN app_state s ON s.key = ('restart_dismissed:' || counts.date)
       WHERE counts.c < 12 AND s.value IS NULL
       ORDER BY counts.date DESC
       LIMIT 1`
    )
    .get(r.start, r.endExclusive, today, r.start, r.endExclusive, today) as
    | { date: string; count: number }
    | undefined;
  return row ?? null;
}

export function startNewChallenge(startDate: string): number {
  const db = getDB();
  db.prepare(`UPDATE challenges SET status = 'restarted' WHERE status = 'active'`).run();
  const r = db
    .prepare(`INSERT INTO challenges (start_date, status) VALUES (?, 'active')`)
    .run(startDate);
  return Number(r.lastInsertRowid);
}

export type DayStatusEntry = {
  date: string;
  completedCount: number;
  isFuture: boolean;
};

export function getAllDayStatuses(): DayStatusEntry[] {
  const db = getDB();
  const ch = getActiveChallenge();
  if (!ch) return [];

  const rows = db
    .prepare(
      `SELECT date, COUNT(*) AS c FROM task_completions GROUP BY date`
    )
    .all() as { date: string; c: number }[];
  const map = new Map(rows.map((r) => [r.date, r.c]));

  const today = todayLocal();
  const out: DayStatusEntry[] = [];
  const start = ch.start_date;
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = addDaysISO(start, i);
    out.push({
      date: d,
      completedCount: map.get(d) ?? 0,
      isFuture: d > today,
    });
  }
  return out;
}

function addDaysISO(start: string, n: number) {
  const [y, m, dd] = start.split("-").map(Number);
  const date = new Date(y, m - 1, dd + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

// ---------- Writes ----------

function ensureDay(date: string) {
  const db = getDB();
  const ch = getActiveChallenge();
  if (!ch) throw new Error("no active challenge");
  db.prepare(
    `INSERT INTO days (date, challenge_id, notes) VALUES (?, ?, '')
     ON CONFLICT(date) DO NOTHING`
  ).run(date, ch.id);
}

export function toggleTask(date: string, taskId: number, completed: boolean) {
  ensureDay(date);
  const db = getDB();
  if (completed) {
    db.prepare(
      `INSERT INTO task_completions (date, task_id) VALUES (?, ?)
       ON CONFLICT(date, task_id) DO NOTHING`
    ).run(date, taskId);
  } else {
    db.prepare(`DELETE FROM task_completions WHERE date = ? AND task_id = ?`).run(date, taskId);
  }
  return getDay(date);
}

export function saveNotes(date: string, notes: string) {
  ensureDay(date);
  const db = getDB();
  db.prepare(
    `UPDATE days SET notes = ?, updated_at = datetime('now') WHERE date = ?`
  ).run(notes, date);
}

export function saveJournal(date: string, content: string) {
  ensureDay(date);
  const db = getDB();
  db.prepare(
    `INSERT INTO journal_entries (date, content) VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET content = excluded.content, updated_at = datetime('now')`
  ).run(date, content);
}

// ---------- Restart bookkeeping ----------

export function getDismissedRestartFor(date: string): boolean {
  const db = getDB();
  const row = db
    .prepare(`SELECT value FROM app_state WHERE key = ?`)
    .get(`restart_dismissed:${date}`) as { value: string } | undefined;
  return row?.value === "1";
}

export function dismissRestartFor(date: string) {
  const db = getDB();
  db.prepare(
    `INSERT INTO app_state (key, value) VALUES (?, '1')
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(`restart_dismissed:${date}`);
}
