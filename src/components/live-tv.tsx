"use client";
import { useState } from "react";
import type { Video } from "@/lib/youtube";
import { usePrefs } from "./providers";
import { TimeAgo } from "./time-ago";

type Ch = { id: string; ta: string; en: string; handle: string };

/** Official channels' YouTube live streams, loaded only on tap (saves data; YouTube's own embed). */
export function LiveTV({ channels, videos }: { channels: readonly Ch[]; videos: Video[] }) {
  const { lang, lite } = usePrefs();
  const ta = lang === "ta";
  const [ch, setCh] = useState<Ch>(channels[0]);
  const [vid, setVid] = useState<string | null>(null);
  const [play, setPlay] = useState(false);
  const liveNow = videos.find((v) => v.channelId === ch.id && v.live);
  const src = vid ? `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0` : `https://www.youtube.com/embed/live_stream?channel=${ch.id}&autoplay=1`;
  const poster = vid ?? liveNow?.id;
  const list = videos.filter((v) => v.channelId === ch.id);
  return (
    <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
          {channels.map((c) => (
            <button key={c.id} onClick={() => { setCh(c); setVid(null); setPlay(false); }} aria-pressed={c.id === ch.id} className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${c.id === ch.id ? "bg-kumkum-600 text-white" : "border border-ink-100 bg-white dark:border-white/10 dark:bg-ink-900"}`}>
              {videos.some((v) => v.channelId === c.id && v.live) && <span className="live-dot mr-1 text-red-500">●</span>}{ta ? c.ta : c.en}
            </button>
          ))}
        </div>
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-ink-900 shadow-xl">
          {play ? (
            <iframe key={src} src={src} title={`${ch.en} live`} className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          ) : (
            <button onClick={() => setPlay(true)} className="group absolute inset-0 grid place-items-center text-white" aria-label={ta ? "இயக்கு" : "Play"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {poster && !lite && <img src={`https://i.ytimg.com/vi/${poster}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
              <span className="relative grid place-items-center gap-2 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-red-600 text-4xl shadow-2xl transition group-hover:scale-110">▶</span>
                <span className="text-lg font-extrabold drop-shadow">{vid ? (ta ? "வீடியோவை இயக்கு" : "Play video") : `${ta ? ch.ta : ch.en} · ${ta ? "நேரலை" : "Live"}`}</span>
                <span className="text-xs opacity-80">{ta ? "YouTube-இலிருந்து இயங்கும் · தட்டினால் மட்டுமே ஏற்றும்" : "Plays from YouTube · loads only when you tap"}</span>
              </span>
            </button>
          )}
        </div>
        <p className="mt-2 text-xs opacity-60">{ta ? "சேனல் இப்போது நேரலையில் இல்லையெனில் YouTube அதைத் தெரிவிக்கும். " : "If the channel isn’t live right now, YouTube will say so. "}<a className="font-bold underline" href={`https://www.youtube.com/@${ch.handle}/live`} target="_blank" rel="noopener noreferrer">{ta ? "YouTube-இல் திற ↗" : "Open on YouTube ↗"}</a></p>
      </div>
      <aside>
        <h2 className="mb-2 font-extrabold">🎬 {ta ? `${ch.ta} — சமீபத்திய வீடியோக்கள்` : `${ch.en} — latest videos`}</h2>
        <ul className="space-y-2">
          {list.slice(0, 8).map((v) => (
            <li key={v.id}><button onClick={() => { setVid(v.id); setPlay(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex w-full gap-2 rounded-2xl border border-ink-100 bg-white p-2 text-left hover:shadow-md dark:border-white/10 dark:bg-ink-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {!lite && <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" className="h-16 w-28 shrink-0 rounded-xl object-cover" />}
              <span className="min-w-0"><span className="line-clamp-2 text-[13.5px] font-semibold leading-snug">{v.live && <span className="mr-1 rounded bg-red-600 px-1 text-[10px] text-white">LIVE</span>}{v.title}</span><span className="block text-xs opacity-60"><TimeAgo iso={v.published} /></span></span>
            </button></li>
          ))}
          {!list.length && <li className="text-sm opacity-60">{ta ? "வீடியோ பட்டியல் இப்போது கிடைக்கவில்லை." : "Video list unavailable right now."}</li>}
        </ul>
      </aside>
    </div>
  );
}
