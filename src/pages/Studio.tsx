import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Play, Check } from "lucide-react";
import { LESSONS } from "../lessons/registry";
import { db } from "../data/db";

/** List of lessons. One tap starts a session. */
export function Studio() {
  const runs = useLiveQuery(() => db.lessonRuns.toArray(), []);
  return (
    <div className="stack">
      <header className="stack-sm">
        <span className="eyebrow">Learning studio</span>
        <h1>Listen, watch, try.</h1>
      </header>
      <ul className="lesson-list">
        {LESSONS.map((l) => {
          const done = runs?.some((r) => r.lessonId === l.id);
          return (
            <li key={l.id} className="panel lesson-row">
              <div className="stack-xs">
                <span className="eyebrow">
                  {l.prepares} · {l.minutes} min
                </span>
                <h3>{l.title}</h3>
                {done && (
                  <span className="ok-text small">
                    <Check size={14} aria-hidden="true" /> Completed
                  </span>
                )}
              </div>
              <Link to={`/studio/${l.id}?play=1`} className="button primary">
                <Play size={16} aria-hidden="true" /> {done ? "Play again" : "Start"}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
