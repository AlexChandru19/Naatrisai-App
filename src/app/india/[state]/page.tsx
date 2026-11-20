import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getState } from "@/lib/news";
import { STATES } from "@/lib/geo";
import { PageTitle } from "@/components/hero";
import { FollowButton } from "@/components/follow-button";
import { Explorer } from "@/components/explorer";
import { StateGrid } from "@/components/pickers";

export const revalidate = 300;
export async function generateStaticParams() { return []; }
export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const p = await params;
  const s = STATES.find((x) => x.slug === p.state);
  return { title: s ? `${s.ta} செய்திகள் · ${s.en} News` : "State", description: s ? `${s.ta} — ${s.en}: live news from trusted Tamil and English outlets on Naatrisai.` : undefined };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  if (state === "tamil-nadu") redirect("/tamilnadu");
  const s = STATES.find((x) => x.slug === state);
  if (!s) notFound();
  const { articles, fetchedAt } = await getState(state);
  return (
    <>
      <PageTitle emoji="🗺️" ta={`${s.ta} செய்திகள்`} en={`${s.en} News`} subTa={`இந்தியா › ${s.ut ? "யூனியன் பிரதேசம்" : "மாநிலம்"} › ${s.ta} · ${articles.length} செய்திகள்`} subEn={`India › ${s.ut ? "Union Territory" : "State"} › ${s.en} · ${articles.length} stories`}><FollowButton kind="states" value={s.slug} /></PageTitle>
      <div className="mt-5"><Explorer articles={articles.slice(0, 200)} fetchedAt={fetchedAt} /></div>
      <div className="mt-8"><StateGrid active={state} /></div>
    </>
  );
}
