import { useEffect } from "react";
import { useListeningMode } from "./listeningStore";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { player, usePlayer } from "../audio/player";
import { Caption } from "./Caption";
import { Equation } from "./Equation";

/**
 * Distraction-free listening: one big caption, the equation, and large
 * controls. Made for looking away from the screen and just listening.
 */
export function ListeningMode() {
  const { isOpen: open, close } = useListeningMode();
  const s = usePlayer();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open || !s.lesson) return null;
  const lesson = s.lesson;
  const beat = lesson.beats[s.beatIndex];
  const playing = s.status === "playing";
  const overall = (s.beatIndex + s.progress) / lesson.beats.length;

  return (
    <div className="listening" role="dialog" aria-modal="true" aria-label="Listening mode">
      <button
        className="listening-close icon-btn"
        onClick={close}
        aria-label="Close listening mode"
      >
        <X size={20} />
      </button>
      <span className="eyebrow">
        {lesson.title} · {beat.section}
      </span>
      <div className="listening-orb" style={{ ["--p" as string]: overall }} aria-hidden="true">
        <div className={`orb-core ${playing ? "on" : ""}`} />
      </div>
      {s.aside ? (
        <p className="caption-large caption-now">{s.aside.text}</p>
      ) : (
        <Caption lesson={lesson} beatIndex={s.beatIndex} progress={s.progress} large />
      )}
      {beat.equation && <Equation tex={beat.equation.tex} highlight={beat.equation.highlight} />}
      <div className="listening-controls">
        <button className="icon-btn" onClick={() => player.prev()} aria-label="Previous sentence">
          <SkipBack size={22} />
        </button>
        <button
          className="primary icon-btn big"
          onClick={() => player.toggle()}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={28} /> : <Play size={28} />}
        </button>
        <button className="icon-btn" onClick={() => player.next()} aria-label="Next sentence">
          <SkipForward size={22} />
        </button>
      </div>
      <p className="muted small">Space: play or pause · ← →: sentence · Esc: close</p>
    </div>
  );
}
