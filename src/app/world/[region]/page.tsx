import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRegion } from "@/lib/news";
import { WORLD_REGIONS } from "@/lib/geo";
import { PageTitle } from "@/components/hero";
import { Explorer } from "@/components/explorer";
import { RegionPicker } from "@/components/pickers";

export const revalidate = 300;
export async function generateStaticParams() { return []; }
export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const p = await params;
  const r = WORLD_REGIONS.find((x) => x.slug === p.region);
  return { title: r ? `${r.ta} · ${r.en}` : "Region" };
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const r = WORLD_REGIONS.find((x) => x.slug === region);
  if (!r) notFound();
  const { articles, fetchedAt } = await getRegion(region);
  return (
    <>
      <PageTitle emoji={r.emoji} ta={`${r.ta} செய்திகள்`} en={`${r.en} News`} subTa={`உலகம் › ${r.ta} · ${articles.length} செய்திகள்`} subEn={`World › ${r.en} · ${articles.length} stories`} />
      <div className="mt-4"><RegionPicker active={region} /></div>
      <div className="mt-4"><Explorer articles={articles.slice(0, 200)} fetchedAt={fetchedAt} /></div>
    </>
  );
}
