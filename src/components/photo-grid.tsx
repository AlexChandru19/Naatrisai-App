"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Article } from "@/lib/types";
import { ALink, usePrefs } from "./providers";
import { TimeAgo } from "./time-ago";

const SECS = [["all", "அனைத்தும்", "All"], ["tamilnadu", "தமிழ்நாடு", "Tamil Nadu"], ["india", "இந்தியா", "India"], ["world", "உலகம்", "World"]] as const;

function Tile({ a, big }: { a: Article; big: boolean }) {
  const [err, setErr] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // Images can fail before hydration (onError never fires) — check once mounted.
   
  useEffect(() => { const i = ref.current; if (i && i.complete && i.naturalWidth === 0) setErr(true); }, []);
  if (err) return null;
  return (
    <figure className={`group relative overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800 ${big ? "sm:col-span-2 sm:row-span-2" : ""}`}>
      <ALink a={a} className="block h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={ref} src={a.image!} alt={a.title} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setErr(true)} className="aspect-[4/3] h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 pt-10 text-white">
          <div className={`font-bold leading-snug ${big ? "text-lg" : "line-clamp-3 text-sm"}`}>{a.title}</div>
          <div className="mt-1 text-[11px] opacity-80">📷 {a.source} · <TimeAgo iso={a.publishedAt} /></div>
        </figcaption>
      </ALink>
    </figure>
  );
}

export function PhotoGrid({ items }: { items: Article[] }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [sec, setSec] = useState<string>("all");
  const list = useMemo(() => items.filter((a) => sec === "all" || a.section === sec).slice(0, 60), [items, sec]);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {SECS.map(([k, t, e]) => <button key={k} role="tab" aria-selected={sec === k} onClick={() => setSec(k)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${sec === k ? "bg-kumkum-600 text-white" : "border border-ink-100 dark:border-white/10"}`}>{ta ? t : e}</button>)}
      </div>
      <div className="grid auto-rows-auto grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((a, i) => <Tile key={a.id} a={a} big={i % 7 === 0} />)}
      </div>
      {!list.length && <p className="py-10 text-center opacity-70">{ta ? "படங்கள் இல்லை." : "No photos."}</p>}
      <p className="mt-4 text-xs opacity-65">{ta ? "படங்கள் அந்தந்த செய்தி நிறுவனங்களுக்குச் சொந்தமானவை; அவற்றின் RSS ஊட்டத்திலிருந்து நேரடியாகக் காட்டப்படுகின்றன. படத்தைத் தட்டினால் மூலச் செய்திக்குச் செல்லும்." : "Images belong to the publishers and are shown straight from their RSS feeds. Tap a photo to open the original story."}</p>
    </div>
  );
}
