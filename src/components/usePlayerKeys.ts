import { useEffect } from "react";
import { player } from "../audio/player";

/** Space: play/pause. ← →: previous/next sentence. Ignored while typing. */
export function usePlayerKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, button, [contenteditable]")) return;
      if (!player.getState().lesson) return;
      if (e.key === " ") {
        e.preventDefault();
        player.toggle();
      } else if (e.key === "ArrowRight") player.next();
      else if (e.key === "ArrowLeft") player.prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
