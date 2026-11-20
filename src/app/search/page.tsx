import type { Metadata } from "next";
import Link from "next/link";
import { search } from "@/lib/news";
import { wikiCard } from "@/lib/wiki";
import { PageTitle } from "@/components/hero";
import { Explorer } from "@/components/explorer";
import { SearchBox } from "@/components/search-box";
import { L } from "@/components/providers";

export const metadata: Metadata = { title: "தேடல் · Search", robots: { index: false }, alternates: { canonical: "/search" } };

const HREF = { district: "/tamilnadu/", state: "/india/", topic: "/topic/" } as const;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [res, wiki] = q ? await Promise.all([search(q), wikiCard(q).catch(() => null)]) : [null, null];
  const al = res?.alias;
  return (
    <>
      <PageTitle emoji="🔍" ta={q ? `“${q}” — தேடல் முடிவுகள்` : "செய்தி தேடல்"} en={q ? `Results for “${q}”` : "Search news"} subTa={res ? `${res.articles.length} செய்திகள்` : "தமிழிலோ ஆங்கிலத்திலோ தேடலாம் — எ.கா. மழை, Chennai Metro, கிரிக்கெட்"} subEn={res ? `${res.articles.length} stories` : "Search in Tamil or English — e.g. மழை, Chennai Metro, cricket"} />
      <div className="mt-4"><SearchBox initial={q} /></div>
      {al && (
        <p className="mt-3 text-sm">
          🔤 <L ta={`“${al.ta}”, “${al.en}” — இரு மொழிகளிலும் தேடப்பட்டது.`} en={`Searched both “${al.en}” and “${al.ta}”.`} />{" "}
          <Link href={HREF[al.kind] + al.slug} className="font-bold text-kumkum-600 underline dark:text-manjal-400"><L ta={`${al.ta} பக்கம் →`} en={`${al.en} page →`} /></Link>
        </p>
      )}
      {wiki && (
        <aside className="mt-4 flex gap-4 rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {wiki.thumb && <img src={wiki.thumb} alt="" loading="lazy" className="h-24 w-24 shrink-0 rounded-xl object-cover" />}
          <div className="min-w-0">
            <div className="font-extrabold">{wiki.title}{wiki.description && <span className="ml-2 text-xs font-semibold opacity-60">{wiki.description}</span>}</div>
            <p className="mt-1 text-sm leading-relaxed opacity-85" lang={wiki.lang}>{wiki.extract}</p>
            <a href={wiki.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-bold text-kumkum-600 underline dark:text-manjal-400"><L ta="விக்கிப்பீடியாவில் படிக்க ↗" en="Read on Wikipedia ↗" /></a>
            <span className="ml-2 text-[10px] opacity-55">Wikipedia · CC BY-SA</span>
          </div>
        </aside>
      )}
      {res && <div className="mt-5"><Explorer articles={res.articles.slice(0, 200)} fetchedAt={res.fetchedAt} emptyHint={{ ta: "முடிவுகள் இல்லை. வேறு சொல்லில் தேடுங்கள்.", en: "No results. Try another word." }} /></div>}
    </>
  );
}
