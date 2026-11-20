"use client";
import type { Article } from "@/lib/types";
import { usePrefs, ALink } from "./providers";
import { timeAgo } from "./time-ago";

/** "Since your last visit" (SmartNews/Artifact-style catch-up). */
export function CatchUp({ articles }: { articles: Article[] }) {
  const { prevVisit, lang, ready, isHidden, read } = usePrefs();
  if (!ready || !prevVisit) return null;
  const fresh = articles.filter((a) => a.publishedAt && Date.parse(a.publishedAt) > prevVisit && !a.soft && !isHidden(a) && !read[a.id]);
  if (fresh.length < 3) return null;
  const ta = lang === "ta";
  return (
    <section aria-label={ta ? "கடைசி வருகைக்குப் பின்" : "Since your last visit"} className="fade-up mt-4 rounded-3xl border border-peacock-600/25 bg-gradient-to-r from-peacock-600/10 to-sky-500/5 p-4 dark:border-teal-300/20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-extrabold">👋 {ta ? `நீங்கள் கடைசியாக வந்தது ${timeAgo(new Date(prevVisit).toISOString(), "ta")} — அதன்பின் ${fresh.length} புதிய செய்திகள்` : `Since your last visit (${timeAgo(new Date(prevVisit).toISOString(), "en")}): ${fresh.length} new stories`}</h2>
        <button onClick={() => window.dispatchEvent(new Event("ns:fresh"))} className="rounded-full bg-peacock-600 px-4 py-1.5 text-sm font-bold text-white">{ta ? "எல்லாப் புதியவையும் →" : "Catch up on all →"}</button>
      </div>
      <ol className="mt-2 grid gap-x-6 gap-y-1 text-[14.5px] sm:grid-cols-2">
        {fresh.slice(0, 6).map((a, i) => (
          <li key={a.id} className="flex gap-2"><span className="font-extrabold text-peacock-600 dark:text-teal-300">{i + 1}.</span><ALink a={a} className="line-clamp-1 font-semibold hover:underline">{a.title}</ALink></li>
        ))}
      </ol>
    </section>
  );
}
