"use client";
import { useMemo, useState } from "react";
import type { Article } from "@/lib/types";
import { usePrefs } from "./providers";

function rng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }

/** "Who reported it?" — quiz built only from today's real headlines. */
export function HeadlineQuiz({ pool }: { pool: Article[] }) {
  const { lang, ready } = usePrefs();
  const questions = useMemo(() => {
    const day = new Date().toISOString().slice(0, 10);
    const r = rng([...day].reduce((s, c) => s + c.charCodeAt(0), 0) * 7919);
    const sources = [...new Set(pool.map((a) => a.source))];
    if (sources.length < 4) return [];
    const bySource = new Map<string, Article>();
    for (const a of pool) if (!bySource.has(a.source) && a.title.length > 25) bySource.set(a.source, a);
    const picks = [...bySource.values()].sort(() => r() - 0.5).slice(0, 5);
    return picks.map((a) => {
      const wrong = sources.filter((s) => s !== a.source).sort(() => r() - 0.5).slice(0, 3);
      return { a, options: [...wrong, a.source].sort(() => r() - 0.5) };
    });
  }, [pool]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  if (!ready || !questions.length) return null;
  const done = qi >= questions.length;
  const q = questions[Math.min(qi, questions.length - 1)];

  return (
    <div className="rounded-2xl border border-manjal-400/40 bg-gradient-to-br from-manjal-300/30 to-white p-4 dark:from-manjal-500/10 dark:to-ink-900 dark:border-manjal-400/20">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold">🧠 {lang === "ta" ? "இன்றைய செய்தி வினாடி-வினா" : "Today's headline quiz"}</h3>
        <span className="text-xs font-bold tabular-nums opacity-70">{done ? questions.length : qi + 1}/{questions.length} · ⭐ {score}</span>
      </div>
      {done ? (
        <div className="py-4 text-center">
          <div className="text-4xl">{score >= 4 ? "🏆" : score >= 2 ? "👏" : "📰"}</div>
          <p className="mt-2 font-bold">{lang === "ta" ? `உங்கள் மதிப்பெண்: ${score}/${questions.length}` : `You scored ${score}/${questions.length}`}</p>
          <button onClick={() => { setQi(0); setScore(0); setPicked(null); }} className="mt-3 rounded-full bg-ink-900 px-4 py-1.5 text-sm font-bold text-white dark:bg-white dark:text-ink-900">{lang === "ta" ? "மீண்டும்" : "Play again"}</button>
        </div>
      ) : (
        <>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide opacity-60">{lang === "ta" ? "இந்தத் தலைப்புச் செய்தியை வெளியிட்டது யார்?" : "Which outlet published this headline?"}</p>
          <p className="mt-1 line-clamp-3 font-bold leading-snug">“{q.a.title}”</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {q.options.map((o) => {
              const state = picked ? (o === q.a.source ? "bg-emerald-500 text-white border-emerald-500" : o === picked ? "bg-kumkum-500 text-white border-kumkum-500" : "opacity-50") : "hover:border-kumkum-400";
              return <button key={o} disabled={!!picked} onClick={() => { setPicked(o); if (o === q.a.source) setScore((s) => s + 1); }} className={`rounded-xl border border-ink-100 bg-white px-2 py-2 text-sm font-semibold transition dark:border-white/10 dark:bg-ink-800 ${state}`}>{o}</button>;
            })}
          </div>
          {picked && (
            <div className="fade-up mt-3 flex items-center justify-between gap-2 text-sm">
              <a href={q.a.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-kumkum-600 hover:underline dark:text-manjal-400">{lang === "ta" ? "செய்தியைப் படிக்க ↗" : "Read the story ↗"}</a>
              <button onClick={() => { setQi(qi + 1); setPicked(null); }} className="rounded-full bg-kumkum-600 px-4 py-1.5 font-bold text-white">{lang === "ta" ? "அடுத்தது →" : "Next →"}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
