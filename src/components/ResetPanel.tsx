import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { RotateCcw } from "lucide-react";
import { db, resetAll } from "../data/db";
import { player } from "../audio/player";

/** Erase all progress on this device, after an explicit confirmation. */
export function ResetPanel() {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const counts = useLiveQuery(async () => ({
    stages: await db.stageState.count(),
    sessions: await db.lessonRuns.count(),
    started: await db.projectState.where("status").notEqual("planned").count(),
  }));
  const resetAt = useLiveQuery(() => db.meta.get("resetAt"));

  const doReset = async () => {
    player.reset();
    await resetAll(db);
    setConfirming(false);
    setMessage("Done. Every project is back at the beginning.");
  };

  return (
    <section className="panel stack-sm">
      <span className="eyebrow">Your data · on this device only</span>
      {counts && (
        <p className="small">
          {plural(counts.started, "project")} started · {plural(counts.stages, "stage")} ticked ·{" "}
          {plural(counts.sessions, "lesson session")}
        </p>
      )}
      {typeof resetAt?.value === "number" && (
        <p className="small muted">Last reset: {new Date(resetAt.value).toLocaleString()}</p>
      )}
      {!confirming ? (
        <div>
          <button className="icon-text" onClick={() => setConfirming(true)}>
            <RotateCcw size={15} aria-hidden="true" /> Reset everything
          </button>
        </div>
      ) : (
        <div className="reset-confirm stack-sm" role="alertdialog" aria-label="Confirm reset">
          <p className="small">
            This deletes all project progress, ticked stages and lesson history on this device. It
            cannot be undone. Lessons and specs stay.
          </p>
          <div className="row">
            <button className="danger" onClick={doReset}>
              Yes, reset everything
            </button>
            <button onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </div>
      )}
      {message && (
        <p className="ok-text small" role="status">
          {message}
        </p>
      )}
    </section>
  );
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
