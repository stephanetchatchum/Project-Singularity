import { describe, expect, it } from "vitest";
import { classifyVoices, type VoiceInfo } from "./voiceCapabilities";

const v = (name: string, lang: string, localService: boolean): VoiceInfo => ({
  name,
  lang,
  localService,
  isDefault: false,
});

describe("classifyVoices", () => {
  it("separates on-device English voices from network voices", () => {
    const r = classifyVoices([
      v("Microsoft David - English (United States)", "en-US", true),
      v("Microsoft Ava Online (Natural) - English (United States)", "en-US", false),
      v("Microsoft Hortense - French", "fr-FR", true),
    ]);
    expect(r.english.local.map((x) => x.name)).toEqual([
      "Microsoft David - English (United States)",
    ]);
    expect(r.english.network).toHaveLength(1);
    expect(r.otherCount).toBe(1);
  });

  it("never recommends a voice that needs the internet", () => {
    const r = classifyVoices([v("Google UK English Female", "en-GB", false)]);
    expect(r.recommended).toBeNull();
  });

  it("reports no support when the browser has no speech synthesis", () => {
    expect(classifyVoices([], false).supported).toBe(false);
  });
});
