"use client";
import { useEffect, useState } from "react";
import type { Article } from "@/lib/types";
import { usePrefs, ALink } from "./providers";
import { Bulletin } from "./hero";
import { Thumb, SourceLine } from "./article-card";

export function BriefingHead({ count, fetchedAt }: { count: number; fetchedAt: string }) {
  const { lang } = usePrefs();
  const [h, setH] = useState<number | null>(null);
  useEffect(() => { setH(Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }))); }, []); // eslint-disable-line react-hooks/set-state-in-effect
  const ta = lang === "ta";
  const g = h === null ? (ta ? "வணக்கம்" : "Hello") : h < 12 ? (ta ? "காலை வணக்கம்" : "Good morning") : h < 17 ? (ta ? "மதிய வணக்கம்" : "Good afternoon") : (ta ? "மாலை வணக்கம்" : "Good evening");
  const kind = h === null ? "" : h < 12 ? (ta ? "காலைச் சுருக்கம்" : "Morning briefing") : h < 17 ? (ta ? "மதியச் சுருக்கம்" : "Midday briefing") : (ta ? "மாலைச் சுருக்கம்" : "Evening briefing");
  const mins = Math.max(2, Math.round((count * 22) / 60));
  return (
    <div className="mt-4 rounded-3xl bg-gradient-to-br from-kumkum-600 to-manjal-500 p-6 text-white shadow-xl">
      <p className="text-sm font-bold opacity-90">{new Date(fetchedAt).toLocaleDateString(ta ? "ta-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}</p>
      <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">☀️ {g}! {kind && <span className="block text-xl font-bold opacity-95 sm:inline sm:text-2xl">— {kind}</span>}</h1>
      <p className="mt-2 opacity-95">{ta ? `${count} முக்கியச் செய்திகள் · சுமார் ${mins} நிமிட வாசிப்பு · தமிழ்நாடு, இந்தியா, உலகம்` : `${count} key stories · about ${mins} min read · Tamil Nadu, India, World`}</p>
    </div>
  );
}

export function BriefingList({ title, items, start }: { title: { ta: string; en: string }; items: Article[]; start: number }) {
  const { lang } = usePrefs();
  return (
    <section className="rounded-3xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
      <h2 className="mb-3 text-xl font-extrabold">{lang === "ta" ? title.ta : title.en}</h2>
      <ol className="space-y-3">
        {items.map((a, i) => (
          <li key={a.id} data-card tabIndex={-1} className="flex gap-3 outline-none focus:ring-4 focus:ring-manjal-400/60">
            <span className="w-7 shrink-0 text-2xl font-extrabold text-kumkum-600/80 dark:text-manjal-400/80">{start + i}</span>
            <div className="min-w-0 flex-1">
              <SourceLine a={a} />
              <ALink a={a} className="block"><h3 className="text-[16px] font-bold leading-snug hover:underline">{a.title}</h3></ALink>
              {a.summary && <p className="mt-0.5 line-clamp-2 text-sm opacity-75">{a.summary}</p>}
            </div>
            <ALink a={a} className="fx-lite hidden shrink-0 overflow-hidden rounded-xl sm:block"><Thumb a={a} className="h-20 w-28" /></ALink>
          </li>
        ))}
      </ol>
    </section>
  );
}
export { Bulletin };
