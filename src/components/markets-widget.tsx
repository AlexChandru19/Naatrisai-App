"use client";
import Link from "next/link";
import type { Markets } from "@/lib/markets";
import type { Match } from "@/lib/cricket";
import { usePrefs } from "./providers";
import { When } from "./money";

const fmt = (n: number, d = 2) => n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

function Spark({ v, up }: { v: number[]; up: boolean }) {
  if (v.length < 3) return null;
  const min = Math.min(...v), max = Math.max(...v), r = max - min || 1;
  const pts = v.map((x, i) => `${(i / (v.length - 1)) * 60},${18 - ((x - min) / r) * 16}`).join(" ");
  return <svg viewBox="0 0 60 20" className="h-5 w-14" aria-hidden><polyline points={pts} fill="none" strokeWidth="1.6" stroke={up ? "#16a34a" : "#dc2626"} /></svg>;
}

export function MarketsWidget({ m, full = false, title }: { m: Markets; full?: boolean; title?: { ta: string; en: string } }) {
  const { lang } = usePrefs();
  const ta = lang === "ta";
  if (!m.quotes.length) return null;
  const qs = full ? m.quotes : m.quotes.filter((q) => ["nifty", "sensex", "usdinr", "gold-inr"].includes(q.key));
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900" aria-label={ta ? "சந்தை நிலவரம்" : "Markets"}>
      <div className="mb-2 flex items-center justify-between"><h2 className="font-extrabold">💹 {title ? (ta ? title.ta : title.en) : ta ? "சந்தை நிலவரம்" : "Markets"}</h2>{!full && <Link href="/markets" className="text-xs font-bold text-kumkum-600 dark:text-manjal-400">{ta ? "மேலும் →" : "More →"}</Link>}</div>
      <ul className="divide-y divide-ink-100 dark:divide-white/10">
        {qs.map((q) => {
          const up = q.change >= 0;
          return (
            <li key={q.key} className="flex items-center gap-2 py-2">
              <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{ta ? q.ta : q.en}</div>{q.note && <div className="text-[11px] opacity-60">{ta ? q.note.ta : q.note.en}</div>}</div>
              <Spark v={q.spark} up={up} />
              <div className="text-right tabular-nums"><div className="text-sm font-extrabold">{q.unit === "₹" ? "₹" : ""}{fmt(q.price, q.key === "jpyinr" ? 4 : q.key === "gold-inr" ? 0 : 2)}{q.unit && q.unit !== "₹" ? <span className="text-[10px] opacity-60"> {q.unit}</span> : null}</div>
                <div className={`text-xs font-bold ${up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{up ? "▲" : "▼"} {fmt(Math.abs(q.change))} ({fmt(Math.abs(q.pct))}%)</div></div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] opacity-60">{ta ? `மூலம்: ${m.source} · தாமதமான தரவு · கடைசி விலை ` : `Source: ${m.source} · delayed · last trade `}<When t={Math.max(...m.quotes.map((q) => q.time))} label={{ ta: "", en: "" }} /></p>
    </section>
  );
}

export function CricketWidget({ matches }: { matches: Match[] }) {
  const { lang } = usePrefs();
  const ta = lang === "ta";
  if (!matches.length) return null;
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900" aria-label={ta ? "கிரிக்கெட் ஸ்கோர்" : "Cricket scores"}>
      <h2 className="mb-2 font-extrabold">🏏 {ta ? "கிரிக்கெட் ஸ்கோர்" : "Cricket scores"}</h2>
      <ul className="space-y-1.5">
        {matches.slice(0, 6).map((m) => (
          <li key={m.link || m.title}><a href={m.link} target="_blank" rel="noopener noreferrer" className={`block rounded-xl px-2.5 py-1.5 text-sm font-semibold hover:bg-ink-50 dark:hover:bg-white/5 ${m.india ? "bg-manjal-300/25" : ""}`}>{m.live && <span className="live-dot mr-1 text-red-600" aria-label="live">●</span>}{m.title}{m.upcoming && <span className="ml-1 rounded bg-ink-100 px-1 text-[10px] font-bold dark:bg-white/10">{ta ? "தொடங்கவில்லை" : "yet to start"}</span>}</a></li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] opacity-60">{ta ? "மூலம்: ESPNcricinfo நேரடி ஸ்கோர் RSS · * = பேட்டிங் அணி · ● = நடைபெறுகிறது" : "Source: ESPNcricinfo live-scores RSS · * = batting side · ● = in progress"}</p>
    </section>
  );
}
