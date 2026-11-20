"use client";
import { useState } from "react";
import type { Quote } from "@/lib/markets";
import { usePrefs } from "./providers";

const CODE: Record<string, string> = { usdinr: "USD", aedinr: "AED", sgdinr: "SGD", myrinr: "MYR", eurinr: "EUR", gbpinr: "GBP", jpyinr: "JPY" };

/** Quick converter between the rupee and the currencies Tamil families abroad use most, from the same live rates. */
export function FxConverter({ quotes }: { quotes: Quote[] }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const fx = quotes.filter((q) => CODE[q.key] && q.price > 0);
  const [k, setK] = useState(fx.find((q) => q.key === "aedinr")?.key ?? fx[0]?.key);
  const [amt, setAmt] = useState("100");
  const [toInr, setToInr] = useState(true);
  if (!fx.length) return null;
  const q = fx.find((x) => x.key === k) ?? fx[0];
  const n = Number(amt.replace(/,/g, "")) || 0;
  const out = toInr ? n * q.price : n / q.price;
  const f = (x: number, d = 2) => x.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d });
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
      <h2 className="mb-2 font-extrabold">💱 {ta ? "நாணய மாற்றி" : "Currency converter"}</h2>
      <div className="flex flex-wrap items-center gap-2">
        <input inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d.,]/g, ""))} aria-label={ta ? "தொகை" : "Amount"} className="w-28 rounded-xl border border-ink-100 bg-white px-3 py-2 font-bold tabular-nums dark:border-white/10 dark:bg-ink-950" />
        {toInr ? (
          <select value={q.key} onChange={(e) => setK(e.target.value)} aria-label={ta ? "நாணயம்" : "Currency"} className="rounded-xl border border-ink-100 bg-white px-2 py-2 font-bold dark:border-white/10 dark:bg-ink-950">{fx.map((x) => <option key={x.key} value={x.key}>{CODE[x.key]}</option>)}</select>
        ) : <span className="font-bold">INR</span>}
        <button onClick={() => setToInr(!toInr)} aria-label={ta ? "திசையை மாற்று" : "Swap direction"} className="grid h-9 w-9 place-items-center rounded-full border border-ink-100 dark:border-white/10">⇄</button>
        {toInr ? <span className="font-bold">INR</span> : (
          <select value={q.key} onChange={(e) => setK(e.target.value)} aria-label={ta ? "நாணயம்" : "Currency"} className="rounded-xl border border-ink-100 bg-white px-2 py-2 font-bold dark:border-white/10 dark:bg-ink-950">{fx.map((x) => <option key={x.key} value={x.key}>{CODE[x.key]}</option>)}</select>
        )}
      </div>
      <p className="mt-3 text-2xl font-black tabular-nums">{toInr ? `₹${f(out)}` : `${f(out, q.key === "jpyinr" ? 0 : 2)} ${CODE[q.key]}`}</p>
      <p className="text-xs opacity-65">1 {CODE[q.key]} = ₹{f(q.price, q.key === "jpyinr" ? 4 : 2)} · {ta ? "சந்தை விகிதம் (Yahoo Finance); வங்கி/பணமாற்று விகிதம் வேறுபடும்" : "Market rate (Yahoo Finance); bank and remittance rates differ"}</p>
    </section>
  );
}
