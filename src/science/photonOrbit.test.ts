import { describe, expect, it } from "vitest";
import { flatU, toXY, traceRay } from "./photonOrbit";

describe("flat space (P2 hand-check 1, Stage 1)", () => {
  it("returns to u = 0 at phi = pi within 0.001 for b = 10", () => {
    const r = traceRay(10, "flat");
    expect(r.outcome).toBe("escaped");
    expect(Math.abs(r.phiEnd - Math.PI)).toBeLessThan(0.001);
  });

  it("matches the exact answer u = sin(phi) / b along the path", () => {
    const r = traceRay(10, "flat");
    const worst = Math.max(...r.samples.map((s) => Math.abs(s.u - flatU(s.phi, 10))));
    expect(worst).toBeLessThan(1e-9);
  });

  it("draws a straight line 10 from the centre", () => {
    const r = traceRay(10, "flat");
    const inside = r.samples.filter((s) => s.u > 0.01);
    for (const s of inside) expect(toXY(s.u, s.phi).y).toBeCloseTo(10, 6);
  });
});

describe("bending switched on (P2 Stage 2 targets)", () => {
  it("bends b = 100 by about 0.041 rad", () => {
    const r = traceRay(100, "schwarzschild");
    expect(r.phiEnd - Math.PI).toBeCloseTo(0.041, 3);
  });

  it("captures b = 5.0 and lets b = 5.3 escape after bending more than 3 rad", () => {
    expect(traceRay(5.0, "schwarzschild").outcome).toBe("captured");
    const r = traceRay(5.3, "schwarzschild");
    expect(r.outcome).toBe("escaped");
    expect(r.phiEnd - Math.PI).toBeGreaterThan(3);
  });
});

it("rejects a non-positive impact parameter", () => {
  expect(() => traceRay(0, "flat")).toThrow(RangeError);
});
