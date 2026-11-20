"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Bullion, CityGold } from "@/lib/bullion";
import type { Fuel, FuelCity } from "@/lib/fuel";
import type { Markets, Movers, MarketStatus, Quote } from "@/lib/markets";
import { usePrefs } from "./providers";

const inr = (n: number, d = 0) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmt = (n: number, d = 2) => n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
export const istTime = (t: string | number, ta: boolean) => new Date(t).toLocaleString(ta ? "ta-IN" : "en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) + " IST";
const card = "rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900";
const sel = "rounded-xl border border-ink-200 bg-white px-2.5 py-1.5 text-sm font-bold dark:border-white/15 dark:bg-ink-800";

/** City choice remembered on this device (read after mount so SSR and first paint agree). */
function useCity(key: string, def: string, valid: (c: string) => boolean) {
  const [city, setCity] = useState(def);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { const v = localStorage.getItem(key); if (v && valid(v)) setCity(v); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = (c: string) => { setCity(c); try { localStorage.setItem(key, c); } catch {} };
  return [city, set] as const;
}

function Chg({ v, d = 0, unit = "₹", pct }: { v?: number; d?: number; unit?: string; pct?: number }) {
  if (v === undefined || !Number.isFinite(v)) return null;
  if (Math.abs(v) < 1e-9) return <span className="text-xs font-bold opacity-60">● 0</span>;
  const up = v > 0;
  return <span className={`text-xs font-bold ${up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{up ? "▲" : "▼"} {unit}{fmt(Math.abs(v), d)}{pct !== undefined ? ` (${fmt(Math.abs(pct))}%)` : ""}</span>;
}
function Src({ children }: { children: React.ReactNode }) { return <p className="mt-3 text-[11px] leading-snug opacity-65">{children}</p>; }

// ------------------------------------------------------------------ GOLD
export function GoldPanel({ b, intl }: { b: Bullion; intl?: { gold?: Quote; silver?: Quote } }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [city, setCity] = useCity("ns-gold-city", "Chennai", (c) => b.cities.some((x) => x.city === c));
  const g: CityGold | undefined = b.cities.find((c) => c.city === city) ?? b.cities[0];
  const s = b.silver.find((x) => x.city === g?.city) ?? b.silver.find((x) => x.city === "Chennai");
  if (!g && !b.ibja) return <section className={card}><h2 className="font-extrabold">🪙 <T ta="தங்கம் & வெள்ளி" en="Gold & silver" /></h2><p className="mt-2 text-sm opacity-70"><T ta="தங்க விலை இப்போது கிடைக்கவில்லை. சற்று நேரம் கழித்துப் பாருங்கள்." en="Gold rates are unavailable right now. Please check back shortly." /></p></section>;
  const hist = b.history.slice(0, 10).reverse();
  const hmin = Math.min(...hist.map((h) => h.k22)), hmax = Math.max(...hist.map((h) => h.k22));
  const ib = b.ibja;
  const intl10 = intl?.gold?.price;
  return (
    <section className={card} aria-label={ta ? "தங்கம் வெள்ளி விலை" : "Gold and silver rates"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold">🪙 <T ta="இன்றைய தங்கம் விலை" en="Gold rate today" /></h2>
        {b.cities.length > 1 && (
          <label className="flex items-center gap-1.5 text-xs font-bold"><span className="opacity-70"><T ta="நகரம்" en="City" /></span>
            <select value={g?.city} onChange={(e) => setCity(e.target.value)} className={sel} aria-label={ta ? "நகரம் தேர்வு" : "Choose city"}>
              {b.cities.map((c) => <option key={c.city} value={c.city}>{ta ? c.ta : c.city}</option>)}
            </select></label>
        )}
      </div>
      {g && (
        <>
          <p className="mt-1 text-xs opacity-70"><T ta={`${g.ta} நகைக்கடை விலை (சராசரி) · ${b.goldDate ?? ""}`} en={`Jeweller’s retail rate in ${g.city} · ${b.goldDate ?? ""}`} /></p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {([["22K", g.k22, g.ch22, ta ? "ஆபரணத் தங்கம் (916)" : "Jewellery gold (916)"], ["24K", g.k24, g.ch24, ta ? "சுத்தத் தங்கம் (999)" : "Pure gold (999)"]] as const).map(([k, v, ch, lab]) => (
              <div key={k} className="rounded-xl bg-manjal-300/20 p-3 dark:bg-manjal-400/10">
                <div className="text-xs font-bold opacity-75">{k} · {lab}</div>
                <div className="mt-0.5 text-2xl font-black tabular-nums">{inr(v)}<span className="text-xs font-bold opacity-60"> /{ta ? "கிராம்" : "g"}</span></div>
                <div className="flex flex-wrap items-center gap-x-2 text-sm tabular-nums"><span className="font-bold">{inr(v * 8)}</span><span className="text-xs opacity-60">/{ta ? "பவுன் (8 கி)" : "sovereign (8 g)"}</span></div>
                <div className="mt-0.5"><Chg v={ch} />{ch !== undefined && <span className="text-[11px] opacity-60"> {ta ? "நேற்றை விட" : "vs yesterday"}</span>}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs opacity-75 tabular-nums">18K: {inr(g.k18)}/{ta ? "கி" : "g"} · 10 {ta ? "கி" : "g"} 22K: {inr(g.k22 * 10)} · 24K: {inr(g.k24 * 10)}</div>
        </>
      )}
      {hist.length > 2 && (
        <div className="mt-4">
          <div className="mb-1 text-xs font-bold opacity-75"><T ta="கடந்த 10 நாட்கள் — 22K (₹/கிராம், இந்தியா)" en="Last 10 days — 22K (₹/g, India)" /></div>
          <div className="flex h-20 items-end gap-1" role="img" aria-label={hist.map((h) => `${h.date}: ${h.k22}`).join(", ")}>
            {hist.map((h) => <div key={h.date} title={`${h.date}: ${inr(h.k22)}`} className="flex-1 rounded-t bg-manjal-400/70 dark:bg-manjal-400/50" style={{ height: `${20 + ((h.k22 - hmin) / (hmax - hmin || 1)) * 80}%` }} />)}
          </div>
          <div className="mt-0.5 flex justify-between text-[10px] opacity-60"><span>{hist[0].date}</span><span>{inr(hmin)} – {inr(hmax)}</span><span>{hist.at(-1)!.date}</span></div>
        </div>
      )}
      {s && (
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-ink-50 p-3 dark:bg-white/5">
          <div><div className="text-xs font-bold opacity-75">🥈 <T ta={`வெள்ளி · ${s.ta}`} en={`Silver · ${s.city}`} /></div>
            <div className="text-xl font-black tabular-nums">{inr(s.kg)}<span className="text-xs font-bold opacity-60"> /{ta ? "கிலோ" : "kg"}</span></div></div>
          <div className="text-right text-sm tabular-nums"><div>{inr(s.kg / 1000, 2)} /{ta ? "கி" : "g"}</div><Chg v={b.silverChange} /></div>
        </div>
      )}
      {(ib || intl10) && (
        <div className="mt-4 rounded-xl border border-dashed border-ink-200 p-3 text-sm dark:border-white/15">
          <div className="mb-1.5 text-xs font-extrabold uppercase tracking-wide opacity-70"><T ta="ஒப்பீடு: மொத்த / சர்வதேச விலை (₹/10 கி, 24K)" en="Compare: wholesale / international (₹/10 g, 24K)" /></div>
          <ul className="space-y-1 tabular-nums">
            {g && <li className="flex justify-between gap-2"><span><T ta="நகைக்கடை (GST இல்லாமல்)" en="Jeweller retail (pre-GST)" /></span><b>{inr(g.k24 * 10)}</b></li>}
            {ib && <li className="flex justify-between gap-2"><span>IBJA 999 · {ib.date} {ib.session} {ib.prev && <Chg v={ib.g999 - ib.prev.g999} />}</span><b>{inr(ib.g999)}</b></li>}
            {intl10 && <li className="flex justify-between gap-2"><span><T ta="சர்வதேச (COMEX → ₹, வரி இல்லாமல்)" en="International (COMEX → ₹, no duty)" /></span><b>{inr(intl10)}</b></li>}
            {ib && <li className="flex justify-between gap-2 text-xs opacity-80"><span>IBJA {ta ? "வெள்ளி 999 /கிலோ" : "silver 999 /kg"}</span><span>{inr(ib.silver)}</span></li>}
          </ul>
          <p className="mt-1.5 text-[11px] opacity-65"><T ta="IBJA = இந்திய புல்லியன் & நகை வியாபாரிகள் சங்கத்தின் அதிகாரப்பூர்வ அளவுகோல் விலை (GST, செய்கூலி இல்லாமல்). சர்வதேச விலைக்கும் உள்ளூர் விலைக்கும் இடையிலான வேறுபாடு இறக்குமதி வரி மற்றும் உள்ளூர் கட்டணங்களால் வருகிறது. MCX எதிர்கால ஒப்பந்த விலை இலவசமாகக் கிடைக்காததால் சேர்க்கவில்லை." en="IBJA = India Bullion & Jewellers Association benchmark (excl. GST & making charges). The gap to the international price is import duty and local premiums. MCX futures are not shown — no free, licensed feed." /></p>
        </div>
      )}
      <Src>
        <T ta="நகைக்கடை விலை: " en="Jeweller rates: " /><a className="underline" href={g?.url ?? "https://www.goodreturns.in/gold-rates/"} target="_blank" rel="noopener noreferrer">Goodreturns</a>
        {ib && <> · IBJA: <a className="underline" href="https://ibjarates.com/" target="_blank" rel="noopener noreferrer">ibjarates.com</a></>}
        {intl10 && <> · COMEX: Yahoo Finance</>}
        {" · "}<T ta={`உண்மையான விலை கடைக்குக் கடை மாறும்; GST 3% + செய்கூலி தனி`} en={`actual shop prices vary; 3% GST + making charges extra`} /> · <When t={b.fetchedAt} />
      </Src>
    </section>
  );
}

// ------------------------------------------------------------------ FUEL
const GROUP_LABEL: Record<FuelCity["group"], { ta: string; en: string }> = {
  tn: { ta: "தமிழ்நாடு மாவட்டங்கள்", en: "Tamil Nadu districts" }, metro: { ta: "பெருநகரங்கள்", en: "Major cities" }, state: { ta: "மாநிலங்கள் (தலைநகர் விலை)", en: "States (capital city)" },
};
const fkey = (c: FuelCity) => `${c.group}:${c.city}`;
export function FuelPanel({ f }: { f: Fuel }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [k, setK] = useCity("ns-fuel-city", "tn:Chennai", (v) => f.cities.some((c) => fkey(c) === v));
  const c = f.cities.find((x) => fkey(x) === k) ?? f.cities.find((x) => x.city === "Chennai") ?? f.cities[0];
  const tn = useMemo(() => f.cities.filter((x) => x.group === "tn" && x.petrol).sort((a, b) => a.petrol! - b.petrol!), [f.cities]);
  const [all, setAll] = useState(true);
  if (!c) return <section className={card}><h2 className="font-extrabold">⛽ <T ta="பெட்ரோல் / டீசல்" en="Petrol / diesel" /></h2><p className="mt-2 text-sm opacity-70"><T ta="எரிபொருள் விலை இப்போது கிடைக்கவில்லை." en="Fuel prices are unavailable right now." /></p></section>;
  const name = (x: FuelCity) => (ta ? x.ta : x.city);
  return (
    <section className={card} aria-label={ta ? "பெட்ரோல் டீசல் விலை" : "Petrol and diesel prices"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold">⛽ <T ta="இன்றைய பெட்ரோல், டீசல் விலை" en="Petrol & diesel today" /></h2>
        <select value={fkey(c)} onChange={(e) => setK(e.target.value)} className={sel} aria-label={ta ? "நகரம் / மாவட்டம் தேர்வு" : "Choose city or district"}>
          {(["tn", "metro", "state"] as const).map((gr) => (
            <optgroup key={gr} label={ta ? GROUP_LABEL[gr].ta : GROUP_LABEL[gr].en}>
              {f.cities.filter((x) => x.group === gr).map((x) => <option key={fkey(x)} value={fkey(x)}>{name(x)}</option>)}
            </optgroup>
          ))}
        </select>
      </div>
      <p className="mt-1 text-xs opacity-70"><T ta={`${c.ta} · ${f.date ?? ""} அன்று காலை 6 மணி முதல் அமலில் உள்ள சில்லறை விலை (மாநில வரிகள் உட்பட)`} en={`${c.city} · retail price in effect from 6 AM, ${f.date ?? "today"} (incl. state taxes)`} /></p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {([["petrol", c.petrol, c.pCh, ta ? "பெட்ரோல்" : "Petrol"], ["diesel", c.diesel, c.dCh, ta ? "டீசல்" : "Diesel"]] as const).map(([key, v, ch, lab]) => (
          <div key={key} className={`rounded-xl p-3 ${key === "petrol" ? "bg-green-600/10" : "bg-sky-600/10"}`}>
            <div className="text-xs font-bold opacity-75">{lab}</div>
            {v ? <div className="text-2xl font-black tabular-nums">{inr(v, 2)}<span className="text-xs font-bold opacity-60"> /{ta ? "லிட்டர்" : "litre"}</span></div> : <div className="text-sm opacity-60">—</div>}
            {v !== undefined && <div><Chg v={ch} d={2} />{ch !== undefined && <span className="text-[11px] opacity-60"> {ta ? "நேற்றை விட" : "vs yesterday"}</span>}</div>}
          </div>
        ))}
      </div>
      {tn.length > 5 && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs font-bold"><span className="opacity-75"><T ta={`தமிழ்நாட்டில் பெட்ரோல்: மலிவு ${name(tn[0])} ${inr(tn[0].petrol!, 2)} · அதிகம் ${name(tn.at(-1)!)} ${inr(tn.at(-1)!.petrol!, 2)}`} en={`TN petrol: cheapest ${tn[0].city} ${inr(tn[0].petrol!, 2)} · highest ${tn.at(-1)!.city} ${inr(tn.at(-1)!.petrol!, 2)}`} /></span></div>
          <button onClick={() => setAll((x) => !x)} className="text-xs font-bold text-kumkum-600 underline dark:text-manjal-400" aria-expanded={all}>{all ? (ta ? "மறை" : "Hide") : (ta ? `எல்லா ${tn.length} மாவட்டங்களும் →` : `All ${tn.length} districts →`)}</button>
          {all && (
            <div className="mt-2 max-h-80 overflow-auto rounded-xl border border-ink-100 dark:border-white/10">
              <table className="w-full text-sm tabular-nums">
                <thead className="sticky top-0 bg-ink-50 text-xs dark:bg-ink-800"><tr><th className="px-2 py-1 text-left">{ta ? "மாவட்டம்" : "District"}</th><th className="px-2 py-1 text-right">{ta ? "பெட்ரோல்" : "Petrol"}</th><th className="px-2 py-1 text-right">{ta ? "டீசல்" : "Diesel"}</th></tr></thead>
                <tbody>{[...tn].sort((a, b) => name(a).localeCompare(name(b))).map((x) => (
                  <tr key={x.city} className={`border-t border-ink-100 dark:border-white/10 ${fkey(x) === fkey(c) ? "bg-manjal-300/25" : ""}`}><td className="px-2 py-1"><button className="text-left hover:underline" onClick={() => setK(fkey(x))}>{name(x)}</button></td><td className="px-2 py-1 text-right">{x.petrol ? fmt(x.petrol) : "—"}</td><td className="px-2 py-1 text-right">{x.diesel ? fmt(x.diesel) : "—"}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <Src><T ta="மூலம்: " en="Source: " /><a className="underline" href="https://www.goodreturns.in/petrol-price.html" target="_blank" rel="noopener noreferrer">Goodreturns</a> <T ta={`(எண்ணெய் நிறுவனங்கள் தினமும் காலை 6 மணிக்கு அறிவிக்கும் விலை — நொடிக்கு நொடி மாறும் விலை அல்ல; பங்க்குக்குப் பங்க் சில பைசா வேறுபடலாம்)`} en={`(oil companies revise prices daily at 6 AM — not a live tick; pumps may differ by a few paise)`} /> · <When t={f.fetchedAt} /></Src>
    </section>
  );
}

// ------------------------------------------------------------------ STOCKS
function Spark({ v, up, w = 60 }: { v: number[]; up: boolean; w?: number }) {
  if (v.length < 3) return null;
  const min = Math.min(...v), max = Math.max(...v), r = max - min || 1;
  const pts = v.map((x, i) => `${(i / (v.length - 1)) * w},${18 - ((x - min) / r) * 16}`).join(" ");
  return <svg viewBox={`0 0 ${w} 20`} className="h-6 w-16" aria-hidden><polyline points={pts} fill="none" strokeWidth="1.6" stroke={up ? "#16a34a" : "#dc2626"} /></svg>;
}
export function StatusBadge({ s }: { s: MarketStatus }) {
  const { lang } = usePrefs();
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${s.open ? "bg-green-600/15 text-green-700 dark:text-green-400" : "bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-white/70"}`}>{s.open ? <span className="live-dot">●</span> : "○"} {lang === "ta" ? s.label.ta : s.label.en}</span>;
}
const DRILL: Record<string, string> = { nifty: "/markets/nifty50", sensex: "/markets/stock/%5EBSESN", banknifty: "/markets/sector/bank", it: "/markets/sector/it", pharma: "/markets/sector/pharma", auto: "/markets/sector/auto", fmcg: "/markets/sector/fmcg", metal: "/markets/sector/metal", midcap: "/markets/stock/NIFTY_MIDCAP_100.NS", smallcap: "/markets/stock/%5ECNXSC", vix: "/markets/stock/%5EINDIAVIX" };
function QuoteTile({ q }: { q: Quote }) {
  const { lang } = usePrefs(); const up = q.change >= 0;
  const vix = q.key === "vix";
  const href = DRILL[q.key];
  return (
    <li className="relative rounded-xl border border-ink-100 p-2.5 transition hover:border-kumkum-600/40 dark:border-white/10">
      {href && <Link href={href} className="absolute inset-0 z-10 rounded-xl" aria-label={`${lang === "ta" ? q.ta : q.en} — ${lang === "ta" ? "விவரம்" : "details"}`} />}
      <div className="flex items-start justify-between gap-1"><div className="text-xs font-bold leading-tight opacity-80">{lang === "ta" ? q.ta : q.en}</div><Spark v={q.spark} up={vix ? !up : up} /></div>
      <div className="text-lg font-black tabular-nums">{fmt(q.price)}</div>
      <div className={`text-xs font-bold tabular-nums ${(vix ? !up : up) ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{up ? "▲" : "▼"} {fmt(Math.abs(q.change))} ({fmt(Math.abs(q.pct))}%)</div>
    </li>
  );
}
function Row({ x }: { x: Movers["gainers"][number] }) {
  return (
  <li className="flex items-center justify-between gap-2 py-1.5 text-sm"><Link href={`/markets/stock/${encodeURIComponent(x.sym)}`} className="min-w-0 truncate hover:underline"><b>{x.sym}</b> <span className="text-xs opacity-60">{x.name}</span></Link><span className="shrink-0 text-right tabular-nums">{fmt(x.price)} <span className={`text-xs font-bold ${x.pct >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{x.pct >= 0 ? "+" : ""}{fmt(x.pct)}%</span></span></li>
  );
}

function Item({ label, value, ch, d = 0, unit = "₹" }: { label: string; value: string; ch?: number; d?: number; unit?: string }) {
  return <li className="flex items-baseline justify-between gap-2 py-1.5"><span className="text-sm font-bold">{label}</span><span className="text-right tabular-nums"><b>{value}</b> {ch !== undefined && <Chg v={ch} d={d} unit={unit} />}</span></li>;
}

export function StocksPanel({ m, movers, status }: { m: Markets; movers: Movers | null; status: MarketStatus }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const idx = m.quotes.filter((q) => q.group === "index"), sec = m.quotes.filter((q) => q.group === "sector");
  const last = Math.max(0, ...m.quotes.filter((q) => q.group === "index" || q.group === "sector").map((q) => q.time));
  if (!idx.length) return <section className={card}><h2 className="font-extrabold">📈 <T ta="பங்குச் சந்தை" en="Stock market" /></h2><p className="mt-2 text-sm opacity-70"><T ta="சந்தைத் தரவு இப்போது கிடைக்கவில்லை." en="Market data is unavailable right now." /></p></section>;
  const br = movers?.breadth;
  return (
    <section className={card} aria-label={ta ? "பங்குச் சந்தை" : "Stock market"}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-extrabold">📈 <T ta="இந்தியப் பங்குச் சந்தை" en="Indian stock market" /></h2><StatusBadge s={status} /></div>
      <p className="mt-1 text-xs opacity-70"><T ta={`NSE நேரம்: திங்கள்–வெள்ளி காலை 9:15 – மாலை 3:30 IST${status.tradeDate ? ` · கடைசி அமர்வு ${status.tradeDate}` : ""}`} en={`NSE hours: Mon–Fri 9:15 AM – 3:30 PM IST${status.tradeDate ? ` · last session ${status.tradeDate}` : ""}`} /></p>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{idx.map((q) => <QuoteTile key={q.key} q={q} />)}</ul>
      {sec.length > 0 && <><h3 className="mb-2 mt-4 text-sm font-extrabold"><T ta="துறை வாரியாக" en="Sectors" /></h3><ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{sec.map((q) => <QuoteTile key={q.key} q={q} />)}</ul></>}
      {movers && (
        <div className="mt-4">
          {br && <div className="mb-3"><div className="mb-1 text-xs font-bold opacity-75"><T ta={`நிஃப்டி 50 நிலவரம்: ${br.up} ஏற்றம் · ${br.down} இறக்கம்${br.flat ? ` · ${br.flat} மாற்றமில்லை` : ""}`} en={`NIFTY 50 breadth: ${br.up} up · ${br.down} down${br.flat ? ` · ${br.flat} flat` : ""}`} /></div>
            <div className="flex h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10" aria-hidden><div className="bg-green-600" style={{ width: `${(br.up / movers.count) * 100}%` }} /><div className="bg-ink-300" style={{ width: `${(br.flat / movers.count) * 100}%` }} /><div className="bg-red-600" style={{ width: `${(br.down / movers.count) * 100}%` }} /></div></div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div><h3 className="text-sm font-extrabold text-green-700 dark:text-green-400">▲ <T ta="அதிக ஏற்றம் (நிஃப்டி 50)" en="Top gainers (NIFTY 50)" /></h3><ul className="divide-y divide-ink-100 dark:divide-white/10">{movers.gainers.map((x) => <Row key={x.sym} x={x} />)}</ul>{!movers.gainers.length && <p className="text-xs opacity-60">—</p>}</div>
            <div><h3 className="text-sm font-extrabold text-red-700 dark:text-red-400">▼ <T ta="அதிக இறக்கம் (நிஃப்டி 50)" en="Top losers (NIFTY 50)" /></h3><ul className="divide-y divide-ink-100 dark:divide-white/10">{movers.losers.map((x) => <Row key={x.sym} x={x} />)}</ul>{!movers.losers.length && <p className="text-xs opacity-60">—</p>}</div>
          </div>
        </div>
      )}
      <Src><T ta={`விலைகள்: Yahoo Finance (தாமதமான தரவு) · நிஃப்டி 50 பட்டியல்: Wikipedia (NSE Indices) · சந்தை நிலை: ${status.source === "NSE" ? "NSE" : "IST நேரக் கணிப்பு"} · VIX உயர்வு = அதிக பதற்றம்`} en={`Prices: Yahoo Finance (delayed) · NIFTY 50 list: Wikipedia (citing NSE Indices) · status: ${status.source === "NSE" ? "NSE" : "IST session clock"} · higher VIX = more nervous market`} />{last > 0 && <> · <When t={last} label={{ ta: "கடைசி வர்த்தகம்", en: "last trade" }} /></>}</Src>
    </section>
  );
}

// ------------------------------------------------------------------ COMPACT (home / briefing)
export function DailyRates({ b, f, m, status, strip = false }: { b: Bullion; f: Fuel; m?: Markets; status?: MarketStatus; strip?: boolean }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [gc] = useCity("ns-gold-city", "Chennai", (c) => b.cities.some((x) => x.city === c));
  const [fk] = useCity("ns-fuel-city", "tn:Chennai", (v) => f.cities.some((c) => fkey(c) === v));
  const g = b.cities.find((c) => c.city === gc) ?? b.cities[0];
  const s = b.silver.find((x) => x.city === g?.city) ?? b.silver[0];
  const fc = f.cities.find((x) => fkey(x) === fk) ?? f.cities.find((x) => x.city === "Chennai");
  const nifty = m?.quotes.find((q) => q.key === "nifty"), sensex = m?.quotes.find((q) => q.key === "sensex");
  if (!g && !fc && !nifty) return null;
  if (strip) {
    const chips: [string, string, number | undefined, number][] = [];
    if (g) chips.push([ta ? `22K · ${g.ta}` : `22K gold · ${g.city}`, `${inr(g.k22)}/${ta ? "கி" : "g"}`, g.ch22, 0], [ta ? "பவுன்" : "Sovereign", inr(g.k22 * 8), g.ch22 !== undefined ? g.ch22 * 8 : undefined, 0]);
    if (s) chips.push([ta ? "வெள்ளி" : "Silver", `${inr(s.kg)}/${ta ? "கிலோ" : "kg"}`, b.silverChange, 0]);
    if (fc?.petrol) chips.push([ta ? `பெட்ரோல் · ${fc.ta}` : `Petrol · ${fc.city}`, inr(fc.petrol, 2), fc.pCh, 2]);
    if (fc?.diesel) chips.push([ta ? "டீசல்" : "Diesel", inr(fc.diesel, 2), fc.dCh, 2]);
    if (nifty) chips.push(["NIFTY 50", fmt(nifty.price), nifty.change, 2]);
    if (sensex) chips.push(["SENSEX", fmt(sensex.price), sensex.change, 2]);
    return (
      <Link href="/markets" className="mt-4 flex items-center gap-2 overflow-x-auto rounded-2xl border border-ink-100 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-ink-900" aria-label={ta ? "இன்றைய விலைகள் — விவரம்" : "Today’s rates — details"}>
        <span className="shrink-0 font-extrabold">🪙⛽📈</span>
        {status && <span className="shrink-0"><StatusBadge s={status} /></span>}
        {chips.map(([l, v, ch, d]) => <span key={l} className="flex shrink-0 items-baseline gap-1 whitespace-nowrap border-l border-ink-100 pl-2 dark:border-white/10"><span className="text-xs font-bold opacity-70">{l}</span> <b className="tabular-nums">{v}</b> <Chg v={ch} d={d} unit={l.startsWith("NIFTY") || l.startsWith("SENSEX") ? "" : "₹"} /></span>)}
        <span className="shrink-0 pl-1 text-xs font-bold text-kumkum-600 dark:text-manjal-400">→</span>
      </Link>
    );
  }
  return (
    <section className={card} aria-label={ta ? "இன்றைய விலைகள்" : "Today’s rates"}>
      <div className="mb-1 flex items-center justify-between"><h2 className="font-extrabold">🪙⛽ <T ta="இன்றைய விலைகள்" en="Today’s rates" /></h2><Link href="/markets" className="text-xs font-bold text-kumkum-600 dark:text-manjal-400">{ta ? "விவரம் →" : "Details →"}</Link></div>
      <ul className="divide-y divide-ink-100 dark:divide-white/10">
        {g && <Item label={ta ? `22K தங்கம் · ${g.ta}` : `22K gold · ${g.city}`} value={`${inr(g.k22)}/${ta ? "கி" : "g"}`} ch={g.ch22} />}
        {g && <Item label={ta ? "பவுன் (8 கி, 22K)" : "Sovereign (8 g, 22K)"} value={inr(g.k22 * 8)} ch={g.ch22 !== undefined ? g.ch22 * 8 : undefined} />}
        {g && <Item label={ta ? "24K தங்கம்" : "24K gold"} value={`${inr(g.k24)}/${ta ? "கி" : "g"}`} ch={g.ch24} />}
        {s && <Item label={ta ? "வெள்ளி" : "Silver"} value={`${inr(s.kg)}/${ta ? "கிலோ" : "kg"}`} ch={b.silverChange} />}
        {fc?.petrol && <Item label={ta ? `பெட்ரோல் · ${fc.ta}` : `Petrol · ${fc.city}`} value={`${inr(fc.petrol, 2)}/L`} ch={fc.pCh} d={2} />}
        {fc?.diesel && <Item label={ta ? "டீசல்" : "Diesel"} value={`${inr(fc.diesel, 2)}/L`} ch={fc.dCh} d={2} />}
        {nifty && <Item label={`NIFTY 50${status ? (status.open ? " ●" : "") : ""}`} value={fmt(nifty.price)} ch={nifty.change} d={2} unit="" />}
        {sensex && <Item label="SENSEX" value={fmt(sensex.price)} ch={sensex.change} d={2} unit="" />}
      </ul>
      <p className="mt-1 text-[11px] opacity-60"><T ta={`தங்கம், எரிபொருள்: Goodreturns (${b.goldDate ?? f.date ?? ""}) · பங்கு: Yahoo Finance · நகரத்தை சந்தைப் பக்கத்தில் மாற்றலாம்`} en={`Gold, fuel: Goodreturns (${b.goldDate ?? f.date ?? ""}) · stocks: Yahoo Finance · change city on the Markets page`} /></p>
    </section>
  );
}

/** IST time rendered after mount only, so server and browser HTML always match. */
export function When({ t, label = { ta: "சரிபார்த்தது", en: "checked" } }: { t: string | number; label?: { ta: string; en: string } }) {
  const { lang } = usePrefs(); const [v, setV] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setV(istTime(t, lang === "ta")); }, [t, lang]);
  return <span suppressHydrationWarning>{lang === "ta" ? label.ta : label.en} {v}</span>;
}
function T({ ta, en }: { ta: string; en: string }) { const { lang } = usePrefs(); return <>{lang === "ta" ? ta : en}</>; }
