import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDistrict } from "@/lib/news";
import { DISTRICTS } from "@/lib/geo";
import { PageTitle } from "@/components/hero";
import { FollowButton } from "@/components/follow-button";
import { Explorer } from "@/components/explorer";
import { DistrictPicker } from "@/components/pickers";
import { WeatherWidget } from "@/components/weather";
import { getFuel } from "@/lib/fuel";
import { getBullion } from "@/lib/bullion";
import { getAlerts } from "@/lib/alerts";
import { fuelByDistrict } from "@/lib/place";
import { TownCard } from "@/components/town-card";
import { AlertList } from "@/components/alerts-view";

export const revalidate = 300;
export async function generateStaticParams() { return []; }
export async function generateMetadata({ params }: { params: Promise<{ district: string }> }): Promise<Metadata> {
  const p = await params;
  const d = DISTRICTS.find((x) => x.slug === p.district);
  return { title: d ? `${d.ta} செய்திகள் · ${d.en} News` : "District", description: d ? `${d.ta} — ${d.en}: live news from trusted Tamil and English outlets on Naatrisai.` : undefined, alternates: d ? { canonical: `/tamilnadu/${d.slug}`, types: { "application/rss+xml": [{ url: `/rss/district-${d.slug}.xml`, title: `${d.en} RSS` }] } } : undefined };
}

export default async function DistrictPage({ params }: { params: Promise<{ district: string }> }) {
  const { district } = await params;
  const d = DISTRICTS.find((x) => x.slug === district);
  if (!d) notFound();
  const [{ articles, fetchedAt }, fuel, gold, alerts] = await Promise.all([getDistrict(district), getFuel(), getBullion(), getAlerts()]);
  const fb = fuelByDistrict(fuel.cities);
  const mine = alerts.tn.filter((a) => a.districts.includes(district));
  return (
    <>
      <PageTitle emoji="📍" ta={`${d.ta} மாவட்டச் செய்திகள்`} en={`${d.en} district news`} subTa={`தமிழ்நாடு › ${d.ta} · ${articles.length} செய்திகள்`} subEn={`Tamil Nadu › ${d.en} · ${articles.length} stories`}><FollowButton kind="districts" value={d.slug} /></PageTitle>
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div><Explorer articles={articles.slice(0, 200)} fetchedAt={fetchedAt} emptyHint={{ ta: "இந்த மாவட்டத்திற்கு இப்போது செய்திகள் இல்லை.", en: "No stories for this district right now." }} /></div>
        <aside className="order-first space-y-4 lg:order-none lg:sticky lg:top-24 lg:self-start">
          <TownCard fixed={district} fuelBy={fb[district] ? { [district]: fb[district] } : {}} gold={gold.cities.find((c) => /chennai/i.test(c.city))} alerts={mine} />
          {mine.length > 0 && <AlertList items={mine} />}
          <WeatherWidget fixed={district} />
          <DistrictPicker active={district} compact />
        </aside>
      </div>
    </>
  );
}
