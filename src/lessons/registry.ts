import type { Lesson } from "./types";
import lightFlatSpace from "../content/lessons/p2-light-flat-space.json";

/** All lessons, in teaching order. */
export const LESSONS: readonly Lesson[] = [lightFlatSpace as Lesson];

export function findLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

/** Problems that would break playback or mislead; empty means the lesson is valid. */
export function lessonProblems(lesson: Lesson): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  lesson.beats.forEach((b, i) => {
    if (ids.has(b.id)) problems.push(`beat ${i}: duplicate id ${b.id}`);
    ids.add(b.id);
    if (b.text.split(/[.!?](\s|$)/).filter((s) => s.trim()).length > 2)
      problems.push(`beat ${b.id}: more than two sentences; split it`);
    if (b.text.length > 160) problems.push(`beat ${b.id}: caption longer than 160 characters`);
    if (b.scene.focus && !b.scene.show.includes(b.scene.focus))
      problems.push(`beat ${b.id}: focus layer is not shown`);
    for (const h of b.equation?.highlight ?? [])
      if (!b.equation!.tex.includes(`{${h}}`))
        problems.push(`beat ${b.id}: highlight ${h} not in tex`);
  });
  for (const t of lesson.tasks) {
    if (t.hints.length === 0) problems.push(`task ${t.id}: needs at least one hint`);
    if (t.kind === "choice") {
      if (!t.options.some((o) => o.id === t.correct))
        problems.push(`task ${t.id}: correct option missing`);
      for (const o of t.options)
        if (o.id !== t.correct && !t.why[o.id])
          problems.push(`task ${t.id}: no feedback for ${o.id}`);
    }
  }
  return problems;
}
