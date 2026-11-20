"use client";
import Link from "next/link";
import type { Alert } from "@/lib/alerts";
import { DISTRICTS } from "@/lib/geo";
import { usePrefs } from "./providers";
import { TimeAgo } from "./time-ago";
import { When } from "./money";

const SEV: Record<string, { ta: string; en: string; cls: string }> = {
  Extreme: { ta: "மிகத் தீவிரம்", en: "Extreme", cls: "bg-rose-700 text-white" },
  Severe: { ta: "தீவிரம்", en: "Severe", cls: "bg-red-600 text-white" },
  Moderate: { ta: "மிதமானது", en: "Moderate", cls: "bg-orange-500 text-white" },
  Minor: { ta: "சிறியது", en: "Minor", cls: "bg-yellow-400 text-ink-900" },
};
const dName = (slug: string, ta: boolean) => { const d = DISTRICTS.find((x) => x.slug === slug); return d ? (ta ? d.ta : d.en) : slug; };

/** Slim banner for active IMD alerts in Tamil Nadu; renders nothing when there are none. */
export function AlertBanner({ alerts, district }: { alerts: Alert[]; district?: string }) {
  const { lang, town } = usePrefs(); const ta = lang === "ta";
  const list = district ? alerts.filter((a) => a.districts.includes(district)) : alerts;
  if (!list.length) return null;
  const mine = !district && list.find((a) => a.districts.includes(town));
  const top = mine || list[0];
  return (
    <Link data-mod="alerts" href="/alerts" className="mt-3 flex items-start gap-2 rounded-2xl border border-orange-300 bg-orange-50 px-3 py-2 text-sm dark:border-orange-400/40 dark:bg-orange-500/10">
      <span className="text-lg leading-none" aria-hidden>⚠️</span>
      <span className="min-w-0 flex-1">
        <b>{ta ? `IMD எச்சரிக்கை${list.length > 1 ? ` (${list.length})` : ""}` : `IMD alert${list.length > 1 ? `s (${list.length})` : ""}`}{mine ? (ta ? ` · உங்கள் ஊர் ${dName(town, true)}` : ` · your town ${dName(town, false)}`) : ""}: </b>
        <span className="opacity-90">{top.title}</span>
      </span>
      <span className="shrink-0 text-xs font-bold text-kumkum-600 dark:text-manjal-400">{ta ? "விவரம் →" : "Details →"}</span>
    </Link>
  );
}

export function AlertList({ items, expired = false, empty }: { items: Alert[]; expired?: boolean; empty?: { ta: string; en: string } }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  if (!items.length) return empty ? <p className="rounded-2xl border border-ink-100 bg-white p-4 text-sm opacity-75 dark:border-white/10 dark:bg-ink-900">{ta ? empty.ta : empty.en}</p> : null;
  return (
    <ul className="space-y-2">
      {items.map((a) => {
        const sev = a.severity ? SEV[a.severity] : undefined;
        return (
          <li key={a.id} className={`rounded-2xl border border-ink-100 bg-white p-3 dark:border-white/10 dark:bg-ink-900 ${expired ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {sev && <span className={`rounded-full px-2 py-0.5 font-bold ${sev.cls}`}>{ta ? sev.ta : sev.en}</span>}
              {a.event && <span className="rounded-full bg-ink-100 px-2 py-0.5 font-bold dark:bg-white/10">{a.event}</span>}
              {expired && <span className="rounded-full bg-ink-100 px-2 py-0.5 font-bold dark:bg-white/10">{ta ? "காலாவதியானது" : "Expired"}</span>}
              <span className="opacity-70">{a.issuer} · <TimeAgo iso={a.time} /></span>
            </div>
            <p className="mt-1.5 font-semibold leading-snug">{a.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              {a.districts.map((d) => <Link key={d} href={`/tamilnadu/${d}`} className="rounded-full border border-ink-100 px-2 py-0.5 font-semibold hover:bg-ink-50 dark:border-white/10 dark:hover:bg-white/5">📍 {dName(d, ta)}</Link>)}
              {a.expires && <span className="opacity-70">{ta ? "செல்லுபடி வரை: " : "Valid until: "}<When t={a.expires} label={{ ta: "", en: "" }} /></span>}
              <a href={a.link} target="_blank" rel="noopener noreferrer" className="ml-auto font-bold text-kumkum-600 underline dark:text-manjal-400">CAP ↗</a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
