import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDetail, getNifty50List, getNiftyNext50List, SECTORS } from "@/lib/stocks";
import { getCompanyNews } from "@/lib/market-news";
import { PageTitle } from "@/components/hero";
import { MarketsNav, StockChart, StatGrid, WatchButton, Pct } from "@/components/stocks-ui";
import { fmt } from "@/lib/fmt";
import { ArticleCard } from "@/components/article-card";
import { L } from "@/components/providers";

export const revalidate = 120;
export const dynamicParams = true;
export function generateStaticParams() { return []; }
const clean = (s: string) => decodeURIComponent(s).toUpperCase().replace(/\.NS$/, "");

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }): Promise<Metadata> {
  const sym = clean((await params).symbol);
  return { title: `${sym} பங்கு விலை & செய்திகள் · ${sym} share price & news`, description: `${sym} live share price, chart (1D–1Y), day range, 52-week range and latest company news.`, alternates: { canonical: `/markets/stock/${encodeURIComponent(sym)}` } };
}

const SECTOR_OF: Record<string, string> = { "Information Technology": "it", "Healthcare": "pharma", "Automobile and Auto Components": "auto", "Fast Moving Consumer Goods": "fmcg", "Metals & Mining": "metal" };

export default async function Stock({ params }: { params: Promise<{ symbol: string }> }) {
  const sym = clean((await params).symbol);
  const [r, n50, nn50] = await Promise.all([getDetail(sym), getNifty50List(), getNiftyNext50List()]);
  if (!r) notFound();
  const { d, s } = r;
  const meta = [...n50, ...nn50].find((x) => x.sym === sym);
  const isIndex = sym.startsWith("^") || sym.startsWith("NIFTY_");
  const news = isIndex ? [] : await getCompanyNews(sym, meta?.name ?? d.name);
  const sector = meta && (SECTOR_OF[meta.industry] ?? (/bank/i.test(meta.name) ? "bank" : undefined));
  const sec = SECTORS.find((x) => x.slug === sector);
  return (
    <>
      <PageTitle emoji={isIndex ? "📊" : "🏢"} ta={`${d.name}`} en={`${d.name}`} subTa={`${isIndex ? "குறியீடு" : `NSE: ${sym}`}${meta ? ` · ${meta.industry}` : ""}${n50.some((x) => x.sym === sym) ? " · நிஃப்டி 50" : nn50.some((x) => x.sym === sym) ? " · நிஃப்டி நெக்ஸ்ட் 50" : ""}`} subEn={`${isIndex ? "Index" : `NSE: ${sym}`}${meta ? ` · ${meta.industry}` : ""}${n50.some((x) => x.sym === sym) ? " · NIFTY 50" : nn50.some((x) => x.sym === sym) ? " · NIFTY Next 50" : ""}`}>
        <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
          <span data-price className="text-4xl font-black tabular-nums">₹{fmt(d.price)}</span>
          <span className="pb-1 text-base"><Pct v={d.pct} /> <span className="text-sm font-bold tabular-nums opacity-80">({d.change >= 0 ? "+" : "−"}₹{fmt(Math.abs(d.change))})</span></span>
          {!isIndex && <span className="pb-0.5"><WatchButton sym={sym} /></span>}
        </div>
      </PageTitle>
      <MarketsNav />
      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <StockChart sym={sym} initial={s} />
        <div className="space-y-4">
          <StatGrid d={d} />
          {sec && <Link href={`/markets/sector/${sec.slug}`} className="block rounded-2xl border border-ink-100 bg-white p-4 text-sm font-bold hover:bg-kumkum-50 dark:border-white/10 dark:bg-ink-900 dark:hover:bg-white/5">{sec.emoji} <L ta={`${sec.ta} துறையைப் பாருங்கள் →`} en={`Explore the ${sec.en} sector →`} /></Link>}
        </div>
      </div>
      {!isIndex && (
        <section className="mt-8" aria-label="Company news">
          <h2 className="mb-3 text-xl font-extrabold">📰 <L ta={`${sym} — சமீபத்திய செய்திகள்`} en={`${sym} — latest news`} /> <span className="text-sm font-bold opacity-70">· {news.length}</span></h2>
          {news.length ? <div data-grid className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">{news.map((a, i) => <ArticleCard key={a.id} a={a} i={i} />)}</div> : <p className="rounded-2xl border border-dashed border-ink-100 p-6 text-sm opacity-75 dark:border-white/10"><L ta="இந்த நிறுவனம் பற்றி கடந்த 30 நாட்களில் செய்திகள் கிடைக்கவில்லை." en="No news about this company in the last 30 days." /></p>}
          <p className="mt-3 text-[11px] opacity-70"><L ta="எங்கள் சந்தை ஊட்டங்களிலிருந்தும் இந்த நிறுவனத்திற்கான Google News தேடலிலிருந்தும் · இணைப்புகள் அசல் வெளியீட்டாளருக்கே" en="From our market feeds plus a Google News search for this company · links go to the original publishers" /></p>
        </section>
      )}
    </>
  );
}
