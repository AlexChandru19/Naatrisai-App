"use client";
import Link from "next/link";
import type { FuelCity } from "@/lib/fuel";
import type { CityGold } from "@/lib/bullion";
import type { Alert } from "@/lib/alerts";
import type { Article } from "@/lib/types";
import { DISTRICTS } from "@/lib/geo";
import { ALink, usePrefs } from "./providers";
import { TimeAgo } from "./time-ago";

const rs = (n?: number) => (n ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—");
const ch = (n?: number) => (n ? <span className={n > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>{n > 0 ? "▲" : "▼"}{Math.abs(n).toFixed(2)}</span> : null);

export function TownCard({ fuelBy, gold, alerts, items = [], fixed }: { fuelBy: Record<string, FuelCity>; gold?: CityGold; alerts: Alert[]; items?: Article[]; fixed?: string }) {
  const { lang, town, setTown, ready } = usePrefs(); const ta = lang === "ta";
  const slug = fixed ?? town;
  const d = DISTRICTS.find((x) => x.slug === slug);
  if (!d || (!fixed && !ready)) return null;
  const f = fuelBy[slug];
  const al = alerts.filter((a) => a.districts.includes(slug));
  const news = items.filter((a) => a.districts.includes(slug)).slice(0, 3);
  const mine = town === slug;
  return (
    <section data-mod={fixed ? undefined : "town"} className="rounded-2xl border border-peacock-600/30 bg-gradient-to-br from-peacock-600/10 to-transparent p-4 dark:border-peacock-500/30">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-extrabold">📍 {fixed ? (ta ? `${d.ta} — இன்று` : `${d.en} today`) : (ta ? `என் ஊர்: ${d.ta}` : `My town: ${d.en}`)}</h2>
        {fixed ? (
          <button onClick={() => setTown(slug)} disabled={mine} aria-pressed={mine} className={`rounded-full px-3 py-1 text-xs font-bold ${mine ? "bg-peacock-600 text-white" : "border border-peacock-600 text-peacock-600 dark:text-peacock-500"}`}>{mine ? (ta ? "✓ என் ஊர்" : "✓ My town") : (ta ? "என் ஊராக அமை" : "Set as my town")}</button>
        ) : (
          <select value={slug} onChange={(e) => setTown(e.target.value)} aria-label={ta ? "ஊர்" : "Town"} className="max-w-[45%] rounded-full border border-ink-100 bg-white px-2 py-1 text-xs font-semibold dark:border-white/10 dark:bg-ink-900">
            {DISTRICTS.map((x) => <option key={x.slug} value={x.slug}>{ta ? x.ta : x.en}</option>)}
          </select>
        )}
      </div>
      {al.length > 0 ? (
        <Link href="/alerts" className="mt-2 block rounded-xl bg-orange-100 px-3 py-2 text-sm font-semibold dark:bg-orange-500/15">⚠️ {al[0].title}</Link>
      ) : <p className="mt-2 text-xs opacity-70">✅ {ta ? "இந்த மாவட்டத்திற்குச் செயலில் உள்ள IMD/NDMA எச்சரிக்கை இல்லை" : "No active IMD/NDMA alert for this district"}</p>}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/70 p-2 dark:bg-white/5"><div className="text-[11px] font-bold opacity-70">⛽ {ta ? "பெட்ரோல்" : "Petrol"}</div><div className="font-black tabular-nums">{rs(f?.petrol)}</div><div className="text-[10px]">{ch(f?.pCh)}</div></div>
        <div className="rounded-xl bg-white/70 p-2 dark:bg-white/5"><div className="text-[11px] font-bold opacity-70">🛢️ {ta ? "டீசல்" : "Diesel"}</div><div className="font-black tabular-nums">{rs(f?.diesel)}</div><div className="text-[10px]">{ch(f?.dCh)}</div></div>
        <div className="rounded-xl bg-white/70 p-2 dark:bg-white/5"><div className="text-[11px] font-bold opacity-70">🥇 22K {ta ? "(சென்னை)" : "(Chennai)"}</div><div className="font-black tabular-nums">{gold ? rs(gold.k22) : "—"}</div><div className="text-[10px] opacity-60">/g</div></div>
      </div>
      {!f && <p className="mt-1 text-[11px] opacity-60">{ta ? "இந்த மாவட்டத்தின் எரிபொருள் விலை மூலத்தில் இல்லை." : "Fuel price for this district isn't listed by the source."}</p>}
      {news.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {news.map((a) => <li key={a.id} className="text-sm leading-snug"><ALink a={a} className="font-semibold hover:underline">{a.title}</ALink> <span className="text-[11px] opacity-60">· {a.source} · <TimeAgo iso={a.publishedAt} /></span></li>)}
        </ul>
      )}
      {!fixed && <Link href={`/tamilnadu/${slug}`} className="mt-3 inline-block text-xs font-bold text-kumkum-600 dark:text-manjal-400">{ta ? `${d.ta} செய்திகள் அனைத்தும் →` : `All ${d.en} news →`}</Link>}
      <p className="mt-2 text-[10px] opacity-55">{ta ? "எரிபொருள், தங்கம்: Goodreturns · எச்சரிக்கை: NDMA SACHET" : "Fuel & gold: Goodreturns · Alerts: NDMA SACHET"}</p>
    </section>
  );
}
