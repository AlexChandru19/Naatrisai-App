"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Holiday, Otd } from "@/lib/calendar";
import { usePrefs } from "./providers";

const istToday = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400e3);
const fmtDate = (d: string, ta: boolean, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) => new Date(d + "T12:00:00+05:30").toLocaleDateString(ta ? "ta-IN" : "en-IN", { ...opts, timeZone: "Asia/Kolkata" });
const card = "rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900";

function useToday(server: string) {
  const [t, setT] = useState(server);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setT(istToday()); }, []);
  return t;
}

export function TodayCard({ server }: { server: string }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const t = useToday(server);
  return (
    <section className={`${card} bg-gradient-to-br from-manjal-300/30 to-kumkum-500/10`}>
      <div className="text-xs font-bold uppercase tracking-wide opacity-70">{ta ? "இன்று" : "Today"}</div>
      <div className="text-3xl font-black" suppressHydrationWarning>{fmtDate(t, ta, { weekday: "long" })}</div>
      <div className="text-lg font-bold" suppressHydrationWarning>{fmtDate(t, ta, { day: "numeric", month: "long", year: "numeric" })}</div>
      <p className="mt-2 text-[11px] opacity-65">{ta ? "தமிழ் மாதம், திதி, நட்சத்திரம், நல்ல நேரம் போன்ற பஞ்சாங்கத் தகவல்களுக்கு நம்பகமான இலவசத் தரவு மூலம் கிடைக்காததால் அவற்றைச் சேர்க்கவில்லை." : "Panchangam details (Tamil month, thithi, nakshatram, auspicious times) are not shown — we found no reliable free data source for them."}</p>
    </section>
  );
}

export function HolidayList({ list, server, compact = false }: { list: Holiday[]; server: string; compact?: boolean }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const t = useToday(server);
  const [all, setAll] = useState(false);
  const up = useMemo(() => list.filter((h) => h.date >= t && (all || h.kind === "public" || days(t, h.date) <= 30)), [list, t, all]);
  const show = compact ? up.filter((h) => h.kind === "public").slice(0, 4) : up.slice(0, all ? 80 : 24);
  if (!list.length) return <p className={`${card} text-sm opacity-70`}>{ta ? "விடுமுறை நாள்காட்டி இப்போது கிடைக்கவில்லை." : "Holiday calendar is unavailable right now."}</p>;
  return (
    <section className={card} data-mod={compact ? "history" : undefined}>
      <div className="mb-2 flex items-center justify-between gap-2"><h2 className="font-extrabold">🎉 {ta ? "வரவிருக்கும் விடுமுறைகள் & விழாக்கள்" : "Upcoming holidays & festivals"}</h2>{compact ? <Link href="/calendar" className="text-xs font-bold text-kumkum-600 dark:text-manjal-400">{ta ? "நாள்காட்டி →" : "Calendar →"}</Link> : <button onClick={() => setAll(!all)} className="text-xs font-bold text-kumkum-600 underline dark:text-manjal-400">{all ? (ta ? "முக்கியமானவை மட்டும்" : "Key dates only") : (ta ? "அனைத்து அனுசரிப்புகளும்" : "All observances")}</button>}</div>
      <ul className="divide-y divide-ink-100 dark:divide-white/10">
        {show.map((h) => { const n = days(t, h.date); return (
          <li key={h.date + h.name} className="flex items-center gap-3 py-2">
            <div className="w-16 shrink-0 text-center"><div className="text-xs font-bold opacity-70" suppressHydrationWarning>{fmtDate(h.date, ta, { month: "short" })}</div><div className="text-xl font-black leading-none" suppressHydrationWarning>{fmtDate(h.date, ta, { day: "numeric" })}</div></div>
            <div className="min-w-0 flex-1"><div className="font-bold">{ta && h.ta ? h.ta : h.name}</div><div className="text-xs opacity-65" suppressHydrationWarning>{fmtDate(h.date, ta, { weekday: "long" })} · {h.kind === "public" ? (ta ? "பொது விடுமுறை (மத்திய அரசு)" : "Public holiday (central)") : (ta ? "அனுசரிப்பு" : "Observance")}</div></div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${n === 0 ? "bg-kumkum-600 text-white" : "bg-ink-100 dark:bg-white/10"}`} suppressHydrationWarning>{n === 0 ? (ta ? "இன்று" : "Today") : n === 1 ? (ta ? "நாளை" : "Tomorrow") : ta ? `${n} நாளில்` : `in ${n} days`}</span>
          </li>); })}
      </ul>
      <p className="mt-2 text-[11px] opacity-65">{ta ? "மூலம்: Google பொது “இந்திய விடுமுறைகள்” நாள்காட்டி. தமிழ்நாடு அரசின் விடுமுறைப் பட்டியல் (அரசாணை) சற்று வேறுபடலாம்; பள்ளி/அலுவலக விடுமுறைக்கு அரசு அறிவிப்பைச் சரிபார்க்கவும்." : "Source: Google's public “Holidays in India” calendar. Tamil Nadu's own government holiday list may differ — check the official G.O. for school/office closures."}</p>
    </section>
  );
}

export function OnThisDay({ items, max = 12, compact = false }: { items: Otd[]; max?: number; compact?: boolean }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  if (!items.length) return null;
  return (
    <section className={card} data-mod={compact ? "history" : undefined}>
      <div className="mb-2 flex items-center justify-between"><h2 className="font-extrabold">📜 {ta ? "வரலாற்றில் இன்று" : "On this day"}</h2>{compact && <Link href="/calendar" className="text-xs font-bold text-kumkum-600 dark:text-manjal-400">{ta ? "மேலும் →" : "More →"}</Link>}</div>
      <ul className="space-y-2.5">
        {items.slice(0, max).map((o) => (
          <li key={o.year + o.text.slice(0, 20)} className="flex gap-3">
            <span className="w-12 shrink-0 text-right font-black tabular-nums text-kumkum-600 dark:text-manjal-400">{o.year}</span>
            <span className="text-sm leading-snug">{o.india && <span className="mr-1" title="India">🇮🇳</span>}{o.link ? <a href={o.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{o.text}</a> : o.text}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] opacity-65">{ta ? "மூலம்: விக்கிப்பீடியா “On this day” (CC BY-SA) — ஆங்கிலத்தில் உள்ளபடி." : "Source: Wikipedia “On this day” (CC BY-SA)."}</p>
    </section>
  );
}
