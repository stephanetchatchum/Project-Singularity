/**
 * The one lesson player for the whole app. It survives page navigation, so the
 * mini-player keeps working while Stephane looks at other sections.
 *
 * Granularity is one beat (one sentence). Pause stops the sentence; play
 * repeats it from its start, which keeps captions, sound and visuals aligned.
 */

import { useSyncExternalStore } from "react";
import type { Lesson } from "../lessons/types";
import { chooseNarrator, type Line, type Narrator, type SpeakResult } from "./narrators";

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "finished";

export interface PlayerState {
  lesson: Lesson | null;
  beatIndex: number;
  /** 0..1 progress through the current beat. Drives the animation. */
  progress: number;
  status: PlayerStatus;
  rate: number;
  narrator: Pick<Narrator, "kind" | "label" | "needsInternet"> | null;
  /** A one-off line (hint, feedback, recap, spec stage) currently being spoken. */
  aside: Line | null;
  /** Where the aside comes from, shown in the mini-player (e.g. "P2 · Stage 3"). */
  asideLabel: string | null;
}

export const RATES = [0.75, 0.9, 1, 1.15, 1.3, 1.5] as const;

const INITIAL: PlayerState = {
  lesson: null,
  beatIndex: 0,
  progress: 0,
  status: "idle",
  rate: 1,
  narrator: null,
  aside: null,
  asideLabel: null,
};

class LessonPlayer {
  private state: PlayerState = INITIAL;
  private listeners = new Set<() => void>();
  private narrator: Narrator | null = null;
  /** Narrators for reading outside lessons (spec pages), one per scope. */
  private readers = new Map<string, Promise<Narrator>>();
  private reading: Narrator | null = null;
  /** Increments on every interruption so stale loops stop themselves. */
  private run = 0;

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getState = () => this.state;

  private set(patch: Partial<PlayerState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn());
  }

  /** Load a lesson without playing it. Audio never starts on its own. */
  async load(lesson: Lesson) {
    if (this.state.lesson?.id === lesson.id && this.narrator) return;
    this.stopSound();
    this.set({ ...INITIAL, rate: this.state.rate, lesson, status: "loading" });
    this.narrator = await chooseNarrator(lesson.id);
    const { kind, label, needsInternet } = this.narrator;
    this.set({ status: "paused", narrator: { kind, label, needsInternet } });
  }

  play() {
    const { lesson, status, beatIndex } = this.state;
    if (!lesson || !this.narrator || status === "playing" || status === "loading") return;
    this.playFrom(status === "finished" ? 0 : beatIndex);
  }

  pause() {
    if (this.state.status !== "playing") return;
    this.stopSound();
    this.set({ status: "paused", progress: 0 });
  }

  toggle() {
    if (this.state.status === "playing") this.pause();
    else this.play();
  }

  /** Jump to a beat. Keeps playing if it was playing. */
  goTo(index: number) {
    const { lesson, status } = this.state;
    if (!lesson) return;
    const i = Math.max(0, Math.min(lesson.beats.length - 1, index));
    if (status === "playing") this.playFrom(i);
    else {
      this.stopSound();
      this.set({ beatIndex: i, progress: 0, status: "paused" });
    }
  }

  next() {
    this.goTo(this.state.beatIndex + 1);
  }

  prev() {
    // Like a music player: early in a beat, go back one; later, restart it.
    const back = this.state.progress < 0.25 ? 1 : 0;
    this.goTo(this.state.beatIndex - back);
  }

  /** Replay from the first beat of the current section. */
  replaySection() {
    const { lesson, beatIndex } = this.state;
    if (!lesson) return;
    const section = lesson.beats[beatIndex].section;
    const first = lesson.beats.findIndex((b) => b.section === section);
    this.stopSound();
    this.playFrom(first);
  }

  setRate(rate: number) {
    const wasPlaying = this.state.status === "playing";
    this.set({ rate });
    if (wasPlaying) this.playFrom(this.state.beatIndex);
  }

  /** Speak one extra line (hint, feedback, recap) outside the beat sequence. */
  async say(line: Line): Promise<SpeakResult> {
    if (!this.narrator) return "stopped";
    this.stopSound();
    const myRun = this.run;
    if (this.state.status === "playing") this.set({ status: "paused", progress: 0 });
    this.set({ aside: line });
    const result = await this.narrator.speak(line, this.state.rate, () => {});
    if (this.run !== myRun) return "stopped";
    this.set({ aside: null });
    return result;
  }

  /**
   * Read a line from outside the current lesson (e.g. a spec stage). `scope`
   * picks the recorded clips folder: narration/<scope>/.
   */
  async read(scope: string, line: Line, label: string): Promise<SpeakResult> {
    if (!this.readers.has(scope)) this.readers.set(scope, chooseNarrator(scope));
    const narrator = await this.readers.get(scope)!;
    this.stopSound();
    const myRun = this.run;
    if (this.state.status === "playing") this.set({ status: "paused", progress: 0 });
    this.reading = narrator;
    this.set({ aside: line, asideLabel: label });
    const result = await narrator.speak(line, this.state.rate, () => {});
    if (this.run !== myRun) return "stopped";
    this.reading = null;
    this.set({ aside: null, asideLabel: null });
    return result;
  }

  /** Stop whatever is speaking. */
  stop() {
    this.stopSound();
    if (this.state.status === "playing") this.set({ status: "paused", progress: 0 });
  }

  /** Speak several lines in order; stops early if anything interrupts. */
  async sayAll(lines: Line[]): Promise<void> {
    for (const line of lines) if ((await this.say(line)) === "stopped") return;
  }

  /** Unload everything (used by tests and when leaving a lesson for good). */
  reset() {
    this.stopSound();
    this.narrator = null;
    this.set({ ...INITIAL, rate: this.state.rate });
  }

  private stopSound() {
    this.run++;
    this.narrator?.stop();
    this.reading?.stop();
    this.reading = null;
    if (this.state.aside) this.set({ aside: null, asideLabel: null });
  }

  private async playFrom(start: number) {
    const lesson = this.state.lesson!;
    const narrator = this.narrator!;
    this.stopSound();
    const myRun = this.run;
    for (let i = start; i < lesson.beats.length; i++) {
      const beat = lesson.beats[i];
      this.set({ beatIndex: i, progress: 0, status: "playing" });
      const result = await narrator.speak(
        { key: beat.id, text: beat.speech ?? beat.text },
        this.state.rate,
        (p) => {
          if (this.run === myRun) this.set({ progress: p });
        },
      );
      if (result === "stopped" || this.run !== myRun) return;
      // A short breath between sentences, like a teacher pausing.
      await new Promise((r) => setTimeout(r, 350 / this.state.rate));
      if (this.run !== myRun) return;
    }
    this.set({ status: "finished", progress: 1 });
  }
}

export const player = new LessonPlayer();

/** React hook: re-renders when the player changes. */
export function usePlayer(): PlayerState {
  return useSyncExternalStore(player.subscribe, player.getState);
}
