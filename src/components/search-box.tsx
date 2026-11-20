"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePrefs } from "./providers";

const SUGGEST = ["மழை", "சென்னை", "கிரிக்கெட்", "TNPSC", "தங்கம் விலை", "Chennai Metro", "ISRO", "Kollywood"];

export function SearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const { lang } = usePrefs();
  const [q, setQ] = useState(initial);
  const [recent, setRecent] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem("ns-recent") || "[]")); } catch {} }, []); // eslint-disable-line react-hooks/set-state-in-effect
  const go = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const r = [t, ...recent.filter((x) => x !== t)].slice(0, 6);
    setRecent(r); localStorage.setItem("ns-recent", JSON.stringify(r));
    router.push(`/search?q=${encodeURIComponent(t)}`);
  };
  const voice = () => {
    const W = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) { alert(lang === "ta" ? "இந்த உலாவியில் குரல் தேடல் இல்லை" : "Voice search isn't supported in this browser"); return; }
    const r = new SR();
    r.lang = lang === "ta" ? "ta-IN" : "en-IN";
    r.onresult = (e) => { const t = e.results[0][0].transcript; setQ(t); go(t); };
    r.onend = () => setListening(false);
    setListening(true); r.start();
  };
  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); go(q); }} className="flex gap-2">
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={lang === "ta" ? "எதைத் தேட வேண்டும்?" : "What are you looking for?"} className="min-w-0 flex-1 rounded-2xl border border-ink-100 bg-white px-4 py-3 text-lg outline-none ring-kumkum-500/30 focus:border-kumkum-400 focus:ring-4 dark:border-white/10 dark:bg-ink-900" />
        <button type="button" onClick={voice} className={`grid w-12 place-items-center rounded-2xl border border-ink-100 bg-white text-xl dark:border-white/10 dark:bg-ink-900 ${listening ? "live-dot" : ""}`} aria-label="Voice search">🎤</button>
        <button className="rounded-2xl bg-kumkum-600 px-5 font-bold text-white">{lang === "ta" ? "தேடு" : "Search"}</button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {(recent.length ? recent : SUGGEST).map((s) => (
          <button key={s} onClick={() => { setQ(s); go(s); }} className="rounded-full border border-ink-100 bg-white px-3 py-1 hover:border-kumkum-400 dark:border-white/10 dark:bg-ink-900">{recent.length ? "🕘" : "🔥"} {s}</button>
        ))}
      </div>
    </div>
  );
}
type SpeechRec = { lang: string; start: () => void; onresult: (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void; onend: () => void };
