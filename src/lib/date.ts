// All "day" math uses YYYY-MM-DD strings in the user's local timezone.
// Day 1 of the challenge = 2026-05-25 (the user's chosen start date).

export const CHALLENGE_START = "2026-05-26";
export const TOTAL_DAYS = 100;

export function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(a: string, b: string): number {
  const da = parseISO(a).getTime();
  const db = parseISO(b).getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

export function dayNumber(dateISO: string, startISO = CHALLENGE_START): number {
  return daysBetween(startISO, dateISO) + 1;
}

export function addDays(dateISO: string, n: number): string {
  const d = parseISO(dateISO);
  d.setDate(d.getDate() + n);
  return dateToISO(d);
}

export function isFuture(dateISO: string): boolean {
  return daysBetween(todayLocal(), dateISO) > 0;
}

export function isPast(dateISO: string): boolean {
  return daysBetween(todayLocal(), dateISO) < 0;
}

export function formatPretty(dateISO: string): string {
  const d = parseISO(dateISO);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
