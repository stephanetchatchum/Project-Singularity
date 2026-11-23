import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { Play, Check } from "lucide-react";
import { LESSONS } from "../lessons/registry";
import { db } from "../data/db";
import { PROJECTS } from "../data/projects";
import { SPEC_ISSUES } from "../data/specIssues";
import { JourneyMap } from "../components/JourneyMap";

/** Mission control: where Stephane is, and what comes next. */
export function Dashboard() {
  const states = useLiveQuery(() => db.projectState.toArray(), []);
  const runs = useLiveQuery(() => db.lessonRuns.toArray(), []);
  const next = LESSONS.find((l) => !runs?.some((r) => r.lessonId === l.id)) ?? LESSONS[0];
  const nextDone = runs?.some((r) => r.lessonId === next.id);
  const openIssues = SPEC_ISSUES.filter((i) => i.status === "open");
  const current = states?.find((s) => s.status === "in-progress");
  const currentMeta = PROJECTS.find((p) => p.id === current?.id);

  return (
    <div className="stack">
      <header className="stack-sm">
        <span className="eyebrow">Mission control</span>
        <h1>Good to see you, Stephane.</h1>
      </header>

      <section className="panel mission">
        <div className="stack-sm">
          <span className="eyebrow">Next session</span>
          <h2>{next.title}</h2>
          <p className="muted">
            {next.prepares} · {next.minutes} min listening, then one small task.
          </p>
          {nextDone && (
            <span className="ok-text small">
              <Check size={14} aria-hidden="true" /> Done. More lessons arrive with M7.
            </span>
          )}
        </div>
        <Link to={`/studio/${next.id}?play=1`} className="button primary start-btn">
          <Play size={18} aria-hidden="true" /> {nextDone ? "Play again" : "Start session"}
        </Link>
      </section>

      <section className="panel stack-sm journey-panel">
        <div className="row-between">
          <span className="eyebrow">Your journey · 8 projects</span>
          <Link to="/projects" className="small-link">
            Open library
          </Link>
        </div>
        {states ? <JourneyMap states={states} /> : <p className="muted">Loading…</p>}
        {current && currentMeta && (
          <p className="muted small">
            Current build:{" "}
            <strong>
              P{currentMeta.number} · {currentMeta.title}
            </strong>{" "}
            — {current.note}
          </p>
        )}
      </section>

      <div className="grid-2">
        <section className="panel stack-sm">
          <span className="eyebrow">Needs your decision · {openIssues.length}</span>
          <ul className="issue-list">
            {openIssues.map((i) => (
              <li key={i.id}>
                <span className="mono small issue-id">{i.location}</span>
                <p className="small">{i.summary}</p>
              </li>
            ))}
          </ul>
          <p className="muted small">The original specs stay unchanged until you decide.</p>
        </section>
        <section className="panel stack-sm">
          <span className="eyebrow">Concepts to revisit</span>
          <p className="muted small">
            None yet. Concepts you find hard in knowledge checks will come back here, spaced out
            over days (built in M5).
          </p>
        </section>
      </div>
    </div>
  );
}
