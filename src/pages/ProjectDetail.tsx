import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Check, ChevronRight, FileText, TriangleAlert, Volume2 } from "lucide-react";
import { PROJECTS } from "../data/projects";
import { db, type StageState } from "../data/db";
import { SPECS, type SpecStage } from "../specs/specs";
import { SPEC_ISSUES, type SpecIssue } from "../data/specIssues";
import { StatusChip } from "../components/StatusChip";
import { SpecItems } from "../components/SpecItems";
import { player, usePlayer } from "../audio/player";

/** One project: roadmap of its stages, plus the full spec, word for word. */
export function ProjectDetail() {
  const { projectId = "" } = useParams();
  const meta = PROJECTS.find((p) => p.id === projectId);
  const spec = SPECS[projectId];
  const state = useLiveQuery(() => db.projectState.get(projectId), [projectId]);
  const stages = useLiveQuery(
    () => db.stageState.where("projectId").equals(projectId).toArray(),
    [projectId],
  );
  if (!meta || !spec) return <p>Project not found.</p>;

  const byId = new Map((stages ?? []).map((s) => [s.stageId, s]));
  const issues = SPEC_ISSUES.filter((i) => i.projectId === projectId && i.status === "open");
  const done = spec.stages.filter((s) => byId.get(s.id)?.status === "done").length;
  const current = spec.stages.find((s) => byId.get(s.id)?.status !== "done");
  const unit = meta.stageUnit === "phase" ? "Phase" : "Stage";
  const scope = `spec-${projectId}`;
  const label = (key: string) => `P${meta.number} · ${key}`;
  const read = (key: string, text: string, where: string) =>
    void player.read(scope, { key, text }, label(where));

  // The stage list is shown as the roadmap, so skip it among the text sections.
  const sections = spec.sections.filter(
    (s) => !s.heading.startsWith("BUILD STAGES") && s.heading !== "Build stages",
  );

  return (
    <div className="stack project-detail">
      <Link to="/projects" className="small-link back-link">
        <ArrowLeft size={14} aria-hidden="true" /> All projects
      </Link>

      <header className="stack-sm">
        <span className="eyebrow">
          Project {meta.number} · {meta.stageCount} {meta.stageUnit}s
        </span>
        <div className="row-between wrap">
          <h1>{meta.title}</h1>
          {state && <StatusChip status={state.status} source={state.statusSource} />}
        </div>
        <p className="muted">{meta.goal}</p>
        <div className="row">
          {spec.speech.overview && (
            <ListenButton
              onClick={() => read("overview", spec.speech.overview, "Overview")}
              text={spec.speech.overview}
              label="Listen to the overview"
            />
          )}
          <span className="small muted row-inline">
            <FileText size={14} aria-hidden="true" /> Word for word from {meta.specFiles[0]}
          </span>
        </div>
      </header>

      {issues.map((i) => (
        <IssueNote key={i.id} issue={i} />
      ))}

      <section className="panel stack-sm">
        <div className="row-between">
          <span className="eyebrow">Roadmap</span>
          <span className="mono small muted">
            {done} / {spec.stages.length} {meta.stageUnit}s done
          </span>
        </div>
        <div className="progress-bar" aria-hidden="true">
          <div style={{ width: `${(done / spec.stages.length) * 100}%` }} />
        </div>
        <ol className="roadmap">
          {spec.stages.map((st) => (
            <StageRow
              key={st.id}
              stage={st}
              unit={unit}
              state={byId.get(st.id)}
              stepStates={byId}
              current={st.id === current?.id}
              issues={issues.filter((i) => i.stages.includes(st.id))}
              onListen={(key, text, where) => read(key, text, where)}
              speech={spec.speech}
            />
          ))}
        </ol>
        <p className="small muted">
          Progress shown is what you reported. From M3, a {meta.stageUnit} is ticked only with the
          evidence it needs.
        </p>
      </section>

      <section className="stack-sm">
        <span className="eyebrow">Specification</span>
        {sections.map((s, i) => {
          const flagged = issues.filter((x) => x.sections.some((h) => s.heading.startsWith(h)));
          return (
            <details key={s.heading} className="panel spec-section" open={i < 2}>
              <summary>
                <ChevronRight size={16} className="chev" aria-hidden="true" />
                <span>{s.heading}</span>
                {flagged.length > 0 && (
                  <span className="issue-flag" title={flagged.map((f) => f.id).join(", ")}>
                    <TriangleAlert size={13} aria-hidden="true" /> open question
                  </span>
                )}
              </summary>
              <SpecItems items={s.items} />
            </details>
          );
        })}
      </section>
    </div>
  );
}

function ListenButton({
  onClick,
  text,
  label,
}: {
  onClick: () => void;
  text: string;
  label: string;
}) {
  const s = usePlayer();
  const active = s.aside?.text === text;
  return (
    <button
      className={`icon-text listen-btn ${active ? "on" : ""}`}
      onClick={() => (active ? player.stop() : onClick())}
      aria-label={active ? "Stop reading" : label}
    >
      <Volume2 size={15} aria-hidden="true" /> {active ? "Stop" : "Listen"}
    </button>
  );
}

function IssueNote({ issue }: { issue: SpecIssue }) {
  return (
    <aside className="issue-note" role="note">
      <TriangleAlert size={16} aria-hidden="true" />
      <div className="stack-xs">
        <span className="mono small">
          {issue.id} · {issue.location} · awaiting your decision
        </span>
        <p className="small">{issue.summary}</p>
        <p className="small muted">The spec below is unchanged.</p>
      </div>
    </aside>
  );
}

interface StageRowProps {
  stage: SpecStage;
  unit: string;
  state?: StageState;
  stepStates: Map<string, StageState>;
  current: boolean;
  issues: SpecIssue[];
  speech: Record<string, string>;
  onListen: (key: string, text: string, where: string) => void;
}

function StageRow({
  stage,
  unit,
  state,
  stepStates,
  current,
  issues,
  speech,
  onListen,
}: StageRowProps) {
  const status = state?.status ?? "todo";
  const key = `stage.${stage.id}`;
  return (
    <li className={`stage-row ${status} ${current ? "current" : ""}`}>
      <details open={current}>
        <summary>
          <span className={`stage-dot ${status}`} aria-hidden="true">
            {status === "done" ? <Check size={13} /> : stage.id}
          </span>
          <span className="stage-title">
            <span className="eyebrow">
              {unit} {stage.id}
              {current && " · next"}
              {state && ` · ${status === "done" ? "done" : "in progress"}, you reported`}
            </span>
            <span>{stage.title}</span>
          </span>
          {issues.length > 0 && (
            <TriangleAlert size={15} className="issue-icon" aria-label="Open question" />
          )}
        </summary>
        <div className="stage-body stack-sm">
          {stage.body && <p>{stage.body}</p>}
          {stage.doneWhen ? (
            <p className="done-when">
              <strong>Done when:</strong> {stage.doneWhen}
            </p>
          ) : (
            unit === "Stage" && (
              <p className="small muted">The spec gives no "Done when" for this stage.</p>
            )
          )}
          {issues.map((i) => (
            <IssueNote key={i.id} issue={i} />
          ))}
          {speech[key] && (
            <div>
              <ListenButton
                onClick={() => onListen(key, speech[key], `${unit} ${stage.id}`)}
                text={speech[key]}
                label={`Listen to ${unit} ${stage.id}`}
              />
            </div>
          )}
          {stage.steps && stage.steps.length > 0 && (
            <ol className="steps">
              {stage.steps.map((step) => {
                const st = stepStates.get(step.id);
                const sk = `step.${step.id}`;
                return (
                  <li key={step.id} className={`step ${st?.status ?? ""}`}>
                    <div className="row-between">
                      <span>
                        <span className="mono small muted">{step.id}</span> {step.title}
                        {st && <span className="ok-text small"> · done, you reported</span>}
                      </span>
                      {speech[sk] && (
                        <ListenButton
                          onClick={() => onListen(sk, speech[sk], `Step ${step.id}`)}
                          text={speech[sk]}
                          label={`Listen to step ${step.id}`}
                        />
                      )}
                    </div>
                    <dl className="step-fields">
                      {Object.entries(step.fields).map(([k, v]) => (
                        <div key={k}>
                          <dt>{k === "Note" ? "" : k}</dt>
                          <dd className={k === "Commit" ? "mono" : ""}>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </details>
    </li>
  );
}
