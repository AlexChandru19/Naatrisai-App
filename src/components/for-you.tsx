"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { TOPICS } from "@/lib/topics";
import { DISTRICTS, STATES, ZONES } from "@/lib/geo";
import { usePrefs, type Follows } from "./providers";
import { PageTitle } from "./hero";
import { Explorer } from "./explorer";
import { CatchUp } from "./catch-up";
import { CardSkeleton } from "./article-card";

const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-[13px] font-semibold transition active:scale-95 ${on ? "border-peacock-600 bg-peacock-600 text-white" : "border-ink-100 bg-white hover:border-kumkum-400 dark:border-white/10 dark:bg-ink-900"}`;

function Onboarding({ sources, onDone }: { sources: string[]; onDone: () => void }) {
  const { follows, setFollows, setOnboarded, lang } = usePrefs();
  const [f, setF] = useState<Follows>(follows);
  const ta = lang === "ta";
  const tog = (k: keyof Follows, v: string) => setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : [...x[k], v] }));
  const n = f.topics.length + f.districts.length + f.states.length + f.sources.length;
  return (
    <div className="mt-5 space-y-6 rounded-3xl border border-ink-100 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
      <div><h2 className="text-lg font-extrabold">1. {ta ? "உங்களுக்குப் பிடித்த தலைப்புகள்" : "Topics you care about"}</h2>
        <div className="mt-2 flex flex-wrap gap-2">{TOPICS.map((t) => <button key={t.slug} aria-pressed={f.topics.includes(t.slug)} className={chip(f.topics.includes(t.slug))} onClick={() => tog("topics", t.slug)}>{t.emoji} {ta ? t.ta : t.en}</button>)}</div></div>
      <div><h2 className="text-lg font-extrabold">2. {ta ? "உங்கள் மாவட்டங்கள்" : "Your districts"}</h2>
        {(Object.keys(ZONES) as (keyof typeof ZONES)[]).map((z) => (
          <div key={z} className="mt-2"><div className="mb-1 text-[11px] font-bold uppercase tracking-wider opacity-60">{ta ? ZONES[z].ta : ZONES[z].en}</div>
            <div className="flex flex-wrap gap-1.5">{DISTRICTS.filter((d) => d.zone === z).map((d) => <button key={d.slug} aria-pressed={f.districts.includes(d.slug)} className={chip(f.districts.includes(d.slug))} onClick={() => tog("districts", d.slug)}>{ta ? d.ta : d.en}</button>)}</div></div>
        ))}</div>
      <div><h2 className="text-lg font-extrabold">3. {ta ? "மாநிலங்கள்" : "States"}</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">{STATES.map((s) => <button key={s.slug} aria-pressed={f.states.includes(s.slug)} className={chip(f.states.includes(s.slug))} onClick={() => tog("states", s.slug)}>{ta ? s.ta : s.en}</button>)}</div></div>
      <div><h2 className="text-lg font-extrabold">4. {ta ? "நம்பும் ஊடகங்கள்" : "Outlets you trust"}</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">{sources.map((s) => <button key={s} aria-pressed={f.sources.includes(s)} className={chip(f.sources.includes(s))} onClick={() => tog("sources", s)}>{s}</button>)}</div></div>
      <div className="sticky bottom-20 flex items-center justify-between gap-3 rounded-2xl bg-ink-900 p-3 text-white lg:bottom-3 dark:bg-white dark:text-ink-900">
        <span className="text-sm font-semibold">{ta ? `${n} தேர்வுகள்` : `${n} selected`}</span>
        <button onClick={() => { setFollows(f); setOnboarded(); onDone(); }} className="rounded-full bg-manjal-400 px-5 py-2 font-extrabold text-ink-900">{ta ? "என் செய்தியோடையை உருவாக்கு →" : "Build my feed →"}</button>
      </div>
    </div>
  );
}

/** Personalised feed computed on the device from follows + reading history (Inshorts My Feed / Google For You), with an unpersonalised "everyone" lane to avoid a filter bubble. */
export function ForYou({ articles, fetchedAt }: { articles: Article[]; fetchedAt: string }) {
  const p = usePrefs();
  const sp = useSearchParams();
  const [setup, setSetup] = useState(sp.get("setup") === "1");
  const ta = p.lang === "ta";
  const sources = useMemo(() => [...new Set(articles.map((a) => a.source))].filter((s) => !/^Google/.test(s)).slice(0, 40), [articles]);
  const { list, why, interest } = useMemo(() => {
    const reads = Object.values(p.read);
    const tc: Record<string, number> = {}, dc: Record<string, number> = {};
    for (const r of reads) { for (const t of r.topics.slice(0, 1)) tc[t] = (tc[t] ?? 0) + 1; for (const d of r.districts) dc[d] = (dc[d] ?? 0) + 1; }
    const totalR = Math.max(1, reads.length);
    const why: Record<string, string> = {};
    const scored = articles.filter((a) => !p.isHidden(a)).map((a) => {
      let s = a.score ?? 0.3; const w: string[] = [];
      const ft = a.topics.find((t) => p.follows.topics.includes(t)); if (ft) { s += 0.35; const t = TOPICS.find((x) => x.slug === ft); if (t) w.push(`${t.emoji} ${ta ? t.ta : t.en}`); }
      const fd = a.districts.find((d) => p.follows.districts.includes(d)); if (fd) { s += 0.45; const d = DISTRICTS.find((x) => x.slug === fd); if (d) w.push(`📍 ${ta ? d.ta : d.en}`); }
      const fs = a.states.find((x) => p.follows.states.includes(x)); if (fs) { s += 0.35; const st = STATES.find((x) => x.slug === fs); if (st) w.push(`🗺️ ${ta ? st.ta : st.en}`); }
      if (p.follows.sources.includes(a.source)) { s += 0.25; w.push(`📰 ${a.source}`); }
      if (a.topics[0] && tc[a.topics[0]]) s += 0.2 * (tc[a.topics[0]] / totalR);
      if (a.districts.some((d) => dc[d])) s += 0.1;
      if (p.read[a.id]) s -= 0.3;
      if (a.soft) s -= 0.15;
      if (w.length) why[a.id] = w.join(" · ");
      return { a, s };
    }).sort((x, y) => y.s - x.s);
    const interest = Object.entries(tc).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
    return { list: scored.map((x) => x.a), why, interest };
  }, [articles, p, ta]);

  if (!p.ready) return <div className="mt-6 grid gap-3 sm:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}</div>;
  const nf = p.follows.topics.length + p.follows.districts.length + p.follows.states.length + p.follows.sources.length;
  const showSetup = setup || (!p.onboarded && nf === 0);
  const mine = list.filter((a) => why[a.id]);
  return (
    <>
      <PageTitle emoji="✨" ta="உங்களுக்காக" en="For You" subTa={`நீங்கள் பின்தொடர்வதும் படிப்பதும் வைத்து இந்தச் சாதனத்திலேயே தொகுக்கப்படுகிறது · ${nf} பின்தொடர்வுகள் · 🔥 ${p.streak} நாள்`} subEn={`Built on this device from what you follow and read · ${nf} follows · 🔥 ${p.streak}-day streak`}>
        {!showSetup && <button onClick={() => setSetup(true)} className="rounded-full border border-kumkum-600 px-4 py-2 text-sm font-extrabold text-kumkum-700 dark:border-manjal-400 dark:text-manjal-400">✏️ {ta ? "விருப்பங்களை மாற்று" : "Edit interests"}</button>}
      </PageTitle>
      {showSetup ? <Onboarding sources={sources} onDone={() => setSetup(false)} /> : (
        <>
          <CatchUp articles={list} />
          {interest.length > 0 && (
            <p className="mt-4 text-sm opacity-75">💡 {ta ? "நீங்கள் அதிகம் படிப்பவை: " : "You read a lot of: "}{interest.map((t) => { const x = TOPICS.find((y) => y.slug === t); return x ? <Link key={t} href={`/topic/${t}`} className="mr-2 font-bold underline">{x.emoji} {ta ? x.ta : x.en}</Link> : null; })}</p>
          )}
          {mine.length > 0 && (
            <section className="mt-5">
              <h2 className="mb-2 text-xl font-extrabold">🎯 {ta ? "நீங்கள் பின்தொடர்பவற்றிலிருந்து" : "From what you follow"} <span className="text-sm font-semibold opacity-60">({mine.length})</span></h2>
              <ul className="mb-4 flex flex-wrap gap-1.5 text-xs">{[...new Set(Object.values(why).flatMap((w) => w.split(" · ")))].slice(0, 12).map((w) => <li key={w} className="rounded-full bg-peacock-600/10 px-2 py-0.5 font-bold text-peacock-600 dark:text-teal-300">{w}</li>)}</ul>
              <Explorer articles={mine.slice(0, 150)} fetchedAt={fetchedAt} />
            </section>
          )}
          <section className="mt-10">
            <h2 className="mb-1 text-xl font-extrabold">🌐 {ta ? "எல்லோரும் படிக்கும் முக்கியச் செய்திகள்" : "Top stories for everyone"}</h2>
            <p className="mb-3 text-sm opacity-60">{ta ? "உங்கள் விருப்பத்துக்கு வெளியே உள்ள முக்கியச் செய்திகள் — ஒரே குமிழுக்குள் சிக்காமல் இருக்க." : "Important stories outside your interests — so you don’t end up in a filter bubble."}</p>
            <Explorer articles={articles.filter((a) => !why[a.id] && !a.soft).slice(0, 120)} fetchedAt={fetchedAt} />
          </section>
        </>
      )}
    </>
  );
}
