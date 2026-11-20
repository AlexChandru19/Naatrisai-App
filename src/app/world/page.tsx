import type { Metadata } from "next";
import { getSection } from "@/lib/news";
import { pickLeads, tickerPick } from "@/lib/pick";
import { WorldClock } from "@/components/world-clock";
import { PageTitle, Hero } from "@/components/hero";
import { Ticker } from "@/components/ticker";
import { Explorer } from "@/components/explorer";
import { RegionPicker } from "@/components/pickers";

export const revalidate = 300;
export const metadata: Metadata = { title: "உலகச் செய்திகள் · World News", alternates: { canonical: "/world", types: { "application/rss+xml": [{ url: "/rss/world.xml", title: "world RSS" }] } } };

export default async function World() {
  const { articles: all, fetchedAt } = await getSection("world");
  const { lead, side } = pickLeads(all, { preferTamil: false });
  const articles = all.filter((a) => a.id !== lead?.id && !side.some((s) => s.id === a.id));
  return (
    <>
      <PageTitle emoji="🌍" ta="உலகச் செய்திகள்" en="World News" subTa="BBC, Al Jazeera, The Hindu, Google செய்திகள் — பிராந்திய வாரியாக" subEn="BBC, Al Jazeera, The Hindu, Google News — by region" />
      <WorldClock />
      <Ticker items={tickerPick(all)} />
      {lead && <Hero lead={lead} side={side} />}
      <div className="mt-4"><RegionPicker /></div>
      <div className="mt-4"><Explorer articles={articles.slice(0, 240)} fetchedAt={fetchedAt} /></div>
    </>
  );
}
