import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/news";
import { TOPICS } from "@/lib/topics";
import { PageTitle } from "@/components/hero";
import { FollowButton } from "@/components/follow-button";
import { Explorer } from "@/components/explorer";
import { TopicGrid } from "@/components/topic-grid";

export const revalidate = 300;
export async function generateStaticParams() { return []; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await params;
  const t = TOPICS.find((x) => x.slug === p.slug);
  return { title: t ? `${t.ta} · ${t.en}` : "Topic", description: t ? `${t.ta} — ${t.en}: live news from trusted Tamil and English outlets on Naatrisai.` : undefined, alternates: t ? { canonical: `/topic/${t.slug}`, types: { "application/rss+xml": [{ url: `/rss/topic-${t.slug}.xml`, title: `${t.en} RSS` }] } } : undefined };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = TOPICS.find((x) => x.slug === slug);
  if (!t) notFound();
  const { articles, fetchedAt } = await getTopic(slug);
  return (
    <>
      <PageTitle emoji={t.emoji} ta={t.ta} en={t.en} subTa={`${articles.length} செய்திகள் · தமிழ்நாடு, இந்தியா, உலகம்`} subEn={`${articles.length} stories · Tamil Nadu, India, World`}><FollowButton kind="topics" value={t.slug} /></PageTitle>
      <div className="mt-5"><Explorer articles={articles.slice(0, 220)} fetchedAt={fetchedAt} showTopics={false} /></div>
      <h2 className="mb-3 mt-10 text-lg font-extrabold">🗂️ மற்ற தலைப்புகள் · More topics</h2>
      <TopicGrid active={slug} />
    </>
  );
}
