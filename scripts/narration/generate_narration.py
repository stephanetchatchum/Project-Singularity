"""Record every spoken line of a lesson as audio clips, for offline playback.

Reads  src/content/lessons/<lesson>.json          (target: <lesson id>)
       src/content/specs/<project>.json          (target: spec:<project id>)
Writes public/narration/<lesson or spec-project>/<key>.ogg and manifest.json

Each clip is one sentence (one beat, hint, or feedback line). The app matches
clips by key AND by exact text, so if a lesson's wording changes, the stale
clip is ignored and the browser voice is used until you re-record.

Usage (Windows, Git Bash, inside scripts/audio-validation/.venv):
    python scripts/narration/generate_narration.py p2-light-flat-space --voice af_heart
    python scripts/narration/generate_narration.py p2-light-flat-space --engine espeak   # test only
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
LESSON_DIR = ROOT / "src" / "content" / "lessons"
SPEC_DIR = ROOT / "src" / "content" / "specs"
OUT_ROOT = ROOT / "public" / "narration"
SAMPLE_RATE_HZ = 24_000


def spoken_lines(lesson: dict) -> list[tuple[str, str]]:
    """All (key, text) pairs the app may speak for this lesson. Keys match the app."""
    lines = [(b["id"], b.get("speech", b["text"])) for b in lesson["beats"]]
    for t in lesson["tasks"]:
        lines += [(f"{t['id']}.hint.{i}", h) for i, h in enumerate(t["hints"])]
        lines.append((f"{t['id']}.explain", t["explain"]))
        if t["kind"] == "choice":
            lines += [(f"{t['id']}.why.{k}", v) for k, v in t["why"].items()]
        else:
            lines += [(f"{t['id']}.tooLow", t["tooLow"]), (f"{t['id']}.tooHigh", t["tooHigh"])]
    lines.append(("recap", lesson["recap"]))
    return lines


RULES = json.loads((ROOT / "src" / "content" / "pronunciation.json").read_text(encoding="utf-8"))["rules"]


def for_speech(text: str) -> str:
    """Same pronunciation rules as the app (src/content/pronunciation.json)."""
    for pattern, say in RULES:
        flags = re.IGNORECASE if pattern.startswith("\\b") else 0
        text = re.sub(pattern, lambda _m, s=say: s, text, flags=flags)
    return re.sub(r"\s+", " ", text).strip()


class KokoroEngine:
    """Kokoro-82M, running locally. Downloads its model once, then works offline."""

    def __init__(self, voice: str) -> None:
        from kokoro import KPipeline

        self.voice = voice
        # Voice names starting with "b" are British English; others American.
        self.pipe = KPipeline(lang_code="b" if voice.startswith("b") else "a")
        self.name = "Kokoro"

    def synth(self, text: str) -> np.ndarray:
        chunks = [audio for _, _, audio in self.pipe(text, voice=self.voice, speed=1.0)]
        return np.concatenate([np.asarray(c) for c in chunks])


class EspeakEngine:
    """Robotic but dependable. For testing the pipeline only, never for lessons."""

    def __init__(self, voice: str) -> None:
        if not shutil.which("espeak-ng"):
            sys.exit("espeak-ng is not installed.")
        self.voice = voice if voice != "af_heart" else "en-gb"
        self.name = "espeak-ng (test)"

    def synth(self, text: str) -> np.ndarray:
        with tempfile.TemporaryDirectory() as tmp:
            wav = Path(tmp) / "out.wav"
            subprocess.run(["espeak-ng", "-v", self.voice, "-s", "160", "-w", str(wav), text], check=True)
            audio, rate = sf.read(wav, dtype="float32")
        # Resample by linear interpolation to the shared rate; fine for a test voice.
        n = int(len(audio) * SAMPLE_RATE_HZ / rate)
        return np.interp(np.linspace(0, len(audio) - 1, n), np.arange(len(audio)), audio).astype("float32")


def main() -> int:
    """Generate clips and manifest for one lesson. Returns an exit code."""
    ap = argparse.ArgumentParser()
    ap.add_argument("target", help="lesson id (p2-light-flat-space) or spec:<project id>")
    ap.add_argument("--engine", choices=["kokoro", "espeak"], default="kokoro")
    ap.add_argument("--voice", default="af_heart")
    args = ap.parse_args()

    if args.target.startswith("spec:"):
        pid = args.target[5:]
        spec = json.loads((SPEC_DIR / f"{pid}.json").read_text(encoding="utf-8"))
        lines = list(spec["speech"].items())
        folder = f"spec-{pid}"
    else:
        lesson = json.loads((LESSON_DIR / f"{args.target}.json").read_text(encoding="utf-8"))
        lines = spoken_lines(lesson)
        folder = args.target
    engine = KokoroEngine(args.voice) if args.engine == "kokoro" else EspeakEngine(args.voice)
    out = OUT_ROOT / folder
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    manifest = {"engine": engine.name, "voice": args.voice, "clips": {}}
    total_audio = total_gen = 0.0
    for key, text in lines:
        t0 = time.perf_counter()
        audio = engine.synth(for_speech(text))
        gen = time.perf_counter() - t0
        # Trim to a short tail of silence so beats flow like natural speech.
        audio = np.concatenate([audio, np.zeros(int(0.08 * SAMPLE_RATE_HZ), dtype=audio.dtype)])
        file = f"{key}.ogg"
        sf.write(out / file, audio, SAMPLE_RATE_HZ, format="OGG", subtype="VORBIS")
        seconds = len(audio) / SAMPLE_RATE_HZ
        # `text` is the un-tweaked line: the app compares it to what it wants to say.
        manifest["clips"][key] = {"file": file, "seconds": round(seconds, 2), "text": text}
        total_audio += seconds
        total_gen += gen
        print(f"{key:14s} {seconds:5.2f} s  (made in {gen:4.2f} s)")

    (out / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    size_kb = sum(f.stat().st_size for f in out.iterdir()) / 1024
    print(f"\n{len(manifest['clips'])} clips · {total_audio:.0f} s of audio · made in {total_gen:.0f} s · {size_kb:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
