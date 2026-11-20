"use client";
import { useState as useStateCompat, useSyncExternalStore } from "react";
import { THEMES, type ThemeId, type Density, type CardStyle, type Thumbs, type FontStyle } from "@/lib/themes";

/** Appearance prefs (device-only). The pre-paint script in layout applies them before first paint; these keep them in sync after. */
export type Appearance = { theme: ThemeId; density: Density; cards: CardStyle; thumbs: Thumbs; font: FontStyle };
const EVT = "ns:appearance";
const DEF: Appearance = { theme: "kumkum", density: "comfortable", cards: "standard", thumbs: "full", font: "sans" };
const raw = (k: string) => { try { const v = localStorage.getItem(k); if (v == null) return null; try { return JSON.parse(v); } catch { return v; } } catch { return null; } };

let snap: Appearance = DEF; let sig = "";
function read(): Appearance {
  if (typeof document === "undefined") return DEF;
  const theme = (document.documentElement.getAttribute("data-theme") as ThemeId) || "kumkum";
  const font = (raw("ns-font") as FontStyle) || (raw("ns-readable") ? "atkinson" : "sans");
  const n: Appearance = { theme, density: (raw("ns-density") as Density) || "comfortable", cards: (raw("ns-cards") as CardStyle) || "standard", thumbs: (raw("ns-thumbs") as Thumbs) || "full", font };
  const s = JSON.stringify(n);
  if (s !== sig) { sig = s; snap = n; }
  return snap;
}
function sub(cb: () => void) { window.addEventListener(EVT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); }; }
export const useAppearance = () => useSyncExternalStore(sub, read, () => DEF);

export function applyTheme(id: ThemeId) {
  const t = THEMES.find((x) => x.id === id) ?? THEMES[0];
  const d = document.documentElement;
  d.setAttribute("data-theme", t.id);
  d.classList.toggle("dark", t.dark);
  d.style.colorScheme = t.dark ? "dark" : "light";
  document.querySelectorAll("meta[name=theme-color]").forEach((m) => { m.setAttribute("content", t.meta); m.removeAttribute("media"); });
}
export function setTheme(id: ThemeId) {
  const t = THEMES.find((x) => x.id === id); if (!t) return;
  try { localStorage.setItem("ns-theme", id); localStorage.setItem(t.dark ? "ns-theme-dark" : "ns-theme-light", id); } catch {}
  applyTheme(id);
  window.dispatchEvent(new Event(EVT));
}
/** Dark-mode shortcut: flips between the reader's last light and last dark theme. */
export function toggleDarkTheme() {
  const cur = THEMES.find((x) => x.id === document.documentElement.getAttribute("data-theme"));
  const back = cur?.dark ? (localStorage.getItem("ns-theme-light") as ThemeId) || "kumkum" : (localStorage.getItem("ns-theme-dark") as ThemeId) || "midnight";
  setTheme(back);
}
export function setAppearance<K extends Exclude<keyof Appearance, "theme">>(k: K, v: Appearance[K]) {
  const d = document.documentElement;
  const key = { density: "ns-density", cards: "ns-cards", thumbs: "ns-thumbs", font: "ns-font" }[k];
  try { localStorage.setItem(key, JSON.stringify(v)); if (k === "font") localStorage.setItem("ns-readable", JSON.stringify(v === "atkinson")); } catch {}
  if (k === "density") { d.classList.remove("dn-compact", "dn-spacious"); if (v !== "comfortable") d.classList.add(`dn-${v}`); }
  if (k === "cards") { d.classList.remove("cs-list", "cs-magazine"); if (v !== "standard") d.classList.add(`cs-${v}`); }
  if (k === "thumbs") { d.classList.remove("th-small", "th-none"); if (v !== "full") d.classList.add(`th-${v}`); }
  if (k === "font") { d.classList.toggle("ff-serif", v === "serif"); d.classList.toggle("readable", v === "atkinson"); }
  window.dispatchEvent(new Event(EVT));
}
export function resetAppearance() {
  for (const k of ["ns-theme", "ns-theme-light", "ns-theme-dark", "ns-density", "ns-cards", "ns-thumbs", "ns-font", "ns-readable"]) try { localStorage.removeItem(k); } catch {}
  const d = document.documentElement;
  d.classList.remove("dn-compact", "dn-spacious", "cs-list", "cs-magazine", "th-small", "th-none", "ff-serif", "readable");
  applyTheme(matchMedia("(prefers-color-scheme: dark)").matches ? "midnight" : "kumkum");
  window.dispatchEvent(new Event(EVT));
}
export const isDarkTheme = (id: string) => !!THEMES.find((t) => t.id === id)?.dark;

/** Swatch grid — used in Settings and the header popover. */
export function ThemeSwatches({ ta, compact = false, onPick }: { ta: boolean; compact?: boolean; onPick?: () => void }) {
  const { theme } = useAppearance();
  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`} role="radiogroup" aria-label={ta ? "தீம்" : "Theme"}>
      {THEMES.map((t) => {
        const on = theme === t.id;
        return (
          <button key={t.id} role="radio" aria-checked={on} data-theme-pick={t.id} onClick={() => { setTheme(t.id); onPick?.(); }}
            className={`overflow-hidden rounded-xl border-2 text-left transition hover:-translate-y-0.5 ${on ? "border-kumkum-600 ring-2 ring-kumkum-600/30" : "border-ink-100 dark:border-white/15"}`}>
            <span className="block p-2" style={{ background: t.sw[0] }}>
              <span className="block rounded-md p-1.5 shadow-sm" style={{ background: t.sw[1], border: `1px solid ${t.sw[3]}22` }}>
                <span className="block h-1.5 w-8 rounded-full" style={{ background: t.sw[2] }} />
                <span className="mt-1 block h-1 w-full rounded-full opacity-80" style={{ background: t.sw[3] }} />
                <span className="mt-0.5 block h-1 w-2/3 rounded-full opacity-50" style={{ background: t.sw[3] }} />
              </span>
            </span>
            <span className="flex items-center justify-between gap-1 bg-white px-2 py-1 text-[11.5px] font-bold leading-tight dark:bg-ink-900">{ta ? t.ta : t.en}{on && <span aria-hidden>✓</span>}</span>
          </button>
        );
      })}
    </div>
  );
}

function Seg<T extends string>({ value, opts, onChange, label }: { value: T; opts: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="flex flex-wrap rounded-full border border-ink-100 p-0.5 dark:border-white/10" role="radiogroup" aria-label={label}>
      {opts.map((o) => <button key={o.v} role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)} className={`rounded-full px-2.5 py-1 text-xs font-bold ${value === o.v ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : ""}`}>{o.l}</button>)}
    </div>
  );
}

/** Settings → Theme & appearance. */
export function AppearanceSettings({ ta, row, view, setView }: { ta: boolean; row: string; view: "feed" | "cards"; setView: (v: "feed" | "cards") => void }) {
  const a = useAppearance();
  const L = (t: string, e: string) => (ta ? t : e);
  return (
    <section className="border-b border-ink-100 py-3 dark:border-white/10" aria-label={L("தீம் & தோற்றம்", "Theme & appearance")}>
      <div className="mb-2 flex items-center justify-between"><b>🎨 {L("தீம் & தோற்றம்", "Theme & appearance")}</b>
        <button onClick={() => { resetAppearance(); setView("feed"); }} className="rounded-full border border-ink-100 px-2.5 py-1 text-xs font-bold dark:border-white/10">↺ {L("இயல்புநிலைக்கு", "Reset appearance")}</button>
      </div>
      <ThemeSwatches ta={ta} />
      <div className={row}><div><b className="text-sm">{L("அடர்த்தி", "Layout density")}</b></div>
        <Seg label="Density" value={a.density} onChange={(v) => setAppearance("density", v)} opts={[{ v: "compact", l: L("நெருக்கம்", "Compact") }, { v: "comfortable", l: L("வசதி", "Comfortable") }, { v: "spacious", l: L("விசாலம்", "Spacious") }]} /></div>
      <div className={row}><div><b className="text-sm">{L("செய்தி அட்டை வடிவம்", "Feed card style")}</b></div>
        <Seg label="Card style" value={a.cards} onChange={(v) => setAppearance("cards", v)} opts={[{ v: "standard", l: L("அட்டைகள்", "Cards") }, { v: "list", l: L("பட்டியல்", "List") }, { v: "magazine", l: L("இதழ்", "Magazine") }]} /></div>
      <div className={row}><div><b className="text-sm">{L("படங்கள்", "Thumbnails")}</b></div>
        <Seg label="Thumbnails" value={a.thumbs} onChange={(v) => setAppearance("thumbs", v)} opts={[{ v: "full", l: L("முழு", "Full") }, { v: "small", l: L("சிறிய", "Small") }, { v: "none", l: L("உரை மட்டும்", "Text only") }]} /></div>
      <div className={row}><div><b className="text-sm">{L("எழுத்துரு", "Font style")}</b><p className="text-[11px] opacity-70">{L("Atkinson — டிஸ்லெக்சியாவுக்கு ஏற்றது", "Atkinson is dyslexia-friendly")}</p></div>
        <Seg label="Font" value={a.font} onChange={(v) => setAppearance("font", v)} opts={[{ v: "sans", l: L("தமிழ் சான்ஸ்", "Tamil Sans") }, { v: "serif", l: L("செரிஃப்", "Serif") }, { v: "atkinson", l: "Atkinson" }]} /></div>
      <div className={`${row} border-b-0`}><div><b className="text-sm">{L("முகப்பு தொடக்கக் காட்சி", "Default home view")}</b></div>
        <Seg label="Home view" value={view} onChange={setView} opts={[{ v: "feed", l: L("செய்தி ஓடை", "Classic feed") }, { v: "cards", l: L("ஸ்வைப் அட்டைகள்", "Swipe cards") }]} /></div>
    </section>
  );
}

/** Header 🎨 button with a quick theme popover. */
export function ThemeButton({ ta }: { ta: boolean }) {
  const [open, setOpen] = useStateCompat(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="dialog" aria-label={ta ? "தீம் மாற்று" : "Change theme"} title={ta ? "தீம்" : "Theme"} className="grid h-9 w-9 place-items-center rounded-full text-lg transition hover:bg-ink-100 dark:hover:bg-white/10">🎨</button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div role="dialog" aria-label={ta ? "தீம் தேர்வு" : "Choose a theme"} className="fade-up fixed right-2 top-14 z-50 w-[min(22rem,calc(100vw-1rem))] rounded-2xl border border-ink-100 bg-white p-3 shadow-2xl sm:absolute sm:right-0 sm:top-11 dark:border-white/10 dark:bg-ink-900">
            <div className="mb-2 flex items-center justify-between"><b className="text-sm">🎨 {ta ? "தீம்" : "Theme"}</b>
              <button onClick={() => { setOpen(false); window.dispatchEvent(new Event("ns:settings")); }} className="text-xs font-bold text-kumkum-600 underline dark:text-manjal-400">{ta ? "மேலும் தோற்ற அமைப்புகள்" : "More appearance options"}</button></div>
            <ThemeSwatches ta={ta} compact />
          </div>
        </>
      )}
    </div>
  );
}
