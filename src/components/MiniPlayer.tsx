import { AudioLines } from "lucide-react";

/**
 * Persistent mini-player bar. In M0 it only reserves its place in the layout
 * and states honestly that nothing is loaded. Controls arrive with the lesson
 * engine in M1, so there are no inactive buttons here.
 */
export function MiniPlayer() {
  return (
    <footer className="mini-player" aria-label="Lesson player">
      <AudioLines size={20} strokeWidth={1.6} className="mini-player-icon" aria-hidden="true" />
      <div className="mini-player-text">
        <span className="eyebrow">Player</span>
        <span className="muted">Nothing playing. The first lesson arrives in M1.</span>
      </div>
      <div className="mini-player-track" aria-hidden="true">
        <div className="mini-player-wave" />
      </div>
    </footer>
  );
}
