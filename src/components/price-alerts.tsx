"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePrefs } from "./providers";

/** Device-only price alerts for NSE stocks and Chennai gold. Checked every 5 min while a Naatrisai tab is open;
 *  shows a browser notification if allowed, otherwise an in-page banner. (Background push needs the server-side database.) */
export type PriceAlert = { id: string; kind: "stock" | "gold"; sym: string; dir: "above" | "below"; value: number; hit?: string };
const KEY = "ns-price-alerts", EVT = "ns:alerts";
let cache: { raw: string | null; v: PriceAlert[] } = { raw: null, v: [] };
const read = () => { const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(KEY); if (raw !== cache.raw) { try { cache = { raw, v: raw ? JSON.parse(raw) : [] }; } catch { cache = { raw, v: [] }; } } return cache.v; };
const write = (v: PriceAlert[]) => { localStorage.setItem(KEY, JSON.stringify(v.slice(0, 30))); window.dispatchEvent(new Event(EVT)); };
const EMPTY: PriceAlert[] = [];
export const useAlerts = () => useSyncExternalStore((cb) => { window.addEventListener(EVT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); }; }, read, () => EMPTY);

async function prices(list: PriceAlert[]) {
  const out: Record<string, number> = {};
  const syms = [...new Set(list.filter((a) => a.kind === "stock").map((a) => a.sym))];
  if (syms.length) { try { const q: { sym: string; price: number }[] = await (await fetch(`/api/market/quotes?s=${syms.join(",")}`)).json(); q.forEach((x) => (out["stock:" + x.sym] = x.price)); } catch {} }
  if (list.some((a) => a.kind === "gold")) { try { const g = await (await fetch("/api/gold")).json(); const c = g.cities?.find((x: { city: string }) => x.city === "Chennai"); if (c) out["gold:22K"] = c.k22; } catch {} }
  return out;
}

export function AlertWatcher() {
  const alerts = useAlerts();
  const [banner, setBanner] = useState("");
  const key = alerts.filter((a) => !a.hit).map((a) => a.id).join(",");
  useEffect(() => {
    if (!key) return;
    const run = async () => {
      if (document.hidden) return;
      const live = read().filter((a) => !a.hit); if (!live.length) return;
      const p = await prices(live); const now = new Date().toISOString(); const hits: string[] = [];
      const next = read().map((a) => { const v = p[`${a.kind}:${a.sym}`]; if (a.hit || v === undefined) return a; if ((a.dir === "above" && v >= a.value) || (a.dir === "below" && v <= a.value)) { hits.push(`${a.kind === "gold" ? "Gold 22K Chennai" : a.sym} ${a.dir === "above" ? "≥" : "≤"} ₹${a.value.toLocaleString("en-IN")} (now ₹${v.toLocaleString("en-IN")})`); return { ...a, hit: now }; } return a; });
      if (!hits.length) return;
      write(next);
      const msg = "🔔 " + hits.join(" · ");
      if ("Notification" in window && Notification.permission === "granted") { try { new Notification("Naatrisai price alert", { body: hits.join("\n"), icon: "/icon-192.png" }); } catch {} }
      setBanner(msg);
    };
    run(); const t = setInterval(run, 5 * 60e3); return () => clearInterval(t);
  }, [key]);
  if (!banner) return null;
  return <div role="status" className="fixed inset-x-3 top-16 z-[60] mx-auto max-w-lg rounded-2xl bg-ink-900 p-3 text-sm font-bold text-white shadow-2xl dark:bg-white dark:text-ink-900" data-alert-banner>{banner}<button onClick={() => setBanner("")} className="float-right ml-2" aria-label="Dismiss">✕</button></div>;
}

export function PriceAlerts({ symbols }: { symbols: string[] }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const alerts = useAlerts();
  const [sym, setSym] = useState("gold"); const [dir, setDir] = useState<"above" | "below">("above"); const [val, setVal] = useState("");
  const [perm, setPerm] = useState<string>("unsupported");
  useEffect(() => { if ("Notification" in window) setPerm(Notification.permission); }, []); // eslint-disable-line react-hooks/set-state-in-effect
  const add = () => { const v = parseFloat(val); if (!(v > 0)) return; write([...read(), { id: Math.random().toString(36).slice(2, 9), kind: sym === "gold" ? "gold" : "stock", sym: sym === "gold" ? "22K" : sym, dir, value: v }]); setVal(""); };
  const sel = "rounded-full border border-ink-100 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-ink-950";
  return (
    <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900" data-price-alerts>
      <h2 className="text-lg font-extrabold">🔔 {ta ? "விலை எச்சரிக்கைகள்" : "Price alerts"}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select value={sym} onChange={(e) => setSym(e.target.value)} className={sel} aria-label={ta ? "எது" : "What"}><option value="gold">{ta ? "தங்கம் 22K (சென்னை, ₹/கி)" : "Gold 22K (Chennai, ₹/g)"}</option>{symbols.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select value={dir} onChange={(e) => setDir(e.target.value as "above" | "below")} className={sel} aria-label={ta ? "திசை" : "Direction"}><option value="above">{ta ? "இதற்கு மேல்" : "rises to"} ≥</option><option value="below">{ta ? "இதற்குக் கீழ்" : "falls to"} ≤</option></select>
        <input value={val} onChange={(e) => setVal(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="₹" aria-label={ta ? "விலை" : "Price"} className={`${sel} w-28`} />
        <button onClick={add} className="rounded-full bg-kumkum-600 px-4 py-2 text-sm font-bold text-white">{ta ? "சேர்" : "Add"}</button>
        {perm === "default" && <button onClick={async () => setPerm(await Notification.requestPermission())} className="rounded-full border border-ink-100 px-3 py-2 text-xs font-bold dark:border-white/10">🔔 {ta ? "அறிவிப்புகளை அனுமதி" : "Allow notifications"}</button>}
      </div>
      {alerts.length > 0 && <ul className="mt-3 space-y-1.5 text-sm">{alerts.map((a) => <li key={a.id} className="flex items-center gap-2"><span>{a.hit ? "✅" : "⏳"}</span><span className="flex-1">{a.kind === "gold" ? (ta ? "தங்கம் 22K" : "Gold 22K") : a.sym} {a.dir === "above" ? "≥" : "≤"} ₹{a.value.toLocaleString("en-IN")}{a.hit && <span className="opacity-75"> · {new Date(a.hit).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} IST</span>}</span><button onClick={() => write(read().filter((x) => x.id !== a.id))} aria-label="Remove" className="opacity-70">✕</button></li>)}</ul>}
      <p className="mt-2 text-[11px] opacity-75">{ta ? "இந்தச் சாதனத்தில் மட்டும்; நாற்றிசை தாவல் திறந்திருக்கும்போது 5 நிமிடத்துக்கு ஒருமுறை சோதிக்கப்படும். பின்னணி push அறிவிப்புகளுக்குச் சேவையகத் தரவுத்தளம் தேவை." : "Stored on this device; checked every 5 minutes while a Naatrisai tab is open. Background push needs the server database (not yet set up)."}</p>
    </section>
  );
}
