"""Validate Kokoro text-to-speech on this computer before the academy depends on it.

Checks, in order:
  1. The kokoro package imports.
  2. The model loads (first run downloads it once, about 330 MB).
  3. Each sample sentence is generated; time and real-time factor are measured.
  4. With --offline, step 2-3 run with Hugging Face downloads disabled,
     which proves the model is cached and works without internet.

Outputs WAV files and report.json in scripts/audio-validation/out/.
"""

from __future__ import annotations

import argparse
import json
import os
import platform
import sys
import time
from pathlib import Path

SAMPLE_RATE_HZ = 24_000
OUT_DIR = Path(__file__).parent / "out"

# Sentences from the first planned lesson, plus one with an equation said aloud.
SENTENCES = [
    "A picture is a grid of pixels.",
    "For each pixel, we ask one question: where did this light come from?",
    "The impact parameter, b, is how close the ray would pass if nothing bent it.",
    "u equals the sine of phi, divided by b.",
]

# Two American and two British voices, so Stephane can pick one by ear.
VOICES = ["af_heart", "am_michael", "bf_emma", "bm_george"]


def main() -> int:
    """Run the validation and write a report. Returns a process exit code."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--offline", action="store_true", help="forbid any download")
    args = parser.parse_args()

    if args.offline:
        # Must be set before huggingface_hub is imported.
        os.environ["HF_HUB_OFFLINE"] = "1"

    report: dict = {
        "mode": "offline" if args.offline else "online",
        "python": sys.version.split()[0],
        "os": f"{platform.system()} {platform.release()}",
        "voices": {},
    }
    OUT_DIR.mkdir(exist_ok=True)

    try:
        import soundfile as sf
        from kokoro import KPipeline
    except ImportError as exc:
        print(f"FAIL import: {exc}. Run: pip install -r requirements.txt")
        return 1

    t0 = time.perf_counter()
    try:
        pipeline = KPipeline(lang_code="a")  # "a" = American English rules
        british = KPipeline(lang_code="b")
    except Exception as exc:  # noqa: BLE001 - report any load failure plainly
        print(f"FAIL model load ({report['mode']}): {exc}")
        return 1
    report["model_load_s"] = round(time.perf_counter() - t0, 2)
    print(f"Model loaded in {report['model_load_s']} s")

    for voice in VOICES:
        pipe = british if voice.startswith("b") else pipeline
        rows = []
        for i, text in enumerate(SENTENCES):
            start = time.perf_counter()
            chunks = [audio for _, _, audio in pipe(text, voice=voice, speed=1.0)]
            gen_s = time.perf_counter() - start
            audio = chunks[0] if len(chunks) == 1 else __import__("numpy").concatenate(chunks)
            dur_s = len(audio) / SAMPLE_RATE_HZ
            path = OUT_DIR / f"{voice}_{i}.wav"
            sf.write(path, audio, SAMPLE_RATE_HZ)
            # Real-time factor below 1 means it speaks faster than it talks.
            rtf = gen_s / dur_s
            rows.append({"file": path.name, "gen_s": round(gen_s, 2), "audio_s": round(dur_s, 2), "rtf": round(rtf, 3)})
            print(f"{voice:11s} #{i}  {dur_s:5.2f} s audio  in {gen_s:5.2f} s  (RTF {rtf:.2f})")
        report["voices"][voice] = rows

    (OUT_DIR / f"report_{report['mode']}.json").write_text(json.dumps(report, indent=2))
    print(f"\nPASS ({report['mode']}). Listen to the WAV files in {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
