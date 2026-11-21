"use client";
import Link from "next/link";
import type { Video } from "@/lib/youtube";
import { usePrefs } from "./providers";
import { TimeAgo } from "./time-ago";

/** Latest uploads from official Tamil news channels (YouTube RSS); opens on YouTube. */
export function VideoStrip({ videos }: { videos: Video[] }) {
  const { lang, lite } = usePrefs(); const ta = lang === "ta";
  if (!videos.length) return null;
  return (
    <section data-mod="videos" className="mt-8">
      <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-extrabold sm:text-2xl">📺 {ta ? "செய்திக் காணொளிகள்" : "News videos"}</h2><Link href="/live" className="text-sm font-bold text-kumkum-600 dark:text-manjal-400">{ta ? "நேரலை டிவி →" : "Live TV →"}</Link></div>
      <div className="no-scrollbar -mx-3 flex snap-x gap-3 overflow-x-auto px-3 sm:-mx-4 sm:px-4 pb-2">
        {videos.map((v) => (
          <a key={v.id} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="group w-60 shrink-0 snap-start">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {!lite && <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />}
              <span className="absolute inset-0 grid place-items-center"><span className="grid h-10 w-10 place-items-center rounded-full bg-red-600/90 text-white shadow-lg">▶</span></span>
              {v.live && <span className="absolute left-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">● LIVE</span>}
            </div>
            <div className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug group-hover:underline">{v.title}</div>
            <div className="text-[11px] opacity-60">{v.channel} · <TimeAgo iso={v.published} /></div>
          </a>
        ))}
      </div>
    </section>
  );
}
