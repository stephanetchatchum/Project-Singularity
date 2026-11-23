/**
 * Reads a typed answer like "3.14", "pi", "π", "π/2" or "180°" into radians.
 * Returns null when it cannot be read, so the UI can ask again instead of
 * marking it wrong.
 */
export function parseAngle(raw: string): number | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "").replace(",", ".");
  if (!s) return null;
  const deg = s.endsWith("°") || s.endsWith("deg");
  const body = s.replace(/°|deg|rad$/g, "").replace(/π/g, "pi");
  const m = body.match(/^(\d*\.?\d*)?\*?(pi)?(?:\/(\d+\.?\d*))?$/);
  if (!m || (!m[1] && !m[2])) return null;
  const k = m[1] ? Number(m[1]) : 1;
  if (!Number.isFinite(k)) return null;
  let v = m[2] ? k * Math.PI : k;
  if (m[3]) v /= Number(m[3]);
  return deg ? (v * Math.PI) / 180 : v;
}
