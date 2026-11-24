import { describe, expect, it } from "vitest";
import { AcademyDB, resetAll } from "./db";
import { PROJECTS } from "./projects";
import { SPEC_ISSUES } from "./specIssues";

describe("project catalogue", () => {
  it("has exactly eight projects numbered 1 to 8", () => {
    expect(PROJECTS.map((p) => p.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("matches the stage counts in the original specs", () => {
    const counts = Object.fromEntries(PROJECTS.map((p) => [p.number, p.stageCount]));
    expect(counts).toEqual({ 1: 12, 2: 12, 3: 13, 4: 14, 5: 10, 6: 15, 7: 15, 8: 14 });
  });

  it("shows Earth Observation as Project 8 even though its source says Project 5", () => {
    const eo = PROJECTS.find((p) => p.id === "p8-earth-obs")!;
    expect(eo.number).toBe(8);
    expect(eo.specFiles[0]).toMatch(/source_labelled_Project5/);
  });
});

describe("first-run database", () => {
  it("starts every project at zero (reset requested 2026-11-24)", async () => {
    const db = new AcademyDB(`test-${Math.random()}`);
    const states = await db.projectState.toArray();
    expect(states).toHaveLength(8);
    expect(states.every((s) => s.status === "planned")).toBe(true);
    expect(states.every((s) => s.note === undefined)).toBe(true);
    expect(await db.stageState.count()).toBe(0);
    expect(await db.lessonRuns.count()).toBe(0);
    await db.delete();
  });
});

describe("reset button", () => {
  it("erases all progress and keeps the eight projects", async () => {
    const db = new AcademyDB(`test-${Math.random()}`);
    await db.projectState.update("p1-slingshot", { status: "completed" });
    await db.stageState.add({
      key: "p2-black-hole:1",
      projectId: "p2-black-hole",
      stageId: "1",
      status: "done",
      statusSource: "verified",
      updatedAt: 1,
    });
    await db.lessonRuns.add({ lessonId: "x", finishedAt: 1, narrator: "x", tasks: [] });
    await resetAll(db);
    expect((await db.projectState.toArray()).every((s) => s.status === "planned")).toBe(true);
    expect(await db.projectState.count()).toBe(8);
    expect(await db.stageState.count()).toBe(0);
    expect(await db.lessonRuns.count()).toBe(0);
    expect(await db.meta.get("resetAt")).toBeDefined();
    await db.delete();
  });
});

describe("spec issues", () => {
  it("keeps the P3 and P4 issues open until Stephane decides", () => {
    expect(SPEC_ISSUES.map((i) => [i.id, i.status])).toEqual([
      ["ISSUE-P3-01", "open"],
      ["ISSUE-P4-01", "open"],
    ]);
  });

  it("states numbers that are actually correct", () => {
    // P3: sqrt(2) x 7,788 vs escape speed from the surface radius
    const mu = 3.986e14;
    const R = 6.371e6;
    expect(Math.SQRT2 * 7788).toBeCloseTo(11014, -1);
    expect(Math.sqrt(mu / R)).toBeCloseTo(7910, -1);
    expect(Math.sqrt((2 * mu) / R)).toBeCloseTo(11186, -1);
    // P4: burn height for a 1,000 m drop with net braking 2g: g(1000 - h) = 2g h
    const h = 1000 / 3;
    expect(h).toBeCloseTo(333.3, 1);
    expect(Math.sqrt(2 * 9.81 * 500)).toBeCloseTo(99.0, 0);
  });
});

describe("upgrade from an older database", () => {
  it("resets existing installs to zero once", async () => {
    const { default: Dexie } = await import("dexie");
    const name = `upgrade-${Math.random()}`;
    const old = new Dexie(name);
    old.version(3).stores({
      projectState: "id, status",
      meta: "key",
      lessonRuns: "++id, lessonId, finishedAt",
      stageState: "key, projectId",
    });
    await old.table("projectState").put({ id: "p1-slingshot", status: "completed" });
    await old.table("stageState").put({ key: "p5-em-field:4.1", projectId: "p5-em-field" });
    await old.table("lessonRuns").add({ lessonId: "p2-light-flat-space", finishedAt: 1 });
    old.close();

    const db = new AcademyDB(name);
    expect((await db.projectState.toArray()).every((s) => s.status === "planned")).toBe(true);
    expect(await db.stageState.count()).toBe(0);
    expect(await db.lessonRuns.count()).toBe(0);
    await db.delete();
  });
});
