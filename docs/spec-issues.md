# Specification issues log

The original specifications in `docs/specs/` are never edited.
This file records possible problems found while reading them.
**Nothing here changes a spec until Stephane approves it.** An approved change
is recorded below with its date, and the academy shows it as a labelled
correction next to the original text.

Status values: `open` (awaiting decision), `approved`, `rejected`.

---

## ISSUE-P3-01 · Hand-check 5 mixes two orbit speeds

- **Spec:** P3, Hand-checks, item 5
- **Original text:** "Circular orbit speed gives escape speed. sqrt(2) × 7,788 at the surface radius is 11,186. I check the numbers agree."
- **Observation:**
  - 7,788 m/s is the circular speed at 200 km (r = R + 200,000 m).
  - √2 × 7,788 = 11,014 m/s, not 11,186.
  - The circular speed at the surface radius is √(mu / R) = 7,910 m/s, and √2 × 7,910 = 11,186 m/s. That matches the spec's escape speed.
- **Possible wording (not applied):** "√2 × the circular speed at the surface radius (7,910 m/s) is 11,186 m/s."
- **Affects:** hand-check 5 only. The key numbers (7,788 and 11,186) are each correct on their own.
- **Status:** open

## ISSUE-P4-01 · Suicide-burn height for a drop from 1,000 m

- **Spec:** P4, Key numbers ("So the suicide burn starts at 500 m"), Hand-check 2, Stage 4, Finish checklist ("the 500 m burn height")
- **Observation:**
  - d = v² / (2 × a_net) = 140² / (2 × 19.62) ≈ 500 m is correct **for a rocket already moving at 140 m/s**.
  - But 140 m/s is the speed at the ground after a full 1,000 m fall. At 500 m height the rocket is only moving at √(2 × 9.81 × 500) ≈ 99 m/s.
  - Burning at full thrust from 500 m at 99 m/s stops the rocket at about 250 m. It hovers or climbs instead of landing.
  - For a drop from 1,000 m (constant mass, thrust-to-weight 3), the burn must start where the fall speed equals the stopping speed:
    g × (1000 − h) = 2g × h → **h ≈ 333 m**, at a speed of ≈ 114 m/s, with a burn time of ≈ 5.8 s.
- **Affects:** Stage 4 "Done when" (a soft landing from 1,000 m) cannot be met using the 500 m height from hand-check 2.
- **Options (not applied):**
  1. Keep hand-check 2 as written (it is a valid formula exercise) and add a hand-check for the burn height of a 1,000 m drop (≈ 333 m).
  2. Change the scenario so the rocket starts at 140 m/s downward (for example, a rocket entering the scene already falling).
- **Status:** open
