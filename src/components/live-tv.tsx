"use client";
import { useEffect, useRef, useState } from "react";
import type { LiveInfo, Video } from "@/lib/youtube";
import { usePrefs } from "./providers";
import { TimeAgo } from "./time-ago";

type Ch = { id: string; ta: string; en: string; handle: string };
type YTPlayer = { destroy: () => void };
type YTNS = { Player: new (el: HTMLElement, o: Record<string, unknown>) => YTPlayer };
declare global { interface Window { YT?: YTNS; onYouTubeIframeAPIReady?: () => void } }

let apiP: Promise<YTNS> | null = null;
function loadApi(): Promise<YTNS> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiP ??= new Promise((res) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); res(window.YT!); };
    const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; s.async = true; document.head.appendChild(s);
  });
  return apiP;
}

/** YouTube player via the official IFrame API (privacy-enhanced host) so embed errors can be caught. */
function Player({ id, title, onFail }: { id: string; title: string; onFail: (code: number) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const fail = useRef(onFail);
  useEffect(() => { fail.current = onFail; }, [onFail]);
  useEffect(() => {
    let p: YTPlayer | null = null; let dead = false;
    loadApi().then((YT) => {
      if (dead || !host.current) return;
      const el = document.createElement("div"); host.current.replaceChildren(el);
      p = new YT.Player(el, {
        host: "https://www.youtube-nocookie.com", videoId: id, width: "100%", height: "100%",
        playerVars: { autoplay: 1, mute: 1, playsinline: 1, rel: 0, modestbranding: 1, origin: location.origin },
        events: { onError: (e: { data: number }) => fail.current(e.data), onStateChange: (e: { data: number }) => host.current?.setAttribute("data-state", String(e.data)) },
      });
      host.current.querySelector("iframe")?.setAttribute("title", title);
    });
    return () => { dead = true; p?.destroy(); };
  }, [id, title]);
  return <div ref={host} data-player={id} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />;
}

/** Official channels' live streams resolved server-side; falls back to the latest embeddable upload. */
export function LiveTV({ channels, videos, live }: { channels: readonly Ch[]; videos: Video[]; live: LiveInfo[] }) {
  const { lang, lite } = usePrefs();
  const ta = lang === "ta";
  const [ch, setCh] = useState<Ch>(channels[0]);
  const [pick, setPick] = useState<Video | null>(null);
  const [play, setPlay] = useState(false);
  const [failed, setFailed] = useState<Record<string, number>>({});
  const info = live.find((l) => l.channelId === ch.id);
  const isLive = !pick && !!info?.live && info.embeddable && !!info.videoId;
  const probable = !pick && !isLive && info?.via === "feed" && !!info.videoId;
  const fb = info?.fallback ?? null;
  const id = pick?.id ?? (isLive || probable ? info!.videoId! : fb?.id ?? null);
  const title = pick?.title ?? (isLive || probable ? info!.title ?? `${ch.en} live` : fb?.title ?? "");
  const err = id ? failed[id] : undefined;
  const watch = id ? `https://www.youtube.com/watch?v=${id}` : `https://www.youtube.com/@${ch.handle}/live`;
  const list = videos.filter((v) => v.channelId === ch.id);
  const onFail = (code: number) => { if (id) setFailed((f) => ({ ...f, [id]: code })); };
  const label = pick
    ? (ta ? "நீங்கள் தேர்ந்தெடுத்த வீடியோ" : "Your selected video")
    : isLive ? (ta ? "🔴 இப்போது நேரலை" : "🔴 Live now")
    : probable ? (ta ? "சமீபத்திய நேரலை ஒளிபரப்பு — இப்போதும் நேரலையா என உறுதிசெய்ய முடியவில்லை" : "Latest live broadcast — couldn't confirm it's still on air")
    : fb ? (ta ? "இப்போது நேரலையில் இல்லை — சமீபத்திய வீடியோ காட்டப்படுகிறது" : "Not live right now — showing latest video")
    : (ta ? "இப்போது நேரலையில் இல்லை" : "Not live right now");
  return (
    <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
          {channels.map((c) => {
            const on = live.some((l) => l.channelId === c.id && l.embeddable && (l.live || l.via === "feed"));
            return (
              <button key={c.id} data-ch={c.handle} onClick={() => { setCh(c); setPick(null); setPlay(false); }} aria-pressed={c.id === ch.id} className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${c.id === ch.id ? "bg-kumkum-600 text-white" : "border border-ink-100 bg-white dark:border-white/10 dark:bg-ink-900"}`}>
                {on && <span className="live-dot mr-1 text-red-500" aria-label={ta ? "நேரலை" : "live"}>●</span>}{ta ? c.ta : c.en}
              </button>
            );
          })}
        </div>
        <p data-status className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-extrabold ${isLive ? "bg-red-600 text-white" : "bg-manjal-400/25"}`}>{label}</p>
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-ink-900 shadow-xl">
          {id && play && err === undefined ? (
            <Player key={id} id={id} title={title} onFail={onFail} />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {id && !lite && <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />}
              {id && err === undefined ? (
                <button onClick={() => setPlay(true)} className="group relative grid place-items-center gap-2 text-center" aria-label={ta ? "இயக்கு" : "Play"}>
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-red-600 text-4xl shadow-2xl transition group-hover:scale-110">▶</span>
                  <span className="line-clamp-2 max-w-md px-4 text-base font-extrabold drop-shadow">{title}</span>
                  <span className="text-xs opacity-80">{ta ? "YouTube-இலிருந்து இயங்கும் · தட்டினால் மட்டுமே ஏற்றும்" : "Plays from YouTube · loads only when you tap"}</span>
                </button>
              ) : (
                <div data-fallback className="relative grid place-items-center gap-3 px-6 text-center">
                  <span className="text-base font-extrabold drop-shadow">{err !== undefined ? (ta ? "இந்த வீடியோவை இங்கே இயக்க YouTube அனுமதிக்கவில்லை" : "YouTube doesn't allow this video to play here") : (ta ? "இந்தச் சேனல் இப்போது நேரலையில் இல்லை" : "This channel isn't live right now")}</span>
                  <a href={watch} target="_blank" rel="noopener noreferrer" className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-extrabold shadow-lg">▶ {ta ? "YouTube-இல் திற" : "Open on YouTube"} ↗</a>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <a data-open-yt className="rounded-full border border-ink-100 px-3 py-1.5 font-bold dark:border-white/10" href={watch} target="_blank" rel="noopener noreferrer">▶ {ta ? "YouTube-இல் திற" : "Open on YouTube"} ↗</a>
          <span className="opacity-60">{ta ? "நேரலை நிலை சில நிமிடங்களுக்கு ஒருமுறை சரிபார்க்கப்படும். ஒலி அணைந்த நிலையில் தொடங்கும்." : "Live status is checked every few minutes. Starts muted — tap the player to unmute."}</span>
        </p>
      </div>
      <aside>
        <h2 className="mb-2 font-extrabold">🎬 {ta ? `${ch.ta} — சமீபத்திய வீடியோக்கள்` : `${ch.en} — latest videos`}</h2>
        <ul className="space-y-2">
          {list.slice(0, 8).map((v) => (
            <li key={v.id}><button data-vid={v.id} onClick={() => { setPick(v); setPlay(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-current={pick?.id === v.id ? "true" : undefined} className={`flex w-full gap-2 rounded-2xl border bg-white p-2 text-left hover:shadow-md dark:bg-ink-900 ${pick?.id === v.id ? "border-kumkum-600" : "border-ink-100 dark:border-white/10"}`}>
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
