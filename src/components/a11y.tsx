"use client";
import { useEffect, useState } from "react";

/** Device-only accessibility + listening prefs: reading ruler, TTS voice and speed. */
const EVT = "ns:a11y";
const getB = (k: string) => { try { return JSON.parse(localStorage.getItem(k) || "false") === true; } catch { return false; } };
type Voice = { ta?: string; en?: string; rate?: number };
const getV = (): Voice => { try { return JSON.parse(localStorage.getItem("ns-voice") || "{}"); } catch { return {}; } };

/** Translucent band that follows the pointer/finger to keep your place while reading. */
export function ReadingRuler() {
  const [on, setOn] = useState(false);
  const [y, setY] = useState(-200);
  useEffect(() => {
    const sync = () => setOn(getB("ns-ruler"));
    sync();
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
  }, []);
  useEffect(() => {
    if (!on) return;
    const m = (e: PointerEvent) => setY(e.clientY);
    window.addEventListener("pointermove", m, { passive: true });
    window.addEventListener("pointerdown", m, { passive: true });
    return () => { window.removeEventListener("pointermove", m); window.removeEventListener("pointerdown", m); };
  }, [on]);
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <div className="absolute inset-x-0 top-0 bg-black/35" style={{ height: Math.max(0, y - 30) }} />
      <div className="absolute inset-x-0 border-y-2 border-manjal-500/70" style={{ top: y - 30, height: 60 }} />
      <div className="absolute inset-x-0 bottom-0 bg-black/35" style={{ top: y + 30 }} />
    </div>
  );
}

export function A11ySettings({ ta, row, sw }: { ta: boolean; row: string; sw: (on: boolean, f: () => void, label: string) => React.ReactNode }) {
  const [ruler, setRuler] = useState(false);
  const [voice, setVoice] = useState<Voice>({});
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read device prefs after mount
    setRuler(getB("ns-ruler")); setVoice(getV());
    const s = window.speechSynthesis; if (!s) return;
    const load = () => setVoices(s.getVoices());
    load(); s.addEventListener?.("voiceschanged", load);
    return () => s.removeEventListener?.("voiceschanged", load);
  }, []);
  const flip = (k: string, v: boolean, set: (b: boolean) => void) => {
    set(v); localStorage.setItem(k, JSON.stringify(v));
    window.dispatchEvent(new Event(EVT));
  };
  const saveV = (n: Voice) => { setVoice(n); localStorage.setItem("ns-voice", JSON.stringify(n)); };
  const test = (lang: "ta" | "en") => {
    const s = window.speechSynthesis; if (!s) return; s.cancel();
    const u = new SpeechSynthesisUtterance(lang === "ta" ? "வணக்கம். இது நாற்றிசை செய்தி வாசிப்பு." : "Hello. This is the Naatrisai news reader.");
    u.lang = lang === "ta" ? "ta-IN" : "en-IN";
    const v = voices.find((x) => x.name === voice[lang]); if (v) u.voice = v;
    u.rate = voice.rate ?? 0.95; s.speak(u);
  };
  const of = (l: string) => voices.filter((v) => v.lang.toLowerCase().startsWith(l));
  const sel = "min-w-0 max-w-[11rem] rounded-lg border border-ink-100 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-ink-950";
  return (
    <>
      <div className={row}><div><b>{ta ? "வாசிப்பு அளவுகோல்" : "Reading ruler"}</b><p className="text-xs opacity-60">{ta ? "சுட்டி/விரலைப் பின்தொடரும் வரி — இடம் தவறாமல் படிக்க" : "A band that follows your pointer/finger to keep your place"}</p></div>{sw(ruler, () => flip("ns-ruler", !ruler, setRuler), "Reading ruler")}</div>
      <div className={`${row} flex-wrap`}>
        <div className="w-full"><b>🔊 {ta ? "குரல் வாசிப்பு" : "Read-aloud voice"}</b><p className="text-xs opacity-60">{voices.length ? (ta ? `உங்கள் சாதனத்தில் ${voices.length} குரல்கள் · தமிழ் ${of("ta").length}` : `${voices.length} voices on this device · Tamil ${of("ta").length}`) : (ta ? "இந்த உலாவி குரல்களைக் காட்டவில்லை" : "This browser exposes no voices")}</p></div>
        {(["ta", "en"] as const).map((l) => (
          <label key={l} className="flex items-center gap-2 text-xs font-bold">{l === "ta" ? "தமிழ்" : "English"}
            <select className={sel} value={voice[l] ?? ""} onChange={(e) => saveV({ ...voice, [l]: e.target.value || undefined })}>
              <option value="">{ta ? "தானியங்கி" : "Automatic"}</option>
              {of(l).map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
            </select>
            <button type="button" onClick={() => test(l)} className="rounded-full border border-ink-100 px-2 py-0.5 dark:border-white/10" aria-label={`Test ${l} voice`}>▶</button>
          </label>
        ))}
        <label className="flex w-full items-center gap-2 text-xs font-bold">{ta ? "வேகம்" : "Speed"}
          <input type="range" min={0.6} max={1.6} step={0.05} value={voice.rate ?? 0.95} onChange={(e) => saveV({ ...voice, rate: Number(e.target.value) })} className="flex-1 accent-kumkum-600" aria-label="Speech rate" />
          <span className="w-10 text-right tabular-nums">{(voice.rate ?? 0.95).toFixed(2)}×</span>
        </label>
      </div>
    </>
  );
}
