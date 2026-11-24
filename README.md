# Computational Science Academy

A personal, offline-first, audio-visual learning environment for eight computational
science projects. Listen → watch → experiment → try → feedback → repeat.

## Use it

**Link:** https://stephanetchatchum.github.io/Project-Singularity/

Open it once while online. After that it opens with no internet (lessons, audio,
progress). Chrome or Edge can also install it as an app from the address bar.

Every push to `main` re-records the lesson narration with Kokoro (on GitHub's
servers) and republishes the site. See `.github/workflows/deploy.yml`.

## Run locally (developers only)

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest
npm run lint       # oxlint
npm run build && npm run preview   # production build with offline support
```

Open the production build once while online; after that it works with no internet.
Chrome or Edge can install it as an app (address-bar install icon).

## Structure

```
src/
  app/        routing and the persistent shell
  pages/      one file per main section
  components/ shared UI
  design/     tokens and global styles (fonts bundled, no CDNs)
  data/       project catalogue, local database (IndexedDB via Dexie), spec issues
  audio/      narrators (recorded clips, browser voice, captions) and the lesson player
  lessons/    lesson format, registry, answer parsing
  content/    lesson scripts and extracted specs as JSON (also read by the narration recorder)
  specs/      spec loader; test proves every sentence matches the original
  scenes/     scientific visualizations (drawn only from science/ results)
  science/    pure, tested numerical code, separate from the UI
docs/
  specs/          original specifications, never edited
  spec-issues.md  possible spec problems, awaiting Stephane's decision
scripts/
  audio-validation/  Kokoro check for the Windows machine
  narration/         records lesson and spec clips with Kokoro (run by CI)
  specs/             extracts docs/specs/* into src/content/specs/*.json
```

## Milestones

- [x] M0 Shell: navigation, design system, local data, offline install, voice check
- [x] M1 One complete audio-visual lesson
- [x] M2 Project Library with verbatim specs
- [ ] M3 Dashboard, progress with evidence, notes, backups
- [ ] M4 Experiment Lab
- [ ] M5 Exercises and spaced review
- [ ] M6 Knowledge Library
- [ ] M7+ Lesson content per project

## Progress history

- 2026-11-24: at Stephane's request, all progress was reset to zero (P1 and P5 included).
  The System page has a **Reset everything** button for future resets.

## Rules this codebase follows

- Original specs are never modified. Possible corrections go to `docs/spec-issues.md` and need approval.
- A stage is never marked complete without the evidence that stage requires. A PR link alone is not enough.
- Statuses show where they came from: "you reported" or "verified".
