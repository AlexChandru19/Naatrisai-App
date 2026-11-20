import type { Metadata } from "next";
import { getNifty50Board, getGlobal, getNiftyNext50List } from "@/lib/stocks";
import { PageTitle } from "@/components/hero";
import { MarketsNav, Screener, GlobalCues, StockSearch } from "@/components/stocks-ui";

export const revalidate = 120;
export const metadata: Metadata = {
  title: "நிஃப்டி 50 ஹீட்மேப் & ஸ்கிரீனர் · NIFTY 50 heatmap & screener",
  description: "All 50 NIFTY stocks with live prices, % change heatmap, sector filter, sorting and advance/decline breadth.",
  alternates: { canonical: "/markets/nifty50" },
};

export default async function Nifty50() {
  const [b, g, next] = await Promise.all([getNifty50Board(), getGlobal(), getNiftyNext50List()]);
  const local = [...b.stocks.map(({ sym, name }) => ({ sym, name })), ...next.map(({ sym, name }) => ({ sym, name }))];
  return (
    <>
      <PageTitle emoji="🟩" ta="நிஃப்டி 50 — ஹீட்மேப் & ஸ்கிரீனர்" en="NIFTY 50 — heatmap & screener" subTa="அனைத்து 50 பங்குகள் · துறை வடிகட்டி · வரிசைப்படுத்தல் · ஏற்ற/இறக்க நிலவரம் · எந்தப் பங்கையும் அழுத்தி விவரம் பாருங்கள்" subEn="All 50 stocks · sector filter · sorting · advance/decline breadth · tap any stock to drill down" />
      <MarketsNav />
      <div className="mt-4"><StockSearch local={local} /></div>
      <div className="mt-4">{b.stocks.length ? <Screener stocks={b.stocks} title={{ ta: "நிஃப்டி 50 பங்குகள்", en: "NIFTY 50 stocks" }} /> : <p className="rounded-2xl border p-6 text-sm opacity-75">NIFTY 50 data is unavailable right now. · நிஃப்டி 50 தரவு இப்போது கிடைக்கவில்லை.</p>}</div>
      <div className="mt-5"><GlobalCues g={g} /></div>
    </>
  );
}
