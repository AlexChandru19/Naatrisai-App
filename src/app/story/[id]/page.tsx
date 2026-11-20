import type { Metadata } from "next";
import Link from "next/link";
import { getStory } from "@/lib/news";
import { StoryView } from "@/components/story-view";

type P = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };
const hintOf = (s: Record<string, string | undefined>) => (s.t && s.u ? { title: s.t.slice(0, 200), link: s.u, source: (s.s ?? "").slice(0, 60), lang: (s.l === "ta" ? "ta" : "en") as "ta" | "en" } : undefined);

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const t = hintOf(sp)?.title;
  return { title: t ? `${t} — முழு கவரேஜ் · Full coverage` : "முழு கவரேஜ் · Full coverage", robots: { index: false }, alternates: { canonical: `/story/${id}` } };
}

export default async function StoryPage({ params, searchParams }: P) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const data = await getStory(id, hintOf(sp));
  if (!data.lead) {
    return (
      <div className="py-20 text-center">
        <div className="text-5xl">🧭</div>
        <h1 className="mt-3 text-2xl font-extrabold">இந்தச் செய்தி இப்போது நேரலைத் தொகுப்பில் இல்லை · This story has left the live feed</h1>
        <Link href="/" className="mt-6 inline-block rounded-full bg-kumkum-600 px-5 py-2 font-bold text-white">முகப்பு · Home</Link>
      </div>
    );
  }
  return <StoryView data={data} />;
}
