import type { ProjectState } from "../data/db";
import { PROJECTS } from "../data/projects";

const COLOR = {
  completed: "var(--done)",
  "in-progress": "var(--progress)",
  planned: "var(--planned)",
} as const;

/**
 * The eight projects as stations on one path, like an orbit transfer diagram.
 * Colour = status. A path segment turns solid only when both ends are completed.
 */
export function JourneyMap({ states }: { states: ProjectState[] }) {
  const byId = new Map(states.map((s) => [s.id, s]));
  const w = 880;
  const pad = 40;
  const step = (w - pad * 2) / (PROJECTS.length - 1);
  const y = 54;

  return (
    <svg
      viewBox={`0 0 ${w} 120`}
      className="journey"
      role="img"
      aria-label={PROJECTS.map((p) => `Project ${p.number} ${byId.get(p.id)?.status}`).join(", ")}
    >
      <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="var(--line-strong)" strokeDasharray="3 5" />
      {PROJECTS.slice(1).map((p, i) =>
        byId.get(p.id)?.status === "completed" &&
        byId.get(PROJECTS[i].id)?.status === "completed" ? (
          <line
            key={p.id}
            x1={pad + step * i}
            y1={y}
            x2={pad + step * (i + 1)}
            y2={y}
            stroke="var(--signal)"
            strokeWidth={1.5}
          />
        ) : null,
      )}
      {PROJECTS.map((p, i) => {
        const s = byId.get(p.id);
        const x = pad + step * i;
        const color = COLOR[s?.status ?? "planned"];
        return (
          <g key={p.id}>
            {s?.status === "in-progress" && (
              <circle
                cx={x}
                cy={y}
                r={15}
                fill="none"
                stroke={color}
                opacity={0.35}
                className="pulse"
              />
            )}
            <circle cx={x} cy={y} r={9} fill="var(--bg-1)" stroke={color} strokeWidth={2} />
            {s?.status === "completed" && <circle cx={x} cy={y} r={4} fill={color} />}
            <text x={x} y={y - 22} textAnchor="middle" className="journey-num">
              P{p.number}
            </text>
            <text x={x} y={y + 32} textAnchor="middle" className="journey-label">
              {p.shortName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
