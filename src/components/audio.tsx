"use client";
import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Article } from "@/lib/types";
import { storyUrl } from "@/lib/story-url";
import { usePrefs } from "./providers";

/**
 * Global read-aloud player (browser speechSynthesis), mounted once in the root layout so a bulletin keeps
 * playing while you browse. Robust against Chrome quirks: text is spoken in short chunks (Chrome stalls on
 * long utterances), pause = cancel + resume from the current chunk (native pause/resume is unreliable on
 * Chrome/Android), and every utterance carries a token so stale onend/onerror events never advance the queue.
 */
export type PlayState = "idle" | "playing" | "paused";
type Snap = { queue: Article[]; idx: number; state: PlayState; qid: string; label: string; rate: number; notice: string };
type Api = Snap & {
  playQueue: (items: Article[], start?: number, opts?: { qid?: string; label?: string }) => void;
  pause: () => void; resume: () => void; toggle: () => void; stop: () => void; next: () => void; prev: () => void; jump: (i: number) => void;
  setRate: (r: number) => void; supported: boolean;
};
const Ctx = createContext<Api | null>(null);
export const useAudio = () => { const c = useContext(Ctx); if (!c) throw new Error("useAudio outside AudioProvider"); return c; };
export const SPEEDS = [0.8, 1, 1.25, 1.5];

function chunks(a: Article): string[] {
  const text = `${a.title}. ${a.summary || ""}`.replace(/\s+/g, " ").trim();
  const out: string[] = [];
  for (const s of text.split(/(?<=[.!?।])\s+/)) {
    let rest = s;
    while (rest.length > 220) { let cut = rest.lastIndexOf(" ", 200); if (cut < 80) cut = 200; out.push(rest.slice(0, cut)); rest = rest.slice(cut).trim(); }
    if (rest) out.push(rest);
  }
  return out.filter((x) => x.replace(/[\s.]/g, "").length > 0);
}
const prefs = (): { ta?: string; en?: string; rate?: number } => { try { return JSON.parse(localStorage.getItem("ns-voice") || "{}"); } catch { return {}; } };

class Engine {
  snap: Snap = { queue: [], idx: 0, state: "idle", qid: "", label: "", rate: 1, notice: "" };
  private subs = new Set<() => void>();
  private token = 0; private part = 0; private parts: string[] = []; private dog: number | undefined;
  constructor() { if (typeof window !== "undefined") { const r = prefs().rate; if (r && r >= 0.5 && r <= 2) this.snap.rate = r; } }
  sub = (cb: () => void) => { this.subs.add(cb); return () => { this.subs.delete(cb); }; };
  get = () => this.snap;
  private set(p: Partial<Snap>) { this.snap = { ...this.snap, ...p }; this.subs.forEach((f) => f()); }
  private kill() { this.token++; clearTimeout(this.dog); try { window.speechSynthesis?.cancel(); } catch {} }
  private speakPart() {
    const synth = window.speechSynthesis; if (!synth) return;
    const cur = this.snap; const a = cur.queue[cur.idx];
    if (!a || cur.state !== "playing") return;
    if (this.part >= this.parts.length) { this.advance(); return; }
    const my = ++this.token;
    const u = new SpeechSynthesisUtterance(this.parts[this.part]);
    const want = a.lang === "ta" ? "ta" : "en";
    u.lang = want === "ta" ? "ta-IN" : "en-IN";
    const voices = synth.getVoices(); const pr = prefs();
    const v = (pr[want] && voices.find((x) => x.name === pr[want])) || voices.find((x) => x.lang.toLowerCase().replace("_", "-").startsWith(want + "-in")) || voices.find((x) => x.lang.toLowerCase().startsWith(want));
    if (v) u.voice = v;
    u.rate = cur.rate;
    let started = false;
    u.onstart = () => { started = true; clearTimeout(this.dog); if (this.snap.notice) this.set({ notice: "" }); };
    u.onend = () => { if (my !== this.token) return; clearTimeout(this.dog); this.part++; this.speakPart(); };
    u.onerror = (e) => {
      if (my !== this.token || e.error === "interrupted" || e.error === "canceled") return;
      clearTimeout(this.dog);
      const notice = e.error === "language-unavailable" || e.error === "voice-unavailable" ? (want === "ta" ? "tamil" : "voice") : voices.length ? "engine" : "novoices";
      // Failed before a single word: pause with an honest notice instead of racing through the whole queue.
      if (!started) { this.kill(); this.set({ state: "paused", notice }); return; }
      this.set({ notice });
      this.part = this.parts.length; this.speakPart(); // failed mid-story: move on to the next one
    };
    try { synth.resume(); } catch {} // Chrome can get stuck "paused" after the tab idles
    // Small delay after cancel(): Chrome sometimes drops an utterance queued in the same tick.
    setTimeout(() => { if (my === this.token) synth.speak(u); }, 60);
    clearTimeout(this.dog);
    this.dog = window.setTimeout(() => {
      if (my !== this.token || started) return;
      // Nothing came out: say so honestly and pause instead of silently racing through the queue.
      this.kill(); this.set({ state: "paused", notice: voices.length ? "engine" : "novoices" });
    }, 7000);
  }
  private begin(idx: number) {
    this.kill();
    const a = this.snap.queue[idx]; if (!a) { this.set({ state: "idle", queue: [], idx: 0, qid: "" }); return; }
    this.parts = chunks(a); this.part = 0;
    this.set({ idx, state: "playing" });
    this.speakPart();
  }
  private advance() {
    const n = this.snap.idx + 1;
    if (n >= this.snap.queue.length) { this.kill(); this.set({ state: "idle", queue: [], idx: 0, qid: "" }); return; }
    this.begin(n);
  }
  playQueue = (items: Article[], start = 0, opts?: { qid?: string; label?: string }) => {
    if (!("speechSynthesis" in window)) { this.set({ notice: "unsupported" }); return; }
    const q = items.filter((a) => a.title).slice(0, 60);
    if (!q.length) return;
    this.snap = { ...this.snap, queue: q, qid: opts?.qid ?? "", label: opts?.label ?? "", notice: "" };
    this.begin(Math.min(start, q.length - 1));
  };
  pause = () => { if (this.snap.state !== "playing") return; this.kill(); this.set({ state: "paused" }); };
  resume = () => { if (this.snap.state !== "paused") return; this.set({ state: "playing", notice: "" }); this.speakPart(); };
  toggle = () => { if (this.snap.state === "playing") this.pause(); else this.resume(); };
  stop = () => { this.kill(); this.parts = []; this.part = 0; this.set({ state: "idle", queue: [], idx: 0, qid: "", notice: "" }); };
  next = () => { if (this.snap.idx < this.snap.queue.length - 1) this.begin(this.snap.idx + 1); };
  /** Restarts the current story if we're past its first sentence, otherwise goes back one. */
  prev = () => { this.begin(this.part > 1 ? this.snap.idx : Math.max(0, this.snap.idx - 1)); };
  jump = (i: number) => this.begin(i);
  setRate = (r: number) => {
    try { localStorage.setItem("ns-voice", JSON.stringify({ ...prefs(), rate: r })); } catch {}
    this.set({ rate: r });
    if (this.snap.state === "playing") { this.kill(); this.speakPart(); } // restart the sentence at the new speed
  };
}
let engine: Engine | null = null;
const getEngine = () => (engine ??= new Engine());
const SERVER: Snap = { queue: [], idx: 0, state: "idle", qid: "", label: "", rate: 1, notice: "" };

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { lang } = usePrefs();
  const e = typeof window === "undefined" ? null : getEngine();
  const snap = useSyncExternalStore(e ? e.sub : () => () => {}, e ? e.get : () => SERVER, () => SERVER);
  const api: Api = useMemo(() => {
    const en = typeof window === "undefined" ? null : getEngine();
    const noop = () => {};
    return { ...snap, supported: typeof window === "undefined" || "speechSynthesis" in window,
      playQueue: en?.playQueue ?? noop, pause: en?.pause ?? noop, resume: en?.resume ?? noop, toggle: en?.toggle ?? noop, stop: en?.stop ?? noop,
      next: en?.next ?? noop, prev: en?.prev ?? noop, jump: en?.jump ?? noop, setRate: en?.setRate ?? noop };
  }, [snap]);
  useEffect(() => { window.speechSynthesis?.getVoices(); }, []); // warms Chrome's voice list
  // Lock-screen / headset controls where the browser supports Media Session.
  useEffect(() => {
    const ms = navigator.mediaSession; if (!ms) return;
    const a = snap.queue[snap.idx];
    try {
      ms.metadata = a && snap.state !== "idle" ? new MediaMetadata({ title: a.title, artist: a.source, album: "நாற்றிசை · Naatrisai" }) : null;
      ms.setActionHandler("play", api.resume); ms.setActionHandler("pause", api.pause);
      ms.setActionHandler("nexttrack", api.next); ms.setActionHandler("previoustrack", api.prev); ms.setActionHandler("stop", api.stop);
    } catch {}
  }, [snap.idx, snap.state, snap.queue, api]);
  useEffect(() => { document.documentElement.classList.toggle("has-player", snap.state !== "idle"); }, [snap.state]);
  return <Ctx.Provider value={api}>{children}<PlayerBar ta={lang === "ta"} /></Ctx.Provider>;
}

const NOTICE: Record<string, [string, string]> = {
  tamil: ["இந்தச் சாதனத்தில் தமிழ்க் குரல் இல்லை — அமைப்புகள் → குரல் வாசிப்பு அல்லது சாதன TTS-இல் தமிழ் குரலைச் சேர்க்கவும்.", "No Tamil voice on this device — add one in your device's text-to-speech settings."],
  voice: ["தேர்ந்த குரல் கிடைக்கவில்லை; அடுத்த செய்திக்குச் சென்றோம்.", "That voice isn't available; skipped to the next story."],
  engine: ["உலாவியின் குரல் இயந்திரம் பதிலளிக்கவில்லை. ▶ அழுத்தி மீண்டும் முயலுங்கள்.", "The browser's speech engine didn't respond. Press ▶ to try again."],
  novoices: ["இந்த உலாவியில் குரல்கள் எதுவும் நிறுவப்படவில்லை — ஒலி வராமல் போகலாம்.", "This browser has no speech voices installed — you may hear nothing."],
  unsupported: ["இந்த உலாவி குரல் வாசிப்பை ஆதரிக்கவில்லை.", "This browser doesn't support read-aloud."],
};

const ib = "grid shrink-0 place-items-center rounded-full transition active:scale-90 disabled:opacity-35";
/** Transport controls (shared by the global bar and inline bulletin controls). */
export function Transport({ ta, size = "md" }: { ta: boolean; size?: "md" | "lg" }) {
  const p = useAudio();
  const big = size === "lg" ? "h-14 w-14 text-2xl" : "h-12 w-12 text-xl";
  const sm = size === "lg" ? "h-12 w-12 text-xl" : "h-11 w-11 text-lg";
  const playing = p.state === "playing";
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={ta ? "இயக்கக் கட்டுப்பாடுகள்" : "Playback controls"}>
      <button data-ctl="prev" onClick={p.prev} disabled={p.idx === 0 && p.state === "idle"} aria-label={ta ? "முந்தைய செய்தி" : "Previous story"} title={ta ? "முந்தையது" : "Previous"} className={`${ib} ${sm} border border-ink-100 bg-white text-ink-900 hover:bg-ink-50 dark:border-white/15 dark:bg-ink-800 dark:text-white`}>⏮</button>
      <button data-ctl="playpause" onClick={p.toggle} aria-label={playing ? (ta ? "இடைநிறுத்து" : "Pause") : (ta ? "தொடர்ந்து இயக்கு" : "Play / resume")} title={playing ? (ta ? "இடைநிறுத்து" : "Pause") : (ta ? "இயக்கு" : "Play")} className={`${ib} ${big} bg-kumkum-600 text-white shadow-lg shadow-kumkum-600/30 hover:bg-kumkum-700`}>{playing ? "⏸" : "▶"}</button>
      <button data-ctl="stop" onClick={p.stop} aria-label={ta ? "நிறுத்து" : "Stop"} title={ta ? "நிறுத்து" : "Stop"} className={`${ib} ${sm} border border-ink-100 bg-white text-ink-900 hover:bg-ink-50 dark:border-white/15 dark:bg-ink-800 dark:text-white`}>⏹</button>
      <button data-ctl="next" onClick={p.next} disabled={p.idx >= p.queue.length - 1} aria-label={ta ? "அடுத்த செய்தி" : "Next story"} title={ta ? "அடுத்தது" : "Next"} className={`${ib} ${sm} border border-ink-100 bg-white text-ink-900 hover:bg-ink-50 dark:border-white/15 dark:bg-ink-800 dark:text-white`}>⏭</button>
    </div>
  );
}

function SpeedBtn({ ta }: { ta: boolean }) {
  const p = useAudio();
  const nextRate = SPEEDS.find((x) => x > p.rate + 0.01) ?? SPEEDS[0];
  return <button data-ctl="speed" onClick={() => p.setRate(nextRate)} aria-label={ta ? `வேகம் ${p.rate}× — மாற்ற அழுத்தவும்` : `Speed ${p.rate}× — tap to change`} className="h-9 min-w-12 rounded-full border border-ink-100 px-2 text-xs font-extrabold tabular-nums dark:border-white/15">{Number(p.rate.toFixed(2))}×</button>;
}

function PlayerBar({ ta }: { ta: boolean }) {
  const p = useAudio();
  const [queueOpen, setQueueOpen] = useState(false);
  if (p.state === "idle" || !p.queue.length) return p.notice === "unsupported" ? <div role="status" className="fixed inset-x-3 bottom-20 z-50 rounded-2xl bg-ink-900 p-3 text-center text-sm font-bold text-white lg:bottom-5">{ta ? NOTICE.unsupported[0] : NOTICE.unsupported[1]}</div> : null;
  const a = p.queue[p.idx];
  return (
    <div data-player className="no-print fixed inset-x-2 bottom-[calc(3.9rem+env(safe-area-inset-bottom))] z-[45] mx-auto max-w-3xl lg:bottom-4" role="region" aria-label={ta ? "செய்தி வாசிப்பு இயக்கி" : "News audio player"}>
      {queueOpen && (
        <div className="fade-up mb-2 max-h-[45vh] overflow-y-auto rounded-2xl border border-ink-100 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-ink-900" role="list" aria-label={ta ? "வரிசை" : "Queue"}>
          {p.queue.map((q, i) => (
            <button key={q.id + i} role="listitem" onClick={() => p.jump(i)} aria-current={i === p.idx} className={`flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left text-sm ${i === p.idx ? "bg-kumkum-600/10 font-bold" : "hover:bg-ink-50 dark:hover:bg-white/5"}`}>
              <span className="w-6 shrink-0 text-right text-xs font-bold tabular-nums opacity-70">{i === p.idx ? (p.state === "playing" ? "🔊" : "⏸") : i + 1}</span>
              <span className="min-w-0"><span className="line-clamp-2">{q.title}</span><span className="text-[11px] opacity-70">{q.source}</span></span>
            </button>
          ))}
        </div>
      )}
      <div className="rounded-2xl border border-ink-100 bg-white/95 p-2.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/95">
        <div className="flex items-center gap-2.5">
          <Transport ta={ta} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className={p.state === "playing" ? "live-dot text-kumkum-600 dark:text-manjal-400" : "opacity-70"}>{p.state === "playing" ? (ta ? "● வாசிக்கிறது" : "● Playing") : (ta ? "⏸ இடைநிறுத்தம்" : "⏸ Paused")}</span>
              <span data-progress className="rounded-full bg-ink-100 px-1.5 tabular-nums dark:bg-white/10">{p.idx + 1} / {p.queue.length}</span>
              <span className="hidden truncate opacity-75 sm:inline">{a.source}</span>
            </div>
            <Link href={storyUrl(a)} className="line-clamp-1 text-sm font-bold hover:underline sm:line-clamp-2" title={a.title}>{a.title}</Link>
            <span className="text-[11px] opacity-75 sm:hidden">{a.source}</span>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <SpeedBtn ta={ta} />
            <button data-ctl="queue" onClick={() => setQueueOpen((o) => !o)} aria-expanded={queueOpen} aria-label={ta ? "வரிசையைக் காட்டு" : "Show queue"} className="h-9 rounded-full border border-ink-100 px-2.5 text-xs font-bold dark:border-white/15">☰ {ta ? "வரிசை" : "Queue"}</button>
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 sm:hidden">
          <SpeedBtn ta={ta} />
          <button data-ctl="queue" onClick={() => setQueueOpen((o) => !o)} aria-expanded={queueOpen} aria-label={ta ? "வரிசையைக் காட்டு" : "Show queue"} className="h-9 rounded-full border border-ink-100 px-3 text-xs font-bold dark:border-white/15">☰ {ta ? "வரிசை" : "Queue"} ({p.queue.length})</button>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10" aria-hidden><div className="h-full bg-kumkum-600 transition-all" style={{ width: `${((p.idx + 1) / p.queue.length) * 100}%` }} /></div>
        {p.notice && <p role="status" className="mt-1.5 text-[11.5px] font-semibold text-kumkum-700 dark:text-manjal-300">⚠️ {ta ? NOTICE[p.notice]?.[0] : NOTICE[p.notice]?.[1]}</p>}
      </div>
    </div>
  );
}

/** Inline bulletin launcher: a big Play button; once this bulletin is playing it turns into full inline controls. */
export function Bulletin({ items, max = 10, label }: { items: Article[]; max?: number; label?: { ta: string; en: string } }) {
  const { lang, content } = usePrefs(); const ta = lang === "ta";
  const p = useAudio();
  const list = useMemo(() => items.filter((a) => content === "all" || a.lang === content).slice(0, max), [items, content, max]);
  const qid = useMemo(() => `b:${list.length}:${list.slice(0, 3).map((a) => a.id).join(",")}`, [list]);
  if (!list.length) return null;
  const mine = p.qid === qid && p.state !== "idle";
  const txt = label ? (ta ? label.ta : label.en) : ta ? `செய்தி வாசிப்பைக் கேளுங்கள் (${list.length})` : `Listen to news bulletin (${list.length})`;
  if (!mine) {
    return (
      <button data-bulletin onClick={() => p.playQueue(list, 0, { qid, label: txt })} aria-label={txt} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-kumkum-600 to-manjal-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-kumkum-600/25 transition active:scale-95">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-base" aria-hidden>▶</span>{txt}
      </button>
    );
  }
  return (
    <span data-bulletin-active className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-kumkum-600/30 bg-kumkum-50 p-1.5 pr-3 dark:border-white/10 dark:bg-white/5">
      <Transport ta={ta} />
      <span className="text-xs font-bold tabular-nums">{p.state === "playing" ? "🔊" : "⏸"} {p.idx + 1} / {p.queue.length}</span>
      <span className="line-clamp-1 max-w-[16rem] text-xs font-semibold opacity-80">{p.queue[p.idx]?.title}</span>
    </span>
  );
}
