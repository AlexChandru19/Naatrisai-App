"use client";
import type { Article } from "@/lib/types";
import { usePrefs } from "./providers";
import { ALink } from "./providers";
import { TimeAgo } from "./time-ago";

export function Ticker({ items }: { items: Article[] }) {
  const { lang } = usePrefs();
  if (!items.length) return null;
  const list = [...items, ...items];
  return (
    <div className="ticker relative mt-3 flex items-stretch overflow-hidden rounded-xl border border-kumkum-600/20 bg-white shadow-sm dark:border-white/10 dark:bg-ink-900">
      <div className="z-10 flex shrink-0 items-center gap-2 bg-kumkum-600 px-3 text-sm font-extrabold text-white">
        <span className="live-dot h-2 w-2 rounded-full bg-white" />
        {lang === "ta" ? "உடனுக்குடன்" : "LIVE"}
      </div>
      <div className="relative flex-1 overflow-hidden py-2">
        <div className="ticker-track flex w-max gap-8 whitespace-nowrap pl-4" style={{ ["--ticker-duration" as string]: `${items.length * 7}s` }}>
          {list.map((a, i) => (
            <ALink key={i} a={a} className="flex items-center gap-2 text-sm font-semibold hover:text-kumkum-600 dark:hover:text-manjal-400">
              <span aria-hidden className="text-manjal-500">◆</span>
              {a.title}
              <span className="text-xs font-normal opacity-75">· {a.source} · <TimeAgo iso={a.publishedAt} /></span>
            </ALink>
          ))}
        </div>
      </div>
    </div>
  );
}
