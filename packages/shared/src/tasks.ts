/**
 * Task type shared between server and client.
 * The actual task list is stored in the DB and loaded per-request — see lib/db.ts.
 */
export type Task = {
  id: number;
  position: number;
  title: string;
  subtitle: string | null;
  icon: string;
  kind: "check" | "journal" | "photo";
  requiresDetail: boolean;
  detailLabel: string | null;
  detailPlaceholder: string | null;
};

export function findJournalTaskId(tasks: Task[]): number | null {
  return tasks.find((t) => t.kind === "journal")?.id ?? null;
}

export function findPhotoTaskId(tasks: Task[]): number | null {
  return tasks.find((t) => t.kind === "photo")?.id ?? null;
}
