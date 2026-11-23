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

/**
 * Progress on one spec stage (or P5 step, e.g. "4.1"). Absent = not started.
 * M3 adds evidence; until then everything here is what Stephane reported.
 */
export interface StageState {
  key: string; // `${projectId}:${stageId}`
  projectId: string;
  stageId: string;
  status: "in-progress" | "done";
  statusSource: StatusSource;
  updatedAt: number;
}

/** One finished lesson session, with how each task went. */
export interface LessonRun {
  id?: number;
  lessonId: string;
  finishedAt: number;
  narrator: string;
  tasks: { id: string; attempts: number; hints: number; solved: boolean }[];
}

export class AcademyDB extends Dexie {
  projectState!: EntityTable<ProjectState, "id">;
  meta!: EntityTable<MetaEntry, "key">;
  lessonRuns!: EntityTable<LessonRun, "id">;
  stageState!: EntityTable<StageState, "key">;

  constructor(name = "computational-science-academy") {
    super(name);
    this.version(1).stores({
      projectState: "id, status",
      meta: "key",
    });
    this.version(2).stores({
      lessonRuns: "++id, lessonId, finishedAt",
    });
    this.version(3)
      .stores({ stageState: "key, projectId" })
      // Existing installs get the reported stage progress once.
      .upgrade((tx) => tx.table("stageState").bulkPut(initialStageStates(Date.now())));
    // Runs once, the first time the database is created on this device.
    this.on("populate", (tx) => {
      const now = Date.now();
      tx.table("projectState").bulkAdd(initialProjectStates(now));
      tx.table("meta").add({ key: "createdAt", value: now });
      tx.table("stageState").bulkAdd(initialStageStates(now));
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

/**
 * Stage progress Stephane reported in the brief: P1 completed (all 12 stages);
 * P5 phases 1–3 done, phase 4 in progress with step 4.1 (one arrow) done.
 */
export function initialStageStates(now: number): StageState[] {
  const s = (projectId: string, stageId: string, status: StageState["status"]): StageState => ({
    key: `${projectId}:${stageId}`,
    projectId,
    stageId,
    status,
    statusSource: "user-reported",
    updatedAt: now,
  });
  return [
    ...Array.from({ length: 12 }, (_, i) => s("p1-slingshot", String(i + 1), "done")),
    s("p5-em-field", "1", "done"),
    s("p5-em-field", "2", "done"),
    s("p5-em-field", "3", "done"),
    s("p5-em-field", "4", "in-progress"),
    s("p5-em-field", "4.1", "done"),
  ];
}

export const db = new AcademyDB();
