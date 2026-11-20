import type { Metadata } from "next";
import { getAll } from "@/lib/news";
import { PageTitle } from "@/components/hero";
import { DistrictMap, IndiaTiles, RankList } from "@/components/news-map";
import { L } from "@/components/providers";

export const revalidate = 300;
export const metadata: Metadata = { title: "செய்தி வரைபடம் · News map", description: "Live story counts for every Tamil Nadu district and Indian state.", alternates: { canonical: "/map" } };

export default async function MapPage() {
  const { articles } = await getAll();
  const dc: Record<string, number> = {}, sc: Record<string, number> = {};
  for (const a of articles) { for (const d of a.districts) dc[d] = (dc[d] ?? 0) + 1; for (const s of a.states) sc[s] = (sc[s] ?? 0) + 1; }
  return (
    <>
      <PageTitle emoji="🗺️" ta="செய்தி வரைபடம்" en="News map" subTa="இப்போதைய நேரலைச் செய்திகளில் ஒவ்வொரு மாவட்டமும் மாநிலமும் எத்தனை முறை இடம்பெறுகிறது — தொட்டால் அந்தப் பக்கம்" subEn="How often each district and state appears in the live headlines right now — tap to open its page" />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
          <h2 className="mb-2 text-lg font-extrabold">🛕 <L ta="தமிழ்நாடு — 38 மாவட்டங்கள்" en="Tamil Nadu — 38 districts" /></h2>
          <DistrictMap counts={dc} />
          <RankList counts={dc} kind="district" />
          <p className="mt-2 text-xs opacity-60"><L ta="புள்ளிகள் மாவட்டத் தலைநகரங்களின் உண்மையான அட்ச/தீர்க்க ரேகையில்; அளவு = செய்தி எண்ணிக்கை." en="Dots sit at each district HQ’s real latitude/longitude; size = number of stories." /></p>
        </section>
        <section className="rounded-3xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
          <h2 className="mb-2 text-lg font-extrabold">🇮🇳 <L ta="இந்தியா — 28 மாநிலங்கள், 8 யூனியன் பிரதேசங்கள்" en="India — 28 states & 8 UTs" /></h2>
          <IndiaTiles counts={sc} />
          <RankList counts={Object.fromEntries(Object.entries(sc).filter(([k]) => k !== "tamil-nadu"))} kind="state" />
          <p className="mt-2 text-xs opacity-60"><L ta="ஒவ்வொரு கட்டமும் ஒரு மாநிலம்/யூ.பி — இருப்பிடம் தோராயமானது, அளவுக்கேற்றதல்ல." en="One tile per state/UT — positions are approximate, not to scale." /></p>
        </section>
      </div>
    </>
  );
}
