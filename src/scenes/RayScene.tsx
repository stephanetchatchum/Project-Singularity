import { useMemo } from "react";
import type { SceneLayer } from "../lessons/types";
import { flatU, toXY, traceRay } from "../science/photonOrbit";

/**
 * A light ray passing a centre point, in flat space, plus the u(φ) graph.
 * Everything drawn here comes from photonOrbit.ts (RK4), never from hand-placed
 * shapes, so the picture is the physics.
 */

export interface RaySceneProps {
  b: number;
  show: SceneLayer[];
  /** Photon angle φ in radians, or null to hide it. */
  phi: number | null;
  focus?: SceneLayer;
}

const W = 640;
const H = 300;
const SCALE = 8; // pixels per unit of mass (G = c = M = 1)
const OX = W / 2;
const OY = H - 70;

/** World (units of M) to screen pixels. y points up in the world. */
const sx = (x: number) => OX + x * SCALE;
const sy = (y: number) => OY - y * SCALE;

export function RayScene({ b, show, phi, focus }: RaySceneProps) {
  const has = (l: SceneLayer) => show.includes(l);
  const tone = (l: SceneLayer) => (focus === l ? "var(--explain)" : undefined);

  const trace = useMemo(() => traceRay(b, "flat"), [b]);
  const photon =
    phi !== null && phi > 0.01 && phi < Math.PI - 0.01 ? toXY(flatU(phi, b), phi) : null;
  const r = photon ? Math.hypot(photon.x, photon.y) : null;

  // Ray path from RK4 samples, thinned for drawing.
  const rayPath = useMemo(() => {
    const pts = trace.samples
      .filter((s, i) => i % 20 === 0 && s.u > 1 / 120)
      .map((s) => toXY(s.u, s.phi));
    return pts
      .map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
      .join("");
  }, [trace]);

  const arcR = 26;
  const arcPhi = phi ?? 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="scene" role="img" aria-label={sceneLabel(b, phi)}>
      <defs>
        <radialGradient id="glow">
          <stop offset="0%" stopColor="#fff6dc" />
          <stop offset="45%" stopColor="#ffd27a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffb547" stopOpacity="0" />
        </radialGradient>
        <clipPath id="scene-clip">
          <rect width={W} height={H} />
        </clipPath>
      </defs>
      <g clipPath="url(#scene-clip)">
        {/* Reference axis: φ is measured from here. */}
        {has("phi") && (
          <line x1={OX} y1={OY} x2={W} y2={OY} stroke="var(--line-strong)" strokeDasharray="2 6" />
        )}

        {has("ray") && (
          <path
            d={rayPath}
            fill="none"
            stroke="var(--signal)"
            strokeWidth={1.6}
            opacity={0.85}
            className="ray-path"
          />
        )}

        {has("b") && (
          <g color={tone("b") ?? "var(--ink-2)"}>
            <line x1={OX} y1={OY} x2={OX} y2={sy(b)} stroke="currentColor" strokeDasharray="4 4" />
            <text
              x={OX - 10}
              y={(OY + sy(b)) / 2}
              textAnchor="end"
              className="scene-label"
              fill="currentColor"
            >
              b = {fmt(b, 1)}
            </text>
          </g>
        )}

        {has("r") && photon && (
          <g color={tone("r") ?? "var(--ink-2)"}>
            <line
              x1={OX}
              y1={OY}
              x2={sx(photon.x)}
              y2={sy(photon.y)}
              stroke="currentColor"
              strokeWidth={1.2}
            />
            <text
              x={OX + (sx(photon.x) - OX) * 0.6 - 14 * Math.sin(phi!)}
              y={OY + (sy(photon.y) - OY) * 0.6 - 14 * Math.cos(phi!)}
              textAnchor="middle"
              className="scene-label"
              fill="currentColor"
            >
              r
            </text>
          </g>
        )}

        {has("phi") && phi !== null && (
          <g color={tone("phi") ?? "var(--ink-2)"}>
            <path
              d={`M${OX + arcR},${OY} A${arcR},${arcR} 0 ${arcPhi > Math.PI ? 1 : 0} 0 ${
                OX + arcR * Math.cos(arcPhi)
              },${OY - arcR * Math.sin(arcPhi)}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
            />
            <text
              x={OX + (arcR + 14) * Math.cos(arcPhi / 2)}
              y={OY - (arcR + 14) * Math.sin(arcPhi / 2) + 5}
              textAnchor="middle"
              className="scene-label"
              fill="currentColor"
            >
              φ
            </text>
          </g>
        )}

        {has("centre") && (
          <g>
            <circle cx={OX} cy={OY} r={4} fill="var(--ink-1)" />
            <text
              x={OX}
              y={OY + 22}
              textAnchor="middle"
              className="scene-label"
              fill="var(--ink-3)"
            >
              centre · no mass yet
            </text>
          </g>
        )}

        {has("photon") && photon && (
          <g>
            <circle cx={sx(photon.x)} cy={sy(photon.y)} r={14} fill="url(#glow)" />
            <circle cx={sx(photon.x)} cy={sy(photon.y)} r={3.2} fill="#fffaf0" />
          </g>
        )}
      </g>

      {has("readouts") && (
        <g className="readouts" transform="translate(16 22)">
          <Readout
            y={0}
            label="φ"
            value={phi === null ? "—" : `${fmt(phi, 3)} rad  (${fmt((phi * 180) / Math.PI, 1)}°)`}
            hot={focus === "phi"}
          />
          <Readout y={20} label="r" value={r === null ? "∞" : fmt(r, 2)} hot={focus === "r"} />
          <Readout
            y={40}
            label="u = 1/r"
            value={r === null ? "0" : fmt(1 / r, 4)}
            hot={focus === "r"}
          />
        </g>
      )}
    </svg>
  );
}

function Readout({
  y,
  label,
  value,
  hot,
}: {
  y: number;
  label: string;
  value: string;
  hot?: boolean;
}) {
  return (
    <text y={y} className="readout" fill={hot ? "var(--explain)" : "var(--ink-2)"}>
      <tspan className="readout-k">{label}</tspan>
      <tspan x={74}>{value}</tspan>
    </text>
  );
}

/** u against φ, from the RK4 trace, drawn up to the current φ. */
export function UGraph({
  b,
  phi,
  focus,
  uMax = 1 / 3,
}: {
  b: number;
  phi: number | null;
  focus?: boolean;
  /** Top of the u axis. Fixed while exploring so changing b visibly moves the peak. */
  uMax?: number;
}) {
  const trace = useMemo(() => traceRay(b, "flat"), [b]);
  const w = 640;
  const h = 150;
  const pad = { l: 46, r: 16, t: 16, b: 30 };
  const gx = (p: number) => pad.l + (p / Math.PI) * (w - pad.l - pad.r);
  const gy = (u: number) => h - pad.b - (u / uMax) * (h - pad.t - pad.b);
  const upTo = phi ?? Math.PI;
  const pts = trace.samples.filter((s, i) => i % 10 === 0 && s.phi <= upTo + 1e-9);
  const d = pts
    .map((s, i) => `${i ? "L" : "M"}${gx(s.phi).toFixed(1)},${gy(s.u).toFixed(1)}`)
    .join("");
  const last = pts[pts.length - 1];
  const peak = 1 / b;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="graph"
      role="img"
      aria-label={`Graph of u against phi, peak ${fmt(peak, 3)}`}
    >
      <line x1={pad.l} y1={gy(0)} x2={w - pad.r} y2={gy(0)} stroke="var(--line-strong)" />
      <line x1={pad.l} y1={gy(0)} x2={pad.l} y2={pad.t} stroke="var(--line-strong)" />
      {[0, 0.5, 1].map((f) => (
        <text key={f} x={gx(f * Math.PI)} y={h - 10} textAnchor="middle" className="axis-label">
          {f === 0 ? "0" : f === 0.5 ? "π/2" : "π"}
        </text>
      ))}
      <text x={w - pad.r} y={gy(0) - 6} textAnchor="end" className="axis-label">
        φ
      </text>
      <text x={pad.l - 8} y={pad.t + 8} textAnchor="end" className="axis-label">
        u
      </text>
      <line
        x1={pad.l}
        y1={gy(peak)}
        x2={w - pad.r}
        y2={gy(peak)}
        stroke="var(--ink-3)"
        strokeDasharray="3 5"
      />
      <text x={pad.l - 8} y={gy(peak) + 4} textAnchor="end" className="axis-label">
        1/b
      </text>
      <path d={d} fill="none" stroke={focus ? "var(--explain)" : "var(--signal)"} strokeWidth={2} />
      {last && phi !== null && <circle cx={gx(last.phi)} cy={gy(last.u)} r={4} fill="#fffaf0" />}
    </svg>
  );
}

function fmt(n: number, d: number) {
  return Number.isFinite(n) ? n.toFixed(d) : "∞";
}

function sceneLabel(b: number, phi: number | null) {
  return `Straight light ray passing ${fmt(b, 1)} units from the centre${
    phi === null ? "" : `, photon at phi ${fmt(phi, 2)} radians`
  }.`;
}
