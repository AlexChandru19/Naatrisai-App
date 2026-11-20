import type { Metadata } from "next";
import { getMarkets, getMovers, getMarketStatus } from "@/lib/markets";
import { getBullion } from "@/lib/bullion";
import { getFuel } from "@/lib/fuel";
import { getCricket } from "@/lib/cricket";
import { getTopic } from "@/lib/news";
import { PageTitle } from "@/components/hero";
import { CricketWidget, MarketsWidget } from "@/components/markets-widget";
import { GoldPanel, FuelPanel, StocksPanel } from "@/components/money";
import { Explorer } from "@/components/explorer";
import { FxConverter } from "@/components/fx-converter";
import { L } from "@/components/providers";
import { MarketsNav, GlobalCues, StockSearch } from "@/components/stocks-ui";
import { getGlobal, getNifty50List, getNiftyNext50List } from "@/lib/stocks";
import { getMarketNews } from "@/lib/market-news";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";

// Page HTML refreshes every 2 min; each source keeps its own cache (stocks 2 min, gold 30 min, fuel 1 h).
export const revalidate = 120;
export const metadata: Metadata = {
  title: "தங்கம், பெட்ரோல், பங்குச் சந்தை · Gold, petrol & markets",
  description: "Today’s gold and silver rates in Chennai and other cities, petrol and diesel prices across Tamil Nadu districts, NIFTY, SENSEX, sectors, India VIX and top movers.",
  alternates: { canonical: "/markets" },
};

export default async function MarketsPage() {
  const [m, mv, b, f, c, biz, g, n50, nn50, mn] = await Promise.all([getMarkets(), getMovers(), getBullion(), getFuel(), getCricket(), getTopic("business"), getGlobal(), getNifty50List(), getNiftyNext50List(), getMarketNews()]);
  const local = [...n50, ...nn50].map(({ sym, name }) => ({ sym, name }));
  const last = Math.max(0, ...m.quotes.filter((q) => q.group === "index").map((q) => q.time));
  const status = await getMarketStatus(last || undefined);
  const intl = { gold: m.quotes.find((q) => q.key === "gold-inr"), silver: m.quotes.find((q) => q.key === "silver-inr") };
  const fx = m.quotes.filter((q) => q.group === "fx" || ["brent", "gold", "silver"].includes(q.key));
  return (
    <>
      <PageTitle emoji="💹" ta="தங்கம் · பெட்ரோல் · பங்குச் சந்தை" en="Gold · Petrol · Markets" subTa="நகர வாரியான தங்கம், வெள்ளி விலை · மாவட்ட வாரியான பெட்ரோல், டீசல் · நிஃப்டி, சென்செக்ஸ், துறைகள், ஏற்ற-இறக்கப் பங்குகள்" subEn="City-wise gold & silver · district-wise petrol & diesel · NIFTY, SENSEX, sectors and top movers" />
      <MarketsNav />
      <div className="mt-4"><StockSearch local={local} /></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <GoldPanel b={b} intl={intl} />
        <FuelPanel f={f} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <StocksPanel m={m} movers={mv} status={status} />
        <div className="space-y-5">
          <FxConverter quotes={m.quotes} />
          {fx.length > 0 && <FxBox m={{ ...m, quotes: fx }} />}
          {c.matches.length ? <CricketWidget matches={c.matches} /> : <p className="rounded-2xl border p-5 opacity-70"><L ta="இப்போது நடக்கும் போட்டிகள் இல்லை." en="No matches in the live feed right now." /></p>}
        </div>
      </div>
      <div className="mt-5"><GlobalCues g={g} /></div>
      {mn.articles.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-extrabold">📰 <L ta="இன்றைய சந்தைச் செய்திகள்" en="Today's market news" /></h2><Link href="/markets/news" className="text-sm font-bold text-kumkum-600 hover:underline dark:text-manjal-400"><L ta={`எல்லா ${mn.articles.length} செய்திகளும் — பிரிவு வாரியாக →`} en={`All ${mn.articles.length} stories by category →`} /></Link></div>
          <div data-grid className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">{mn.articles.slice(0, 6).map((a, i) => <ArticleCard key={a.id} a={a} i={i} />)}</div>
        </section>
      )}
      <h2 className="mb-3 mt-8 text-xl font-extrabold">💼 <L ta="வணிகச் செய்திகள்" en="Business news" /></h2>
      <Explorer articles={biz.articles.slice(0, 120)} fetchedAt={biz.fetchedAt} showTopics={false} />
    </>
  );
}

function FxBox({ m }: { m: Awaited<ReturnType<typeof getMarkets>> }) { return <MarketsWidget m={m} full title={{ ta: "ரூபாய் & சர்வதேசப் பொருட்கள்", en: "Rupee & global commodities" }} />; }
