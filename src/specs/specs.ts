/**
 * Original project specifications, extracted word for word from docs/specs/
 * by scripts/specs/extract_specs.py. Never edit the JSON by hand: change the
 * source document (with Stephane's approval) and re-run the extractor.
 */
import p1 from "../content/specs/p1-slingshot.json";
import p2 from "../content/specs/p2-black-hole.json";
import p3 from "../content/specs/p3-rocket-orbit.json";
import p4 from "../content/specs/p4-ai-pilot.json";
import p5 from "../content/specs/p5-em-field.json";
import p6 from "../content/specs/p6-fluid-cpp.json";
import p7 from "../content/specs/p7-julia-pde.json";
import p8 from "../content/specs/p8-earth-obs.json";

export type SpecItem =
  | { kind: "p"; text: string }
  | { kind: "li"; text: string; n?: number }
  | { kind: "table"; rows: string[][] }
  | { kind: "math"; tex: string };

export interface SpecSection {
  heading: string;
  items: SpecItem[];
}

export interface SpecStep {
  id: string;
  title: string;
  fields: Record<string, string>;
}

export interface SpecStage {
  id: string;
  title: string;
  body: string;
  doneWhen: string | null;
  /** Only P5 (build guide) has sub-steps. */
  steps?: SpecStep[];
}

export interface ProjectSpec {
  projectId: string;
  sources: string[];
  sections: SpecSection[];
  stages: SpecStage[];
  /** Exact sentences to read aloud: "overview", "stage.N", "step.N.M". */
  speech: Record<string, string>;
}

export const SPECS: Record<string, ProjectSpec> = Object.fromEntries(
  [p1, p2, p3, p4, p5, p6, p7, p8].map((s) => [s.projectId, s as ProjectSpec]),
);
