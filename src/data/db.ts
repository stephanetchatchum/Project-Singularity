import Dexie, { type EntityTable } from "dexie";
import { PROJECTS, type ProjectStatus } from "./projects";

/**
 * Where a status came from. "user-reported" is what Stephane told the academy;
 * "verified" is only set when stage evidence has been checked (M3).
 */
export type StatusSource = "user-reported" | "verified";

export interface ProjectState {
  id: string;
  status: ProjectStatus;
  statusSource: StatusSource;
  note?: string;
  updatedAt: number;
}

export interface MetaEntry {
  key: string;
  value: unknown;
}

export class AcademyDB extends Dexie {
  projectState!: EntityTable<ProjectState, "id">;
  meta!: EntityTable<MetaEntry, "key">;

  constructor(name = "computational-science-academy") {
    super(name);
    this.version(1).stores({
      projectState: "id, status",
      meta: "key",
    });
    // Runs once, the first time the database is created on this device.
    this.on("populate", (tx) => {
      const now = Date.now();
      tx.table("projectState").bulkAdd(initialProjectStates(now));
      tx.table("meta").add({ key: "createdAt", value: now });
    });
  }
}

/** Initial project states from the brief's progress table. */
export function initialProjectStates(now: number): ProjectState[] {
  return PROJECTS.map((p) => ({
    id: p.id,
    status: p.initialStatus,
    statusSource: "user-reported" as const,
    note: p.initialNote,
    updatedAt: now,
  }));
}

export const db = new AcademyDB();
