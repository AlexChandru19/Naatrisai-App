"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DISTRICTS } from "@/lib/geo";
import { usePrefs } from "./providers";

type W = { current: { temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; weather_code: number; wind_speed_10m: number; time: string }; daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[] } };

const CODES: [number[], string, string, string][] = [
  [[0], "☀️", "தெளிவான வானம்", "Clear sky"],
  [[1, 2], "🌤️", "ஓரளவு மேகம்", "Partly cloudy"],
  [[3], "☁️", "மேகமூட்டம்", "Overcast"],
  [[45, 48], "🌫️", "பனிமூட்டம்", "Fog"],
  [[51, 53, 55, 56, 57], "🌦️", "தூறல்", "Drizzle"],
  [[61, 63, 65, 66, 67, 80, 81, 82], "🌧️", "மழை", "Rain"],
  [[71, 73, 75, 77, 85, 86], "❄️", "பனி", "Snow"],
  [[95, 96, 99], "⛈️", "இடியுடன் மழை", "Thunderstorm"],
];
const desc = (c: number) => CODES.find((x) => x[0].includes(c)) ?? [[c], "🌡️", "வானிலை", "Weather"];

type AQ = { current: { us_aqi: number | null; pm2_5: number | null; pm10: number | null; time: string } };
// US-EPA AQI bands (Open-Meteo reports the US AQI scale).
const AQI_BANDS: [number, string, string, string][] = [
  [50, "நல்லது", "Good", "bg-green-500"], [100, "மிதமானது", "Moderate", "bg-yellow-400"], [150, "உணர்திறன் உள்ளோருக்குக் கேடு", "Unhealthy for sensitive groups", "bg-orange-500"],
  [200, "உடல்நலத்துக்குக் கேடு", "Unhealthy", "bg-red-600"], [300, "மிகக் கேடு", "Very unhealthy", "bg-purple-700"], [9999, "அபாயம்", "Hazardous", "bg-rose-900"],
];
export const aqiBand = (v: number) => AQI_BANDS.find((b) => v <= b[0])!;

export function WeatherWidget({ fixed }: { fixed?: string }) {
  const { lang, town, setTown } = usePrefs();
  const slug = fixed ?? town;
  const setSlug = (s: string) => setTown(s);
  const [data, setData] = useState<W | null>(null);
  const [aq, setAq] = useState<AQ | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    const d = DISTRICTS.find((x) => x.slug === slug) ?? DISTRICTS[2];
    let on = true;
    setAq(null); // eslint-disable-line react-hooks/set-state-in-effect
    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${d.lat}&longitude=${d.lon}&current=us_aqi,pm2_5,pm10&timezone=Asia%2FKolkata`)
      .then((r) => (r.ok ? r.json() : Promise.reject())).then((j) => on && setAq(j)).catch(() => {});
    return () => { on = false; };
  }, [slug]);
  useEffect(() => {
    const d = DISTRICTS.find((x) => x.slug === slug) ?? DISTRICTS[2];
    let on = true;
    setData(null); setErr(false); // eslint-disable-line react-hooks/set-state-in-effect
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${d.lat}&longitude=${d.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=4`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => on && setData(j))
      .catch(() => on && setErr(true));
    return () => { on = false; };
  }, [slug]);
  const d = DISTRICTS.find((x) => x.slug === slug)!;
  const cur = data ? desc(data.current.weather_code) : null;
  const day = (iso: string) => new Date(iso + "T00:00:00+05:30").toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { weekday: "short", timeZone: "Asia/Kolkata" });

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-peacock-600 via-peacock-500 to-sky-500 p-4 text-white shadow-lg shadow-peacock-600/20">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider opacity-90">{lang === "ta" ? "வானிலை" : "Weather"}</h3>
        {fixed ? <span className="text-sm font-bold">{lang === "ta" ? DISTRICTS.find((x) => x.slug === fixed)?.ta : DISTRICTS.find((x) => x.slug === fixed)?.en}</span> : <select value={slug} onChange={(e) => setSlug(e.target.value)} className="max-w-[60%] rounded-full bg-white/20 px-2 py-1 text-sm font-semibold outline-none [&>option]:text-ink-900" aria-label="City">
          {DISTRICTS.map((x) => <option key={x.slug} value={x.slug}>{lang === "ta" ? x.ta : x.en}</option>)}
        </select>}
      </div>
      {err ? <p className="mt-4 text-sm opacity-90">{lang === "ta" ? "வானிலைத் தரவைப் பெற முடியவில்லை." : "Couldn't load weather right now."}</p> : !data || !cur ? (
        <div className="mt-4 space-y-2"><div className="h-10 w-32 animate-pulse rounded bg-white/25" /><div className="h-4 w-full animate-pulse rounded bg-white/20" /></div>
      ) : (
        <>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-5xl leading-none">{cur[1]}</span>
            <div>
              <div className="text-4xl font-extrabold leading-none tabular-nums">{Math.round(data.current.temperature_2m)}°<span className="text-lg">C</span></div>
              <div className="text-sm opacity-90">{lang === "ta" ? cur[2] : cur[3]} · {lang === "ta" ? d.ta : d.en}</div>
            </div>
          </div>
          <div className="mt-2 flex gap-3 text-xs opacity-90">
            <span>{lang === "ta" ? "உணர்வு" : "Feels"} {Math.round(data.current.apparent_temperature)}°</span>
            <span>💧 {data.current.relative_humidity_2m}%</span>
            <span>🌬️ {Math.round(data.current.wind_speed_10m)} km/h</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {data.daily.time.map((t, i) => (
              <div key={t} className="rounded-xl bg-white/15 px-1 py-2 text-center text-xs">
                <div className="font-semibold">{i === 0 ? (lang === "ta" ? "இன்று" : "Today") : day(t)}</div>
                <div className="text-lg">{desc(data.daily.weather_code[i])[1]}</div>
                <div className="tabular-nums">{Math.round(data.daily.temperature_2m_max[i])}° / {Math.round(data.daily.temperature_2m_min[i])}°</div>
                <div className="opacity-80">☔ {data.daily.precipitation_probability_max[i] ?? 0}%</div>
              </div>
            ))}
          </div>
          {aq?.current?.us_aqi != null && (() => { const b = aqiBand(aq.current.us_aqi!); return (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 px-2.5 py-1.5 text-xs" title={lang === "ta" ? "Open-Meteo காற்றுத் தர மாதிரி மதிப்பீடு (CAMS) — CPCB நிலைய அளவீடு அல்ல" : "Open-Meteo air-quality model estimate (CAMS) — not a CPCB station reading"}>
              <span className={`inline-block h-3 w-3 rounded-full ${b[3]}`} aria-hidden />
              <span className="font-bold">{lang === "ta" ? "காற்றின் தரம்" : "Air quality"} {Math.round(aq.current.us_aqi!)}</span>
              <span className="opacity-90">· {lang === "ta" ? b[1] : b[2]}</span>
              {aq.current.pm2_5 != null && <span className="ml-auto opacity-80">PM2.5 {Math.round(aq.current.pm2_5)} µg/m³</span>}
            </div>); })()}
          <div className="mt-2 flex items-center justify-between text-[10px] opacity-75"><span>Open-Meteo · {lang === "ta" ? "காற்றுத் தரம்: US AQI மாதிரி மதிப்பீடு" : "AQI: US scale, model estimate"}</span>{!fixed && <Link href={`/tamilnadu/${slug}`} className="font-bold underline">{lang === "ta" ? "என் ஊர் →" : "My town →"}</Link>}</div>
        </>
      )}
    </div>
  );
}
