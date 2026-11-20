"use client";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { usePrefs } from "./providers";
import { ALink } from "./providers";
import { Thumb, SourceLine, Tags } from "./article-card";
import { ArticleActions } from "./actions";

export function Hero({ lead, side }: { lead: Article; side: Article[] }) {
  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <article className="fade-up group relative overflow-hidden rounded-3xl bg-ink-900 text-white shadow-xl">
        <ALink a={lead} className="block">
          <Thumb a={lead} className="aspect-[16/10] w-full opacity-90 transition duration-700 group-hover:scale-105 sm:aspect-[16/9]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </ALink>
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 sm:p-6">
          <div className="text-white/85 [&>div]:!text-white/85 [&_b]:!text-manjal-300"><SourceLine a={lead} dark /></div>
          <ALink a={lead}><h2 className="text-xl font-extrabold leading-tight drop-shadow sm:text-3xl">{lead.title}</h2></ALink>
          {lead.summary && <p className="line-clamp-2 hidden max-w-2xl text-sm text-white/80 sm:block">{lead.summary}</p>}
          <div className="-ml-2 flex items-center [&_button]:text-white [&_button:hover]:bg-white/15"><ArticleActions a={lead} /></div>
        </div>
      </article>
      <div className="grid gap-3">
        {side.map((a, i) => (
          <article key={a.id} className="fade-up group flex gap-3 rounded-2xl border border-ink-100 bg-white p-2.5 transition hover:shadow-md dark:border-white/10 dark:bg-ink-900" style={{ animationDelay: `${(i + 1) * 70}ms` }}>
            <ALink a={a} className="shrink-0 overflow-hidden rounded-xl"><Thumb a={a} className="h-20 w-24 transition duration-500 group-hover:scale-105" /></ALink>
            <div className="min-w-0 space-y-1">
              <SourceLine a={a} />
              <ALink a={a}><h3 className="line-clamp-3 text-[15px] font-bold leading-snug group-hover:text-kumkum-700 dark:group-hover:text-manjal-400">{a.title}</h3></ALink>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export { Bulletin } from "./audio";

export function Strip({ title, href, items, accent }: { title: { ta: string; en: string }; href: string; items: Article[]; accent: string }) {
  const { lang, content } = usePrefs();
  const list = items.filter((a) => content === "all" || a.lang === content).slice(0, 12);
  if (!list.length) return null;
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl"><span className="h-6 w-1.5 rounded-full" style={{ background: accent }} />{lang === "ta" ? title.ta : title.en}</h2>
        <Link href={href} className="text-sm font-bold text-kumkum-600 hover:underline dark:text-manjal-400">{lang === "ta" ? "அனைத்தும் →" : "See all →"}</Link>
      </div>
      <div className="no-scrollbar -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 sm:-mx-5 sm:px-5">
        {list.map((a) => (
          <article key={a.id} className="group flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-ink-900">
            <ALink a={a} className="overflow-hidden"><Thumb a={a} className="aspect-[16/9] w-full transition duration-500 group-hover:scale-105" /></ALink>
            <div className="flex flex-1 flex-col gap-1.5 p-3">
              <SourceLine a={a} />
              <ALink a={a}><h3 className="line-clamp-3 text-[15px] font-bold leading-snug">{a.title}</h3></ALink>
              <div className="mt-auto"><Tags a={a} max={2} /></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PageTitle({ emoji, ta, en, subTa, subEn, children }: { emoji: string; ta: string; en: string; subTa?: string; subEn?: string; children?: React.ReactNode }) {
  const { lang } = usePrefs();
  return (
    <div className="kolam-bg relative mt-4 overflow-hidden rounded-3xl border border-ink-100 bg-white p-5 sm:p-7 dark:border-white/10 dark:bg-ink-900">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-manjal-400/40 to-kumkum-500/30 blur-2xl" />
      <div className="relative flex flex-wrap items-center gap-3">
        <span className="text-4xl">{emoji}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{lang === "ta" ? ta : en}</h1>
          {(subTa || subEn) && <p className="mt-1 text-sm text-ink-900/60 dark:text-white/55">{lang === "ta" ? subTa : subEn}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
