"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePrefs } from "./providers";

type Nav = { code: string; isin: string; name: string; amc: string; cat: string; nav: number; date: string };
const KEY = "ns-mf", EVT = "ns:mf";
let cache: { raw: string | null; v: string[] } = { raw: null, v: [] };
const read = () => { const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(KEY); if (raw !== cache.raw) { try { cache = { raw, v: raw ? JSON.parse(raw) : [] }; } catch { cache = { raw, v: [] }; } } return cache.v; };
const EMPTY: string[] = [];

export function MutualFunds() {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const mine = useSyncExternalStore((cb) => { window.addEventListener(EVT, cb); return () => window.removeEventListener(EVT, cb); }, read, () => EMPTY);
  const toggle = (c: string) => { const v = read(); localStorage.setItem(KEY, JSON.stringify(v.includes(c) ? v.filter((x) => x !== c) : [...v, c].slice(0, 30))); window.dispatchEvent(new Event(EVT)); };
  const [q, setQ] = useState(""); const [res, setRes] = useState<Nav[] | null>(null); const [saved, setSaved] = useState<Nav[]>([]); const [total, setTotal] = useState(0);
  useEffect(() => { const t = setTimeout(() => { if (q.trim().length < 2) { setRes(null); return; } fetch(`/api/mf?q=${encodeURIComponent(q)}`).then((r) => r.json()).then((j) => { setRes(j.items ?? []); setTotal(j.total ?? 0); }).catch(() => setRes([])); }, 300); return () => clearTimeout(t); }, [q]);
  const key = mine.join(",");
  useEffect(() => { if (!key) return; fetch(`/api/mf?codes=${key}`).then((r) => r.json()).then((j) => setSaved(j.items ?? [])).catch(() => {}); }, [key]);
  const row = (x: Nav) => (
    <li key={x.code} className="flex items-center gap-3 border-b border-ink-100 py-2.5 last:border-0 dark:border-white/10" data-mf>
      <div className="min-w-0 flex-1"><div className="text-sm font-bold leading-snug">{x.name}</div><div className="text-[11.5px] opacity-75">{x.amc} · {x.cat} · {`code`} {x.code}</div></div>
      <div className="text-right"><div className="font-black tabular-nums">₹{x.nav.toLocaleString("en-IN", { maximumFractionDigits: 4 })}</div><div className="text-[11px] opacity-75">{x.date}</div></div>
      <button onClick={() => toggle(x.code)} aria-pressed={mine.includes(x.code)} aria-label={ta ? "என் நிதிகளில் சேர்" : "Track this fund"} className={`grid h-8 w-8 place-items-center rounded-full ${mine.includes(x.code) ? "bg-manjal-400 text-ink-900" : "border border-ink-100 dark:border-white/10"}`}>{mine.includes(x.code) ? "★" : "☆"}</button>
    </li>
  );
  return (
    <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_24rem]">
      <section className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={ta ? "நிதியின் பெயர் / AMC / ISIN (எ.கா. parag parikh flexi)" : "Fund name / AMC / ISIN (e.g. parag parikh flexi)"} aria-label={ta ? "நிதி தேடல்" : "Search funds"} className="w-full rounded-full border border-ink-100 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-ink-950" />
        {res === null ? <p className="mt-3 text-sm opacity-75">{ta ? "குறைந்தது 2 எழுத்துகள் தட்டச்சு செய்யுங்கள்." : "Type at least 2 letters."}</p> : res.length ? <ul className="mt-2">{res.map(row)}</ul> : <p className="mt-3 text-sm opacity-75">{ta ? "பொருந்தும் திட்டம் இல்லை." : "No matching scheme."}</p>}
        {total > 0 && <p className="mt-2 text-[11px] opacity-70">{total.toLocaleString("en-IN")} {ta ? "திட்டங்கள் · மூலம்: AMFI" : "schemes · source: AMFI"}</p>}
      </section>
      <aside className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
        <h2 className="font-extrabold">★ {ta ? "என் நிதிகள்" : "My funds"} · {mine.length}</h2>
        {mine.length ? <ul className="mt-1">{saved.map(row)}</ul> : <p className="mt-2 text-sm opacity-75">{ta ? "☆ அழுத்தி நிதிகளைக் கண்காணியுங்கள் (இந்தச் சாதனத்தில் மட்டும்)." : "Tap ☆ to track funds (stored on this device)."}</p>}
      </aside>
    </div>
  );
}
