"use client";
import Link from "next/link";
import type { Coverage } from "@/lib/news";
import { bucket, coverage, type Bucket } from "@/lib/coverage";
import { usePrefs } from "./providers";
import { TimeAgo } from "./time-ago";
import { Thumb, Tags } from "./article-card";
import { ArticleActions } from "./actions";
import { ArticleCard } from "./article-card";
import { AiStoryPanel } from "./ai-panel";

export const BUCKETS: Record<Bucket, { ta: string; en: string; c: string }> = {
  tamil: { ta: "தமிழ் ஊடகங்கள்", en: "Tamil media", c: "#c8321a" },
  national: { ta: "தேசிய ஆங்கில ஊடகங்கள்", en: "Indian English media", c: "#f0a500" },
  world: { ta: "சர்வதேச ஊடகங்கள்", en: "International media", c: "#0e8f8a" },
};

export function CoverageMeter({ c, compact = false }: { c: ReturnType<typeof coverage>; compact?: boolean }) {
  const { lang } = usePrefs();
  const ta = lang === "ta";
  const keys = (Object.keys(BUCKETS) as Bucket[]).filter((k) => c[k]);
  return (
    <div>
      <div className={`flex overflow-hidden rounded-full ${compact ? "h-2" : "h-4"}`} role="img" aria-label={keys.map((k) => `${BUCKETS[k].en} ${c[k]}`).join(", ")}>
        {keys.map((k) => <div key={k} style={{ width: `${(c[k] / c.total) * 100}%`, background: BUCKETS[k].c }} />)}
      </div>
      {!compact && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">{(Object.keys(BUCKETS) as Bucket[]).map((k) => <span key={k} className={c[k] ? "" : "opacity-40"}><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full" style={{ background: BUCKETS[k].c }} />{ta ? BUCKETS[k].ta : BUCKETS[k].en}: <b>{c[k]}</b></span>)}</div>}
    </div>
  );
}

export function StoryView({ data }: { data: Coverage }) {
  const { lang } = usePrefs();
  const ta = lang === "ta";
  const lead = data.lead!;
  const c = coverage(data.versions);
  const timeline = [...data.versions].filter((v) => v.publishedAt).sort((a, b) => a.publishedAt!.localeCompare(b.publishedAt!));
  const groups = (Object.keys(BUCKETS) as Bucket[]).map((k) => ({ k, vs: data.versions.filter((v) => bucket(v) === k) })).filter((g) => g.vs.length);
  return (
    <div className="mt-4 space-y-6">
      <section className="overflow-hidden rounded-3xl border border-ink-100 bg-white dark:border-white/10 dark:bg-ink-900">
        <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
          <Thumb a={lead} className="aspect-[16/9] h-full w-full" />
          <div className="space-y-3 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-peacock-600 dark:text-teal-300">🧭 {ta ? "முழு கவரேஜ்" : "Full coverage"}</p>
            <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{lead.title}</h1>
            {lead.summary && <p className="text-ink-900/75 dark:text-white/70">{lead.summary}</p>}
            <Tags a={lead} />
            <div className="-ml-2"><ArticleActions a={lead} /></div>
          </div>
        </div>
      </section>
      <AiStoryPanel id={lead.id} articleLang={lead.lang} outlets={new Set(data.versions.map((v) => v.source)).size} original={lead.link} />
      <section className="rounded-3xl border border-ink-100 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
        <h2 className="text-lg font-extrabold">⚖️ {ta ? `கவரேஜ் அளவி — ${c.total} ஊடகங்கள்` : `Coverage meter — ${c.total} outlets`}</h2>
        <div className="mt-3"><CoverageMeter c={c} /></div>
        {c.only && c.total >= 1 && (
          <p className="mt-3 rounded-2xl bg-manjal-300/30 px-3 py-2 text-sm font-semibold">🔦 {ta ? `கண்மறைவு: இந்தச் செய்தியை இப்போது ${BUCKETS[c.only].ta} மட்டுமே வெளியிட்டுள்ளன (நாங்கள் கண்காணிக்கும் ஊடகங்களில்).` : `Blindspot: right now only ${BUCKETS[c.only].en.toLowerCase()} among the outlets we track are covering this.`}</p>
        )}
        <p className="mt-2 text-xs opacity-60">{ta ? "இது ஊடகங்களின் மொழி/வகை அடிப்படையிலான கணக்கு மட்டுமே — அரசியல் சார்பு மதிப்பீடு அல்ல." : "Counts outlets by language and type only — not a political-bias rating."}</p>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-extrabold">📰 {ta ? "எல்லா ஊடகங்களின் பதிப்புகள்" : "Every outlet’s version"}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {groups.map((g) => (
            <div key={g.k} className="rounded-2xl border border-ink-100 bg-white p-3 dark:border-white/10 dark:bg-ink-900">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: BUCKETS[g.k].c }} />{ta ? BUCKETS[g.k].ta : BUCKETS[g.k].en} · {g.vs.length}</h3>
              <ul className="space-y-1">
                {g.vs.map((v) => (
                  <li key={v.link}><a href={v.link} target="_blank" rel="noopener noreferrer" className="block rounded-xl px-2 py-1.5 hover:bg-ink-50 dark:hover:bg-white/5">
                    <span className="flex items-center gap-2 text-xs"><b className="text-kumkum-700 dark:text-manjal-400">{v.source}</b><span className="opacity-60"><TimeAgo iso={v.publishedAt} /></span><span className="ml-auto opacity-50">↗</span></span>
                    <span className="line-clamp-2 text-[14px] font-semibold leading-snug">{v.title}</span>
                  </a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      {timeline.length >= 2 && (
        <section className="rounded-3xl border border-ink-100 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
          <h2 className="mb-3 text-lg font-extrabold">🕰️ {ta ? "காலவரிசை — யார் எப்போது வெளியிட்டார்கள்" : "Timeline — who reported it when"}</h2>
          <ol className="relative ml-2 border-l-2 border-kumkum-600/30 pl-5">
            {timeline.map((v) => (
              <li key={v.link} className="relative mb-4 last:mb-0">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white" style={{ background: BUCKETS[bucket(v)].c }} />
                <div className="text-xs font-bold opacity-70">{new Date(v.publishedAt!).toLocaleString(ta ? "ta-IN" : "en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} IST · {v.source}</div>
                <a href={v.link} target="_blank" rel="noopener noreferrer" className="text-[15px] font-semibold hover:underline">{v.title}</a>
              </li>
            ))}
          </ol>
        </section>
      )}
      {data.related.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-extrabold">🔗 {ta ? "தொடர்புடைய செய்திகள்" : "Related stories"}</h2>
          <div data-grid className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{data.related.map((a, i) => <ArticleCard key={a.id} a={a} i={i} />)}</div>
        </section>
      )}
      {(data.more?.length ?? 0) > 0 && (
        <section className="no-print">
          <h2 className="mb-3 text-lg font-extrabold">📰 {ta ? "தொடர்ந்து படிக்க — இப்போதைய முக்கியச் செய்திகள்" : "Keep reading — top stories now"}</h2>
          <div data-grid className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{data.more!.map((a, i) => <ArticleCard key={a.id} a={a} i={i} />)}</div>
        </section>
      )}
      <p className="no-print text-center"><button onClick={() => window.print()} className="rounded-full border border-ink-100 px-4 py-1.5 text-sm font-bold dark:border-white/10">🖨️ {ta ? "அச்சிடு / PDF ஆகச் சேமி" : "Print / save as PDF"}</button></p>
      <p className="text-center text-sm"><Link href={`/search?q=${encodeURIComponent(lead.title.split(/\s+/).slice(0, 6).join(" "))}`} className="font-bold text-kumkum-600 underline dark:text-manjal-400">{ta ? "இதைப் பற்றி மேலும் தேடு →" : "Search more about this →"}</Link></p>
    </div>
  );
}
