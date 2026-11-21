"use client";
import { useState } from "react";
import type { Article } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REACTIONS, usePrefs } from "./providers";
import { storyUrl } from "@/lib/story-url";
import { createPortal } from "react-dom";
import { AiQuick, useAiEnabled } from "./ai-panel";
import { ListPicker } from "./lists";
import { shareImage } from "./share-image";
import { useAudio } from "./audio";
import { QuickPeek } from "./quick-peek";

const btn = "grid h-8 w-8 min-[380px]:h-9 min-[380px]:w-9 place-items-center rounded-full text-[17px] transition hover:bg-ink-100 active:scale-90 dark:hover:bg-white/10";

export function ArticleActions({ a, compact = false }: { a: Article; compact?: boolean }) {
  const { saved, toggleSave, reactions, react, lang, hide } = usePrefs();
  const [more, setMore] = useState(false);
  const [ai, setAi] = useState(false);
  const [pick, setPick] = useState(false);
  const aiOn = useAiEnabled();
  const audio = useAudio();
  const router = useRouter();
  const onAir = audio.state !== "idle" && audio.queue[audio.idx]?.id === a.id;
  const playing = onAir && audio.state === "playing";
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const [toast, setToast] = useState("");
  const [popped, setPopped] = useState(false);
  const isSaved = !!saved[a.id];
  const mine = reactions[a.id];

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  const listen = () => {
    if (!("speechSynthesis" in window)) { flash(lang === "ta" ? "உங்கள் உலாவியில் குரல் வசதி இல்லை" : "Speech not supported in this browser"); return; }
    if (onAir) { audio.toggle(); return; }
    audio.playQueue([a], 0, { qid: `one:${a.id}`, label: a.title });
  };
  const share = async () => {
    // Share text follows the interface language; the headline stays as published.
    const text = lang === "ta" ? `${a.title}\n— ${a.source} · நாற்றிசை வழியாக\nமுழு கவரேஜ்: ${location.origin}${storyUrl(a)}` : `${a.title}\n— ${a.source} · via Naatrisai\nFull coverage: ${location.origin}${storyUrl(a)}`;
    if (navigator.share) { try { await navigator.share({ title: a.title, text, url: a.link }); } catch {} return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${a.link}`)}`, "_blank", "noopener");
  };
  const copy = async () => { try { await navigator.clipboard.writeText(a.link); flash(lang === "ta" ? "இணைப்பு நகலெடுக்கப்பட்டது" : "Link copied"); } catch {} };

  return (
    <div className="relative flex items-center gap-0.5">
      <button data-act="listen" className={btn} onClick={listen} aria-pressed={playing} aria-label={playing ? (lang === "ta" ? "இடைநிறுத்து" : "Pause reading") : (lang === "ta" ? "கேளுங்கள்" : "Listen")} title={playing ? (lang === "ta" ? "இடைநிறுத்து" : "Pause") : (lang === "ta" ? "கேளுங்கள்" : "Listen")}>{playing ? "⏸" : onAir ? "▶" : "🎧"}</button>
      <button data-act="save" className={`${btn} ${isSaved ? "text-manjal-500" : ""}`} onClick={() => { toggleSave(a); flash(isSaved ? (lang === "ta" ? "நீக்கப்பட்டது" : "Removed") : (lang === "ta" ? "சேமிக்கப்பட்டது 🔖" : "Saved 🔖")); }} aria-label="Bookmark" title={lang === "ta" ? "சேமி" : "Save"}>{isSaved ? "🔖" : "📑"}</button>
      <div className="relative">
        <button className={`${btn} ${popped ? "pop" : ""}`} onClick={() => setOpen((o) => !o)} aria-label="React" title={lang === "ta" ? "உணர்வு" : "React"}>{mine || "🙂"}</button>
        {open && (
          <div className="fade-up absolute bottom-11 left-1/2 z-20 flex -translate-x-1/2 gap-1 rounded-full border border-ink-100 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-ink-800">
            {REACTIONS.map((e) => (
              <button key={e} onClick={() => { react(a.id, e); setOpen(false); setPopped(true); setTimeout(() => setPopped(false), 400); }} className={`grid h-9 w-9 place-items-center rounded-full text-xl transition hover:-translate-y-1 hover:scale-125 ${mine === e ? "bg-manjal-300/50" : ""}`}>{e}</button>
            ))}
          </div>
        )}
      </div>
      <button className={btn} onClick={share} aria-label="Share" title={lang === "ta" ? "பகிர்" : "Share"}>📤</button>
      <Link className={`${btn} max-[379px]:hidden`} href={storyUrl(a)} aria-label={lang === "ta" ? "முழு கவரேஜ்" : "Full coverage"} title={lang === "ta" ? "முழு கவரேஜ் — எல்லா ஊடகங்களும், காலவரிசை" : "Full coverage — every outlet, timeline"}>🧭</Link>
      {aiOn && <button className={btn} onClick={() => setAi(true)} aria-label={lang === "ta" ? "AI முக்கியக் குறிப்புகள்" : "AI key points"} title={lang === "ta" ? "AI முக்கியக் குறிப்புகள்" : "AI key points"}>✨</button>}
      {peek && createPortal(<QuickPeek a={a} ta={lang === "ta"} onClose={() => setPeek(false)} />, document.body)}
      {pick && createPortal(<ListPicker a={a} onClose={() => setPick(false)} />, document.body)}
      {ai && createPortal(<AiQuick id={a.id} link={a.link} onClose={() => setAi(false)} />, document.body)}
      {!compact && <button className={`${btn} max-[419px]:hidden`} onClick={copy} aria-label="Copy link" title={lang === "ta" ? "இணைப்பை நகலெடு" : "Copy link"}>🔗</button>}
      <div className="relative">
        <button className={btn} onClick={() => setMore((o) => !o)} aria-label={lang === "ta" ? "மேலும்" : "More"} aria-expanded={more} title={lang === "ta" ? "மேலும்" : "More"}>⋯</button>
        {more && (
          <div className="fade-up absolute bottom-11 right-0 z-30 w-60 rounded-2xl border border-ink-100 bg-white p-1.5 text-left text-sm text-ink-900 shadow-xl dark:border-white/10 dark:bg-ink-800 dark:text-white" onMouseLeave={() => setMore(false)}>
            {[
              { k: "peek", t: lang === "ta" ? "👁️ விரைவுப் பார்வை" : "👁️ Quick peek", f: () => setPeek(true) },
              { k: "list", t: lang === "ta" ? "📂 வாசிப்புப் பட்டியலில் சேர்" : "📂 Add to reading list", f: () => setPick(true) },
              { k: "wa", t: lang === "ta" ? "🟢 WhatsApp-இல் பகிர்" : "🟢 Share on WhatsApp", f: () => window.open(`https://wa.me/?text=${encodeURIComponent(`*${a.title}*\n— ${a.source}\n${a.link}\n\nநாற்றிசை: ${location.origin}${storyUrl(a)}`)}`, "_blank", "noopener") },
              { k: "tg", t: "✈️ Telegram", f: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(a.link)}&text=${encodeURIComponent(a.title)}`, "_blank", "noopener") },
              { k: "x", t: lang === "ta" ? "𝕏 X-இல் பகிர்" : "𝕏 Share on X", f: () => window.open(`https://x.com/intent/post?text=${encodeURIComponent(a.title)}&url=${encodeURIComponent(a.link)}`, "_blank", "noopener") },
              { k: "txt", t: lang === "ta" ? "📋 தலைப்பு + இணைப்பை நகலெடு" : "📋 Copy headline + link", f: async () => { try { await navigator.clipboard.writeText(`${a.title}\n— ${a.source}\n${a.link}`); flash(lang === "ta" ? "நகலெடுக்கப்பட்டது" : "Copied"); } catch {} } },
              { k: "img", t: lang === "ta" ? "🖼️ செய்தி அட்டை (Instagram / WhatsApp Status)" : "🖼️ Story card (Instagram / WhatsApp Status)", f: async () => { const r = await shareImage(a, lang); if (r === "downloaded") flash(lang === "ta" ? "படம் பதிவிறக்கப்பட்டது" : "Image downloaded"); } },
              { k: "tr", t: a.lang === "ta" ? "🌐 Translate to English (Google)" : "🌐 தமிழில் மொழிபெயர் (Google)", f: () => window.open(`https://translate.google.com/translate?sl=auto&tl=${a.lang === "ta" ? "en" : "ta"}&u=${encodeURIComponent(a.link)}`, "_blank", "noopener") },
              { k: "err", t: lang === "ta" ? "🚩 பிழையைப் புகாரளி" : "🚩 Report an error", f: () => { router.push(`/corrections?${new URLSearchParams({ u: a.link, t: a.title.slice(0, 200) })}`); } },
              { k: "hide", t: lang === "ta" ? "🙈 இந்தச் செய்தியை மறை" : "🙈 Hide this story", f: () => { hide("ids", a.id); flash(lang === "ta" ? "மறைக்கப்பட்டது" : "Hidden"); } },
              { k: "src", t: lang === "ta" ? `🚫 ${a.source} செய்திகளை மறை` : `🚫 Hide stories from ${a.source}`, f: () => { hide("sources", a.source); flash(lang === "ta" ? "மூலம் மறைக்கப்பட்டது · அமைப்புகளில் மீட்கலாம்" : "Source hidden · undo in Settings"); } },
            ].map((o) => <button key={o.k} onClick={() => { setMore(false); o.f(); }} className="block w-full rounded-xl px-3 py-2 text-left hover:bg-ink-50 dark:hover:bg-white/10">{o.t}</button>)}
          </div>
        )}
      </div>
      {toast && <span className="fade-up absolute -top-9 left-0 whitespace-nowrap rounded-full bg-ink-900 px-3 py-1 text-xs text-white dark:bg-white dark:text-ink-900">{toast}</span>}
    </div>
  );
}
