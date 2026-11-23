/**
 * Detects which speech-synthesis voices this browser offers.
 *
 * `localService` is the browser's own claim that a voice runs on this device.
 * It is a claim, not proof: the only real test is to speak with the network
 * switched off. The UI says so.
 */

export interface VoiceInfo {
  name: string;
  lang: string;
  localService: boolean;
  isDefault: boolean;
}

export interface VoiceReport {
  supported: boolean;
  english: { local: VoiceInfo[]; network: VoiceInfo[] };
  otherCount: number;
  /** Best English voice that claims to run locally, if any. */
  recommended: VoiceInfo | null;
}

/** Pure: sort voices into local and network English voices. */
export function classifyVoices(voices: VoiceInfo[], supported = true): VoiceReport {
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const local = english.filter((v) => v.localService);
  const network = english.filter((v) => !v.localService);
  const score = (v: VoiceInfo) =>
    (/natural|neural|online/i.test(v.name) ? 2 : 0) +
    (v.lang.toLowerCase() === "en-gb" || v.lang.toLowerCase() === "en-us" ? 1 : 0);
  const recommended = [...local].sort((a, b) => score(b) - score(a))[0] ?? null;
  return {
    supported,
    english: { local, network },
    otherCount: voices.length - english.length,
    recommended,
  };
}

function toInfo(v: SpeechSynthesisVoice): VoiceInfo {
  return { name: v.name, lang: v.lang, localService: v.localService, isDefault: v.default };
}

/** Browser: wait for the voice list (it often loads asynchronously). */
export function loadVoiceReport(timeoutMs = 2000): Promise<VoiceReport> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve(classifyVoices([], false));
  }
  const synth = window.speechSynthesis;
  return new Promise((resolve) => {
    const finish = () => resolve(classifyVoices(synth.getVoices().map(toInfo)));
    if (synth.getVoices().length > 0) return finish();
    const timer = window.setTimeout(finish, timeoutMs);
    synth.addEventListener(
      "voiceschanged",
      () => {
        window.clearTimeout(timer);
        finish();
      },
      { once: true },
    );
  });
}

/** Browser: speak a test sentence with a named voice. Resolves on end or error. */
export function speakTest(text: string, voiceName: string): Promise<"ended" | "error"> {
  const synth = window.speechSynthesis;
  const voice = synth.getVoices().find((v) => v.name === voiceName);
  synth.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.onend = () => resolve("ended");
    u.onerror = () => resolve("error");
    synth.speak(u);
  });
}
