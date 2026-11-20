"use client";
import { useEffect, useState } from "react";
import type { CityGold } from "@/lib/bullion";
import { usePrefs } from "./providers";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const card = "rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900";
const inp = "w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-base font-bold tabular-nums dark:border-white/15 dark:bg-ink-800";
const lab = "block text-xs font-bold opacity-80";

/** Gold jewellery bill estimate from today's live jeweller rate for the chosen city. */
export function GoldCalc({ cities, date }: { cities: CityGold[]; date: string | null }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [city, setCity] = useState("Chennai");
  useEffect(() => { try { const v = localStorage.getItem("ns-gold-city"); if (v && cities.some((c) => c.city === v)) setCity(v); } catch {} }, [cities]); // eslint-disable-line react-hooks/set-state-in-effect
  const [k, setK] = useState<"k22" | "k24" | "k18">("k22");
  const [unit, setUnit] = useState<"g" | "pavan">("pavan");
  const [qty, setQty] = useState(1);
  const [mk, setMk] = useState(10);
  const g = cities.find((c) => c.city === city) ?? cities[0];
  if (!g) return <section className={card}><h2 className="font-extrabold">🪙 {ta ? "தங்க நகை விலைக் கணிப்பான்" : "Gold jewellery price calculator"}</h2><p className="mt-2 text-sm opacity-75">{ta ? "இன்றைய தங்க விலை இப்போது கிடைக்கவில்லை — கணக்கிட முடியாது." : "Today's gold rate is unavailable right now, so the calculator is paused."}</p></section>;
  const rate = g[k];
  const grams = unit === "pavan" ? qty * 8 : qty;
  const metal = grams * rate, making = metal * (mk / 100), gst = (metal + making) * 0.03, total = metal + making + gst;
  return (
    <section className={card} aria-label={ta ? "தங்க நகை விலைக் கணிப்பான்" : "Gold jewellery calculator"} data-calc="gold">
      <h2 className="text-lg font-extrabold">🪙 {ta ? "தங்க நகை விலைக் கணிப்பான்" : "Gold jewellery price calculator"}</h2>
      <p className="mt-1 text-xs opacity-75">{ta ? `இன்றைய ${g.ta} நகைக்கடை விலை தானாக நிரப்பப்பட்டது · ${date ?? ""}` : `Auto-filled with today's ${g.city} jeweller rate · ${date ?? ""}`}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label><span className={lab}>{ta ? "நகரம்" : "City"}</span><select value={g.city} onChange={(e) => { setCity(e.target.value); try { localStorage.setItem("ns-gold-city", e.target.value); } catch {} }} className={inp}>{cities.map((c) => <option key={c.city} value={c.city}>{ta ? c.ta : c.city}</option>)}</select></label>
        <label><span className={lab}>{ta ? "தரம்" : "Purity"}</span><select value={k} onChange={(e) => setK(e.target.value as typeof k)} className={inp}><option value="k22">22K (916)</option><option value="k24">24K (999)</option><option value="k18">18K (750)</option></select></label>
        <label className="col-span-2 sm:col-span-1"><span className={lab}>{ta ? "இன்றைய விலை / கிராம்" : "Today's rate / gram"}</span><output className={`${inp} block bg-ink-50 dark:bg-white/5`}>{inr(rate)}</output></label>
        <label><span className={lab}>{ta ? "அளவு" : "Weight"}</span><input type="number" inputMode="decimal" min={0} step={unit === "pavan" ? 0.25 : 0.5} value={qty} onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))} className={inp} /></label>
        <label><span className={lab}>{ta ? "அலகு" : "Unit"}</span><select value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)} className={inp}><option value="pavan">{ta ? "பவுன் / சவரன் (8 கி)" : "Sovereign / pavan (8 g)"}</option><option value="g">{ta ? "கிராம்" : "Grams"}</option></select></label>
        <label className="col-span-2 sm:col-span-1"><span className={lab}>{ta ? `செய்கூலி + சேதாரம்: ${mk}%` : `Making + wastage: ${mk}%`}</span><input type="range" min={0} max={30} step={0.5} value={mk} onChange={(e) => setMk(Number(e.target.value))} className="mt-2 w-full accent-kumkum-600" aria-label="Making charge percent" /></label>
      </div>
      <dl className="mt-4 divide-y divide-ink-100 rounded-xl border border-ink-100 text-sm dark:divide-white/10 dark:border-white/10">
        {[[ta ? `தங்க மதிப்பு (${grams} கி × ${inr(rate)})` : `Gold value (${grams} g × ${inr(rate)})`, metal], [ta ? `செய்கூலி + சேதாரம் (${mk}%)` : `Making + wastage (${mk}%)`, making], [ta ? "GST (3%)" : "GST (3%)", gst]].map(([l, v]) => <div key={l as string} className="flex justify-between gap-2 px-3 py-2"><dt>{l}</dt><dd className="font-bold tabular-nums">{inr(v as number)}</dd></div>)}
        <div className="flex justify-between gap-2 bg-manjal-300/25 px-3 py-2.5 text-base"><dt className="font-extrabold">{ta ? "மொத்த மதிப்பீடு" : "Estimated total"}</dt><dd data-total className="font-black tabular-nums">{inr(total)}</dd></div>
      </dl>
      <p className="mt-2 text-[11px] leading-snug opacity-75">{ta ? "மதிப்பீடு மட்டுமே. விலை: goodreturns.in நகைக்கடை சராசரி (GST இல்லாமல்). GST 3% தங்க மதிப்பு + செய்கூலி மீது கணக்கிடப்பட்டது; கல், ஹால்மார்க் கட்டணம், கடை தள்ளுபடி சேர்க்கப்படவில்லை." : "Estimate only. Rate: goodreturns.in jeweller average (before GST). GST 3% applied on gold value + making; stones, hallmark fee and shop discounts not included."}</p>
    </section>
  );
}

/** SIP / lumpsum future value — pure maths, clearly an estimate. */
export function SipCalc() {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [mode, setMode] = useState<"sip" | "lump">("sip");
  const [amt, setAmt] = useState(5000), [yrs, setYrs] = useState(10), [ret, setRet] = useState(12);
  const n = yrs * 12, i = ret / 12 / 100;
  const invested = mode === "sip" ? amt * n : amt;
  const fv = mode === "sip" ? (i ? amt * ((Math.pow(1 + i, n) - 1) / i) * (1 + i) : amt * n) : amt * Math.pow(1 + ret / 100, yrs);
  const gain = fv - invested;
  return (
    <section className={card} aria-label={ta ? "SIP கணிப்பான்" : "SIP calculator"} data-calc="sip">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold">📈 {ta ? "SIP / மொத்த முதலீட்டுக் கணிப்பான்" : "SIP / lumpsum return calculator"}</h2>
        <div className="flex rounded-full border border-ink-100 p-0.5 text-xs font-bold dark:border-white/10" role="radiogroup" aria-label="Mode">
          {(["sip", "lump"] as const).map((m) => <button key={m} role="radio" aria-checked={mode === m} onClick={() => { setMode(m); setAmt(m === "sip" ? 5000 : 100000); }} className={`rounded-full px-3 py-1 ${mode === m ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : ""}`}>{m === "sip" ? "SIP" : ta ? "மொத்தம்" : "Lumpsum"}</button>)}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label><span className={lab}>{mode === "sip" ? (ta ? "மாதத் தொகை ₹" : "Monthly amount ₹") : (ta ? "முதலீடு ₹" : "Investment ₹")}</span><input type="number" min={0} step={500} value={amt} onChange={(e) => setAmt(Math.max(0, Number(e.target.value) || 0))} className={inp} /></label>
        <label><span className={lab}>{ta ? `காலம்: ${yrs} ஆண்டுகள்` : `Period: ${yrs} years`}</span><input type="range" min={1} max={40} value={yrs} onChange={(e) => setYrs(Number(e.target.value))} className="mt-2 w-full accent-kumkum-600" aria-label="Years" /></label>
        <label><span className={lab}>{ta ? `எதிர்பார்க்கும் ஆண்டு வருமானம்: ${ret}%` : `Expected annual return: ${ret}%`}</span><input type="range" min={1} max={30} step={0.5} value={ret} onChange={(e) => setRet(Number(e.target.value))} className="mt-2 w-full accent-kumkum-600" aria-label="Expected return" /></label>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-ink-50 p-2 dark:bg-white/5"><div className="text-[11px] font-bold opacity-75">{ta ? "முதலீடு" : "Invested"}</div><div className="font-black tabular-nums">{inr(invested)}</div></div>
        <div className="rounded-xl bg-ink-50 p-2 dark:bg-white/5"><div className="text-[11px] font-bold opacity-75">{ta ? "மதிப்பிட்ட வருமானம்" : "Est. returns"}</div><div className="font-black tabular-nums text-green-700 dark:text-green-400">{inr(gain)}</div></div>
        <div className="rounded-xl bg-manjal-300/30 p-2"><div className="text-[11px] font-bold opacity-75">{ta ? "மொத்த மதிப்பு" : "Total value"}</div><div data-total className="font-black tabular-nums">{inr(fv)}</div></div>
      </div>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full" aria-hidden><div className="bg-peacock-600" style={{ width: `${(invested / fv) * 100}%` }} /><div className="bg-green-600" style={{ width: `${(gain / fv) * 100}%` }} /></div>
      <p className="mt-2 text-[11px] leading-snug opacity-75">{ta ? "கணித மதிப்பீடு மட்டுமே — நிலையான வருமானம் கருதப்படுகிறது. உண்மையான சந்தை வருமானம் மாறும்; வரி, கட்டணங்கள் சேர்க்கப்படவில்லை. இது முதலீட்டு ஆலோசனை அல்ல." : "A mathematical estimate assuming a constant return. Real market returns vary; taxes and fees not included. Not investment advice."}</p>
    </section>
  );
}
