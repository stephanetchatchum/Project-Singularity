/**
 * Lesson format. A lesson is a list of short beats; each beat is ONE spoken
 * sentence plus what the screen should show while it is spoken.
 *
 * The scene is a pure function of (beat, progress within beat), so pausing,
 * replaying or skipping always shows the right picture.
 */

/** Layers of the ray scene that can be switched on per beat. */
export type SceneLayer = "centre" | "ray" | "b" | "photon" | "r" | "phi" | "readouts" | "graph";

export interface SceneState {
  show: SceneLayer[];
  /** Photon angle moves from `from` to `to` (radians) as the beat plays. */
  photon?: { from: number; to: number };
  /** One layer to draw in the "being explained" colour. */
  focus?: SceneLayer;
}

export interface EquationState {
  /** KaTeX source; terms wrapped as \htmlClass{term-ID}{...} can be highlighted. */
  tex: string;
  highlight: string[];
}

export interface Beat {
  id: string;
  /** Section name for navigation (several beats share one). */
  section: string;
  /** On-screen caption, also the default spoken text. */
  text: string;
  /** Spoken version, when it should differ from the caption. */
  speech?: string;
  scene: SceneState;
  equation?: EquationState;
}

export interface ChoiceTask {
  kind: "choice";
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correct: string;
  /** Hints, from gentle to direct. Never the answer itself until the last. */
  hints: string[];
  /** Spoken feedback for each wrong option: explains the mistake. */
  why: Record<string, string>;
  explain: string;
}

export interface NumberTask {
  kind: "number";
  id: string;
  prompt: string;
  unit: string;
  /** Checked against a live computation, not a stored number. */
  check: "flat-escape-angle";
  tolerance: number;
  hints: string[];
  /** Spoken when the answer is below / above the correct value. */
  tooLow: string;
  tooHigh: string;
  explain: string;
}

export type Task = ChoiceTask | NumberTask;

export interface Lesson {
  id: string;
  projectId: string;
  title: string;
  /** Which spec stage this lesson prepares. */
  prepares: string;
  minutes: number;
  /** Is the demonstration a checked numerical result or only an illustration? */
  demoKind: "validated" | "illustrative";
  demoNote: string;
  beats: Beat[];
  /** The small task at the end: explore b, then answer. */
  explore: { prompt: string; bMin: number; bMax: number; bStart: number };
  tasks: Task[];
  recap: string;
}
