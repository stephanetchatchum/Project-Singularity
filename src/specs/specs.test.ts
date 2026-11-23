// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SPECS } from "./specs";
import { PROJECTS } from "../data/projects";
import { forSpeech } from "../audio/narrators";

const SPEC_DIR = resolve(process.cwd(), "docs/specs");

/** Same words, ignoring formatting: emphasis marks, escapes, line breaks, spacing. */
function norm(s: string): string {
  return s
    .replace(/\*\*/g, "")
    .replace(/\\/g, "")
    .replace(/\[ \] /g, "")
    .replace(/\s+/g, " ")
    .replace(/ ([.,;:)])/g, "$1")
    .trim();
}

/** Every string inside the extracted spec, wherever it sits. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value))
      if (!["projectId", "sources", "id", "kind", "n", "tex", "speech"].includes(k))
        strings(v, out);
  return out;
}

describe("specs are copied word for word", () => {
  for (const spec of Object.values(SPECS)) {
    it(`${spec.projectId}: every sentence exists in the original`, () => {
      // Page headers and footers of the PDF are page furniture, not spec words.
      const raw = spec.sources.map((f) => readFileSync(resolve(SPEC_DIR, f), "utf8")).join("\n");
      const source = norm(
        raw
          .replace(/\f/g, "")
          .replace(/^(EM Field Visualizer: Build Guide|Page \d+ of \d+)$/gm, ""),
      );
      const missing = strings({ sections: spec.sections, stages: spec.stages })
        .filter(
          (s) =>
            s.trim() &&
            !["Goal", "You'll see", "Just enough", "Your task", "Commit", "Note"].includes(s),
        )
        .filter((s) => !source.includes(norm(s)));
      expect(missing).toEqual([]);
    });
  }
});

describe("equations are copied from the source", () => {
  it("keeps P1's two equations", () => {
    const flat = (t: string) => t.replace(/[\\\s,|]/g, "");
    const src = flat(readFileSync(resolve(SPEC_DIR, "text/P1_3D_Slingshot_Game.md"), "utf8"));
    const math = SPECS["p1-slingshot"].sections
      .flatMap((s) => s.items)
      .filter((i) => i.kind === "math");
    expect(math).toHaveLength(2);
    for (const m of math) expect(src.includes(flat(m.tex))).toBe(true);
  });
});

describe("spec structure", () => {
  it("has a spec for every project", () => {
    expect(Object.keys(SPECS).sort()).toEqual(PROJECTS.map((p) => p.id).sort());
  });

  it("matches the stage counts in the catalogue", () => {
    for (const p of PROJECTS)
      expect(SPECS[p.id].stages.map((s) => s.id)).toHaveLength(p.stageCount);
  });

  // P4 Stage 13 is marked "Optional." and has no "Done when" in the original spec.
  const NO_DONE_WHEN = ["p4-ai-pilot:13"];

  it("numbers stages 1..n with a 'Done when' for every staged spec", () => {
    for (const p of PROJECTS) {
      const stages = SPECS[p.id].stages;
      expect(stages.map((s) => Number(s.id))).toEqual(stages.map((_, i) => i + 1));
      if (p.stageUnit === "stage")
        for (const s of stages)
          expect(Boolean(s.doneWhen) || NO_DONE_WHEN.includes(`${p.id}:${s.id}`)).toBe(true);
    }
  });

  it("keeps the P4 burn height exactly as written (ISSUE-P4-01 is open)", () => {
    const s = SPECS["p4-ai-pilot"].sections.find((x) => x.heading === "KEY NUMBERS")!;
    expect(
      s.items.some((i) => "text" in i && i.text.includes("So the suicide burn starts at 500 m.")),
    ).toBe(true);
  });
});

describe("pronunciation", () => {
  it("speaks symbols as words", () => {
    expect(forSpeech("g = 9.81 m/s²")).toBe("g equals 9.81 metres per second squared");
    expect(forSpeech("b = 3 × √3 ≈ 5.196")).toBe(
      "b equals 3 times square root of 3 approximately 5.196",
    );
    expect(forSpeech("phi reaches pi")).toBe("fye reaches pie");
    expect(forSpeech("graphic pixels")).toBe("graphic pixels");
  });
});
