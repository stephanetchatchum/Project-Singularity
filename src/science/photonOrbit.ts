/**
 * Photon paths around a non-spinning black hole, in its orbital plane.
 *
 * Units: G = c = M = 1, so distances are in multiples of the black hole mass.
 * u = 1 / r. phi is the angle the ray has swept around the centre (radians).
 *
 * Orbit equation (Project 2 spec):   d²u/dφ² = −u + 3u²
 * Flat space (no bending) drops the 3u² term:   d²u/dφ² = −u
 *
 * Pure functions only. No drawing code lives here.
 */

/** State of one ray: u = 1/r and w = du/dφ. */
export interface RayState {
  u: number;
  w: number;
}

/** Which physics to use. "flat" switches the 3u² bending term off. */
export type Spacetime = "flat" | "schwarzschild";

/** Right-hand side of the orbit equation: (du/dφ, dw/dφ). */
export function derivative(s: RayState, spacetime: Spacetime): RayState {
  // d²u/dφ² = −u + 3u²  (the 3u² term bends the light)
  const bend = spacetime === "schwarzschild" ? 3 * s.u * s.u : 0;
  return { u: s.w, w: -s.u + bend };
}

/** One fourth-order Runge–Kutta step of size h (radians). */
export function stepRK4(s: RayState, h: number, spacetime: Spacetime): RayState {
  const k1 = derivative(s, spacetime);
  const k2 = derivative({ u: s.u + (h / 2) * k1.u, w: s.w + (h / 2) * k1.w }, spacetime);
  const k3 = derivative({ u: s.u + (h / 2) * k2.u, w: s.w + (h / 2) * k2.w }, spacetime);
  const k4 = derivative({ u: s.u + h * k3.u, w: s.w + h * k3.w }, spacetime);
  return {
    u: s.u + (h / 6) * (k1.u + 2 * k2.u + 2 * k3.u + k4.u),
    w: s.w + (h / 6) * (k1.w + 2 * k2.w + 2 * k3.w + k4.w),
  };
}

export interface TraceResult {
  outcome: "escaped" | "captured" | "unfinished";
  /** Angle where the ray ended (radians): u back to 0, or u reached 0.5. */
  phiEnd: number;
  /** Sampled path: phi and u at every step. */
  samples: { phi: number; u: number }[];
}

/**
 * Trace a ray that starts far away (u = 0) with impact parameter b.
 * Start: u = 0, du/dφ = 1 / b. Stops when u returns to 0 (escaped),
 * u reaches 0.5 (event horizon, r = 2), or after maxSteps (unfinished).
 */
export function traceRay(
  b: number,
  spacetime: Spacetime,
  h = 0.001,
  maxSteps = 100_000,
): TraceResult {
  if (!(b > 0)) throw new RangeError("Impact parameter b must be positive.");
  let s: RayState = { u: 0, w: 1 / b };
  let phi = 0;
  const samples = [{ phi, u: s.u }];
  for (let i = 0; i < maxSteps; i++) {
    const next = stepRK4(s, h, spacetime);
    const nextPhi = phi + h;
    if (next.u >= 0.5) {
      samples.push({ phi: nextPhi, u: 0.5 });
      return { outcome: "captured", phiEnd: nextPhi, samples };
    }
    if (next.u <= 0 && i > 0) {
      // Linear interpolation for where u crossed zero inside this step.
      const phiZero = phi + h * (s.u / (s.u - next.u));
      samples.push({ phi: phiZero, u: 0 });
      return { outcome: "escaped", phiEnd: phiZero, samples };
    }
    s = next;
    phi = nextPhi;
    samples.push({ phi, u: s.u });
  }
  return { outcome: "unfinished", phiEnd: phi, samples };
}

/** Exact flat-space solution: u = sin(φ) / b. */
export function flatU(phi: number, b: number): number {
  return Math.sin(phi) / b;
}

/** Position in the ray's plane from (u, φ): x = cos φ / u, y = sin φ / u. */
export function toXY(u: number, phi: number): { x: number; y: number } {
  return { x: Math.cos(phi) / u, y: Math.sin(phi) / u };
}
