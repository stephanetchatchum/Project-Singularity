# Kokoro validation (run on your Windows machine)

Goal: prove Kokoro gives good, fast narration **on your computer, without internet**,
before the academy depends on it.

Use Python 3.10, 3.11 or 3.12. Kokoro needs PyTorch, which is about 1 GB to install.

```bash
cd scripts/audio-validation
python -m venv .venv
source .venv/Scripts/activate      # Git Bash on Windows
pip install -r requirements.txt
```

If a word is said strangely or you see an espeak error, install espeak-ng
(the `.msi` from its GitHub releases page). Kokoro uses it for unusual words.

## Run 1: online (downloads the model once)

```bash
python validate_kokoro.py
```

## Run 2: offline (the real test)

Turn Wi-Fi off, then:

```bash
python validate_kokoro.py --offline
```

## What to send back

1. Did both runs print `PASS`?
2. The two `out/report_*.json` files (speed numbers).
3. Your favourite voice after listening to `out/*.wav`: `af_heart`, `am_michael`, `bf_emma` or `bm_george`.

RTF (real-time factor) below 1.0 means a sentence is generated faster than it takes to play.
