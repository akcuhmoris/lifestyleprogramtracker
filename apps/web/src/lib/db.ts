import "server-only";
import Database from "better-sqlite3";
import path from "node:path";
import { CHALLENGE_START, TOTAL_DAYS as DEFAULT_TOTAL_DAYS, todayLocal } from "@program/shared/date";

// Re-export the default so callers without DB access still have a fallback.
export const TOTAL_DAYS = DEFAULT_TOTAL_DAYS;

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

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      position INTEGER NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      icon TEXT NOT NULL DEFAULT 'ListChecks',
      kind TEXT NOT NULL DEFAULT 'check',
      requires_detail INTEGER NOT NULL DEFAULT 0,
      detail_label TEXT,
      detail_placeholder TEXT,
      archived INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default total_days if missing.
  const ds = db
    .prepare(`SELECT value FROM settings WHERE key = 'total_days'`)
    .get() as { value: string } | undefined;
  if (!ds) {
    db.prepare(`INSERT INTO settings (key, value) VALUES ('total_days', ?)`).run(
      String(TOTAL_DAYS)
    );
  }

  // Seed default 12 tasks on first run.
  const tcount = db.prepare(`SELECT COUNT(*) as c FROM tasks`).get() as { c: number };
  if (tcount.c === 0) {
    const seed = db.prepare(
      `INSERT INTO tasks (position, title, subtitle, icon, kind, requires_detail, detail_label, detail_placeholder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const DEFAULT_TASKS = [
      ["Structured diet", "No cheat meals", "Apple", "check", 0, null, null],
      ["No alcohol", null, "Beer", "check", 0, null, null],
      ["No processed food", null, "Sandwich", "check", 0, null, null],
      [
        "Workout 1",
        "45 min · log what you did",
        "Dumbbell",
        "check",
        1,
        "What did you do?",
        "e.g. Push day · bench, OHP, dips, triceps",
      ],
      [
        "Workout 2",
        "45 min outdoors · log what you did",
        "Trees",
        "check",
        1,
        "What did you do?",
        "e.g. 5-mile zone 2 run along the river",
      ],
      ["1 gallon of water", null, "GlassWater", "check", 0, null, null],
      [
        "Read 10 pages",
        "Nonfiction",
        "BookOpen",
        "check",
        0,
        "What did you read?",
        "e.g. Atomic Habits · ch. 3, pp. 41–53",
      ],
      ["Progress photo", null, "Camera", "photo", 0, null, null],
      ["Self-care block", "20–30 min", "Sparkles", "check", 0, null, null],
      ["7+ hours sleep", null, "Moon", "check", 0, null, null],
      [
        "No social media",
        "Until morning task done",
        "Smartphone",
        "check",
        0,
        null,
        null,
      ],
      ["Journal entry", "Tap to write", "PenLine", "journal", 0, null, null],
    ] as const;
    const tx = db.transaction(() => {
      DEFAULT_TASKS.forEach((row, i) => {
        seed.run(i, ...row);
      });
    });
    tx();
  }

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

// ---------- Settings & task definitions ----------

export type TaskKind = "check" | "journal" | "photo";

export type TaskRow = {
  id: number;
  position: number;
  title: string;
  subtitle: string | null;
  icon: string;
  kind: TaskKind;
  requiresDetail: boolean;
  detailLabel: string | null;
  detailPlaceholder: string | null;
};

export function getTotalDays(): number {
  const db = getDB();
  const row = db
    .prepare(`SELECT value FROM settings WHERE key = 'total_days'`)
    .get() as { value: string } | undefined;
  const n = row ? parseInt(row.value, 10) : DEFAULT_TOTAL_DAYS;
  if (!Number.isFinite(n) || n < 1) return DEFAULT_TOTAL_DAYS;
  return Math.min(365, Math.max(1, n));
}

export function setTotalDays(n: number) {
  const db = getDB();
  const v = Math.min(365, Math.max(1, Math.floor(n)));
  db.prepare(
    `INSERT INTO settings (key, value) VALUES ('total_days', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(String(v));
}

export function getTasks(): TaskRow[] {
  const db = getDB();
  const rows = db
    .prepare(
      `SELECT id, position, title, subtitle, icon, kind, requires_detail as requiresDetail,
              detail_label as detailLabel, detail_placeholder as detailPlaceholder
       FROM tasks
       WHERE archived = 0
       ORDER BY position ASC, id ASC`
    )
    .all() as Array<{
      id: number;
      position: number;
      title: string;
      subtitle: string | null;
      icon: string;
      kind: string;
      requiresDetail: number;
      detailLabel: string | null;
      detailPlaceholder: string | null;
    }>;
  return rows.map((r) => ({
    ...r,
    requiresDetail: !!r.requiresDetail,
    kind: (["check", "journal", "photo"].includes(r.kind) ? r.kind : "check") as TaskKind,
  }));
}

export type TaskInput = {
  id?: number;
  title: string;
  subtitle: string | null;
  icon: string;
  kind: TaskKind;
  requiresDetail: boolean;
  detailLabel: string | null;
  detailPlaceholder: string | null;
};

export function upsertTask(input: TaskInput, position?: number): number {
  const db = getDB();
  if (input.id) {
    db.prepare(
      `UPDATE tasks SET title = ?, subtitle = ?, icon = ?, kind = ?,
        requires_detail = ?, detail_label = ?, detail_placeholder = ?
       WHERE id = ?`
    ).run(
      input.title,
      input.subtitle,
      input.icon,
      input.kind,
      input.requiresDetail ? 1 : 0,
      input.detailLabel,
      input.detailPlaceholder,
      input.id
    );
    return input.id;
  }
  // new task — append to end if position not provided
  const max = db.prepare(`SELECT COALESCE(MAX(position), -1) as p FROM tasks`).get() as {
    p: number;
  };
  const pos = position ?? max.p + 1;
  const r = db
    .prepare(
      `INSERT INTO tasks (position, title, subtitle, icon, kind, requires_detail, detail_label, detail_placeholder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      pos,
      input.title,
      input.subtitle,
      input.icon,
      input.kind,
      input.requiresDetail ? 1 : 0,
      input.detailLabel,
      input.detailPlaceholder
    );
  return Number(r.lastInsertRowid);
}

export function archiveTask(id: number) {
  const db = getDB();
  db.prepare(`UPDATE tasks SET archived = 1 WHERE id = ?`).run(id);
}

export function reorderTasks(ordering: number[]) {
  const db = getDB();
  const u = db.prepare(`UPDATE tasks SET position = ? WHERE id = ?`);
  const tx = db.transaction(() => {
    ordering.forEach((id, i) => u.run(i, id));
  });
  tx();
}

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
  const endExclusive = addDaysISO(start, getTotalDays());
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
  const total = getTotalDays();
  for (let i = 0; i < total; i++) {
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
