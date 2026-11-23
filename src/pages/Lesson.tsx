import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Play, Pause, RotateCcw, Maximize2, ShieldCheck, Hand } from "lucide-react";
import { findLesson } from "../lessons/registry";
import type { Lesson as LessonT } from "../lessons/types";
import { player, usePlayer } from "../audio/player";
import { RayScene, UGraph } from "../scenes/RayScene";
import { Equation } from "../components/Equation";
import { Caption } from "../components/Caption";
import { Activity } from "../components/Activity";
import { useListeningMode } from "../components/listeningStore";

/** Linear interpolation of the photon angle across the current beat. */
function photonPhi(lesson: LessonT, beatIndex: number, progress: number): number | null {
  const p = lesson.beats[beatIndex]?.scene.photon;
  if (!p) return null;
  return p.from + (p.to - p.from) * progress;
}

export function LessonPage() {
  const { lessonId = "" } = useParams();
  const [params] = useSearchParams();
  const lesson = findLesson(lessonId);
  const s = usePlayer();
  const listening = useListeningMode();
  // null = automatic: listen first, then move to the task when narration ends.
  const [chosen, setMode] = useState<"watch" | "try" | null>(null);

  useEffect(() => {
    if (!lesson) return;
    player.load(lesson).then(() => {
      // Only autoplay when Stephane pressed "Start session" to get here.
      if (params.get("play") === "1") player.play();
    });
  }, [lesson, params]);

  if (!lesson) return <p>Lesson not found.</p>;
  const active = s.lesson?.id === lesson.id;
  const mode = chosen ?? (active && s.status === "finished" ? "try" : "watch");
  const beat = lesson.beats[active ? s.beatIndex : 0];
  const progress = active ? s.progress : 0;
  const phi = photonPhi(lesson, active ? s.beatIndex : 0, progress);
  const sections = [...new Set(lesson.beats.map((b) => b.section))];
  const playing = active && s.status === "playing";
  const atStart = !active || (s.status === "paused" && s.beatIndex === 0 && s.progress === 0);

  return (
    <div className="lesson stack">
      <header className="lesson-head">
        <div className="stack-xs">
          <span className="eyebrow">
            {lesson.prepares} · {lesson.minutes} min
          </span>
          <h1>{lesson.title}</h1>
        </div>
        <span className="badge-validated" title={lesson.demoNote}>
          <ShieldCheck size={14} aria-hidden="true" />
          {lesson.demoKind === "validated" ? "Validated: RK4 vs exact answer" : "Illustration"}
        </span>
      </header>

      <div className="mode-switch" role="tablist" aria-label="Lesson part">
        <button role="tab" aria-selected={mode === "watch"} onClick={() => setMode("watch")}>
          1 · Listen and watch
        </button>
        <button role="tab" aria-selected={mode === "try"} onClick={() => setMode("try")}>
          2 · Your turn
        </button>
      </div>

      {mode === "watch" ? (
        <div className="lesson-grid">
          <section className="panel stage" aria-label="Demonstration">
            <RayScene b={10} show={beat.scene.show} phi={phi} focus={beat.scene.focus} />
            {beat.scene.show.includes("graph") && (
              <UGraph b={10} phi={phi} focus={beat.scene.focus === "graph"} uMax={0.125} />
            )}
            {atStart && (
              <button className="big-play" onClick={() => player.play()} disabled={!active}>
                <Play size={28} aria-hidden="true" />
                <span>Play lesson</span>
                <small>{active && s.narrator ? s.narrator.label : "Preparing voice…"}</small>
              </button>
            )}
          </section>

          <aside className="side stack-sm">
            <div className="panel eq-panel" aria-live="polite">
              {beat.equation ? (
                <Equation tex={beat.equation.tex} highlight={beat.equation.highlight} />
              ) : (
                <span className="muted small">The equation appears when the tutor gets to it.</span>
              )}
            </div>

            <Caption lesson={lesson} beatIndex={active ? s.beatIndex : 0} progress={progress} />

            <div className="controls">
              <button
                className="primary icon-btn"
                onClick={() => player.toggle()}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button onClick={() => player.replaySection()} className="icon-text">
                <RotateCcw size={16} aria-hidden="true" /> Replay section
              </button>
              <button onClick={() => listening.open()} className="icon-text">
                <Maximize2 size={16} aria-hidden="true" /> Listening mode
              </button>
            </div>

            <nav className="sections" aria-label="Sections">
              {sections.map((name) => {
                const first = lesson.beats.findIndex((b) => b.section === name);
                const current = beat.section === name;
                return (
                  <button
                    key={name}
                    className={`section-chip ${current ? "current" : ""}`}
                    onClick={() => player.goTo(first)}
                    aria-current={current ? "step" : undefined}
                  >
                    {name}
                  </button>
                );
              })}
            </nav>

            {s.status === "finished" && (
              <button className="primary next-step" onClick={() => setMode("try")}>
                <Hand size={16} aria-hidden="true" /> Your turn: one small task
              </button>
            )}
          </aside>
        </div>
      ) : (
        <Activity lesson={lesson} />
      )}

      <p className="muted small">
        <Link to="/studio">All lessons</Link>
      </p>
    </div>
  );
}
