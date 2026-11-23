import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../data/db";
import { PROJECTS } from "../data/projects";
import { StatusChip } from "../components/StatusChip";

/** Project library. Stage roadmaps (verbatim from the specs) arrive in M2. */
export function Projects() {
  const states = useLiveQuery(() => db.projectState.toArray(), []);
  const byId = new Map((states ?? []).map((s) => [s.id, s]));

  return (
    <div className="stack">
      <header className="stack-sm">
        <span className="eyebrow">Project library</span>
        <h1>Eight builds, one path.</h1>
      </header>
      <ol className="project-list">
        {PROJECTS.map((p) => {
          const s = byId.get(p.id);
          return (
            <li key={p.id} className="panel project-row">
              <span className="project-num mono">{String(p.number).padStart(2, "0")}</span>
              <div className="stack-xs">
                <h3>{p.title}</h3>
                <p className="muted small">{p.goal}</p>
                {s?.note && <p className="small note">{s.note}</p>}
                <div className="tags">
                  {p.technologies.map((t) => (
                    <span key={t} className="tag mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="project-side">
                {s && <StatusChip status={s.status} source={s.statusSource} />}
                <span className="mono small muted">
                  {p.stageCount} {p.stageUnit}s
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
