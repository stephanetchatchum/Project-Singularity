import type { SpecItem } from "../specs/specs";
import { Equation } from "./Equation";

/** Renders spec content exactly as extracted: paragraphs, lists, tables, equations. */
export function SpecItems({ items }: { items: SpecItem[] }) {
  const out: React.ReactNode[] = [];
  let list: { ordered: boolean; items: React.ReactNode[] } | null = null;
  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    out.push(
      <Tag key={`l${out.length}`} className="spec-list">
        {list.items}
      </Tag>,
    );
    list = null;
  };

  items.forEach((it, i) => {
    if (it.kind === "li") {
      const ordered = it.n !== undefined;
      if (!list || list.ordered !== ordered) {
        flush();
        list = { ordered, items: [] };
      }
      list.items.push(<li key={i}>{it.text}</li>);
      return;
    }
    flush();
    if (it.kind === "p") out.push(<p key={i}>{it.text}</p>);
    else if (it.kind === "math")
      out.push(
        <div key={i} className="spec-math">
          <Equation tex={it.tex} />
        </div>,
      );
    else
      out.push(
        <div key={i} className="spec-table-wrap">
          <table className="spec-table">
            <thead>
              <tr>
                {it.rows[0].map((c, j) => (
                  <th key={j}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {it.rows.slice(1).map((r, k) => (
                <tr key={k}>
                  {r.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
  });
  flush();
  return <div className="spec-items">{out}</div>;
}
