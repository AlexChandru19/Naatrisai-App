import type { Metadata } from "next";
import { Suspense } from "react";
import { getAll } from "@/lib/news";
import { ForYou } from "@/components/for-you";

export const revalidate = 300;
export const metadata: Metadata = { title: "உங்களுக்காக · For You", description: "Your personalised Tamil, India and world news feed — built on your device from the topics, districts, states and outlets you follow.", alternates: { canonical: "/for-you" } };

export default async function ForYouPage() {
  const { articles, fetchedAt } = await getAll();
  const slim = articles.slice(0, 450).map((a) => ({ ...a, cluster: a.cluster?.slice(0, 6) }));
  return <Suspense><ForYou articles={slim} fetchedAt={fetchedAt} /></Suspense>;
}
