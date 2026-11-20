"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Article } from "@/lib/types";
import { usePrefs } from "./providers";
import { ArticleCard } from "./article-card";

/** Personal watchwords (device-only, part of the Settings backup). */
const KEY = "ns-watchwords", EVT = "ns:watchwords";
let cache: { raw: string | null; v: string[] } = { raw: null, v: [] };
const read = () => { const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(KEY); if (raw !== cache.raw) { try { const v = raw ? JSON.parse(raw) : []; cache = { raw, v: Array.isArray(v) ? v : [] }; } catch { cache = { raw, v: [] }; } } return cache.v; };
const EMPTY: string[] = [];
export function useWatchwords() {
  const words = useSyncExternalStore((cb) => { window.addEventListener(EVT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); }; }, read, () => EMPTY);
  const write = (n: string[]) => { localStorage.setItem(KEY, JSON.stringify(n.slice(0, 12))); window.dispatchEvent(new Event(EVT)); };
  return { words, add: (w: string) => { const t = w.trim().slice(0, 40); if (t.length >= 2 && !read().some((x) => x.toLowerCase() === t.toLowerCase())) write([...read(), t]); }, remove: (w: string) => write(read().filter((x) => x !== w)) };
}

type Res = { word: string; count: number; articles: Article[] }[];
const IDEAS = ["TNPSC", "Chennai Metro", "ISRO", "Monsoon", "TCS", "மெட்ரோ", "பருவமழை", "Kalaignar"];
export function WatchwordsView() {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const { words, add, remove } = useWatchwords();
  const [input, setInput] = useState(""); const [res, setRes] = useState<Res | null>(null); const [sel, setSel] = useState("");
  const key = words.join("|");
  useEffect(() => {
    if (!key) return;
    let off = false;
    fetch(`/api/watch?w=${encodeURIComponent(key)}`).then((r) => r.json()).then((j: Res) => { if (!off) setRes(Array.isArray(j) ? j : []); }).catch(() => { if (!off) setRes([]); });
    return () => { off = true; };
  }, [key]);
  const shown = (res ?? []).filter((r) => words.includes(r.word));
  const seen = new Set<string>();
  const list = shown.filter((r) => !sel || r.word === sel).flatMap((r) => r.articles).filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true))).sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  return (
    <div className="mt-5 space-y-5">
      <section className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
        <form onSubmit={(e) => { e.preventDefault(); add(input); setInput(""); }} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={40} placeholder={ta ? "சொல்லைச் சேர்க்கவும் (எ.கா. TNPSC, சென்னை மெட்ரோ)" : "Add a watchword (e.g. TNPSC, Chennai Metro)"} aria-label={ta ? "கண்காணிப்புச் சொல்" : "Watchword"} className="min-w-0 flex-1 rounded-full border border-ink-100 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-ink-950" />
          <button className="rounded-full bg-kumkum-600 px-5 text-sm font-bold text-white">{ta ? "சேர்" : "Add"}</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist">
          {words.length > 0 && <button role="tab" aria-selected={!sel} onClick={() => setSel("")} className={`rounded-full px-3 py-1.5 text-sm font-bold ${!sel ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "border border-ink-100 dark:border-white/10"}`}>{ta ? "அனைத்தும்" : "All"}</button>}
          {words.map((w) => { const c = res?.find((r) => r.word === w)?.count; return (
            <span key={w} className={`inline-flex items-center rounded-full ${sel === w ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "border border-ink-100 dark:border-white/10"}`}>
              <button role="tab" aria-selected={sel === w} onClick={() => setSel(w)} className="py-1.5 pl-3 pr-1 text-sm font-bold">🔔 {w} <span data-count className="ml-1 rounded-full bg-kumkum-600 px-1.5 text-[11px] text-white">{c ?? "…"}</span></button>
              <button onClick={() => { remove(w); if (sel === w) setSel(""); }} aria-label={`${ta ? "நீக்கு" : "Remove"} ${w}`} className="px-2 text-sm opacity-70">✕</button>
            </span>); })}
        </div>
        {!words.length && <div className="mt-3"><p className="text-sm opacity-80">{ta ? "யோசனைகள்:" : "Ideas:"}</p><div className="mt-2 flex flex-wrap gap-2">{IDEAS.map((w) => <button key={w} onClick={() => add(w)} className="rounded-full border border-dashed border-ink-100 px-3 py-1 text-sm font-semibold dark:border-white/15">+ {w}</button>)}</div></div>}
        <p className="mt-3 text-[11px] opacity-70">{ta ? "கடந்த 3 நாட்களின் செய்திகள் — எங்கள் ஊட்டங்கள் + Google News தேடல் · சொற்கள் இந்தச் சாதனத்தில் மட்டும் (காப்பில் சேர்க்கப்படும்)" : "Stories from the last 3 days — our feeds plus a Google News search · words stay on this device (included in backup)"}</p>
      </section>
      {words.length > 0 && (res === null ? <p className="text-sm opacity-70">{ta ? "தேடுகிறது…" : "Searching…"}</p> : list.length ? <div data-grid className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">{list.slice(0, 60).map((a, i) => <ArticleCard key={a.id} a={a} i={i % 20} />)}</div> : <p className="rounded-2xl border border-dashed border-ink-100 p-8 text-center text-sm opacity-75 dark:border-white/10">{ta ? "இந்தச் சொற்களுக்குச் சமீபத்திய செய்திகள் இல்லை." : "No recent stories match these words."}</p>)}
    </div>
  );
}
