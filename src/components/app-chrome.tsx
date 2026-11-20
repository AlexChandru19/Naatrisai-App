"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrefs } from "./providers";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Global keyboard shortcuts, help sheet, offline banner and the PWA install chip. */
export function AppChrome() {
  const { lang, toggleDark, setLang } = usePrefs();
  const router = useRouter();
  const [help, setHelp] = useState(false);
  const [offline, setOffline] = useState(false);
  const [bip, setBip] = useState<BIP | null>(null);
  const ta = lang === "ta";

  useEffect(() => {
    const on = () => setOffline(!navigator.onLine);
    on();
    window.addEventListener("online", on); window.addEventListener("offline", on);
    const b = (e: Event) => { e.preventDefault(); setBip(e as BIP); };
    window.addEventListener("beforeinstallprompt", b);
    const h = () => setHelp(true);
    window.addEventListener("ns:shortcuts", h);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", on); window.removeEventListener("beforeinstallprompt", b); window.removeEventListener("ns:shortcuts", h); };
  }, []);

  useEffect(() => {
    let g = false;
    const cards = () => [...document.querySelectorAll<HTMLElement>("[data-card]")].filter((c) => c.offsetParent);
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable) return;
      if (document.querySelector("[data-deck]")) { if (e.key === "j" || e.key === "k") return; }
      const k = e.key;
      if (g) {
        g = false;
        const to: Record<string, string> = { h: "/", f: "/for-you", t: "/tamilnadu", i: "/india", w: "/world", b: "/briefing", l: "/live", s: "/saved" };
        if (to[k]) { e.preventDefault(); router.push(to[k]); }
        return;
      }
      if (k === "g") { g = true; setTimeout(() => (g = false), 1200); return; }
      if (k === "/") { e.preventDefault(); router.push("/search"); return; }
      if (k === "?") { setHelp((h) => !h); return; }
      if (k === "Escape") { setHelp(false); return; }
      if (k === "d") { toggleDark(); return; }
      if (k === "L") { setLang(lang === "ta" ? "en" : "ta"); return; }
      if (k === "," ) { window.dispatchEvent(new Event("ns:settings")); return; }
      if (k === "j" || k === "k") {
        const cs = cards(); if (!cs.length) return;
        e.preventDefault();
        const i = cs.indexOf(document.activeElement as HTMLElement);
        const n = cs[Math.max(0, Math.min(cs.length - 1, i < 0 ? 0 : i + (k === "j" ? 1 : -1)))];
        n.focus({ preventScroll: true }); n.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      const cur = (document.activeElement as HTMLElement)?.closest?.("[data-card]");
      if (!cur) return;
      if (k === "o" || k === "Enter") { (cur.querySelector("a[href^='http']") as HTMLAnchorElement)?.click(); }
      if (k === "s") (cur.querySelector("[data-act=save]") as HTMLButtonElement)?.click();
      if (k === "c") (cur.querySelector("a[href^='/story/']") as HTMLAnchorElement)?.click();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, toggleDark, setLang, lang]);

  const keys: [string, string, string][] = [
    ["j / k", "அடுத்த / முந்தைய செய்தி", "Next / previous story"], ["o", "செய்தியைத் திற", "Open story"], ["s", "சேமி", "Save"], ["c", "முழு கவரேஜ்", "Full coverage"],
    ["/", "தேடல்", "Search"], ["g h · g f · g t · g i · g w", "முகப்பு · உங்களுக்கு · தமிழ்நாடு · இந்தியா · உலகம்", "Home · For You · TN · India · World"],
    ["g b · g l · g s", "சுருக்கம் · நேரலை · சேமித்தவை", "Briefing · Live TV · Saved"], ["d", "இருண்ட பயன்முறை", "Dark mode"], ["Shift+L", "மொழி மாற்று", "Switch language"], [",", "அமைப்புகள்", "Settings"], ["?", "இந்த உதவி", "This help"],
  ];
  return (
    <>
      {offline && <div role="status" className="fixed inset-x-0 top-0 z-[55] bg-ink-900 py-1.5 text-center text-sm font-bold text-white">📴 {ta ? "இணைய இணைப்பு இல்லை — சேமித்த பக்கங்களைக் காட்டுகிறோம்" : "You’re offline — showing saved pages"}</div>}
      {bip && (
        <button onClick={async () => { await bip.prompt(); setBip(null); }} className="fixed bottom-20 right-3 z-40 rounded-full bg-ink-900 px-4 py-2 text-sm font-bold text-white shadow-xl lg:bottom-5 dark:bg-white dark:text-ink-900">
          📲 {ta ? "செயலியாக நிறுவு" : "Install app"}
        </button>
      )}
      {help && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3" onClick={() => setHelp(false)} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <div onClick={(e) => e.stopPropagation()} className="fade-up w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl dark:bg-ink-900">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-extrabold">⌨️ {ta ? "விசைப்பலகைக் குறுக்குவழிகள்" : "Keyboard shortcuts"}</h2><button onClick={() => setHelp(false)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink-100 dark:hover:bg-white/10">✕</button></div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {keys.map(([k, a, b]) => <div key={k} className="contents"><dt><kbd className="rounded-md border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono text-xs dark:border-white/15 dark:bg-white/5">{k}</kbd></dt><dd>{ta ? a : b}</dd></div>)}
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
