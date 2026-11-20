"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Article } from "@/lib/types";
import { TOPICS } from "@/lib/topics";
import { DISTRICTS, STATES } from "@/lib/geo";
import { usePrefs } from "./providers";
import { ALink } from "./providers";
import { TimeAgo } from "./time-ago";
import { ArticleActions } from "./actions";
import { SourcesBadge } from "./sources-badge";

export function Thumb({ a, className = "" }: { a: Article; className?: string }) {
  const { lite } = usePrefs();
  const [err, setErr] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // An image can fail before React hydrates (onError never fires) — check once mounted.
  useEffect(() => { const i = ref.current; if (i && i.complete && i.naturalWidth === 0) setErr(true); }, []);
  if (!a.image || err || lite) {
    return (
      <div className={`kolam-bg relative grid place-items-center overflow-hidden bg-gradient-to-br from-kumkum-100 via-manjal-300/40 to-kumkum-50 dark:from-ink-800 dark:via-ink-900 dark:to-ink-800 ${lite ? "thumb-lite" : ""} ${className}`}>
        <span className="px-3 text-center text-sm font-bold text-kumkum-700/70 dark:text-manjal-400/70">{a.source}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={a.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setErr(true)} className={`bg-ink-100 object-cover dark:bg-ink-800 ${className}`} />;
}

export function Tags({ a, max = 3 }: { a: Article; max?: number }) {
  const { lang } = usePrefs();
  const chips: { href: string; label: string; color?: string }[] = [];
  for (const t of a.topics) { const x = TOPICS.find((y) => y.slug === t); if (x) chips.push({ href: `/topic/${x.slug}`, label: `${x.emoji} ${lang === "ta" ? x.ta : x.en}`, color: x.color }); }
  for (const d of a.districts.slice(0, 1)) { const x = DISTRICTS.find((y) => y.slug === d); if (x) chips.push({ href: `/tamilnadu/${x.slug}`, label: `📍 ${lang === "ta" ? x.ta : x.en}` }); }
  for (const s of a.states.filter((s) => s !== "tamil-nadu").slice(0, 1)) { const x = STATES.find((y) => y.slug === s); if (x) chips.push({ href: `/india/${x.slug}`, label: `🗺️ ${lang === "ta" ? x.ta : x.en}` }); }
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.slice(0, max).map((c) => (
        <Link key={c.href} href={c.href} className={`rounded-full border px-2 py-0.5 text-[11.5px] font-semibold transition hover:-translate-y-0.5 ${c.color ? "chip-c" : ""}`} style={c.color ? ({ borderColor: c.color + "55", background: c.color + "12", ["--chip" as string]: c.color } as CSSProperties) : undefined}>{c.label}</Link>
      ))}
    </div>
  );
}

export function SourceLine({ a, dark = false }: { a: Article; dark?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-900/70 dark:text-white/65">
      <span className={`font-bold ${dark ? "text-manjal-300" : "text-kumkum-700 dark:text-manjal-400"}`}>{a.source}</span>
      <span>•</span>
      <TimeAgo iso={a.publishedAt} />
      {a.lang === "ta" ? <span className="rounded bg-ink-100 px-1 text-[10px] dark:bg-white/10">த</span> : <span className="rounded bg-ink-100 px-1 text-[10px] dark:bg-white/10">EN</span>}
      <SourcesBadge a={a} dark={dark} />
    </div>
  );
}

export function ReadLink({ a, className = "" }: { a: Article; className?: string }) {
  const { lang } = usePrefs();
  return (
    <ALink a={a} className={`inline-flex items-center gap-1 text-sm font-bold text-kumkum-600 hover:underline dark:text-manjal-400 ${className}`}>
      {lang === "ta" ? `${a.source} தளத்தில் முழுமையாகப் படிக்க` : `Read full story on ${a.source}`} ↗
    </ALink>
  );
}

export function ArticleCard({ a, i = 0 }: { a: Article; i?: number }) {
  const { isHidden } = usePrefs();
  if (isHidden(a)) return null;
  return (
    <article data-card tabIndex={-1} className="fade-up group outline-none focus:ring-4 focus:ring-manjal-400/60 flex gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-kumkum-600/5 sm:flex-col sm:gap-0 sm:p-0 dark:border-white/10 dark:bg-ink-900" style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
      <ALink a={a} className="block shrink-0 overflow-hidden rounded-xl sm:rounded-b-none sm:rounded-t-2xl" data-thumb>
        <Thumb a={a} className="h-24 w-28 transition duration-500 group-hover:scale-105 sm:aspect-[16/9] sm:h-auto sm:w-full" />
      </ALink>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:p-4">
        <SourceLine a={a} />
        <ALink a={a}>
          <h3 className="line-clamp-3 text-[15.5px] font-bold leading-snug group-hover:text-kumkum-700 sm:text-[17px] dark:group-hover:text-manjal-400">{a.title}</h3>
        </ALink>
        {a.summary && <p className="line-clamp-3 hidden text-sm leading-relaxed text-ink-900/70 sm:block dark:text-white/65">{a.summary}</p>}
        <div className="hidden sm:block"><Tags a={a} /></div>
        <div className="-ml-2 mt-auto flex items-center justify-between pt-1">
          <ArticleActions a={a} compact />
        </div>
      </div>
    </article>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex gap-3 rounded-2xl border border-ink-100 bg-white p-3 sm:flex-col sm:p-0 dark:border-white/10 dark:bg-ink-900">
      <div className="skeleton h-24 w-28 shrink-0 rounded-xl sm:aspect-[16/9] sm:h-auto sm:w-full sm:rounded-b-none" />
      <div className="flex flex-1 flex-col gap-2 sm:p-4">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton hidden h-3 w-3/5 rounded sm:block" />
      </div>
    </div>
  );
}
