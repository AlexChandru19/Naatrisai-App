"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StockQuote, Series, Detail, GlobalQuote } from "@/lib/stocks";
import type { Article } from "@/lib/types";
import { usePrefs } from "./providers";
import { ArticleCard } from "./article-card";
import { useWatchlist } from "./watchlist-store";

import { fmt } from "@/lib/fmt";
export { fmt };
const compact = (n: number) => n >= 1e7 ? `${fmt(n / 1e7, 2)} Cr` : n >= 1e5 ? `${fmt(n / 1e5, 2)} L` : n.toLocaleString("en-IN");
const ist = (t: number, withDate = true) => new Date(t).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", ...(withDate ? { day: "numeric", month: "short" } : {}), hour: "numeric", minute: "2-digit" });
const istDay = (t: number) => new Date(t).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "2-digit" });
const card = "rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900";
const T = ({ ta, en }: { ta: string; en: string }) => { const { lang } = usePrefs(); return <>{lang === "ta" ? ta : en}</>; };
const up = (v: number) => (v >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400");
export const Pct = ({ v, className = "" }: { v: number; className?: string }) => <span className={`font-bold tabular-nums ${up(v)} ${className}`}>{v >= 0 ? "▲" : "▼"} {fmt(Math.abs(v))}%</span>;

// ------------------------------------------------------------ Tabs across the markets section
export const MARKET_TABS = [
  { href: "/markets", ta: "கண்ணோட்டம்", en: "Overview", icon: "💹" },
  { href: "/markets/news", ta: "சந்தைச் செய்திகள்", en: "Market news", icon: "📰" },
  { href: "/markets/nifty50", ta: "நிஃப்டி 50 & ஹீட்மேப்", en: "NIFTY 50 & heatmap", icon: "🟩" },
  { href: "/markets/sector/it", ta: "துறைகள்", en: "Sectors", icon: "🏭", match: "/markets/sector" },
  { href: "/markets/watchlist", ta: "என் கண்காணிப்பு", en: "My watchlist", icon: "⭐" },
  { href: "/markets/mutual-funds", ta: "மியூச்சுவல் ஃபண்ட்", en: "Mutual funds", icon: "🏦" },
  { href: "/markets/ipo", ta: "IPO & முடிவுகள்", en: "IPOs & results", icon: "🗓️" },
  { href: "/markets/mandi", ta: "மண்டி விலைகள்", en: "Mandi prices", icon: "🌾" },
  { href: "/markets/calculators", ta: "கணிப்பான்கள்", en: "Calculators", icon: "🧮" },
];
export function MarketsNav() {
  const path = usePathname() || "";
  const { lang } = usePrefs();
  return (
    <nav aria-label={lang === "ta" ? "சந்தைப் பிரிவுகள்" : "Markets sections"} className="no-scrollbar -mx-3 mt-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
      {MARKET_TABS.map((t) => {
        const on = t.match ? path.startsWith(t.match) : t.href === "/markets" ? path === "/markets" : path.startsWith(t.href);
        return <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined} className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold transition ${on ? "bg-kumkum-600 text-white shadow" : "border border-ink-100 bg-white hover:bg-kumkum-50 dark:border-white/10 dark:bg-ink-900 dark:hover:bg-white/10"}`}><span aria-hidden>{t.icon}</span> {lang === "ta" ? t.ta : t.en}</Link>;
      })}
    </nav>
  );
}

// ------------------------------------------------------------ Watchlist pin
export function WatchButton({ sym, size = "md" }: { sym: string; size?: "sm" | "md" }) {
  const { has, toggle } = useWatchlist(); const { lang } = usePrefs(); const on = has(sym);
  const label = on ? (lang === "ta" ? "கண்காணிப்பிலிருந்து நீக்கு" : "Remove from watchlist") : (lang === "ta" ? "கண்காணிப்பில் சேர்" : "Pin to my watchlist");
  if (size === "sm") return <button data-watch={sym} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(sym); }} aria-pressed={on} aria-label={`${label}: ${sym}`} title={label} className={`grid h-8 w-8 place-items-center rounded-full text-base ${on ? "text-manjal-500" : "opacity-60 hover:opacity-100"}`}>{on ? "★" : "☆"}</button>;
  return <button data-watch={sym} onClick={() => toggle(sym)} aria-pressed={on} className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm transition active:scale-95 ${on ? "bg-manjal-400 text-ink-900" : "border border-ink-100 bg-white dark:border-white/10 dark:bg-ink-800"}`}>{on ? "★" : "☆"} {label}</button>;
}

// ------------------------------------------------------------ Chart
const RANGE_L: { k: string; ta: string; en: string }[] = [{ k: "1d", ta: "1 நா", en: "1D" }, { k: "5d", ta: "5 நா", en: "5D" }, { k: "1mo", ta: "1 மா", en: "1M" }, { k: "3mo", ta: "3 மா", en: "3M" }, { k: "6mo", ta: "6 மா", en: "6M" }, { k: "1y", ta: "1 ஆ", en: "1Y" }];
export function StockChart({ sym, initial }: { sym: string; initial: Series }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [range, setRange] = useState("1d");
  const [cache, setCache] = useState<Record<string, Series>>({ "1d": initial });
  const [err, setErr] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (cache[range]) return;
    let off = false;
    fetch(`/api/market/chart?s=${encodeURIComponent(sym)}&r=${range}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((j: Series) => { if (!off) { setCache((c) => ({ ...c, [range]: j })); setErr(false); } }).catch(() => { if (!off) setErr(true); });
    return () => { off = true; };
  }, [range, sym, cache]);
  const s = cache[range];
  const W = 720, H = 260, P = 8;
  const geo = useMemo(() => {
    if (!s || s.c.length < 2) return null;
    const base = range === "1d" && s.prev ? s.prev : s.c[0];
    const vals = range === "1d" && s.prev ? [...s.c, s.prev] : s.c;
    const min = Math.min(...vals), max = Math.max(...vals), r = max - min || 1;
    const x = (i: number) => P + (i / (s.c.length - 1)) * (W - 2 * P);
    const y = (v: number) => P + (1 - (v - min) / r) * (H - 2 * P);
    const d = s.c.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
    const last = s.c[s.c.length - 1];
    return { d, x, y, min, max, base, last, upish: last >= base, area: `${d}L${x(s.c.length - 1)},${H - P}L${x(0)},${H - P}Z` };
  }, [s, range]);
  const onMove = (e: React.PointerEvent) => {
    if (!s || !svg.current) return;
    const b = svg.current.getBoundingClientRect();
    const i = Math.round(((e.clientX - b.left) / b.width) * (s.c.length - 1));
    setHover(Math.max(0, Math.min(s.c.length - 1, i)));
  };
  const hi = hover !== null && s ? hover : null;
  const col = geo?.upish ? "#15803d" : "#b91c1c";
  const chg = geo ? ((geo.last - geo.base) / geo.base) * 100 : 0;
  return (
    <section className={card} aria-label={ta ? "விலை வரைபடம்" : "Price chart"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label={ta ? "காலம்" : "Timeframe"} className="flex flex-wrap gap-1">
          {RANGE_L.map((r) => <button key={r.k} role="tab" aria-selected={range === r.k} data-range={r.k} onClick={() => { setRange(r.k); setHover(null); }} className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${range === r.k ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "border border-ink-100 dark:border-white/10"}`}>{ta ? r.ta : r.en}</button>)}
        </div>
        <div data-readout className="text-right text-sm tabular-nums" aria-live="polite">
          {s && hi !== null ? <><b>₹{fmt(s.c[hi])}</b> <span className="text-xs opacity-75">{range === "1d" || range === "5d" ? ist(s.t[hi]) : istDay(s.t[hi])} IST</span></> : geo ? <><b>₹{fmt(geo.last)}</b> <Pct v={chg} className="text-xs" /> <span className="text-xs opacity-70">{RANGE_L.find((r) => r.k === range)?.[ta ? "ta" : "en"]}</span></> : null}
        </div>
      </div>
      <div className="relative mt-3">
        {geo && s ? (
          <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="h-56 w-full touch-none select-none sm:h-64" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label={`${sym} ${ta ? "விலை" : "price"} ${RANGE_L.find((r) => r.k === range)?.en}: ₹${fmt(geo.min)} – ₹${fmt(geo.max)}`}>
            <defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={col} stopOpacity="0.22" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient></defs>
            <path d={geo.area} fill="url(#cg)" />
            {range === "1d" && s.prev && <line x1={P} x2={W - P} y1={geo.y(s.prev)} y2={geo.y(s.prev)} stroke="currentColor" strokeOpacity="0.4" strokeDasharray="4 4" />}
            <path d={geo.d} fill="none" stroke={col} strokeWidth="2.2" strokeLinejoin="round" />
            {hi !== null && <><line x1={geo.x(hi)} x2={geo.x(hi)} y1={P} y2={H - P} stroke="currentColor" strokeOpacity="0.35" /><circle cx={geo.x(hi)} cy={geo.y(s.c[hi])} r="5" fill={col} stroke="white" strokeWidth="2" /></>}
          </svg>
        ) : <div className="grid h-56 place-items-center text-sm opacity-70">{err ? <T ta="வரைபடத் தரவு கிடைக்கவில்லை" en="Chart data unavailable" /> : <T ta="ஏற்றுகிறது…" en="Loading…" />}</div>}
        {geo && <div className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-between py-1 text-[10px] font-bold tabular-nums opacity-70"><span>{fmt(geo.max)}</span><span>{fmt(geo.min)}</span></div>}
      </div>
      <p className="mt-2 text-[11px] opacity-70">{range === "1d" && <><T ta="கோடிட்ட வரி = முந்தைய முடிவு · " en="Dashed line = previous close · " /></>}<T ta="தொட்டு/சுட்டியை நகர்த்தி விலையைப் பாருங்கள் · தரவு: Yahoo Finance (தாமதம்)" en="Hover or drag to read prices · data: Yahoo Finance (delayed)" /></p>
    </section>
  );
}

// ------------------------------------------------------------ Quote stats (only fields Yahoo returned)
export function StatGrid({ d }: { d: Detail }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const rows: [string, string, number | undefined, "p" | "v"][] = [
    ["திறப்பு", "Open", d.open, "p"], ["முந்தைய முடிவு", "Prev. close", d.prev || undefined, "p"], ["நாள் உச்சம்", "Day high", d.high, "p"], ["நாள் குறைவு", "Day low", d.low, "p"],
    ["52 வார உச்சம்", "52-week high", d.hi52, "p"], ["52 வார குறைவு", "52-week low", d.lo52, "p"], ["வர்த்தக அளவு", "Volume", d.volume, "v"],
  ];
  const shown = rows.filter((r) => typeof r[2] === "number" && Number.isFinite(r[2]) && (r[2] as number) > 0);
  const range52 = d.hi52 && d.lo52 && d.hi52 > d.lo52 ? Math.max(0, Math.min(100, ((d.price - d.lo52) / (d.hi52 - d.lo52)) * 100)) : null;
  return (
    <section className={card} aria-label={ta ? "விவரங்கள்" : "Key stats"}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {shown.map(([t, e, v, k]) => <div key={e}><dt className="text-[11px] font-bold opacity-70">{ta ? t : e}</dt><dd className="font-extrabold tabular-nums">{k === "v" ? compact(v!) : `₹${fmt(v!)}`}</dd></div>)}
      </dl>
      {range52 !== null && <div className="mt-3"><div className="mb-1 flex justify-between text-[11px] font-bold opacity-75"><span>52W ↓ ₹{fmt(d.lo52!)}</span><span>52W ↑ ₹{fmt(d.hi52!)}</span></div><div className="relative h-2 rounded-full bg-gradient-to-r from-red-500/60 via-manjal-400/60 to-green-600/60"><span className="absolute -top-1 h-4 w-1.5 rounded bg-ink-900 dark:bg-white" style={{ left: `calc(${range52}% - 3px)` }} aria-label={`${fmt(range52, 0)}%`} /></div></div>}
      <p className="mt-3 text-[11px] opacity-70"><T ta={`Yahoo Finance வழங்கிய புலங்கள் மட்டும் · ${d.exchange} · கடைசி வர்த்தகம் ${ist(d.time)} IST`} en={`Only fields returned by Yahoo Finance · ${d.exchange} · last trade ${ist(d.time)} IST`} /></p>
    </section>
  );
}

// ------------------------------------------------------------ NIFTY 50 screener + heatmap + breadth
export function Breadth({ stocks }: { stocks: { pct: number }[] }) {
  const n = stocks.length; if (!n) return null;
  const a = stocks.filter((s) => s.pct > 0.005).length, dcl = stocks.filter((s) => s.pct < -0.005).length, f = n - a - dcl;
  return (
    <div data-breadth>
      <div className="mb-1 flex justify-between text-xs font-extrabold"><span className="text-green-700 dark:text-green-400">▲ <T ta={`${a} ஏற்றம்`} en={`${a} advances`} /></span>{f > 0 && <span className="opacity-70"><T ta={`${f} மாற்றமில்லை`} en={`${f} unchanged`} /></span>}<span className="text-red-700 dark:text-red-400">▼ <T ta={`${dcl} இறக்கம்`} en={`${dcl} declines`} /></span></div>
      <div className="flex h-3 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10" role="img" aria-label={`Advances ${a}, declines ${dcl}, unchanged ${f}`}><div className="bg-green-600" style={{ width: `${(a / n) * 100}%` }} /><div className="bg-ink-100 dark:bg-white/20" style={{ width: `${(f / n) * 100}%` }} /><div className="bg-red-600" style={{ width: `${(dcl / n) * 100}%` }} /></div>
      <p className="mt-1 text-[11px] opacity-70"><T ta={`ஏற்ற/இறக்க விகிதம் ${dcl ? fmt(a / dcl) : "—"}`} en={`Advance/decline ratio ${dcl ? fmt(a / dcl) : "—"}`} /></p>
    </div>
  );
}
function heat(p: number) {
  const c = Math.min(1, Math.abs(p) / 3);
  // Tile colours chosen so white text stays ≥ 4.5:1 even at the palest step.
  return p >= 0 ? `hsl(142 ${45 + c * 30}% ${30 - c * 10}%)` : `hsl(0 ${55 + c * 25}% ${38 - c * 12}%)`;
}
type SortKey = "pct" | "-pct" | "price" | "name" | "volume";
export function Screener({ stocks, title }: { stocks: StockQuote[]; title?: { ta: string; en: string } }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [q, setQ] = useState(""); const [ind, setInd] = useState(""); const [sort, setSort] = useState<SortKey>("-pct"); const [view, setView] = useState<"heat" | "table">("heat");
  const { has } = useWatchlist();
  const inds = useMemo(() => [...new Set(stocks.map((s) => s.industry).filter(Boolean))].sort(), [stocks]);
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    const l = stocks.filter((s) => (!ind || s.industry === ind) && (!k || s.sym.toLowerCase().includes(k) || s.name.toLowerCase().includes(k)));
    const by: Record<SortKey, (a: StockQuote, b: StockQuote) => number> = { pct: (a, b) => a.pct - b.pct, "-pct": (a, b) => b.pct - a.pct, price: (a, b) => b.price - a.price, name: (a, b) => a.sym.localeCompare(b.sym), volume: (a, b) => (b.volume ?? 0) - (a.volume ?? 0) };
    return [...l].sort(by[sort]);
  }, [stocks, q, ind, sort]);
  const ctl = "rounded-xl border border-ink-100 bg-white px-2.5 py-2 text-sm font-bold dark:border-white/15 dark:bg-ink-800";
  return (
    <section className={card} aria-label={title ? (ta ? title.ta : title.en) : "Screener"}>
      {title && <h2 className="mb-3 text-lg font-extrabold">{ta ? title.ta : title.en} <span className="text-sm font-bold opacity-70">· {list.length}/{stocks.length}</span></h2>}
      <Breadth stocks={list} />
      <div className="mt-3 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={ta ? "பங்கு தேடு (எ.கா. TCS)" : "Search stock (e.g. TCS)"} aria-label={ta ? "பங்கு தேடல்" : "Search stocks"} className={`${ctl} min-w-0 flex-1 font-semibold`} />
        <select value={ind} onChange={(e) => setInd(e.target.value)} aria-label={ta ? "துறை வடிகட்டி" : "Sector filter"} className={ctl}><option value="">{ta ? "எல்லாத் துறைகளும்" : "All sectors"}</option>{inds.map((i) => <option key={i}>{i}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label={ta ? "வரிசைப்படுத்து" : "Sort by"} className={ctl}>
          <option value="-pct">{ta ? "% ஏற்றம் முதலில்" : "% change: high → low"}</option><option value="pct">{ta ? "% இறக்கம் முதலில்" : "% change: low → high"}</option>
          <option value="price">{ta ? "விலை" : "Price"}</option><option value="volume">{ta ? "வர்த்தக அளவு" : "Volume"}</option><option value="name">{ta ? "பெயர் (A–Z)" : "Name (A–Z)"}</option>
        </select>
        <div className="flex rounded-xl border border-ink-100 p-0.5 dark:border-white/15" role="radiogroup" aria-label={ta ? "காட்சி" : "View"}>
          <button role="radio" aria-checked={view === "heat"} onClick={() => setView("heat")} className={`rounded-lg px-3 py-1.5 text-sm font-bold ${view === "heat" ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : ""}`}>🟩 {ta ? "ஹீட்மேப்" : "Heatmap"}</button>
          <button role="radio" aria-checked={view === "table"} onClick={() => setView("table")} className={`rounded-lg px-3 py-1.5 text-sm font-bold ${view === "table" ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : ""}`}>☰ {ta ? "அட்டவணை" : "Table"}</button>
        </div>
      </div>
      {view === "heat" ? (
        <ul data-heatmap className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-5 lg:grid-cols-8">
          {list.map((s) => (
            <li key={s.sym}><Link href={`/markets/stock/${encodeURIComponent(s.sym)}`} title={`${s.name} · ₹${fmt(s.price)} · ${s.pct >= 0 ? "+" : ""}${fmt(s.pct)}%`} className="block rounded-lg p-2 text-white transition hover:scale-[1.04] hover:shadow-lg" style={{ background: heat(s.pct) }}>
              <span className="flex items-center justify-between gap-1 text-[12.5px] font-black">{s.sym}{has(s.sym) && <span aria-label="pinned">★</span>}</span>
              <span className="block text-sm font-extrabold tabular-nums">{s.pct >= 0 ? "+" : ""}{fmt(s.pct)}%</span>
              <span className="block text-[11px] font-semibold tabular-nums">₹{fmt(s.price)}</span>
            </Link></li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead><tr className="border-b border-ink-100 text-left text-xs opacity-80 dark:border-white/10"><th className="py-2 pr-2">{ta ? "பங்கு" : "Stock"}</th><th className="py-2 pr-2 text-right">{ta ? "விலை ₹" : "Price ₹"}</th><th className="py-2 pr-2 text-right">%</th><th className="hidden py-2 pr-2 text-right sm:table-cell">{ta ? "உச்சம் / குறைவு" : "High / low"}</th><th className="py-2 pr-2 text-right">{ta ? "அளவு" : "Volume"}</th><th className="w-8" /></tr></thead>
            <tbody>{list.map((s) => (
              <tr key={s.sym} className="border-b border-ink-100/70 dark:border-white/5">
                <td className="py-2 pr-2"><Link href={`/markets/stock/${encodeURIComponent(s.sym)}`} className="font-extrabold hover:underline">{s.sym}</Link><span className="block max-w-[14rem] truncate text-[11px] opacity-70">{s.name} · {s.industry}</span></td>
                <td className="py-2 pr-2 text-right font-bold tabular-nums">{fmt(s.price)}</td>
                <td className="py-2 pr-2 text-right"><Pct v={s.pct} className="text-xs" /></td>
                <td className="hidden py-2 pr-2 text-right text-xs tabular-nums sm:table-cell">{s.high ? fmt(s.high) : "—"} / {s.low ? fmt(s.low) : "—"}</td>
                <td className="py-2 pr-2 text-right text-xs tabular-nums">{s.volume ? compact(s.volume) : "—"}</td>
                <td><WatchButton sym={s.sym} size="sm" /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {!list.length && <p className="mt-4 text-sm opacity-70"><T ta="பொருந்தும் பங்குகள் இல்லை." en="No matching stocks." /></p>}
      <p className="mt-3 text-[11px] opacity-70"><T ta="நிறம் = இன்றைய % மாற்றம் (முந்தைய முடிவிலிருந்து) · விலைகள்: Yahoo Finance (தாமதம்) · பட்டியல்: Wikipedia (NSE Indices)" en="Colour = today's % change vs previous close · prices: Yahoo Finance (delayed) · constituents: Wikipedia (citing NSE Indices)" /></p>
    </section>
  );
}

// ------------------------------------------------------------ Stock search (NIFTY 100 locally + Yahoo NSE search)
export function StockSearch({ local }: { local: { sym: string; name: string }[] }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [q, setQ] = useState(""); const [remote, setRemote] = useState<{ sym: string; name: string }[]>([]);
  const k = q.trim().toLowerCase();
  const hits = useMemo(() => (k.length < 2 ? [] : local.filter((s) => s.sym.toLowerCase().includes(k) || s.name.toLowerCase().includes(k)).slice(0, 8)), [k, local]);
  useEffect(() => {
    if (k.length < 3) return;
    const t = setTimeout(() => { fetch(`/api/market/search?q=${encodeURIComponent(k)}`).then((r) => r.json()).then((j) => setRemote(Array.isArray(j) ? j : [])).catch(() => {}); }, 350);
    return () => clearTimeout(t);
  }, [k]);
  const all = [...hits, ...(k.length >= 3 ? remote : []).filter((r) => !hits.some((h) => h.sym === r.sym))].slice(0, 10);
  return (
    <div className="relative">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={ta ? "🔎 எந்த NSE பங்கையும் தேடுங்கள் — பெயர் அல்லது குறியீடு" : "🔎 Search any NSE stock — name or symbol"} aria-label={ta ? "NSE பங்கு தேடல்" : "Search NSE stocks"} className="w-full rounded-2xl border border-ink-100 bg-white px-4 py-3 text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-ink-900" />
      {all.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-2xl border border-ink-100 bg-white p-1 shadow-2xl dark:border-white/10 dark:bg-ink-900">
          {all.map((s) => <li key={s.sym}><Link href={`/markets/stock/${encodeURIComponent(s.sym)}`} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm hover:bg-ink-50 dark:hover:bg-white/5"><b>{s.sym}</b><span className="truncate text-xs opacity-75">{s.name}</span></Link></li>)}
        </ul>
      )}
    </div>
  );
}

// ------------------------------------------------------------ Global cues
export function GlobalCues({ g }: { g: GlobalQuote[] }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  if (!g.length) return null;
  return (
    <section className={card} aria-label={ta ? "உலகச் சந்தைகள்" : "Global markets"}>
      <h2 className="text-lg font-extrabold">🌐 <T ta="உலகச் சந்தை நிலவரம்" en="Global market cues" /></h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {g.map((x) => (
          <li key={x.sym} className="rounded-xl border border-ink-100 p-2.5 dark:border-white/10">
            <div className="text-xs font-bold leading-tight"><span aria-hidden>{x.flag}</span> {ta ? x.ta : x.en}</div>
            <div className="text-base font-black tabular-nums">{fmt(x.price)}</div>
            <Pct v={x.pct} className="text-xs" />
            <div className="text-[10px] opacity-70">{ist(x.time)} IST</div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] opacity-70"><T ta="Yahoo Finance · ஒவ்வொரு சந்தையின் கடைசி வர்த்தக நேரம் IST-இல்" en="Yahoo Finance · each market's last trade time shown in IST" /></p>
    </section>
  );
}

// ------------------------------------------------------------ Categorised market news
type Cat = { key: string; ta: string; en: string; emoji: string };
export function MarketNewsView({ articles, cats, initial = "all" }: { articles: (Article & { cats: string[] })[]; cats: Cat[]; initial?: string }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [cat, setCat] = useState(initial); const [q, setQ] = useState(""); const [src, setSrc] = useState(""); const [n, setN] = useState(30);
  const counts = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c.key === "all" ? articles.length : articles.filter((a) => a.cats.includes(c.key)).length])), [articles, cats]);
  const sources = useMemo(() => { const m = new Map<string, number>(); for (const a of articles) m.set(a.source, (m.get(a.source) ?? 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); }, [articles]);
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return articles.filter((a) => (cat === "all" || a.cats.includes(cat)) && (!src || a.source === src) && (!k || `${a.title} ${a.summary}`.toLowerCase().includes(k)));
  }, [articles, cat, q, src]);
  useEffect(() => { const c = new URL(location.href).searchParams.get("cat"); if (c && cats.some((x) => x.key === c)) setCat(c); }, [cats]); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => { const u = new URL(location.href); if (cat === "all") u.searchParams.delete("cat"); else u.searchParams.set("cat", cat); history.replaceState(null, "", u); }, [cat]);
  return (
    <>
      <div role="tablist" aria-label={ta ? "சந்தைச் செய்திப் பிரிவுகள்" : "Market news categories"} className="no-scrollbar -mx-3 mt-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {cats.map((c) => <button key={c.key} role="tab" aria-selected={cat === c.key} data-cat={c.key} onClick={() => { setCat(c.key); setN(30); }} className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold ${cat === c.key ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "border border-ink-100 bg-white dark:border-white/10 dark:bg-ink-900"}`}>{c.emoji} {ta ? c.ta : c.en} <span className="text-xs opacity-75">{counts[c.key]}</span></button>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={ta ? "நிறுவனம் / சொல் தேடு (எ.கா. Infosys, IPO, தங்கம்)" : "Search company or keyword (e.g. Infosys, IPO, gold)"} aria-label={ta ? "சந்தைச் செய்தி தேடல்" : "Search market news"} className="min-w-0 flex-1 rounded-full border border-ink-100 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-ink-900" />
        <select value={src} onChange={(e) => setSrc(e.target.value)} aria-label={ta ? "மூலம்" : "Source"} className="rounded-full border border-ink-100 bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-ink-900"><option value="">{ta ? "எல்லா மூலங்களும்" : "All sources"}</option>{sources.map(([s, c]) => <option key={s} value={s}>{s} ({c})</option>)}</select>
      </div>
      <p className="mt-2 text-xs opacity-75">{ta ? `${list.length} செய்திகள்` : `${list.length} stories`}</p>
      <div data-grid className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">{list.slice(0, n).map((a, i) => <ArticleCard key={a.id} a={a} i={i % 30} />)}</div>
      {list.length > n && <div className="mt-5 text-center"><button onClick={() => setN((x) => x + 30)} className="rounded-full bg-kumkum-600 px-5 py-2 text-sm font-bold text-white">{ta ? "மேலும் காட்டு" : "Show more"}</button></div>}
      {!list.length && <p className="mt-6 rounded-2xl border border-dashed border-ink-100 p-8 text-center text-sm opacity-75 dark:border-white/10"><T ta="இந்தப் பிரிவில் இப்போது செய்திகள் இல்லை." en="No stories in this view right now." /></p>}
    </>
  );
}

// ------------------------------------------------------------ Watchlist page
export function WatchlistView({ suggestions }: { suggestions: { sym: string; name: string }[] }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const { list, remove, toggle } = useWatchlist();
  const [qs, setQs] = useState<StockQuote[] | null>(null);
  const [news, setNews] = useState<Article[] | null>(null);
  const key = list.join(",");
  useEffect(() => {
    if (!key) return;
    let off = false;
    fetch(`/api/market/quotes?s=${encodeURIComponent(key)}`).then((r) => r.json()).then((j) => { if (!off) setQs(Array.isArray(j) ? j : []); }).catch(() => { if (!off) setQs([]); });
    fetch(`/api/market/news?s=${encodeURIComponent(key)}`).then((r) => r.json()).then((j) => { if (!off) setNews(Array.isArray(j) ? j : []); }).catch(() => { if (!off) setNews([]); });
    return () => { off = true; };
  }, [key]);
  return (
    <div className="mt-5 space-y-5">
      {!list.length ? (
        <section className={card}>
          <p className="font-bold"><T ta="இன்னும் பங்குகள் இல்லை. கீழே உள்ளவற்றில் ☆ அழுத்திச் சேர்க்கவும், அல்லது எந்தப் பங்குப் பக்கத்திலும் “கண்காணிப்பில் சேர்”." en="No stocks yet. Tap ☆ on a suggestion below, or “Pin to my watchlist” on any stock page." /></p>
          <div className="mt-3 flex flex-wrap gap-2">{suggestions.slice(0, 12).map((s) => <button key={s.sym} onClick={() => toggle(s.sym)} className="rounded-full border border-ink-100 px-3 py-1.5 text-sm font-bold dark:border-white/10">☆ {s.sym}</button>)}</div>
        </section>
      ) : (
        <section className={card} aria-label={ta ? "என் பங்குகள்" : "My stocks"}>
          <h2 className="text-lg font-extrabold">⭐ <T ta={`என் கண்காணிப்புப் பட்டியல் (${list.length})`} en={`My watchlist (${list.length})`} /></h2>
          {qs && <div className="mt-3"><Breadth stocks={qs} /></div>}
          <ul className="mt-3 divide-y divide-ink-100 dark:divide-white/10">
            {list.map((sym) => { const x = qs?.find((q) => q.sym === sym); return (
              <li key={sym} className="flex items-center justify-between gap-2 py-2.5">
                <Link href={`/markets/stock/${encodeURIComponent(sym)}`} className="min-w-0"><b className="hover:underline">{sym}</b><span className="block truncate text-xs opacity-75">{x?.name ?? (qs ? (ta ? "விலை கிடைக்கவில்லை" : "No quote available") : "…")}</span></Link>
                <span className="flex items-center gap-3 text-right tabular-nums">{x && <span><b>₹{fmt(x.price)}</b><br /><Pct v={x.pct} className="text-xs" /></span>}<button onClick={() => remove(sym)} aria-label={`${ta ? "நீக்கு" : "Remove"} ${sym}`} className="grid h-8 w-8 place-items-center rounded-full border border-ink-100 text-xs dark:border-white/10">✕</button></span>
              </li>); })}
          </ul>
          <p className="mt-2 text-[11px] opacity-70"><T ta="இந்தச் சாதனத்தில் மட்டும் · அமைப்புகள் → ஏற்றுமதி காப்பில் சேர்க்கப்படும் · விலைகள்: Yahoo Finance (தாமதம்)" en="Stored on this device only · included in Settings → Export backup · prices: Yahoo Finance (delayed)" /></p>
        </section>
      )}
      {list.length > 0 && (
        <section aria-label={ta ? "என் கண்காணிப்புச் செய்திகள்" : "My watchlist news"}>
          <h2 className="mb-3 text-xl font-extrabold">📰 <T ta="என் கண்காணிப்புச் செய்திகள்" en="My watchlist news" /></h2>
          {news === null ? <p className="text-sm opacity-70"><T ta="ஏற்றுகிறது…" en="Loading…" /></p> : news.length ? <div data-grid className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">{news.map((a, i) => <ArticleCard key={a.id} a={a} i={i} />)}</div> : <p className="text-sm opacity-70"><T ta="இந்தப் பங்குகள் பற்றி சமீபத்திய செய்திகள் இல்லை." en="No recent news about these stocks." /></p>}
        </section>
      )}
    </div>
  );
}
