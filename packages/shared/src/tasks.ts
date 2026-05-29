/**
 * Task type shared between server and client.
 * Task IDs are Postgres UUIDs rendered as strings.
 */
export type Task = {
  id: string;
  position: number;
  title: string;
  subtitle: string | null;
  icon: string;
  kind: "check" | "journal" | "photo";
  requiresDetail: boolean;
  detailLabel: string | null;
  detailPlaceholder: string | null;
};

export function findJournalTaskId(tasks: Task[]): string | null {
  return tasks.find((t) => t.kind === "journal")?.id ?? null;
}

export function findPhotoTaskId(tasks: Task[]): string | null {
  return tasks.find((t) => t.kind === "photo")?.id ?? null;
}
