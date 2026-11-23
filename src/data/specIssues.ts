/**
 * Open questions about the original specs. Mirrors docs/spec-issues.md.
 * The specs themselves are never modified here.
 */
export interface SpecIssue {
  id: string;
  projectId: string;
  location: string;
  summary: string;
  status: "open" | "approved" | "rejected";
  /** Stage ids affected (shown on those stages in the roadmap). */
  stages: string[];
  /** Spec section headings affected (prefix match). */
  sections: string[];
}

export const SPEC_ISSUES: readonly SpecIssue[] = [
  {
    id: "ISSUE-P3-01",
    projectId: "p3-rocket-orbit",
    location: "P3 · Hand-check 5",
    summary:
      "√2 × 7,788 is 11,014, not 11,186. The 11,186 comes from the surface orbit speed, 7,910 m/s.",
    status: "open",
    stages: [],
    sections: ["HAND-CHECKS"],
  },
  {
    id: "ISSUE-P4-01",
    projectId: "p4-ai-pilot",
    location: "P4 · Key numbers, Hand-check 2, Stage 4",
    summary:
      "From a 1,000 m drop the burn must start at about 333 m, not 500 m. 500 m assumes the rocket is already at 140 m/s.",
    status: "open",
    stages: ["4"],
    sections: ["KEY NUMBERS", "HAND-CHECKS", "FINISH CHECKLIST"],
  },
];
