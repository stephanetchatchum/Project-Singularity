/**
 * Narrators turn one short line into sound and report progress (0..1).
 *
 * Three kinds, tried in this order:
 *  1. recorded – Kokoro clips made on Stephane's computer and cached offline.
 *  2. voice    – a speech-synthesis voice installed in the browser/OS.
 *  3. captions – no sound; the line stays on screen for its reading time.
 */

import { loadVoiceReport } from "./voiceCapabilities";
import pronunciation from "../content/pronunciation.json";

const RULES = pronunciation.rules.map(
  ([pattern, say]) => [new RegExp(pattern, /^\\b/.test(pattern) ? "gi" : "g"), say] as const,
);

export interface Line {
  /** Stable key, used to find a recorded clip (e.g. "b3", "t1.hint.0"). */
  key: string;
  text: string;
}

export type SpeakResult = "ended" | "stopped";

export interface Narrator {
  kind: "recorded" | "voice" | "captions";
  /** Short human description shown in the player. */
  label: string;
  /** True when this narrator may need the internet to speak. */
  needsInternet: boolean;
  speak(line: Line, rate: number, onProgress: (p: number) => void): Promise<SpeakResult>;
  stop(): void;
}

/** Seconds a line takes at normal speed, assuming ~2.6 spoken words per second. */
export function estimateSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1.2, words / 2.6 + 0.4);
}

/** Turn symbols into words a voice can say ("m/s²" → "metres per second squared"). */
export function forSpeech(text: string): string {
  let out = text;
  for (const [re, say] of RULES) out = out.replace(re, say);
  return out.replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------

/** Plays nothing; advances on a timer so captions and visuals still work. */
export class CaptionsNarrator implements Narrator {
  kind = "captions" as const;
  label = "Captions only (no voice found)";
  needsInternet = false;
  private cancel: (() => void) | null = null;

  speak(line: Line, rate: number, onProgress: (p: number) => void): Promise<SpeakResult> {
    const total = (estimateSeconds(line.text) * 1000) / rate;
    return new Promise((resolve) => {
      const start = performance.now();
      let raf = 0;
      const tick = () => {
        const p = Math.min(1, (performance.now() - start) / total);
        onProgress(p);
        if (p >= 1) return resolve("ended");
        raf = requestAnimationFrame(tick);
      };
      this.cancel = () => {
        cancelAnimationFrame(raf);
        resolve("stopped");
      };
      raf = requestAnimationFrame(tick);
    });
  }

  stop() {
    this.cancel?.();
    this.cancel = null;
  }
}

// ---------------------------------------------------------------------------

/** Browser speech synthesis. Progress blends word boundaries with a time estimate. */
export class VoiceNarrator implements Narrator {
  kind = "voice" as const;
  label: string;
  needsInternet: boolean;
  private voice: SpeechSynthesisVoice;
  private cancel: (() => void) | null = null;

  constructor(voice: SpeechSynthesisVoice) {
    this.voice = voice;
    this.needsInternet = !voice.localService;
    this.label = `${voice.name.replace(/^Microsoft /, "").split(" - ")[0]}${
      voice.localService ? "" : " (online)"
    }`;
  }

  speak(line: Line, rate: number, onProgress: (p: number) => void): Promise<SpeakResult> {
    const synth = window.speechSynthesis;
    synth.cancel();
    const spoken = forSpeech(line.text);
    const expected = (estimateSeconds(line.text) * 1000) / rate;
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(spoken);
      u.voice = this.voice;
      u.rate = rate;
      let boundary = 0;
      let start = 0;
      let raf = 0;
      let done = false;
      const finish = (r: SpeakResult) => {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        if (r === "ended") onProgress(1);
        resolve(r);
      };
      const tick = () => {
        if (start) {
          // Time estimate keeps motion smooth; boundaries correct it when available.
          const timeP = Math.min(0.98, (performance.now() - start) / expected);
          onProgress(Math.max(timeP, boundary));
        }
        raf = requestAnimationFrame(tick);
      };
      u.onstart = () => {
        start = performance.now();
      };
      u.onboundary = (e) => {
        boundary = Math.min(0.98, e.charIndex / spoken.length);
      };
      u.onend = () => finish("ended");
      u.onerror = (e) =>
        finish(e.error === "interrupted" || e.error === "canceled" ? "stopped" : "ended");
      this.cancel = () => {
        synth.cancel();
        finish("stopped");
      };
      raf = requestAnimationFrame(tick);
      synth.speak(u);
    });
  }

  stop() {
    this.cancel?.();
    this.cancel = null;
  }
}

// ---------------------------------------------------------------------------

export interface ClipManifest {
  engine: string;
  voice: string;
  clips: Record<string, { file: string; seconds: number; text: string }>;
}

/** Pre-recorded clips (Kokoro). Lines with no clip fall back to `backup`. */
export class RecordedNarrator implements Narrator {
  kind = "recorded" as const;
  label: string;
  needsInternet = false;
  private audio = new Audio();
  private cancel: (() => void) | null = null;
  private manifest: ClipManifest;
  private base: string;
  private backup: Narrator;

  constructor(manifest: ClipManifest, base: string, backup: Narrator) {
    this.manifest = manifest;
    this.base = base;
    this.backup = backup;
    this.label = `${manifest.engine} · ${manifest.voice}`;
  }

  speak(line: Line, rate: number, onProgress: (p: number) => void): Promise<SpeakResult> {
    const clip = this.manifest.clips[line.key];
    // A clip recorded from older text would contradict the caption, so use the backup.
    if (!clip || clip.text !== line.text) return this.backup.speak(line, rate, onProgress);
    const a = this.audio;
    a.src = this.base + clip.file;
    a.playbackRate = rate;
    return new Promise((resolve) => {
      let raf = 0;
      const finish = (r: SpeakResult) => {
        cancelAnimationFrame(raf);
        a.onended = null;
        a.onerror = null;
        if (r === "ended") onProgress(1);
        resolve(r);
      };
      const tick = () => {
        if (a.duration) onProgress(Math.min(1, a.currentTime / a.duration));
        raf = requestAnimationFrame(tick);
      };
      a.onended = () => finish("ended");
      a.onerror = () => {
        finish("stopped");
      };
      this.cancel = () => {
        a.pause();
        finish("stopped");
      };
      a.play().then(
        () => (raf = requestAnimationFrame(tick)),
        () => finish("stopped"),
      );
    });
  }

  stop() {
    this.cancel?.();
    this.cancel = null;
    this.backup.stop();
  }
}

// ---------------------------------------------------------------------------

/** Pick the best available narrator for a lesson. */
export async function chooseNarrator(lessonId: string): Promise<Narrator> {
  const fallback = await chooseVoiceOrCaptions();
  const base = `${import.meta.env.BASE_URL}narration/${lessonId}/`;
  try {
    const res = await fetch(`${base}manifest.json`);
    if (res.ok && res.headers.get("content-type")?.includes("json")) {
      return new RecordedNarrator((await res.json()) as ClipManifest, base, fallback);
    }
  } catch {
    // No recorded narration for this lesson yet.
  }
  return fallback;
}

async function chooseVoiceOrCaptions(): Promise<Narrator> {
  const report = await loadVoiceReport();
  if (!report.supported) return new CaptionsNarrator();
  const pick = report.recommended ?? report.english.local[0] ?? report.english.network[0];
  const voice = pick && window.speechSynthesis.getVoices().find((v) => v.name === pick.name);
  return voice ? new VoiceNarrator(voice) : new CaptionsNarrator();
}
