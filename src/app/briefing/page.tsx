import type { Metadata } from "next";
import { getAll } from "@/lib/news";
import { getMarkets, getMarketStatus } from "@/lib/markets";
import { getBullion } from "@/lib/bullion";
import { getFuel } from "@/lib/fuel";
import { DailyRates } from "@/components/money";
import { getCricket } from "@/lib/cricket";
import { trending } from "@/lib/trending";
import { briefingPicks } from "@/lib/briefing";
import { AiBriefing } from "@/components/ai-panel";
import { BriefingHead, BriefingList, Bulletin } from "@/components/briefing-view";
import { CricketWidget } from "@/components/markets-widget";
import { WeatherWidget } from "@/components/weather";
import { TrendingChips } from "@/components/trending-chips";
import { PrintButton } from "@/components/print-button";
import { getOnThisDay } from "@/lib/calendar";
import { OnThisDay } from "@/components/calendar-view";

export const revalidate = 300;
export const metadata: Metadata = { title: "இன்றைய சுருக்கம் · Daily briefing", description: "The day’s most important Tamil Nadu, India and world stories in one short read — with weather, markets and cricket.", alternates: { canonical: "/briefing" } };

export default async function BriefingPage() {
  const [{ articles, fetchedAt }, m, c, bullion, fuel, otd] = await Promise.all([getAll(), getMarkets(), getCricket(), getBullion(), getFuel(), getOnThisDay()]);
  const status = await getMarketStatus(Math.max(0, ...m.quotes.filter((q) => q.group === "index").map((q) => q.time)) || undefined);
  const { big, tn, india, world, all } = briefingPicks(articles);
  return (
    <>
      <BriefingHead count={all.length} fetchedAt={fetchedAt} />
      <div className="mt-3 flex flex-wrap items-center gap-2"><Bulletin items={all} /><PrintButton /></div>
      <div className="mt-3"><TrendingChips trends={trending(articles)} max={10} /></div>
      <AiBriefing />
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <BriefingList title={{ ta: "⭐ இன்றைய முக்கியச் செய்திகள்", en: "⭐ The big stories" }} items={big} start={1} />
          <BriefingList title={{ ta: "🛕 தமிழ்நாடு", en: "🛕 Tamil Nadu" }} items={tn} start={big.length + 1} />
          <BriefingList title={{ ta: "🇮🇳 இந்தியா", en: "🇮🇳 India" }} items={india} start={big.length + tn.length + 1} />
          <BriefingList title={{ ta: "🌍 உலகம்", en: "🌍 World" }} items={world} start={big.length + tn.length + india.length + 1} />
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <WeatherWidget />
          <DailyRates b={bullion} f={fuel} m={m} status={status} />
          <CricketWidget matches={c.matches} />
          <OnThisDay items={otd.items} max={5} compact />
        </aside>
      </div>
    </>
  );
}
