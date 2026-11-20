"use client";
import Link from "next/link";
import { useState } from "react";
import { DISTRICTS, ZONES, STATES, STATE_REGIONS, WORLD_REGIONS } from "@/lib/geo";
import { usePrefs } from "./providers";

export function DistrictPicker({ active, compact = false }: { active?: string; compact?: boolean }) {
  const { lang } = usePrefs();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const cur = DISTRICTS.find((d) => d.slug === active);
  const list = DISTRICTS.filter((d) => !q || d.en.toLowerCase().includes(q.toLowerCase()) || d.ta.includes(q) || d.alt.some((a) => a.toLowerCase().includes(q.toLowerCase())));
  const zones = Object.keys(ZONES) as (keyof typeof ZONES)[];
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-left font-extrabold lg:pointer-events-none">
          📍 {cur ? (lang === "ta" ? cur.ta : cur.en) : lang === "ta" ? "உங்கள் மாவட்டம் (38)" : "Your district (38)"}
          <span className={`text-xs transition lg:hidden ${open ? "rotate-180" : ""}`}>▼</span>
        </button>
        <input onFocus={() => setOpen(true)} value={q} onChange={(e) => setQ(e.target.value)} placeholder={lang === "ta" ? "தேடு…" : "Find…"} className="w-28 rounded-full border border-ink-100 bg-ink-50 px-3 py-1 text-sm outline-none focus:border-kumkum-400 dark:border-white/10 dark:bg-white/5" />
      </div>
      <div className={`mt-3 space-y-3 ${open ? "" : "hidden lg:block"} ${compact ? "max-h-72 overflow-y-auto pr-1" : ""}`}>
        {zones.map((z) => {
          const ds = list.filter((d) => d.zone === z);
          if (!ds.length) return null;
          return (
            <div key={z}>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-900/50 dark:text-white/40">{lang === "ta" ? ZONES[z].ta : ZONES[z].en}</div>
              <div className="flex flex-wrap gap-1.5">
                {ds.map((d) => (
                  <Link key={d.slug} href={`/tamilnadu/${d.slug}`} className={`rounded-lg border px-2.5 py-1 text-[13px] font-semibold transition hover:-translate-y-0.5 ${active === d.slug ? "border-kumkum-600 bg-kumkum-600 text-white" : "border-ink-100 hover:border-kumkum-400 hover:bg-kumkum-50 dark:border-white/10 dark:hover:bg-white/5"}`}>
                    {lang === "ta" ? d.ta : d.en}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const REGION_COLORS: Record<string, string> = { south: "from-kumkum-500 to-manjal-500", north: "from-indigo-500 to-sky-500", east: "from-emerald-500 to-teal-500", west: "from-amber-500 to-orange-500", central: "from-fuchsia-500 to-pink-500", northeast: "from-lime-500 to-green-600" };

export function StateGrid({ active }: { active?: string }) {
  const { lang } = usePrefs();
  const [showUT, setShowUT] = useState<"all" | "states" | "uts">("all");
  const regions = Object.keys(STATE_REGIONS) as (keyof typeof STATE_REGIONS)[];
  const pass = (ut?: boolean) => showUT === "all" || (showUT === "uts" ? ut : !ut);
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-extrabold">🗺️ {lang === "ta" ? "மாநிலம் / யூனியன் பிரதேசம் தேர்வு" : "Pick a State / UT"}</h3>
        <div className="flex rounded-full border border-ink-100 p-0.5 text-xs font-bold dark:border-white/10">
          {([["all", "அனைத்தும் (36)", "All (36)"], ["states", "மாநிலங்கள் (28)", "States (28)"], ["uts", "யூ.பி. (8)", "UTs (8)"]] as const).map(([v, ta, en]) => (
            <button key={v} onClick={() => setShowUT(v)} className={`rounded-full px-2.5 py-1 ${showUT === v ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "opacity-60"}`}>{lang === "ta" ? ta : en}</button>
          ))}
        </div>
      </div>
      <div className="mt-3 space-y-3">
        {regions.map((r) => {
          const ss = STATES.filter((s) => s.region === r && pass(s.ut));
          if (!ss.length) return null;
          return (
            <div key={r}>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-900/50 dark:text-white/40">{lang === "ta" ? STATE_REGIONS[r].ta : STATE_REGIONS[r].en}</div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {ss.map((s) => (
                  <Link key={s.slug} href={s.slug === "tamil-nadu" ? "/tamilnadu" : `/india/${s.slug}`} className={`group relative overflow-hidden rounded-xl border p-2 transition hover:-translate-y-0.5 hover:shadow-md ${active === s.slug ? "border-kumkum-600 ring-2 ring-kumkum-500/40" : "border-ink-100 dark:border-white/10"}`}>
                    <span className={`absolute inset-0 bg-gradient-to-br ${REGION_COLORS[r]} opacity-10 transition group-hover:opacity-25`} />
                    <span className="relative block text-lg font-black tracking-tight opacity-80">{s.abbr}</span>
                    <span className="relative block truncate text-[12px] font-semibold leading-tight">{lang === "ta" ? s.ta : s.en}</span>
                    {s.ut && <span className="absolute right-1.5 top-1.5 rounded bg-ink-900/10 px-1 text-[9px] font-bold dark:bg-white/15">UT</span>}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RegionPicker({ active }: { active?: string }) {
  const { lang } = usePrefs();
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <Link href="/world" className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 ${!active ? "border-peacock-600 bg-peacock-600 text-white" : "border-ink-100 bg-white dark:border-white/10 dark:bg-ink-900"}`}>🌐 {lang === "ta" ? "அனைத்தும்" : "All world"}</Link>
      {WORLD_REGIONS.map((r) => (
        <Link key={r.slug} href={`/world/${r.slug}`} className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 ${active === r.slug ? "border-peacock-600 bg-peacock-600 text-white" : "border-ink-100 bg-white dark:border-white/10 dark:bg-ink-900"}`}>{r.emoji} {lang === "ta" ? r.ta : r.en}</Link>
      ))}
    </div>
  );
}
