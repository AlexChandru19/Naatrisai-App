import { SITE } from "@/lib/site";
import { RSS_FEEDS, rssXml, rssHeaders, feedUrl } from "@/lib/rss";
export const revalidate = 600;
/** Per-section / topic / district RSS: /rss/tamilnadu.xml, /rss/topic-sports.xml, /rss/district-madurai.xml … */
export async function GET(_req: Request, ctx: { params: Promise<{ feed: string }> }) {
  const { feed } = await ctx.params;
  const key = feed.replace(/\.xml$/, "");
  const f = RSS_FEEDS.find((x) => x.key === key);
  if (!f) return new Response(`Unknown feed. See ${SITE}/rss`, { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const { articles, fetchedAt } = await f.load();
  return new Response(rssXml({ title: `நாற்றிசை · Naatrisai — ${f.ta} · ${f.en}`, self: feedUrl(key), page: f.page, desc: `${f.en} headlines gathered from publishers' own feeds. Links go to the original publishers.`, articles, fetchedAt }), { headers: rssHeaders });
}
