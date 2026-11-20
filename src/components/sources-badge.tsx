"use client";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Article } from "@/lib/types";
import { sourceCount } from "@/lib/types";
import { usePrefs } from "./providers";
import { TimeAgo } from "./time-ago";
import Link from "next/link";
import { storyUrl } from "@/lib/story-url";

/** "N sources" chip for clustered stories; opens a panel listing every outlet's version. */
export function SourcesBadge({ a, dark = false }: { a: Article; dark?: boolean }) {
  const { lang } = usePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const n = sourceCount(a);
  if (n < 2) return null;
  const versions = [{ source: a.source, title: a.title, link: a.link, lang: a.lang, publishedAt: a.publishedAt }, ...(a.cluster ?? [])];
  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-extrabold transition hover:scale-105 ${dark ? "bg-white/20 text-white" : "bg-peacock-600/10 text-peacock-600 dark:bg-peacock-500/20 dark:text-teal-300"}`}
        title={lang === "ta" ? "இதே செய்தியை வெளியிட்ட ஊடகங்கள்" : "Outlets covering this story"}
      >
        {n >= 3 ? "🔴" : "🗞️"} {lang === "ta" ? `${n} ஊடகங்கள்` : `${n} sources`} <span className={`text-[9px] transition ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-3 backdrop-blur-[2px] sm:place-items-center" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}>
        <div onClick={(e) => e.stopPropagation()} className="fade-up w-full max-w-md rounded-3xl border border-ink-100 bg-white p-3 text-left text-ink-900 shadow-2xl dark:border-white/10 dark:bg-ink-800 dark:text-white">
          <div className="flex items-center justify-between px-2 pb-1 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">{lang === "ta" ? `இதே செய்தி — ${n} ஊடகங்களில்` : `Same story — ${n} outlets`}</p>
            <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink-100 dark:hover:bg-white/10" aria-label="Close">✕</button>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {versions.map((v) => (
              <li key={v.link}>
                <a href={v.link} target="_blank" rel="noopener noreferrer" className="block rounded-xl px-2 py-2 hover:bg-ink-50 dark:hover:bg-white/5">
                  <span className="flex items-center gap-2 text-xs"><b className="text-kumkum-700 dark:text-manjal-400">{v.source}</b><span className="opacity-50"><TimeAgo iso={v.publishedAt} /></span><span className="ml-auto opacity-50">↗</span></span>
                  <span className="line-clamp-2 text-[13px] font-semibold leading-snug">{v.title}</span>
                </a>
              </li>
            ))}
          </ul>
          <Link href={storyUrl(a)} onClick={() => setOpen(false)} className="mt-2 block rounded-2xl bg-peacock-600 px-4 py-2.5 text-center text-sm font-extrabold text-white hover:bg-peacock-500">🧭 {lang === "ta" ? "முழு கவரேஜ் · காலவரிசை · கவரேஜ் அளவி" : "Full coverage · timeline · coverage meter"} →</Link>
        </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
