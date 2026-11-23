import { useEffect, useState } from "react";
import { loadVoiceReport, speakTest, type VoiceReport } from "../audio/voiceCapabilities";
import { useOnline } from "../components/useOnline";

type Check = "yes" | "no" | "checking";

/** Real checks of what this device can do: offline shell, storage, voices. */
export function System() {
  const online = useOnline();
  const [voices, setVoices] = useState<VoiceReport | null>(null);
  const [chosen, setChosen] = useState("");
  const [speakState, setSpeakState] = useState<string>("");
  const [sw, setSw] = useState<Check>("checking");
  const [persisted, setPersisted] = useState<Check>("checking");

  useEffect(() => {
    loadVoiceReport().then((r) => {
      setVoices(r);
      setChosen(
        r.recommended?.name ?? r.english.local[0]?.name ?? r.english.network[0]?.name ?? "",
      );
    });
    const swCheck: Promise<boolean> =
      "serviceWorker" in navigator
        ? navigator.serviceWorker.getRegistration().then((reg) => Boolean(reg?.active))
        : Promise.resolve(false);
    swCheck.then((ok) => setSw(ok ? "yes" : "no"));
    const persistCheck: Promise<boolean> =
      navigator.storage?.persisted?.() ?? Promise.resolve(false);
    persistCheck.then((p) => setPersisted(p ? "yes" : "no"));
  }, []);

  const requestPersist = async () => {
    const ok = await navigator.storage?.persist?.();
    setPersisted(ok ? "yes" : "no");
  };

  const test = async () => {
    setSpeakState("Speaking…");
    const r = await speakTest(
      "Light near a black hole bends. Rays that pass too close never escape.",
      chosen,
    );
    setSpeakState(
      r === "ended" ? `Finished (${online ? "online" : "offline"})` : "The voice failed",
    );
  };

  const all = voices ? [...voices.english.local, ...voices.english.network] : [];

  return (
    <div className="stack">
      <header className="stack-sm">
        <span className="eyebrow">System</span>
        <h1>What this device can do.</h1>
      </header>

      <section className="panel stack-sm">
        <span className="eyebrow">Offline</span>
        <ul className="checks">
          <CheckRow label="Network" value={online ? "Online" : "Offline"} ok={true} />
          <CheckRow
            label="App cached for offline use"
            value={
              sw === "checking" ? "Checking…" : sw === "yes" ? "Yes" : "Not yet (open once online)"
            }
            ok={sw === "yes"}
          />
          <CheckRow
            label="Progress protected from browser cleanup"
            value={persisted === "checking" ? "Checking…" : persisted === "yes" ? "Yes" : "No"}
            ok={persisted === "yes"}
          />
        </ul>
        {persisted === "no" && (
          <div>
            <button onClick={requestPersist}>Protect my progress</button>
          </div>
        )}
      </section>

      <section className="panel stack-sm">
        <span className="eyebrow">Browser voices · the fallback narrator</span>
        {!voices && <p className="muted">Looking for voices…</p>}
        {voices && !voices.supported && <p>This browser has no speech synthesis.</p>}
        {voices?.supported && (
          <>
            <p className="small">
              <strong>{voices.english.local.length}</strong> English voices say they run on this
              device. <strong>{voices.english.network.length}</strong> need the internet.
            </p>
            <p className="muted small">
              "Runs on this device" is the browser's own claim. To prove it, turn Wi-Fi off and
              press Test voice.
            </p>
            {all.length > 0 && (
              <div className="row">
                <select
                  value={chosen}
                  onChange={(e) => setChosen(e.target.value)}
                  aria-label="Voice"
                >
                  {all.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} · {v.lang} · {v.localService ? "on device" : "needs internet"}
                    </option>
                  ))}
                </select>
                <button className="primary" onClick={test}>
                  Test voice
                </button>
                <span className="mono small muted" role="status">
                  {speakState}
                </span>
              </div>
            )}
          </>
        )}
      </section>

      <section className="panel stack-sm">
        <span className="eyebrow">Main narrator · Kokoro</span>
        <p className="small">
          Lesson audio is recorded ahead of time with Kokoro on your own computer, then stored
          inside the app. Status: <strong>not yet validated on your Windows machine.</strong>
        </p>
        <p className="muted small">
          Run scripts/audio-validation/validate_kokoro.py (see its README).
        </p>
      </section>
    </div>
  );
}

function CheckRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <li className="check-row">
      <span className={`check-dot ${ok ? "ok" : "warn"}`} aria-hidden="true" />
      <span>{label}</span>
      <span className="mono small muted">{value}</span>
    </li>
  );
}
