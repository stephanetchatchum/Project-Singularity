import { describe, expect, it } from "vitest";
import { LESSONS, lessonProblems } from "./registry";
import { PROJECTS } from "../data/projects";
import { estimateSeconds } from "../audio/narrators";

describe("lesson content", () => {
  for (const lesson of LESSONS) {
    it(`${lesson.id} has no structural problems`, () => {
      expect(lessonProblems(lesson)).toEqual([]);
    });

    it(`${lesson.id} belongs to a real project`, () => {
      expect(PROJECTS.some((p) => p.id === lesson.projectId)).toBe(true);
    });

    it(`${lesson.id} fits a short session`, () => {
      const seconds = lesson.beats.reduce((s, b) => s + estimateSeconds(b.speech ?? b.text), 0);
      expect(seconds / 60).toBeLessThanOrEqual(lesson.minutes);
    });
  }
});
