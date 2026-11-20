"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Article } from "@/lib/types";
import { usePrefs } from "./providers";
import { useLists } from "./lists";
import { storyUrl } from "@/lib/story-url";

type Item = { a: Article; bucket: string; point: string };
type B = { key: string; ta: string; en: string; emoji: string };
type Q = { id: string; text: string; answer: string; options: string[]; source: string; link: string; kind: string };
export const STUDY_LIST = "📘 படிப்புப் பட்டியல் · Study list";
const time = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) + " IST" : "");

export function ExamDigest({ buckets, items, quiz, date }: { buckets: B[]; items: Record<string, Item[]>; quiz: Q[]; date: string }) {
  const { lang, saved, toggleSave } = usePrefs(); const ta = lang === "ta";
  const { lists, add, remove } = useLists();
  const [ln, setLn] = useState<"all" | "ta" | "en">("all");
  const study = lists[STUDY_LIST] ?? [];
  const view = useMemo(() => Object.fromEntries(Object.entries(items).map(([k, l]) => [k, l.filter((x) => ln === "all" || x.a.lang === ln)])), [items, ln]);
  const total = Object.values(view).reduce((s, l) => s + l.length, 0);
  const pin = (a: Article) => { if (study.includes(a.id)) remove(STUDY_LIST, a.id); else { if (!saved[a.id]) toggleSave(a); add(STUDY_LIST, a.id); } };
  return (
    <>
      <div className="no-print mt-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-ink-100 bg-white p-0.5 text-sm font-bold dark:border-white/10 dark:bg-ink-900" role="radiogroup" aria-label={ta ? "செய்தி மொழி" : "News language"}>
          {([["all", ta ? "இரு மொழியும்" : "Both"], ["ta", "தமிழ்"], ["en", "English"]] as const).map(([v, l]) => <button key={v} role="radio" aria-checked={ln === v} onClick={() => setLn(v)} className={`rounded-full px-3 py-1 ${ln === v ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : ""}`}>{l}</button>)}
        </div>
        <button onClick={() => window.print()} className="rounded-full border border-ink-100 bg-white px-4 py-1.5 text-sm font-bold dark:border-white/10 dark:bg-ink-900">🖨️ {ta ? "அச்சிடு / PDF" : "Print / PDF"}</button>
        <Link href="/saved" className="rounded-full border border-ink-100 bg-white px-4 py-1.5 text-sm font-bold dark:border-white/10 dark:bg-ink-900">📘 {ta ? `படிப்புப் பட்டியல் (${study.length})` : `Study list (${study.length})`}</Link>
        <a href="#quiz" className="rounded-full bg-kumkum-600 px-4 py-1.5 text-sm font-bold text-white">🧠 {ta ? `இன்றைய வினாடி-வினா (${quiz.length})` : `Today's quiz (${quiz.length})`}</a>
      </div>
      <nav aria-label={ta ? "பாடப் பிரிவுகள்" : "Syllabus sections"} className="no-print no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {buckets.map((b) => <a key={b.key} href={`#${b.key}`} className="shrink-0 rounded-full border border-ink-100 bg-white px-3 py-1.5 text-xs font-bold dark:border-white/10 dark:bg-ink-900">{b.emoji} {ta ? b.ta : b.en} · {view[b.key]?.length ?? 0}</a>)}
      </nav>
      <p className="mt-2 text-xs opacity-75">{ta ? `${date} · ${total} முக்கியச் செய்திகள் · கடந்த 36 மணி நேரம்` : `${date} · ${total} key stories · last 36 hours`}</p>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {buckets.map((b) => (
          <section key={b.key} id={b.key} data-bucket={b.key} className="scroll-mt-24 rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
            <h2 className="text-lg font-extrabold">{b.emoji} {ta ? b.ta : b.en} <span className="text-sm opacity-70">· {view[b.key]?.length ?? 0}</span></h2>
            {view[b.key]?.length ? (
              <ul className="mt-2 space-y-2.5">
                {view[b.key].map(({ a, point }) => (
                  <li key={a.id} className="flex gap-2 text-[15px] leading-snug">
                    <span aria-hidden className="mt-0.5 text-kumkum-600">•</span>
                    <div className="min-w-0 flex-1">
                      <a href={a.link} target="_blank" rel="noopener noreferrer" className="print-url font-bold hover:underline" data-url={a.link}>{a.title}</a>
                      {point && <p className="mt-0.5 text-sm opacity-80">{point}</p>}
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px] opacity-75"><span className="font-bold">{a.source}</span><span>{time(a.publishedAt)}</span><Link href={storyUrl(a)} className="no-print underline">{ta ? "முழு கவரேஜ்" : "Coverage"}</Link></div>
                    </div>
                    <button onClick={() => pin(a)} aria-pressed={study.includes(a.id)} aria-label={ta ? "படிப்புப் பட்டியலில் சேர்" : "Add to study list"} title={ta ? "படிப்புப் பட்டியல்" : "Study list"} className={`no-print grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm ${study.includes(a.id) ? "bg-manjal-400 text-ink-900" : "border border-ink-100 dark:border-white/10"}`}>{study.includes(a.id) ? "📘" : "📌"}</button>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm opacity-70">{ta ? "இன்று இந்தப் பிரிவில் செய்திகள் இல்லை." : "No stories in this section today."}</p>}
          </section>
        ))}
      </div>
      <ExamQuiz quiz={quiz} ta={ta} date={date} />
      <p className="mt-6 text-[11.5px] leading-relaxed opacity-75">{ta ? "பிரிவுகள் தலைப்புச் சொற்களை வைத்து தானாக வகைப்படுத்தப்படுகின்றன (AI அல்ல) — தவறுகள் இருக்கலாம். ஒவ்வொரு குறிப்பும் வெளியீட்டாளரின் தலைப்பும் அவர்களின் RSS சுருக்கமும் மட்டுமே; தேர்வுக்கு முன் அசல் செய்தியைப் படியுங்கள்." : "Sections are sorted automatically by keywords in the headline (no AI), so a few may be misfiled. Each point is the publisher's own headline and RSS snippet — read the original before relying on it for an exam."}</p>
    </>
  );
}

const SKEY = "ns-quiz-days";
const readDays = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(SKEY) || "{}"); } catch { return {}; } };
const streakOf = (days: Record<string, number>, today: string) => { let n = 0; for (let t = Date.parse(today + "T00:00:00Z"); days[new Date(t).toISOString().slice(0, 10)] !== undefined; t -= 864e5) n++; return n; };
function ExamQuiz({ quiz, ta, date }: { quiz: Q[]; ta: boolean; date: string }) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [streak, setStreak] = useState<number | null>(null);
  useEffect(() => { setStreak(streakOf(readDays(), date)); }, [date]); // eslint-disable-line react-hooks/set-state-in-effect
  const record = (next: Record<string, string>) => { if (Object.keys(next).length !== quiz.length) return; const d = readDays(); d[date] = quiz.filter((q) => next[q.id] === q.answer).length; localStorage.setItem(SKEY, JSON.stringify(Object.fromEntries(Object.entries(d).slice(-120)))); setStreak(streakOf(d, date)); };
  if (!quiz.length) return null;
  const score = quiz.filter((q) => picked[q.id] === q.answer).length;
  const done = Object.keys(picked).length;
  const KIND: Record<string, [string, string]> = { state: ["மாநிலம்", "State"], district: ["மாவட்டம்", "District"], country: ["நாடு", "Country"], org: ["அமைப்பு", "Organisation"] };
  return (
    <section id="quiz" className="no-print mt-8 scroll-mt-24 rounded-2xl border border-manjal-400/50 bg-manjal-300/15 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-extrabold">🧠 {ta ? "இன்றைய நடப்பு நிகழ்வுகள் வினாடி-வினா" : "Today's current-affairs quiz"}</h2><span className="text-sm font-bold tabular-nums">⭐ {score}/{quiz.length} · {done}/{quiz.length}{streak ? <span data-streak> · 🔥 {streak} {ta ? "நாள் தொடர்" : "-day streak"}</span> : null}</span></div>
      <p className="mt-1 text-xs opacity-75">{ta ? "இன்றைய உண்மையான தலைப்புகளில் மறைக்கப்பட்ட பெயரைக் கண்டுபிடியுங்கள்." : "Fill in the name hidden in today's real headlines."}</p>
      <ol className="mt-3 space-y-4">
        {quiz.map((q, i) => { const p = picked[q.id]; return (
          <li key={q.id} data-q={i}>
            <p className="font-bold">{i + 1}. {q.text} <span className="text-xs font-semibold opacity-70">({ta ? KIND[q.kind][0] : KIND[q.kind][1]} · {q.source})</span></p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {q.options.map((o) => { const right = p && o === q.answer, wrong = p === o && o !== q.answer; return <button key={o} disabled={!!p} onClick={() => { const nx = { ...picked, [q.id]: o }; setPicked(nx); record(nx); }} className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${right ? "border-green-700 bg-green-600 text-white" : wrong ? "border-red-700 bg-red-600 text-white" : "border-ink-100 bg-white hover:bg-ink-50 dark:border-white/10 dark:bg-ink-900"}`}>{o}</button>; })}
            </div>
            {p && <a href={q.link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-bold text-kumkum-700 underline dark:text-manjal-300">{p === q.answer ? "✓ " : "✗ "}{ta ? `விடை: ${q.answer} — செய்தியைப் படி ↗` : `Answer: ${q.answer} — read the story ↗`}</a>}
          </li>); })}
      </ol>
    </section>
  );
}
