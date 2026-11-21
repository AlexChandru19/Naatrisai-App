"use client";
import { useSyncExternalStore } from "react";
import type { Article } from "@/lib/types";
import { usePrefs, ALink } from "./providers";
import { timeAgo } from "./time-ago";

// Dismissal + on/off preference, kept in localStorage ("ns-catchup").
type CU = { off: boolean; dismissedAt: number };
const KEY = "ns-catchup", EVT = "ns:catchup", GAP = 12 * 3600e3;
let cache: { raw: string | null; v: CU } = { raw: null, v: { off: false, dismissedAt: 0 } };
const DEF: CU = { off: false, dismissedAt: 0 };
const read_ = (): CU => { const raw = localStorage.getItem(KEY); if (raw !== cache.raw) { try { cache = { raw, v: { ...DEF, ...(raw ? JSON.parse(raw) : {}) } }; } catch { cache = { raw, v: DEF }; } } return cache.v; };
const write = (p: Partial<CU>) => { localStorage.setItem(KEY, JSON.stringify({ ...read_(), ...p })); window.dispatchEvent(new Event(EVT)); };
const sub = (cb: () => void) => { window.addEventListener(EVT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); }; };
export const useCatchUpPref = () => {
  const v = useSyncExternalStore(sub, read_, () => DEF);
  return { show: !v.off, setShow: (on: boolean) => write({ off: !on }) };
};
const dismiss = () => write({ dismissedAt: Date.now() });
/** Once dismissed, the box stays hidden until a visit that starts after a 12+ hour absence (and 12+ hours after the dismissal). */
function dismissedNow(c: CU, prev: number) {
  if (!c.dismissedAt) return false;
  let start = 0;
  try { start = JSON.parse(localStorage.getItem("ns-visit") || "{}").last ?? 0; } catch {}
  return !(start - c.dismissedAt >= GAP && start - prev >= GAP);
}

/** "Since your last visit" (SmartNews/Artifact-style catch-up). */
export function CatchUp({ articles }: { articles: Article[] }) {
  const { prevVisit, lang, ready, isHidden, read } = usePrefs();
  const c = useSyncExternalStore(sub, read_, () => ({ off: true, dismissedAt: 0 }));
  if (!ready || !prevVisit || c.off || dismissedNow(c, prevVisit)) return null;
  const fresh = articles.filter((a) => a.publishedAt && Date.parse(a.publishedAt) > prevVisit && !a.soft && !isHidden(a) && !read[a.id]);
  if (fresh.length < 3) return null;
  const ta = lang === "ta";
  return (
    <section aria-label={ta ? "கடைசி வருகைக்குப் பின்" : "Since your last visit"} className="fade-up mt-4 rounded-3xl border border-peacock-600/25 bg-gradient-to-r from-peacock-600/10 to-sky-500/5 p-4 dark:border-teal-300/20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 flex-1 font-extrabold">👋 {ta ? `நீங்கள் கடைசியாக வந்தது ${timeAgo(new Date(prevVisit).toISOString(), "ta")} — அதன்பின் ${fresh.length} புதிய செய்திகள்` : `Since your last visit (${timeAgo(new Date(prevVisit).toISOString(), "en")}): ${fresh.length} new stories`}</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => { dismiss(); window.dispatchEvent(new Event("ns:fresh")); }} className="rounded-full bg-peacock-600 px-4 py-1.5 text-sm font-bold text-white">{ta ? "எல்லாப் புதியவையும் →" : "Catch up on all →"}</button>
          <button onClick={dismiss} data-catchup-close aria-label={ta ? "இந்தப் பெட்டியை மூடு" : "Close this box"} title={ta ? "மூடு" : "Close"} className="grid h-9 w-9 place-items-center rounded-full text-lg font-bold opacity-70 hover:bg-ink-100 hover:opacity-100 dark:hover:bg-white/10">✕</button>
        </div>
      </div>
      <ol className="mt-2 grid gap-x-6 gap-y-1 text-[14.5px] sm:grid-cols-2">
        {fresh.slice(0, 6).map((a, i) => (
          <li key={a.id} className="flex gap-2"><span className="font-extrabold text-peacock-600 dark:text-teal-300">{i + 1}.</span><ALink a={a} className="line-clamp-1 font-semibold hover:underline">{a.title}</ALink></li>
        ))}
      </ol>
    </section>
  );
}
