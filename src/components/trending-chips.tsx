"use client";
import Link from "next/link";
import type { Trend } from "@/lib/trending";
import { usePrefs } from "./providers";

export function TrendingChips({ trends, max = 14, cloud = false }: { trends: Trend[]; max?: number; cloud?: boolean }) {
  const { lang } = usePrefs();
  if (!trends.length) return null;
  const top = trends.slice(0, max);
  const hi = Math.max(...top.map((t) => t.sources)), lo = Math.min(...top.map((t) => t.sources));
  return (
    <div className={cloud ? "flex flex-wrap items-baseline justify-center gap-x-4 gap-y-3 p-2" : "no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1"}>
      {!cloud && <span className="shrink-0 self-center text-sm font-extrabold">📈 {lang === "ta" ? "டிரெண்டிங்:" : "Trending:"}</span>}
      {top.map((t) => {
        const w = hi === lo ? 0.5 : (t.sources - lo) / (hi - lo);
        return (
          <Link key={t.term} href={`/search?q=${encodeURIComponent(t.term)}`} title={lang === "ta" ? `${t.sources} ஊடகங்கள், ${t.count} தலைப்புகள்` : `${t.sources} outlets, ${t.count} headlines`}
            className={cloud ? "font-extrabold text-kumkum-700 transition hover:-translate-y-0.5 hover:underline dark:text-manjal-400" : "shrink-0 rounded-full border border-ink-100 bg-white px-3 py-1 text-[13px] font-semibold hover:border-kumkum-400 dark:border-white/10 dark:bg-ink-900"}
            style={cloud ? { fontSize: `${15 + w * 22}px`, opacity: 0.65 + w * 0.35 } : undefined}>
            {cloud ? t.term : <>#{t.term} <span className="opacity-50">{t.sources}</span></>}
          </Link>
        );
      })}
    </div>
  );
}
