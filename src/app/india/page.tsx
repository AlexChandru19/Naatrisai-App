import type { Metadata } from "next";
import { getSection } from "@/lib/news";
import { pickLeads, tickerPick } from "@/lib/pick";
import { PageTitle, Hero } from "@/components/hero";
import { Ticker } from "@/components/ticker";
import { Explorer } from "@/components/explorer";
import { StateGrid } from "@/components/pickers";

export const revalidate = 300;
export const metadata: Metadata = { title: "இந்தியச் செய்திகள் · India News", alternates: { canonical: "/india", types: { "application/rss+xml": [{ url: "/rss/india.xml", title: "india RSS" }] } } };

export default async function India() {
  const { articles: all, fetchedAt } = await getSection("india");
  const { lead, side } = pickLeads(all, { preferTamil: false });
  const articles = all.filter((a) => a.id !== lead?.id && !side.some((s) => s.id === a.id));
  return (
    <>
      <PageTitle emoji="🇮🇳" ta="இந்தியச் செய்திகள்" en="India News" subTa="28 மாநிலங்கள் + 8 யூனியன் பிரதேசங்கள் — மாநிலத்தைத் தொட்டுப் பாருங்கள்" subEn="28 states + 8 Union Territories — tap a state to dive in" />
      <Ticker items={tickerPick(all)} />
      {lead && <Hero lead={lead} side={side} />}
      <div className="mt-5"><StateGrid /></div>
      <h2 className="mb-3 mt-8 text-xl font-extrabold">🇮🇳 தேசியச் செய்திகள் · National</h2>
      <Explorer articles={articles.slice(0, 240)} fetchedAt={fetchedAt} />
    </>
  );
}
