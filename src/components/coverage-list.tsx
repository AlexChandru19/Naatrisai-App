"use client";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { coverage, versionsOf, type Bucket } from "@/lib/coverage";
import { storyUrl } from "@/lib/story-url";
import { usePrefs, ALink } from "./providers";
import { CoverageMeter, BUCKETS } from "./story-view";
import { TimeAgo } from "./time-ago";

export function CoverageList({ articles }: { articles: Article[] }) {
  const { lang, isHidden } = usePrefs();
  const ta = lang === "ta";
  const rows = articles.filter((a) => !a.soft && !isHidden(a)).map((a) => ({ a, c: coverage(versionsOf(a)) }));
  const wide = rows.filter((r) => r.c.total >= 2 && !r.c.only).sort((x, y) => y.c.total - x.c.total).slice(0, 12);
  const only = (b: Bucket) => rows.filter((r) => r.c.only === b && r.c.total >= 2).slice(0, 8);
  const single = (b: Bucket) => rows.filter((r) => r.c.only === b && r.c.total === 1 && (r.a.score ?? 0) > 0.45).slice(0, 6);
  const Row = ({ a, c }: { a: Article; c: ReturnType<typeof coverage> }) => (
    <li className="rounded-2xl border border-ink-100 bg-white p-3 dark:border-white/10 dark:bg-ink-900">
      <div className="flex items-center gap-2 text-xs"><b className="text-kumkum-700 dark:text-manjal-400">{a.source}</b><span className="opacity-60"><TimeAgo iso={a.publishedAt} /></span><span className="ml-auto font-bold">{c.total} {ta ? "ஊடகங்கள்" : "outlets"}</span></div>
      <ALink a={a} className="mt-1 block text-[15px] font-bold leading-snug hover:underline"><h3>{a.title}</h3></ALink>
      <div className="mt-2"><CoverageMeter c={c} compact /></div>
      <Link href={storyUrl(a)} className="mt-2 inline-block text-xs font-extrabold text-peacock-600 dark:text-teal-300">🧭 {ta ? "முழு கவரேஜ் →" : "Full coverage →"}</Link>
    </li>
  );
  return (
    <div className="mt-5 space-y-8">
      <section>
        <h2 className="mb-1 text-xl font-extrabold">🌐 {ta ? "பரவலான கவரேஜ் — பல தரப்பு ஊடகங்களும்" : "Widely covered — across media types"}</h2>
        <p className="mb-3 text-sm opacity-60">{ta ? "தமிழ், தேசிய, சர்வதேச ஊடகங்களில் இரண்டு அல்லது மூன்று தரப்பும் வெளியிட்டவை." : "Stories carried by two or three of: Tamil, Indian English and international outlets."}</p>
        {wide.length ? <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{wide.map((r) => <Row key={r.a.id} {...r} />)}</ul> : <p className="opacity-60">—</p>}
      </section>
      {(["tamil", "national", "world"] as Bucket[]).map((b) => {
        const list = only(b), one = single(b);
        if (!list.length && !one.length) return null;
        return (
          <section key={b}>
            <h2 className="mb-1 flex items-center gap-2 text-xl font-extrabold"><span className="h-3 w-3 rounded-full" style={{ background: BUCKETS[b].c }} />🔦 {ta ? `கண்மறைவு: ${BUCKETS[b].ta} மட்டும்` : `Blindspot: only ${BUCKETS[b].en}`}</h2>
            <p className="mb-3 text-sm opacity-60">{ta ? "மற்ற தரப்பு ஊடகங்கள் (நாங்கள் கண்காணிப்பவற்றில்) இன்னும் வெளியிடாத செய்திகள் — நேரம் செல்லச் செல்ல மாறலாம்." : "Not (yet) carried by the other media types we track — this can change as the story develops."}</p>
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[...list, ...one].map((r) => <Row key={r.a.id} {...r} />)}</ul>
          </section>
        );
      })}
    </div>
  );
}
