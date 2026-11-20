import { getAll } from "@/lib/news";
import { rssXml, rssHeaders, SITE } from "@/lib/rss";
export const revalidate = 300;
/** Our own RSS: top-ranked headlines, each linking straight to the original publisher. */
export async function GET() {
  const { articles, fetchedAt } = await getAll();
  return new Response(rssXml({ title: "நாற்றிசை · Naatrisai — top stories", self: `${SITE}/feed.xml`, page: "/", desc: "Top Tamil Nadu, India and world headlines, ranked across outlets. Links go to the original publishers.", articles, fetchedAt }), { headers: { ...rssHeaders, "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
