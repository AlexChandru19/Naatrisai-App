"use client";
import Link from "next/link";
import { useState } from "react";
import { DISTRICTS, STATES } from "@/lib/geo";
import { usePrefs } from "./providers";

// Tile-grid cartogram of India (one square per state/UT; position is approximate, not to scale).
const TILES: Record<string, [number, number]> = {
  JK: [3, 0], LA: [4, 0], PB: [2, 1], HP: [3, 1], UK: [4, 1], AR: [10, 1], CH: [2, 2], HR: [3, 2], DL: [4, 2], UP: [5, 2], BR: [6, 2], SK: [7, 2], AS: [9, 2], NL: [10, 2],
  RJ: [2, 3], MP: [3, 3], CG: [4, 3], JH: [5, 3], WB: [6, 3], ML: [8, 3], MN: [10, 3], GJ: [1, 4], DD: [2, 4], MH: [3, 4], TS: [4, 4], OD: [5, 4], TR: [8, 4], MZ: [9, 4],
  GA: [2, 5], KA: [3, 5], AP: [4, 5], LD: [1, 6], KL: [3, 6], TN: [4, 6], PY: [5, 6], AN: [7, 6],
};

export function DistrictMap({ counts }: { counts: Record<string, number> }) {
  const { lang } = usePrefs();
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...Object.values(counts));
  // Equirectangular projection of district HQ coordinates (lon 76.2–80.4, lat 8.0–13.6).
  const X = (lon: number) => ((lon - 76.2) / 4.2) * 380 + 30, Y = (lat: number) => ((13.6 - lat) / 5.6) * 520 + 20;
  return (
    <svg viewBox="0 0 440 560" className="h-auto w-full" role="img" aria-label={lang === "ta" ? "தமிழ்நாடு மாவட்டச் செய்தி வரைபடம்" : "Tamil Nadu district news map"}>
      <rect x="0" y="0" width="440" height="560" rx="24" className="fill-sky-50 dark:fill-ink-800" />
      <text x="400" y="300" className="fill-sky-700/40 text-[13px] font-bold dark:fill-sky-300/30" textAnchor="middle" transform="rotate(90 400 300)">வங்காள விரிகுடா · Bay of Bengal</text>
      {DISTRICTS.map((d) => {
        const n = counts[d.slug] ?? 0, r = 6 + Math.sqrt(n / max) * 20, x = X(d.lon), y = Y(d.lat), on = hover === d.slug;
        return (
          <Link key={d.slug} href={`/tamilnadu/${d.slug}`} onMouseEnter={() => setHover(d.slug)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(d.slug)} aria-label={`${lang === "ta" ? d.ta : d.en}: ${n}`}>
            <circle cx={x} cy={y} r={r} fill="#c8321a" fillOpacity={n ? 0.25 + 0.6 * (n / max) : 0.12} stroke="#c8321a" strokeWidth={on ? 3 : 1} />
            <title>{`${lang === "ta" ? d.ta : d.en} — ${n}`}</title>
            {(on || n >= Math.max(2, max * 0.15)) && <text x={x} y={y + r + 11} textAnchor="middle" className="pointer-events-none fill-ink-900 text-[11px] font-extrabold dark:fill-white" stroke="white" strokeWidth={on ? 0 : 3} paintOrder="stroke">{lang === "ta" ? d.ta : d.en} {n}</text>}
          </Link>
        );
      })}
    </svg>
  );
}

export function RankList({ counts, kind }: { counts: Record<string, number>; kind: "district" | "state" }) {
  const { lang } = usePrefs();
  const items = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const name = (s: string) => { const x = kind === "district" ? DISTRICTS.find((d) => d.slug === s) : STATES.find((d) => d.slug === s); return x ? (lang === "ta" ? x.ta : x.en) : s; };
  return (
    <ol className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
      {items.map(([s, n], i) => <li key={s}><Link href={kind === "district" ? `/tamilnadu/${s}` : `/india/${s}`} className="flex justify-between gap-2 rounded-lg px-2 py-0.5 hover:bg-ink-50 dark:hover:bg-white/5"><span><b className="mr-1 opacity-50">{i + 1}.</b>{name(s)}</span><b>{n}</b></Link></li>)}
    </ol>
  );
}

export function IndiaTiles({ counts }: { counts: Record<string, number> }) {
  const { lang } = usePrefs();
  const max = Math.max(1, ...Object.values(counts));
  const S = 54;
  return (
    <svg viewBox={`0 0 ${11 * S + 10} ${7 * S + 10}`} className="h-auto w-full" role="img" aria-label={lang === "ta" ? "இந்திய மாநிலச் செய்தி வரைபடம்" : "India state news tile map"}>
      {STATES.map((s) => {
        const p = TILES[s.abbr]; if (!p) return null;
        const n = counts[s.slug] ?? 0;
        return (
          <Link key={s.slug} href={`/india/${s.slug}`} aria-label={`${lang === "ta" ? s.ta : s.en}: ${n}`}>
            <title>{`${lang === "ta" ? s.ta : s.en} — ${n}`}</title>
            <rect x={p[0] * S + 5} y={p[1] * S + 5} width={S - 4} height={S - 4} rx="10" fill="#f0a500" fillOpacity={n ? 0.25 + 0.7 * (n / max) : 0.1} stroke="#f0a500" />
            <text x={p[0] * S + 5 + (S - 4) / 2} y={p[1] * S + 27} textAnchor="middle" className="fill-ink-900 text-[13px] font-extrabold dark:fill-white">{s.abbr}</text>
            <text x={p[0] * S + 5 + (S - 4) / 2} y={p[1] * S + 43} textAnchor="middle" className="fill-ink-900 text-[11px] dark:fill-white">{n}</text>
          </Link>
        );
      })}
    </svg>
  );
}
