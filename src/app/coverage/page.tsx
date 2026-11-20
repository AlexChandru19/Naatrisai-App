import type { Metadata } from "next";
import { getAll } from "@/lib/news";
import { PageTitle } from "@/components/hero";
import { CoverageList } from "@/components/coverage-list";

export const revalidate = 300;
export const metadata: Metadata = { title: "கவரேஜ் பார்வை · Coverage lens", description: "Which stories every kind of outlet is covering — and the blindspots only Tamil, national or international media are reporting.", alternates: { canonical: "/coverage" } };

export default async function CoveragePage() {
  const { articles } = await getAll();
  return (
    <>
      <PageTitle emoji="⚖️" ta="கவரேஜ் பார்வை" en="Coverage lens" subTa="எந்தச் செய்தியை யார் வெளியிடுகிறார்கள்? தமிழ் · தேசிய ஆங்கில · சர்வதேச ஊடகங்களின் கவரேஜ் ஒப்பீடு" subEn="Who is covering what? Tamil vs Indian English vs international media, side by side" />
      <CoverageList articles={articles.slice(0, 400)} />
    </>
  );
}
