import type { ProjectStatus } from "../data/projects";
import type { StatusSource } from "../data/db";

const LABEL: Record<ProjectStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  planned: "Planned",
};

/** Status pill. Says where the status came from, so nothing looks verified when it isn't. */
export function StatusChip({ status, source }: { status: ProjectStatus; source: StatusSource }) {
  return (
    <span className={`chip chip-${status}`}>
      <span className="chip-dot" aria-hidden="true" />
      {LABEL[status]}
      {status !== "planned" && (
        <span className="chip-source">{source === "verified" ? "verified" : "you reported"}</span>
      )}
    </span>
  );
}
