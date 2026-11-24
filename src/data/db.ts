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
    // 2026-11-24: Stephane chose to restart every project from zero.
    // Existing installs are reset once; fresh installs already start empty.
    this.version(4)
      .stores({})
      .upgrade(async (tx) => {
        const now = Date.now();
        await tx.table("stageState").clear();
        await tx.table("lessonRuns").clear();
        await tx.table("projectState").clear();
        await tx.table("projectState").bulkAdd(initialProjectStates(now));
        await tx.table("meta").put({ key: "resetAt", value: now });
      });
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
 * Stage progress to start with. Empty: on 2026-11-24 Stephane chose to restart
 * all projects from zero (this used to hold the progress reported in the brief).
 */
export function initialStageStates(_now: number): StageState[] {
  return [];
}

/**
 * Erase all progress on this device: project and stage status, lesson history.
 * Keeps nothing except the record of when the reset happened.
 */
export async function resetAll(target: AcademyDB): Promise<void> {
  const now = Date.now();
  await target.transaction(
    "rw",
    [target.projectState, target.stageState, target.lessonRuns, target.meta],
    async () => {
      await Promise.all([
        target.projectState.clear(),
        target.stageState.clear(),
        target.lessonRuns.clear(),
      ]);
      await target.projectState.bulkAdd(initialProjectStates(now));
      await target.meta.put({ key: "resetAt", value: now });
    },
  );
}

export const db = new AcademyDB();
