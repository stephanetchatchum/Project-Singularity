import { Link } from "react-router-dom";
import {
  AudioLines,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Maximize2,
  WifiOff,
  Square,
} from "lucide-react";
import { player, usePlayer, RATES } from "../audio/player";
import { useListeningMode } from "./listeningStore";

/** Persistent player bar. Works from any page once a lesson is loaded. */
export function MiniPlayer() {
  const s = usePlayer();
  const listening = useListeningMode();

  // Reading a spec stage (or anything outside a lesson).
  if (s.aside && s.asideLabel) {
    return (
      <footer className="mini-player" aria-label="Lesson player">
        <button
          className="icon-btn primary"
          onClick={() => player.stop()}
          aria-label="Stop reading"
        >
          <Square size={16} />
        </button>
        <div className="mini-player-text mp-title">
          <span className="eyebrow">Reading · {s.asideLabel}</span>
          <span className="mp-lesson">{s.aside.text}</span>
        </div>
      </footer>
    );
  }

  if (!s.lesson) {
    return (
      <footer className="mini-player" aria-label="Lesson player">
        <AudioLines size={20} strokeWidth={1.6} className="mini-player-icon" aria-hidden="true" />
        <div className="mini-player-text">
          <span className="eyebrow">Player</span>
          <span className="muted">Nothing loaded. Start a session from Mission.</span>
        </div>
      </footer>
    );
  }

  const lesson = s.lesson;
  const playing = s.status === "playing";
  const beat = lesson.beats[s.beatIndex];

  return (
    <footer className="mini-player" aria-label="Lesson player">
      <div className="mp-buttons">
        <button
          className="icon-btn ghost"
          onClick={() => player.prev()}
          aria-label="Previous sentence"
        >
          <SkipBack size={16} />
        </button>
        <button
          className="icon-btn primary"
          onClick={() => player.toggle()}
          aria-label={playing ? "Pause" : "Play"}
          disabled={s.status === "loading"}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button className="icon-btn ghost" onClick={() => player.next()} aria-label="Next sentence">
          <SkipForward size={16} />
        </button>
      </div>

      <Link to={`/studio/${lesson.id}`} className="mini-player-text mp-title">
        <span className="eyebrow">
          {beat.section} · {s.beatIndex + 1}/{lesson.beats.length}
        </span>
        <span className="mp-lesson">{s.aside ? "Feedback…" : lesson.title}</span>
      </Link>

      <div className="mp-track" role="group" aria-label="Sentences">
        {lesson.beats.map((b, i) => (
          <button
            key={b.id}
            className={`mp-seg ${i < s.beatIndex ? "past" : ""} ${i === s.beatIndex ? "now" : ""}`}
            style={i === s.beatIndex ? { ["--p" as string]: s.progress } : undefined}
            onClick={() => player.goTo(i)}
            aria-label={`Sentence ${i + 1}: ${b.text}`}
          />
        ))}
      </div>

      <span className="mp-narrator small muted" title="Narrator">
        {s.narrator?.needsInternet && <WifiOff size={13} aria-label="Needs internet" />}{" "}
        {s.narrator?.label}
      </span>

      <select
        value={s.rate}
        onChange={(e) => player.setRate(Number(e.target.value))}
        aria-label="Playback speed"
        className="mp-rate mono"
      >
        {RATES.map((r) => (
          <option key={r} value={r}>
            {r}×
          </option>
        ))}
      </select>

      <button
        className="icon-btn ghost"
        onClick={() => listening.open()}
        aria-label="Listening mode"
      >
        <Maximize2 size={16} />
      </button>
    </footer>
  );
}
