"use client";
import Link from "next/link";
import { useEffect } from "react";
import type { Article } from "@/lib/types";
import { storyUrl } from "@/lib/story-url";
import { useAudio } from "./audio";

/** Quick peek: the publisher's own headline, image and RSS snippet plus who else covered it — no scraping. */
export function QuickPeek({ a, ta, onClose }: { a: Article; ta: boolean; onClose: () => void }) {
  const audio = useAudio();
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const others = (a.cluster ?? []).filter((c) => c.link !== a.link).slice(0, 6);
  const t = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) + " IST" : "");
  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={ta ? "விரைவுப் பார்வை" : "Quick peek"} data-peek>
      <div onClick={(e) => e.stopPropagation()} className="fade-up max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white text-ink-900 shadow-2xl sm:rounded-3xl dark:bg-ink-900 dark:text-white">
        {a.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.image} alt="" referrerPolicy="no-referrer" className="aspect-[16/9] w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        )}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 text-xs"><span className="font-bold text-kumkum-700 dark:text-manjal-300">{a.source}</span><span className="opacity-75">{t(a.publishedAt)}</span></div>
          <h2 lang={a.lang} className="mt-2 text-xl font-extrabold leading-snug">{a.title}</h2>
          {a.summary && <p lang={a.lang} className="mt-2 text-[15px] leading-relaxed opacity-85">{a.summary}</p>}
          <p className="mt-2 text-[11px] opacity-65">{ta ? "வெளியீட்டாளரின் RSS சுருக்கம் மட்டும் — முழுச் செய்திக்கு அசல் தளத்தைப் பாருங்கள்." : "Publisher's RSS snippet only — read the full story on their site."}</p>
          {others.length > 0 && (
            <div className="mt-4"><h3 className="text-sm font-extrabold">{ta ? `மற்ற ஊடகங்களிலும் (${others.length})` : `Also covered by (${others.length})`}</h3>
              <ul className="mt-1.5 space-y-1.5 text-sm">{others.map((c) => <li key={c.link}><a href={c.link} target="_blank" rel="noopener noreferrer" className="hover:underline"><b>{c.source}</b> · <span lang={c.lang}>{c.title}</span></a></li>)}</ul>
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={a.link} target="_blank" rel="noopener noreferrer" className="rounded-full bg-kumkum-600 px-4 py-2 text-sm font-bold text-white">{ta ? "முழுச் செய்தி ↗" : "Read full story ↗"}</a>
            <Link href={storyUrl(a)} onClick={onClose} className="rounded-full border border-ink-100 px-4 py-2 text-sm font-bold dark:border-white/15">🧭 {ta ? "முழு கவரேஜ்" : "Full coverage"}</Link>
            {audio.supported && <button onClick={() => audio.playQueue([a], 0, { qid: "one:" + a.id })} className="rounded-full border border-ink-100 px-4 py-2 text-sm font-bold dark:border-white/15">▶ {ta ? "கேள்" : "Listen"}</button>}
            <button onClick={onClose} className="ml-auto rounded-full px-3 py-2 text-sm font-bold opacity-80">{ta ? "மூடு ✕" : "Close ✕"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
