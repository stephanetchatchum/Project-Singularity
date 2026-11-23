# Recording lesson narration with Kokoro

Run this **after** `scripts/audio-validation` passes on your machine.
It records every sentence a lesson can say (beats, hints, feedback, recap)
as small `.ogg` clips plus a `manifest.json`, in `public/narration/<lesson>/`.

```bash
source scripts/audio-validation/.venv/Scripts/activate   # Git Bash
python scripts/narration/generate_narration.py p2-light-flat-space --voice af_heart
npm run build && npm run preview
```

The app then uses the recorded clips automatically, and caches them for offline use.
Commit the generated folder on a branch, like any other change.

Safety: each clip stores the exact sentence it was made from. If a lesson's
wording changes later, old clips are ignored (the browser voice is used for that
line) until you record again. Captions and sound can never disagree.

`--engine espeak` exists only to test the pipeline. Its robotic voice is not for lessons.
