import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Line, Narrator, SpeakResult } from "./narrators";
import { LESSONS } from "../lessons/registry";

/** A narrator we control by hand: each line waits until we finish or stop it. */
class FakeNarrator implements Narrator {
  kind = "captions" as const;
  label = "fake";
  needsInternet = false;
  spoken: string[] = [];
  private pending: ((r: SpeakResult) => void) | null = null;
  speak(line: Line): Promise<SpeakResult> {
    this.spoken.push(line.key);
    return new Promise((r) => (this.pending = r));
  }
  finish() {
    const p = this.pending;
    this.pending = null;
    p?.("ended");
  }
  stop() {
    const p = this.pending;
    this.pending = null;
    p?.("stopped");
  }
}

const fake = new FakeNarrator();
vi.mock("./narrators", async (orig) => ({
  ...(await orig<typeof import("./narrators")>()),
  chooseNarrator: async () => fake,
}));

const { player } = await import("./player");
const lesson = LESSONS[0];
const tick = () => new Promise((r) => setTimeout(r, 400));

describe("lesson player", () => {
  beforeEach(async () => {
    player.reset();
    fake.spoken = [];
    await player.load(lesson);
  });

  it("never starts sound on load", () => {
    expect(player.getState().status).toBe("paused");
    expect(fake.spoken).toEqual([]);
  });

  it("plays beats in order and finishes", async () => {
    player.play();
    for (let i = 0; i < lesson.beats.length; i++) {
      await tick();
      fake.finish();
    }
    await tick();
    expect(fake.spoken).toEqual(lesson.beats.map((b) => b.id));
    expect(player.getState().status).toBe("finished");
  });

  it("pause stops the sentence; play repeats it from the start", async () => {
    player.play();
    await tick();
    fake.finish();
    await tick();
    player.pause();
    expect(player.getState()).toMatchObject({ status: "paused", beatIndex: 1 });
    player.play();
    await tick();
    expect(fake.spoken).toEqual(["b1", "b2", "b2"]);
  });

  it("jumps to a section's first beat on replay", async () => {
    player.goTo(5);
    player.play();
    await tick();
    player.replaySection();
    await tick();
    const first = lesson.beats.findIndex((b) => b.section === lesson.beats[5].section);
    expect(player.getState().beatIndex).toBe(first);
  });

  it("speaks feedback lines in order with sayAll", async () => {
    const done = player.sayAll([
      { key: "a", text: "A" },
      { key: "b", text: "B" },
    ]);
    await tick();
    fake.finish();
    await tick();
    fake.finish();
    await done;
    expect(fake.spoken).toEqual(["a", "b"]);
    expect(player.getState().aside).toBeNull();
  });
});
