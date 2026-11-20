"use client";
import { useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/types";
import { usePrefs } from "./providers";
import { Thumb, SourceLine, Tags, ReadLink } from "./article-card";
import { ArticleActions } from "./actions";

/** Inshorts-style short cards: swipe up/down (touch), scroll, or use ↑/↓ keys. */
export function CardDeck({ items }: { items: Article[] }) {
  const { lang } = usePrefs();
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 150;
    if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top, behavior: "smooth" });
    const onScroll = () => setIdx(Math.round(el.scrollTop / el.clientHeight));
    el.addEventListener("scroll", onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); el.scrollBy({ top: el.clientHeight, behavior: "smooth" }); }
      if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); el.scrollBy({ top: -el.clientHeight, behavior: "smooth" }); }
    };
    window.addEventListener("keydown", onKey);
    return () => { el.removeEventListener("scroll", onScroll); window.removeEventListener("keydown", onKey); };
  }, []);

  const go = (d: number) => ref.current?.scrollBy({ top: d * ref.current.clientHeight, behavior: "smooth" });

  return (
    <div className="relative mx-auto max-w-xl">
      <div className="mb-2 flex items-center justify-between text-xs text-ink-900/60 dark:text-white/50">
        <span>{lang === "ta" ? "மேலே/கீழே ஸ்வைப் செய்யுங்கள் · ↑ ↓ விசைகள்" : "Swipe up/down · ↑ ↓ keys"}</span>
        <span className="font-bold tabular-nums">{Math.min(idx + 1, items.length)} / {items.length}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10"><div className="h-full bg-gradient-to-r from-manjal-400 to-kumkum-600 transition-all" style={{ width: `${((idx + 1) / Math.max(1, items.length)) * 100}%` }} /></div>
      <div data-deck ref={ref} className="no-scrollbar mt-2 h-[calc(100dvh-14rem)] min-h-[440px] snap-y snap-mandatory overflow-y-scroll overscroll-contain rounded-3xl">
        {items.map((a, i) => (
          <section key={a.id} className="flex h-full snap-start snap-always flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-lg dark:border-white/10 dark:bg-ink-900">
            <div className="relative h-[42%] shrink-0">
              <Thumb a={a} className="h-full w-full" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute bottom-2 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs font-bold text-white">{i + 1}</span>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 overflow-hidden p-5">
              <SourceLine a={a} />
              <h2 className="text-xl font-extrabold leading-snug">{a.title}</h2>
              {a.summary ? <p className="line-clamp-3 text-[15px] leading-relaxed text-ink-900/75 dark:text-white/70">{a.summary}</p> : <p className="text-sm italic opacity-50">{lang === "ta" ? "சுருக்கம் இல்லை — மூலத் தளத்தில் படிக்கவும்." : "No summary provided by the feed — read it at the source."}</p>}
              <Tags a={a} />
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3 dark:border-white/10">
                <ArticleActions a={a} compact />
                <ReadLink a={a} />
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="absolute -right-14 top-1/2 hidden -translate-y-1/2 flex-col gap-2 md:flex">
        <button onClick={() => go(-1)} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-md hover:bg-kumkum-50 dark:bg-ink-800">↑</button>
        <button onClick={() => go(1)} className="grid h-11 w-11 place-items-center rounded-full bg-kumkum-600 text-white shadow-md hover:bg-kumkum-700">↓</button>
      </div>
    </div>
  );
}
