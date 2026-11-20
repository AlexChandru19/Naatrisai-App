"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/types";
import { toggleDarkTheme } from "./appearance";

export type UILang = "ta" | "en";
export type ContentLang = "all" | "ta" | "en";
export type ViewMode = "feed" | "cards";
export type TextSize = "s" | "m" | "l" | "xl" | "xxl";
/** Home-page modules a reader can switch off (Settings → Home modules). */
export const MODULES = ["alerts", "rates", "weather", "town", "videos", "cricket", "trending", "history", "quiz"] as const;
export type Module = (typeof MODULES)[number];
export type Follows = { topics: string[]; districts: string[]; states: string[]; sources: string[] };
export type Hidden = { ids: string[]; sources: string[] };
export const REACTIONS = ["👍", "😮", "😢", "😡", "❤️"] as const;

/** Light article record for reading history (kept small for localStorage). */
type ReadRec = { t: number; topics: string[]; districts: string[]; states: string[]; source: string; lang?: "ta" | "en"; section?: string };

type Prefs = {
  lang: UILang; setLang: (l: UILang) => void;
  dark: boolean; toggleDark: () => void;
  content: ContentLang; setContent: (c: ContentLang) => void;
  view: ViewMode; setView: (v: ViewMode) => void;
  saved: Record<string, Article>; toggleSave: (a: Article) => void;
  reactions: Record<string, string>; react: (id: string, emoji: string) => void;
  textSize: TextSize; setTextSize: (t: TextSize) => void;
  simple: boolean; setSimple: (b: boolean) => void;
  lite: boolean; setLite: (b: boolean) => void;
  follows: Follows; toggleFollow: (kind: keyof Follows, v: string) => void; setFollows: (f: Follows) => void;
  hidden: Hidden; hide: (kind: keyof Hidden, v: string) => void; unhide: (kind: keyof Hidden, v: string) => void;
  read: Record<string, ReadRec>; markRead: (a: Article) => void;
  prevVisit: number | null; streak: number; readToday: number;
  onboarded: boolean; setOnboarded: () => void;
  isHidden: (a: Article) => boolean;
  offMods: Module[]; toggleMod: (m: Module) => void;
  town: string; setTown: (slug: string) => void;
  hideRead: boolean; setHideRead: (b: boolean) => void;
  ready: boolean;
};
const Ctx = createContext<Prefs | null>(null);
export const usePrefs = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePrefs outside Providers");
  return c;
};

function load<T>(k: string, d: T): T {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; }
}
function store(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const istDay = (t = Date.now()) => new Date(t + 5.5 * 3600_000).toISOString().slice(0, 10);
const EMPTY_F: Follows = { topics: [], districts: [], states: [], sources: [] };

function applyMods(off: Module[]) {
  const h = document.documentElement;
  for (const m of MODULES) h.classList.toggle(`hm-${m}`, off.includes(m));
}
function applyHtml(size: TextSize, simple: boolean, lite: boolean) {
  const h = document.documentElement;
  h.classList.remove("ts-s", "ts-l", "ts-xl", "ts-xxl");
  if (size !== "m") h.classList.add(`ts-${size}`);
  h.classList.toggle("simple", simple);
  h.classList.toggle("lite", lite);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangS] = useState<UILang>("ta");
  const [dark, setDark] = useState(false);
  const [content, setContentS] = useState<ContentLang>("all");
  const [view, setViewS] = useState<ViewMode>("feed");
  const [saved, setSaved] = useState<Record<string, Article>>({});
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [textSize, setTS] = useState<TextSize>("m");
  const [simple, setSimpleS] = useState(false);
  const [lite, setLiteS] = useState(false);
  const [follows, setFollowsS] = useState<Follows>(EMPTY_F);
  const [hidden, setHidden] = useState<Hidden>({ ids: [], sources: [] });
  const [read, setRead] = useState<Record<string, ReadRec>>({});
  const [prevVisit, setPrev] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [onboarded, setOnb] = useState(true);
  const [offMods, setOffMods] = useState<Module[]>([]);
  const [town, setTownS] = useState("chennai");
  const [hideRead, setHideReadS] = useState(false);
  const [ready, setReady] = useState(false);
  const days = useRef<string[]>([]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLangS((localStorage.getItem("ns-lang") as UILang) || "ta");
    setDark(document.documentElement.classList.contains("dark"));
    setContentS(load<ContentLang>("ns-content", "all"));
    setViewS(load<ViewMode>("ns-view", "feed"));
    setSaved(load("ns-saved", {}));
    setReactions(load("ns-reactions", {}));
    const ts = load<TextSize>("ns-size", "m"), si = load("ns-simple", false), li = load("ns-lite", false);
    setTS(ts); setSimpleS(si); setLiteS(li); applyHtml(ts, si, li);
    setFollowsS({ ...EMPTY_F, ...load<Follows>("ns-follows", EMPTY_F) });
    setHidden(load("ns-hidden", { ids: [], sources: [] }));
    setRead(load("ns-read", {}));
    setOnb(load("ns-onboarded", false));
    const om = load<Module[]>("ns-mods", []); setOffMods(om); applyMods(om);
    setTownS(localStorage.getItem("ns-city") || "chennai");
    setHideReadS(load("ns-hideread", false));
    // Visits: "since your last visit" uses the previous session start (a session = 30 min gap).
    const now = Date.now();
    const v = load<{ last: number; prev: number | null }>("ns-visit", { last: 0, prev: null });
    const prev = now - v.last > 30 * 60_000 ? (v.last || null) : v.prev;
    setPrev(prev);
    store("ns-visit", { last: now, prev });
    // Daily streak (IST calendar days).
    const ds = new Set(load<string[]>("ns-days", []));
    ds.add(istDay(now));
    const list = [...ds].sort().slice(-60);
    days.current = list; store("ns-days", list);
    let s = 0;
    for (let d = now; ds.has(istDay(d)); d -= 86400_000) s++;
    setStreak(s);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // Offline support: register the service worker in production.
    if ("serviceWorker" in navigator && location.hostname !== "localhost") navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const setLang = useCallback((l: UILang) => { setLangS(l); localStorage.setItem("ns-lang", l); document.documentElement.lang = l; }, []);
  const toggleDark = useCallback(() => { toggleDarkTheme(); }, []);
  // Keep `dark` in sync with whatever theme is applied (header picker, Settings, shortcuts, other tabs).
  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    window.addEventListener("ns:appearance", sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener("ns:appearance", sync); window.removeEventListener("storage", sync); };
  }, []);
  const setContent = useCallback((c: ContentLang) => { setContentS(c); store("ns-content", c); }, []);
  const setView = useCallback((v: ViewMode) => { setViewS(v); store("ns-view", v); }, []);
  const toggleSave = useCallback((a: Article) => setSaved((s) => { const n = { ...s }; if (n[a.id]) delete n[a.id]; else n[a.id] = { ...a, cluster: undefined, savedAt: new Date().toISOString() } as Article; store("ns-saved", n); return n; }), []);
  const react = useCallback((id: string, e: string) => setReactions((r) => { const n = { ...r }; if (n[id] === e) delete n[id]; else n[id] = e; store("ns-reactions", n); return n; }), []);
  const setTextSize = useCallback((t: TextSize) => { setTS(t); store("ns-size", t); applyHtml(t, document.documentElement.classList.contains("simple"), document.documentElement.classList.contains("lite")); }, []);
  const setSimple = useCallback((b: boolean) => { setSimpleS(b); store("ns-simple", b); document.documentElement.classList.toggle("simple", b); }, []);
  const setLite = useCallback((b: boolean) => { setLiteS(b); store("ns-lite", b); document.documentElement.classList.toggle("lite", b); }, []);
  const setFollows = useCallback((f: Follows) => { setFollowsS(f); store("ns-follows", f); }, []);
  const toggleFollow = useCallback((k: keyof Follows, v: string) => setFollowsS((f) => { const cur = f[k]; const n = { ...f, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }; store("ns-follows", n); return n; }), []);
  const hide = useCallback((k: keyof Hidden, v: string) => setHidden((h) => { const n = { ...h, [k]: [...new Set([...h[k], v])].slice(-300) }; store("ns-hidden", n); return n; }), []);
  const unhide = useCallback((k: keyof Hidden, v: string) => setHidden((h) => { const n = { ...h, [k]: h[k].filter((x) => x !== v) }; store("ns-hidden", n); return n; }), []);
  const markRead = useCallback((a: Article) => setRead((r) => {
    const n = { ...r, [a.id]: { t: Date.now(), topics: a.topics, districts: a.districts, states: a.states, source: a.source, lang: a.lang, section: a.section } };
    const keys = Object.keys(n);
    if (keys.length > 400) for (const k of keys.sort((x, y) => n[x].t - n[y].t).slice(0, keys.length - 400)) delete n[k];
    store("ns-read", n); return n;
  }), []);
  const setOnboarded = useCallback(() => { setOnb(true); store("ns-onboarded", true); }, []);
  const toggleMod = useCallback((m: Module) => setOffMods((o) => { const n = o.includes(m) ? o.filter((x) => x !== m) : [...o, m]; store("ns-mods", n); applyMods(n); return n; }), []);
  const setTown = useCallback((slug: string) => { setTownS(slug); try { localStorage.setItem("ns-city", slug); } catch {} window.dispatchEvent(new Event("ns:town")); }, []);
  const setHideRead = useCallback((b: boolean) => { setHideReadS(b); store("ns-hideread", b); }, []);
  const isHidden = useCallback((a: Article) => hidden.ids.includes(a.id) || hidden.sources.includes(a.source), [hidden]);
  const today = istDay();
  const readToday = Object.values(read).filter((r) => istDay(r.t) === today).length;

  return (
    <Ctx.Provider value={{ lang, setLang, dark, toggleDark, content, setContent, view, setView, saved, toggleSave, reactions, react, textSize, setTextSize, simple, setSimple, lite, setLite, follows, toggleFollow, setFollows, hidden, hide, unhide, read, markRead, prevVisit, streak, readToday, onboarded, setOnboarded, isHidden, offMods, toggleMod, town, setTown, hideRead, setHideRead, ready }}>
      {children}
    </Ctx.Provider>
  );
}

/** Bilingual text: <L ta="..." en="..." /> */
export function L({ ta, en }: { ta: string; en: string }) {
  const { lang } = usePrefs();
  return <>{lang === "ta" ? ta : en}</>;
}

/** Outbound link to the publisher that also records the story in local reading history. */
export function ALink({ a, className, children, title, ...rest }: { a: Article; className?: string; children: React.ReactNode; title?: string; "data-thumb"?: boolean }) {
  const { markRead, read } = usePrefs();
  return (
    <a href={a.link} target="_blank" rel="noopener noreferrer" className={className} title={title} data-thumb={rest["data-thumb"] ? "" : undefined} data-read={read[a.id] ? "" : undefined} onClick={() => markRead(a)} onAuxClick={() => markRead(a)}>
      {children}
    </a>
  );
}
