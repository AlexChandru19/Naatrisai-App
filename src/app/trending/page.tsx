import type { Metadata } from "next";
import { getAll } from "@/lib/news";
import { trending } from "@/lib/trending";
import { PageTitle } from "@/components/hero";
import { TrendingChips } from "@/components/trending-chips";
import { L } from "@/components/providers";

export const revalidate = 300;
export const metadata: Metadata = { title: "டிரெண்டிங் · Trending", description: "Names and words appearing across the most outlets in the last 18 hours.", alternates: { canonical: "/trending" } };

export default async function TrendingPage() {
  const { articles } = await getAll();
  const t = trending(articles, 18, 60);
  const ta = t.filter((x) => x.lang === "ta"), en = t.filter((x) => x.lang === "en");
  return (
    <>
      <PageTitle emoji="📈" ta="டிரெண்டிங் — இப்போது பேசப்படுபவை" en="Trending — what the news is talking about" subTa="கடந்த 18 மணி நேரத் தலைப்புகளில், அதிக ஊடகங்கள் குறிப்பிட்ட பெயர்கள்/சொற்கள்" subEn="Names and words used by the most outlets in headlines over the last 18 hours" />
      <section className="mt-5 rounded-3xl border border-ink-100 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
        <h2 className="mb-2 text-lg font-extrabold">🔤 <L ta="தமிழ்த் தலைப்புகளில்" en="In Tamil headlines" /></h2>
        {ta.length ? <TrendingChips trends={ta} max={30} cloud /> : <p className="opacity-60">—</p>}
      </section>
      <section className="mt-5 rounded-3xl border border-ink-100 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
        <h2 className="mb-2 text-lg font-extrabold">🔠 <L ta="ஆங்கிலத் தலைப்புகளில்" en="In English headlines" /></h2>
        {en.length ? <TrendingChips trends={en} max={30} cloud /> : <p className="opacity-60">—</p>}
      </section>
      <p className="mt-3 text-xs opacity-60"><L ta="கணக்கு: ஒரு சொல் குறைந்தது 2 ஊடகங்களில், 3 தலைப்புகளில் வந்திருக்க வேண்டும். பெரிய எழுத்து = அதிக ஊடகங்கள். தொட்டால் தேடல்." en="Rule: a term must appear in at least 3 headlines from 2+ outlets. Bigger = more outlets. Tap to search." /></p>
    </>
  );
}
