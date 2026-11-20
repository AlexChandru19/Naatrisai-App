"use client";
import { useSyncExternalStore } from "react";
import { usePrefs } from "./providers";

/** Tamil diaspora world clock — computed on the device with Intl time zones (no external data). */
const ZONES = [
  { tz: "Asia/Kolkata", ta: "இந்தியா (IST)", en: "India (IST)", f: "🇮🇳" },
  { tz: "Asia/Colombo", ta: "இலங்கை", en: "Sri Lanka", f: "🇱🇰" },
  { tz: "Asia/Singapore", ta: "சிங்கப்பூர்", en: "Singapore", f: "🇸🇬" },
  { tz: "Asia/Kuala_Lumpur", ta: "மலேசியா", en: "Malaysia", f: "🇲🇾" },
  { tz: "Asia/Dubai", ta: "துபாய்", en: "Dubai", f: "🇦🇪" },
  { tz: "Europe/London", ta: "லண்டன்", en: "London", f: "🇬🇧" },
  { tz: "America/New_York", ta: "நியூயார்க்", en: "New York", f: "🇺🇸" },
  { tz: "America/Toronto", ta: "டொராண்டோ", en: "Toronto", f: "🇨🇦" },
  { tz: "Australia/Sydney", ta: "சிட்னி", en: "Sydney", f: "🇦🇺" },
];
let now = 0;
const sub = (cb: () => void) => { now = Date.now(); const t = setInterval(() => { now = Date.now(); cb(); }, 20000); return () => clearInterval(t); };
const offMin = (tz: string, d: Date) => { const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(d); const g = (k: string) => +p.find((x) => x.type === k)!.value; return (Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute")) - Math.floor(d.getTime() / 60000) * 60000) / 60000; };

export function WorldClock() {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const t = useSyncExternalStore(sub, () => now, () => 0);
  const d = new Date(t); const ist = t ? offMin("Asia/Kolkata", d) : 0;
  return (
    <section data-worldclock aria-label={ta ? "உலக நேரம்" : "World clock"} className="mt-5 rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
      <h2 className="font-extrabold">🕰️ {ta ? "உலகத் தமிழர் நேரம்" : "Tamil diaspora world clock"}</h2>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {ZONES.map((z) => {
          const diff = t ? offMin(z.tz, d) - ist : 0;
          const h = t ? Number(new Intl.DateTimeFormat("en-US", { timeZone: z.tz, hour: "numeric", hourCycle: "h23" }).format(d)) : 12;
          const rel = !t || z.tz === "Asia/Kolkata" ? "" : diff === 0 ? (ta ? "IST நேரமே" : "same as IST") : `${diff >= 0 ? "+" : "−"}${Math.floor(Math.abs(diff) / 60)}${Math.abs(diff) % 60 ? `:${String(Math.abs(diff) % 60).padStart(2, "0")}` : ""}${ta ? " மணி" : "h"}`;
          return (
            <div key={z.tz} className={`min-w-[7.5rem] shrink-0 rounded-xl px-3 py-2 ${z.tz === "Asia/Kolkata" ? "bg-kumkum-600 text-white" : "bg-ink-50 dark:bg-white/5"}`}>
              <div className="text-xs font-bold">{z.f} {ta ? z.ta : z.en}</div>
              <div className="text-xl font-black tabular-nums" suppressHydrationWarning>{t ? new Intl.DateTimeFormat("en-IN", { timeZone: z.tz, hour: "numeric", minute: "2-digit", hour12: true }).format(d) : "—"} <span aria-hidden className="text-sm">{h >= 6 && h < 18 ? "☀️" : "🌙"}</span></div>
              <div className="text-[11px] opacity-80" suppressHydrationWarning>{t ? new Intl.DateTimeFormat(ta ? "ta-IN" : "en-IN", { timeZone: z.tz, weekday: "short", day: "numeric", month: "short" }).format(d) : ""}{rel && ` · ${rel}`}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
