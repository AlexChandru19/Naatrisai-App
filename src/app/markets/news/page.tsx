import type { Metadata } from "next";
import { getMarketNews, MARKET_CATS, MARKET_FEEDS } from "@/lib/market-news";
import { PageTitle } from "@/components/hero";
import { MarketsNav, MarketNewsView } from "@/components/stocks-ui";
import { L } from "@/components/providers";

export const revalidate = 600;
export const metadata: Metadata = {
  title: "பங்குச் சந்தைச் செய்திகள் · Stock market news",
  description: "Indian stock market news by category — stocks & earnings, Nifty & Sensex, RBI & economy, IPOs, commodities & rupee, global cues and Tamil business news.",
  alternates: { canonical: "/markets/news" },
};

export default async function MarketNews() {
  const n = await getMarketNews();
  const cats = MARKET_CATS.map(({ key, ta, en, emoji }) => ({ key, ta, en, emoji }));
  const srcs = [...new Set(n.articles.map((a) => a.source))];
  return (
    <>
      <PageTitle emoji="📰" ta="பங்குச் சந்தைச் செய்திகள்" en="Stock market news" subTa={`${n.articles.length} செய்திகள் · ${srcs.length} மூலங்கள் · கடந்த 4 நாட்கள் · பிரிவு, நிறுவனம், மூலம் வாரியாக வடிகட்டுங்கள்`} subEn={`${n.articles.length} stories · ${srcs.length} sources · last 4 days · filter by category, company or source`} />
      <MarketsNav />
      <MarketNewsView articles={n.articles} cats={cats} />
      <p className="mt-8 text-xs leading-relaxed opacity-75"><L ta="மூலங்கள்: " en="Feeds: " />ET Markets, Mint, BusinessLine, NDTV Profit, Vikatan, Google News (Moneycontrol, Business Standard &amp; topic searches) · {MARKET_FEEDS.length} <L ta="ஊட்டங்கள் · இணைப்புகள் அசல் வெளியீட்டாளருக்கே செல்லும்" en="feeds · links go to the original publishers" /></p>
    </>
  );
}
