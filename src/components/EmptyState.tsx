import type { ReactNode } from "react";

/** Honest placeholder for a section built in a later milestone. No fake controls. */
export function EmptyState({
  eyebrow,
  title,
  milestone,
  children,
}: {
  eyebrow: string;
  title: string;
  milestone: string;
  children: ReactNode;
}) {
  return (
    <section className="empty panel">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="muted">{children}</p>
      <span className="milestone-tag mono">Built in {milestone}</span>
    </section>
  );
}
