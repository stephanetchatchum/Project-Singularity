import { useEffect, useMemo, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders a KaTeX equation. Terms wrapped as \htmlClass{term-x}{...} light up
 * when their class is listed in `highlight`, in sync with the narration.
 */
export function Equation({ tex, highlight = [] }: { tex: string; highlight?: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: true,
        throwOnError: false,
        // Only \htmlClass is allowed; it is what makes term highlighting possible.
        trust: (ctx) => ctx.command === "\\htmlClass",
        strict: false,
        output: "htmlAndMathml",
      }),
    [tex],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll("[class*='term-']").forEach((node) => {
      const on = highlight.some((h) => node.classList.contains(h));
      node.classList.toggle("term-on", on);
    });
  }, [html, highlight]);

  return <div ref={ref} className="equation" dangerouslySetInnerHTML={{ __html: html }} />;
}
