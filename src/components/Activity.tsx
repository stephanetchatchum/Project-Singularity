import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, Check, X, Volume2, Trophy } from "lucide-react";
import type { ChoiceTask, Lesson, NumberTask, Task } from "../lessons/types";
import { traceRay } from "../science/photonOrbit";
import { parseAngle } from "../lessons/answers";
import { player, usePlayer } from "../audio/player";
import { RayScene, UGraph } from "../scenes/RayScene";
import { db } from "../data/db";

interface TaskLog {
  attempts: number;
  hints: number;
  solved: boolean;
}

/**
 * "Your turn": drag b and watch the physics respond, then answer two short
 * questions. Wrong answers get an explanation, not the solution. Hints come
 * one at a time, and each is spoken.
 */
export function Activity({ lesson }: { lesson: Lesson }) {
  const { explore } = lesson;
  const [b, setB] = useState(explore.bStart);
  const [triedValues, setTried] = useState<Set<number>>(new Set([explore.bStart]));
  const [taskIndex, setTaskIndex] = useState(0);
  const [logs, setLogs] = useState<Record<string, TaskLog>>({});
  const [done, setDone] = useState(false);
  const s = usePlayer();
  const saved = useRef(false);

  // Save the session once every task is solved, using the settled task logs.
  const narratorLabel = s.narrator?.label ?? "unknown";
  useEffect(() => {
    const allSolved = lesson.tasks.every((t) => logs[t.id]?.solved);
    if (!done || !allSolved || saved.current) return;
    saved.current = true;
    void saveRun(lesson, logs, narratorLabel);
  }, [done, logs, lesson, narratorLabel]);

  const trace = useMemo(() => traceRay(b, "flat"), [b]);
  const explored = triedValues.size >= 3;
  const task = lesson.tasks[taskIndex];
  const hintsUsed = Object.values(logs).reduce((n, l) => n + l.hints, 0);

  const EMPTY: TaskLog = { attempts: 0, hints: 0, solved: false };
  const log = (id: string): TaskLog => logs[id] ?? EMPTY;
  // Read the latest state inside the updater so quick successive updates all apply.
  const update = (id: string, patch: Partial<TaskLog>) =>
    setLogs((l) => ({ ...l, [id]: { ...(l[id] ?? EMPTY), ...patch } }));

  const say = (key: string, text: string) => void player.say({ key, text });

  /** Called when a task is answered correctly; speaks the explanation. */
  const onSolved = (t: Task) => {
    update(t.id, { solved: true });
    const explain = { key: `${t.id}.explain`, text: t.explain };
    if (taskIndex + 1 < lesson.tasks.length) return say(explain.key, explain.text);
    // Last task: explanation, then the recap, then save the session.
    setDone(true);
    void player.sayAll([explain, { key: "recap", text: lesson.recap }]);
  };

  return (
    <div className="activity">
      <section className="panel stage" aria-label="Interactive demonstration">
        <RayScene b={b} show={["centre", "ray", "b", "phi", "readouts"]} phi={Math.PI / 2} />
        <UGraph b={b} phi={null} uMax={1 / explore.bMin} />
        <div className="b-control">
          <label htmlFor="b-slider" className="mono">
            b
          </label>
          <input
            id="b-slider"
            type="range"
            min={explore.bMin}
            max={explore.bMax}
            step={0.5}
            value={b}
            onChange={(e) => {
              const v = Number(e.target.value);
              setB(v);
              setTried((t) => new Set(t).add(v));
            }}
          />
          <span className="mono b-readout">
            b = {b.toFixed(1)} · peak u = 1/b = {(1 / b).toFixed(3)} · RK4 exit φ ={" "}
            {trace.phiEnd.toFixed(4)}
          </span>
        </div>
      </section>

      <aside className="side stack-sm">
        <div className="panel stack-sm">
          <span className="eyebrow">Step 1 · Explore</span>
          <p>{explore.prompt}</p>
          <p className="small muted">
            {explored ? (
              <span className="ok-text">
                <Check size={14} aria-hidden="true" /> Explored
              </span>
            ) : (
              `Try ${3 - triedValues.size} more value${3 - triedValues.size === 1 ? "" : "s"} of b.`
            )}
          </p>
        </div>

        {explored && !done && task && (
          <div className="panel stack-sm" key={task.id}>
            <span className="eyebrow">
              Step {taskIndex + 2} · Question {taskIndex + 1} of {lesson.tasks.length}
            </span>
            {task.kind === "choice" ? (
              <ChoiceView
                task={task}
                log={log(task.id)}
                update={update}
                say={say}
                onSolved={onSolved}
              />
            ) : (
              <NumberView
                task={task}
                expected={trace.phiEnd}
                log={log(task.id)}
                update={update}
                say={say}
                onSolved={onSolved}
              />
            )}
            {log(task.id).solved && taskIndex + 1 < lesson.tasks.length && (
              <button className="primary" onClick={() => setTaskIndex((i) => i + 1)}>
                Next question
              </button>
            )}
          </div>
        )}

        {done && (
          <div className="panel stack-sm done-panel">
            <span className="eyebrow">Session complete</span>
            <p className="row">
              <Trophy size={18} aria-hidden="true" /> {lesson.tasks.length} of {lesson.tasks.length}{" "}
              solved · {hintsUsed} hint{hintsUsed === 1 ? "" : "s"} used
            </p>
            <p className="small muted">{lesson.recap}</p>
            <div className="row">
              <button onClick={() => say("recap", lesson.recap)} className="icon-text">
                <Volume2 size={16} aria-hidden="true" /> Hear the recap again
              </button>
              <Link to="/" className="small-link">
                Back to mission
              </Link>
            </div>
            <p className="small muted">
              This lesson prepares P2 Stage 1. The stage itself is ticked only with its own evidence
              (M3).
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

/** Store a finished session in the local database. */
function saveRun(lesson: Lesson, logs: Record<string, TaskLog>, narrator: string) {
  return db.lessonRuns.add({
    lessonId: lesson.id,
    finishedAt: Date.now(),
    narrator,
    tasks: lesson.tasks.map((t) => ({ id: t.id, ...logs[t.id] })),
  });
}

interface ViewProps<T> {
  task: T;
  log: TaskLog;
  update: (id: string, patch: Partial<TaskLog>) => void;
  say: (key: string, text: string) => void;
  onSolved: (t: Task) => void;
}

function Hints({ task, log, update, say }: Omit<ViewProps<Task>, "onSolved">) {
  const shown = task.hints.slice(0, log.hints);
  const more = log.hints < task.hints.length && !log.solved;
  return (
    <div className="stack-xs">
      {shown.map((h, i) => (
        <p key={i} className="hint small">
          <Lightbulb size={14} aria-hidden="true" /> {h}
        </p>
      ))}
      {more && (
        <button
          className="icon-text ghost"
          onClick={() => {
            update(task.id, { hints: log.hints + 1 });
            say(`${task.id}.hint.${log.hints}`, task.hints[log.hints]);
          }}
        >
          <Lightbulb size={16} aria-hidden="true" /> {log.hints === 0 ? "Hint" : "Smaller hint"}
        </button>
      )}
    </div>
  );
}

function ChoiceView({ task, log, update, say, onSolved }: ViewProps<ChoiceTask>) {
  const [picked, setPicked] = useState<string | null>(null);
  const choose = (id: string) => {
    if (log.solved) return;
    setPicked(id);
    if (id === task.correct) {
      update(task.id, { attempts: log.attempts + 1 });
      onSolved(task);
    } else {
      update(task.id, { attempts: log.attempts + 1 });
      say(`${task.id}.why.${id}`, task.why[id]);
    }
  };
  return (
    <>
      <p>{task.prompt}</p>
      <div className="options">
        {task.options.map((o) => {
          const state = picked === o.id ? (o.id === task.correct ? "right" : "wrong") : "";
          return (
            <button
              key={o.id}
              className={`option ${state}`}
              onClick={() => choose(o.id)}
              aria-pressed={picked === o.id}
            >
              {state === "right" && <Check size={16} aria-hidden="true" />}
              {state === "wrong" && <X size={16} aria-hidden="true" />}
              {o.text}
            </button>
          );
        })}
      </div>
      {picked && (
        <p
          className={`feedback small ${picked === task.correct ? "ok-text" : "warn-text"}`}
          role="status"
        >
          {picked === task.correct ? task.explain : task.why[picked]}
        </p>
      )}
      <Hints task={task} log={log} update={update} say={say} />
    </>
  );
}

function NumberView({
  task,
  expected,
  log,
  update,
  say,
  onSolved,
}: ViewProps<NumberTask> & { expected: number }) {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<{ value: number; ok: boolean } | null>(null);
  const [error, setError] = useState("");

  const check = () => {
    const value = parseAngle(raw);
    if (value === null) {
      setError("Type a number like 1.57, or use pi, like pi/2.");
      return;
    }
    setError("");
    const ok = Math.abs(value - expected) <= task.tolerance;
    setResult({ value, ok });
    update(task.id, { attempts: log.attempts + 1 });
    if (ok) {
      onSolved(task);
    } else {
      const low = value < expected;
      say(`${task.id}.${low ? "tooLow" : "tooHigh"}`, low ? task.tooLow : task.tooHigh);
    }
  };

  return (
    <>
      <p>{task.prompt}</p>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
      >
        <input
          className="num-input mono"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setError("");
          }}
          placeholder="3.14 or pi"
          aria-label={`Answer in ${task.unit}`}
          disabled={log.solved}
        />
        <span className="mono small muted">{task.unit}</span>
        <button type="submit" disabled={log.solved}>
          Check
        </button>
      </form>
      {error && (
        <p className="warn-text small" role="alert">
          {error}
        </p>
      )}
      {result && (
        <p className={`feedback small ${result.ok ? "ok-text" : "warn-text"}`} role="status">
          You: {result.value.toFixed(4)} rad · RK4 says {expected.toFixed(4)} rad ·{" "}
          {result.ok ? task.explain : result.value < expected ? task.tooLow : task.tooHigh}
        </p>
      )}
      <Hints task={task} log={log} update={update} say={say} />
    </>
  );
}
