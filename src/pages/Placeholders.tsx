import { EmptyState } from "../components/EmptyState";

export function Studio() {
  return (
    <EmptyState eyebrow="Learning studio" title="Listen, watch, try." milestone="M1">
      Press play and a tutor explains one idea while the demonstration moves in sync. Then you do a
      small task yourself.
    </EmptyState>
  );
}

export function Lab() {
  return (
    <EmptyState eyebrow="Experiment lab" title="Change a number. See what happens." milestone="M4">
      Validated simulations with sliders: Euler against RK4, orbits, and a fan of light rays around
      a black hole.
    </EmptyState>
  );
}

export function Knowledge() {
  return (
    <EmptyState
      eyebrow="Knowledge library"
      title="Every idea, linked to where you need it."
      milestone="M6"
    >
      Maths and physics concepts as a map. Each one points to the project stage that uses it.
    </EmptyState>
  );
}

export function Progress() {
  return (
    <EmptyState eyebrow="Progress" title="Evidence, not clicks." milestone="M3">
      Stages are ticked only with the evidence each stage needs: a test result, a measured value, a
      screenshot or an explanation. Notes and backups also live here.
    </EmptyState>
  );
}
