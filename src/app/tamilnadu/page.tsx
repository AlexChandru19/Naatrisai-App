import type { Metadata } from "next";
import { getSection } from "@/lib/news";
import { pickLeads, tickerPick } from "@/lib/pick";
import { PageTitle, Hero } from "@/components/hero";
import { Ticker } from "@/components/ticker";
import { Explorer } from "@/components/explorer";
import { DistrictPicker } from "@/components/pickers";
import { WeatherWidget } from "@/components/weather";

export const revalidate = 300;
export const metadata: Metadata = { title: "தமிழ்நாடு செய்திகள் · Tamil Nadu News", alternates: { canonical: "/tamilnadu", types: { "application/rss+xml": [{ url: "/rss/tamilnadu.xml", title: "tamilnadu RSS" }] } } };

export default async function TN() {
  const { articles: all, fetchedAt } = await getSection("tamilnadu");
  const { lead, side } = pickLeads(all, { preferTamil: true });
  const articles = all.filter((a) => a.id !== lead?.id && !side.some((s) => s.id === a.id));
  return (
    <>
      <PageTitle emoji="🛕" ta="தமிழ்நாடு செய்திகள்" en="Tamil Nadu News" subTa="38 மாவட்டங்களின் செய்திகள் — தினமணி, தினத்தந்தி, BBC தமிழ், விகடன், The Hindu மற்றும் பல" subEn="All 38 districts — Dinamani, Daily Thanthi, BBC Tamil, Vikatan, The Hindu, Times of India & more" />
      <Ticker items={tickerPick(all)} />
      {lead && <Hero lead={lead} side={side} />}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div><Explorer articles={articles.slice(0, 240)} fetchedAt={fetchedAt} /></div>
        <aside className="order-first space-y-4 lg:order-none lg:sticky lg:top-24 lg:self-start">
          <DistrictPicker compact />
          <div className="hidden lg:block"><WeatherWidget /></div>
        </aside>
      </div>
    </>
  );
}
