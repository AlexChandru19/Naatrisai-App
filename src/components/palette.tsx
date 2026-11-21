"use client";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./search-icon";
import { useEffect, useMemo, useRef, useState } from "react";
import { DISTRICTS, STATES } from "@/lib/geo";
import { TOPICS } from "@/lib/topics";
import { THEMES } from "@/lib/themes";
import { usePrefs } from "./providers";
import { setTheme } from "./appearance";
import { NAV, MORE } from "./header";
import { MARKET_TABS } from "./stocks-ui";

type Item = { id: string; group: string; label: string; sub?: string; icon: string; keys: string; run: () => void };
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

/** Ctrl/⌘+K launcher: pages, 38 districts, 36 states/UTs, topics, NIFTY 50 stocks, themes and quick actions. */
export function CommandPalette() {
  const { lang, setLang } = usePrefs(); const ta = lang === "ta";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(""); const [i, setI] = useState(0);
  const [stocks, setStocks] = useState<{ sym: string; name: string }[]>([]);
  const input = useRef<HTMLInputElement>(null); const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); } };
    const o = () => setOpen(true);
    window.addEventListener("keydown", k); window.addEventListener("ns:palette", o);
    return () => { window.removeEventListener("keydown", k); window.removeEventListener("ns:palette", o); };
  }, []);
  useEffect(() => {
    if (!open) return;
    setTimeout(() => input.current?.focus(), 30);
    if (!stocks.length) fetch("/api/market/list").then((r) => r.json()).then((j) => Array.isArray(j) && setStocks(j)).catch(() => {});
  }, [open, stocks.length]);
  const go = (href: string) => () => router.push(href);
  const L = (t: string, e: string) => (ta ? t : e);
  const items = useMemo<Item[]>(() => {
    const pages = [...NAV, ...MORE, ...MARKET_TABS.filter((m) => m.href !== "/markets"), { href: "/exam-digest", ta: "TNPSC/UPSC நடப்பு நிகழ்வுகள்", en: "Exam current affairs", icon: "📚" }, { href: "/watchwords", ta: "கண்காணிப்புச் சொற்கள்", en: "My watchwords", icon: "🔔" }];
    const seen = new Set<string>();
    return [
      ...pages.filter((p) => (seen.has(p.href) ? false : (seen.add(p.href), true))).map((p) => ({ id: `p:${p.href}`, group: L("பக்கங்கள்", "Pages"), label: ta ? p.ta : p.en, sub: p.href, icon: p.icon, keys: `${p.ta} ${p.en} ${p.href}`, run: go(p.href) })),
      ...DISTRICTS.map((d) => ({ id: `d:${d.slug}`, group: L("மாவட்டங்கள்", "Districts"), label: ta ? d.ta : d.en, sub: ta ? d.en : d.ta, icon: "📍", keys: `${d.ta} ${d.en} ${d.alt.join(" ")}`, run: go(`/tamilnadu/${d.slug}`) })),
      ...STATES.map((s) => ({ id: `s:${s.slug}`, group: L("மாநிலங்கள் / யூனியன் பிரதேசங்கள்", "States & UTs"), label: ta ? s.ta : s.en, sub: s.abbr, icon: "🗺️", keys: `${s.ta} ${s.en} ${s.abbr} ${s.alt.join(" ")}`, run: go(`/india/${s.slug}`) })),
      ...TOPICS.map((t) => ({ id: `t:${t.slug}`, group: L("தலைப்புகள்", "Topics"), label: ta ? t.ta : t.en, icon: t.emoji, keys: `${t.ta} ${t.en}`, run: go(`/topic/${t.slug}`) })),
      ...stocks.map((s) => ({ id: `k:${s.sym}`, group: L("நிஃப்டி 50 பங்குகள்", "NIFTY 50 stocks"), label: s.sym, sub: s.name, icon: "📈", keys: `${s.sym} ${s.name}`, run: go(`/markets/stock/${encodeURIComponent(s.sym)}`) })),
      ...THEMES.map((t) => ({ id: `th:${t.id}`, group: L("தீம்கள்", "Themes"), label: `${L("தீம்", "Theme")}: ${ta ? t.ta : t.en}`, icon: "🎨", keys: `theme தீம் ${t.ta} ${t.en} ${t.dark ? "dark இருண்ட" : "light"}`, run: () => setTheme(t.id) })),
      { id: "a:lang", group: L("செயல்கள்", "Actions"), label: ta ? "Switch to English" : "தமிழுக்கு மாறு", icon: "🔤", keys: "language மொழி english tamil தமிழ்", run: () => setLang(ta ? "en" : "ta") },
      { id: "a:settings", group: L("செயல்கள்", "Actions"), label: L("அமைப்புகள்", "Settings"), icon: "⚙️", keys: "settings அமைப்புகள் preferences", run: () => window.dispatchEvent(new Event("ns:settings")) },
      { id: "a:keys", group: L("செயல்கள்", "Actions"), label: L("விசைக் குறுக்குவழிகள்", "Keyboard shortcuts"), icon: "⌨️", keys: "keyboard shortcuts help", run: () => window.dispatchEvent(new Event("ns:shortcuts")) },
    ];
  }, [ta, stocks]); // eslint-disable-line react-hooks/exhaustive-deps
  const k = norm(q.trim());
  const hits = useMemo(() => {
    if (!k) return items.filter((x) => x.id.startsWith("p:") || x.id.startsWith("th:")).slice(0, 40);
    const score = (x: Item) => { const l = norm(x.label), ks = norm(x.keys); return l.startsWith(k) ? 0 : l.includes(k) ? 1 : ks.includes(k) ? 2 : 9; };
    return items.map((x) => [x, score(x)] as const).filter(([, s]) => s < 9).sort((a, b) => a[1] - b[1]).slice(0, 40).map(([x]) => x);
  }, [items, k]);
  const all: Item[] = k ? [...hits, { id: "q:search", group: L("தேடல்", "Search"), label: ta ? `“${q.trim()}” செய்திகளில் தேடு` : `Search news for “${q.trim()}”`, icon: "🔍", keys: "", run: go(`/search?q=${encodeURIComponent(q.trim())}`) }, ...(/^[a-z&-]{2,15}$/i.test(q.trim()) ? [{ id: "q:stock", group: L("தேடல்", "Search"), label: ta ? `NSE பங்கு: ${q.trim().toUpperCase()}` : `Open NSE stock ${q.trim().toUpperCase()}`, icon: "📈", keys: "", run: go(`/markets/stock/${encodeURIComponent(q.trim().toUpperCase())}`) }] : [])] : hits;
  const sel = Math.min(i, all.length - 1);
  const pick = (x?: Item) => { if (!x) return; setOpen(false); setQ(""); setI(0); x.run(); };
  useEffect(() => { listRef.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" }); }, [sel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/45 p-3 pt-[10vh] backdrop-blur-[2px]" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={ta ? "கட்டளைத் தட்டு" : "Command palette"}>
      <div onClick={(e) => e.stopPropagation()} className="fade-up w-full max-w-xl overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-2xl dark:border-white/10 dark:bg-ink-900">
        <div className="flex items-center gap-2 border-b border-ink-100 px-4 dark:border-white/10">
          <SearchIcon className="h-5 w-5 shrink-0 opacity-60" />
          <input ref={input} autoFocus value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} role="combobox" aria-expanded="true" aria-controls="cp-list" aria-activedescendant={all[sel] ? `cp-${sel}` : undefined}
            onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(all.length - 1, x + 1)); } else if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(0, x - 1)); } else if (e.key === "Enter") { e.preventDefault(); pick(all[sel]); } else if (e.key === "Escape") setOpen(false); }}
            placeholder={ta ? "மாவட்டம், மாநிலம், பங்கு, பக்கம், தீம்…" : "District, state, stock, page, theme…"} className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none" aria-label={ta ? "தேடு" : "Search commands"} />
          <kbd className="hidden rounded border border-ink-100 px-1.5 text-[11px] opacity-70 sm:block dark:border-white/15">Esc</kbd>
        </div>
        <ul id="cp-list" ref={listRef} role="listbox" className="max-h-[60vh] overflow-y-auto p-1.5">
          {all.map((x, n) => { const head = n === 0 || all[n - 1].group !== x.group; return (
            <li key={x.id} role="presentation">
              {head && <div className="px-3 pb-1 pt-2 text-[11px] font-extrabold uppercase tracking-wide opacity-70">{x.group}</div>}
              <button id={`cp-${n}`} data-i={n} role="option" aria-selected={n === sel} onMouseEnter={() => setI(n)} onClick={() => pick(x)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${n === sel ? "bg-kumkum-600 text-white" : ""}`}>
                <span aria-hidden className="w-6 text-center">{x.icon}</span><span className="min-w-0 flex-1 truncate font-bold">{x.label}</span>{x.sub && <span className={`truncate text-xs ${n === sel ? "text-white/85" : "opacity-70"}`}>{x.sub}</span>}
              </button>
            </li>); })}
          {!all.length && <li className="p-4 text-sm opacity-70">{ta ? "எதுவும் இல்லை" : "Nothing found"}</li>}
        </ul>
        <div className="flex justify-between border-t border-ink-100 px-4 py-2 text-[11px] opacity-75 dark:border-white/10"><span>↑↓ {ta ? "தேர்வு" : "move"} · Enter {ta ? "திற" : "open"}</span><span>Ctrl/⌘ + K</span></div>
      </div>
    </div>
  );
}
