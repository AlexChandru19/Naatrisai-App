import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectorBoard, getDetail, SECTORS } from "@/lib/stocks";
import { getMarketNews } from "@/lib/market-news";
import { PageTitle } from "@/components/hero";
import { MarketsNav, StockChart, Screener, Pct } from "@/components/stocks-ui";
import { fmt } from "@/lib/fmt";
import { ArticleCard } from "@/components/article-card";
import { L } from "@/components/providers";

export const revalidate = 300;
export function generateStaticParams() { return SECTORS.map((s) => ({ slug: s.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SECTORS.find((x) => x.slug === slug);
  return s ? { title: `${s.ta} துறை · NIFTY ${s.en} sector`, description: `NIFTY ${s.en} index chart, constituent stocks and sector news.`, alternates: { canonical: `/markets/sector/${s.slug}` } } : { title: "Sector" };
}

export default async function Sector({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const [b, news] = await Promise.all([getSectorBoard(slug), getMarketNews()]);
  if (!b) notFound();
  const idx = await getDetail(b.sector.index);
  const sn = news.articles.filter((a) => b.sector.news.test(a.title) || b.stocks.some((s) => new RegExp(`\\b${s.sym}\\b`).test(a.title))).slice(0, 30);
  return (
    <>
      <PageTitle emoji={b.sector.emoji} ta={`நிஃப்டி ${b.sector.ta}`} en={`NIFTY ${b.sector.en}`} subTa={`குறியீட்டு வரைபடம் · ${b.stocks.length} பங்குகள் · துறைச் செய்திகள்`} subEn={`Index chart · ${b.stocks.length} constituent stocks · sector news`}>
        {idx && <div className="mt-3 flex flex-wrap items-end gap-3"><span className="text-3xl font-black tabular-nums">{fmt(idx.d.price)}</span><Pct v={idx.d.pct} className="pb-1" /></div>}
      </PageTitle>
      <MarketsNav />
      <nav aria-label="Sectors" className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {SECTORS.map((s) => <Link key={s.slug} href={`/markets/sector/${s.slug}`} aria-current={s.slug === slug ? "page" : undefined} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${s.slug === slug ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "border border-ink-100 bg-white dark:border-white/10 dark:bg-ink-900"}`}>{s.emoji} <L ta={s.ta} en={s.en} /></Link>)}
      </nav>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {idx ? <StockChart sym={b.sector.index} initial={idx.s} /> : <p className="rounded-2xl border p-6 text-sm opacity-75"><L ta="குறியீட்டுத் தரவு கிடைக்கவில்லை." en="Index data unavailable." /></p>}
        {b.stocks.length ? <Screener stocks={b.stocks} title={{ ta: `${b.sector.ta} பங்குகள்`, en: `${b.sector.en} stocks` }} /> : <p className="rounded-2xl border p-6 text-sm opacity-75"><L ta="பங்குப் பட்டியல் கிடைக்கவில்லை." en="Constituent list unavailable." /></p>}
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-extrabold">📰 <L ta={`${b.sector.ta} — துறைச் செய்திகள்`} en={`${b.sector.en} sector news`} /> <span className="text-sm opacity-70">· {sn.length}</span></h2>
        {sn.length ? <div data-grid className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">{sn.map((a, i) => <ArticleCard key={a.id} a={a} i={i} />)}</div> : <p className="text-sm opacity-70"><L ta="இப்போது துறைச் செய்திகள் இல்லை." en="No sector news right now." /></p>}
      </section>
    </>
  );
}
