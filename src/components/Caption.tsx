import type { Lesson } from "../lessons/types";

/**
 * The narrated sentence, lit word by word as it is spoken, with the previous
 * and next sentences dimmed around it so the eye always knows where it is.
 */
export function Caption({
  lesson,
  beatIndex,
  progress,
  large = false,
}: {
  lesson: Lesson;
  beatIndex: number;
  progress: number;
  large?: boolean;
}) {
  const beat = lesson.beats[beatIndex];
  const words = beat.text.split(" ");
  const lit = Math.round(progress * words.length);
  const prev = lesson.beats[beatIndex - 1];
  const next = lesson.beats[beatIndex + 1];

  return (
    <div className={`caption ${large ? "caption-large" : ""}`}>
      {prev && !large && <p className="caption-ghost">{prev.text}</p>}
      <p className="caption-now" aria-live="polite">
        {words.map((w, i) => (
          <span key={i} className={i < lit ? "w-lit" : "w-dim"}>
            {w}{" "}
          </span>
        ))}
      </p>
      {next && !large && <p className="caption-ghost">{next.text}</p>}
      <span className="caption-count mono">
        {beatIndex + 1} / {lesson.beats.length}
      </span>
    </div>
  );
}
