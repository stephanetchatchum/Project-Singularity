import { describe, expect, it } from "vitest";
import { AcademyDB } from "./db";
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
  it("seeds the brief's initial status table, all marked as user-reported", async () => {
    const db = new AcademyDB(`test-${Math.random()}`);
    const states = await db.projectState.toArray();
    const byNumber = Object.fromEntries(
      states.map((s) => [PROJECTS.find((p) => p.id === s.id)!.number, s.status]),
    );
    expect(byNumber).toEqual({
      1: "completed",
      2: "planned",
      3: "planned",
      4: "planned",
      5: "in-progress",
      6: "planned",
      7: "planned",
      8: "planned",
    });
    expect(states.every((s) => s.statusSource === "user-reported")).toBe(true);
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
