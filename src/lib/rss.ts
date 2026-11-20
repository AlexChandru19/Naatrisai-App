import type { Article } from "./types";
import { getAll, getSection, getTopic, getDistrict, getFactChecks, getJobsNews, type FeedResult } from "./news";
import { TOPICS } from "./topics";
import { DISTRICTS } from "./geo";

export const SITE = "https://naatrisai.vercel.app";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type FeedDef = { key: string; ta: string; en: string; page: string; load: () => Promise<FeedResult> };
/** Every RSS feed we publish. Items link straight to the original publisher. */
export const RSS_FEEDS: FeedDef[] = [
  { key: "tamilnadu", ta: "தமிழ்நாடு", en: "Tamil Nadu", page: "/tamilnadu", load: () => getSection("tamilnadu") },
  { key: "india", ta: "இந்தியா", en: "India", page: "/india", load: () => getSection("india") },
  { key: "world", ta: "உலகம்", en: "World", page: "/world", load: () => getSection("world") },
  { key: "factcheck", ta: "உண்மைச் சரிபார்ப்பு", en: "Fact checks", page: "/factcheck", load: getFactChecks },
  { key: "jobs", ta: "வேலைவாய்ப்பு", en: "Jobs & exams", page: "/jobs", load: getJobsNews },
  ...TOPICS.map((t) => ({ key: `topic-${t.slug}`, ta: t.ta, en: t.en, page: `/topic/${t.slug}`, load: () => getTopic(t.slug) })),
  ...DISTRICTS.map((d) => ({ key: `district-${d.slug}`, ta: d.ta, en: d.en, page: `/tamilnadu/${d.slug}`, load: () => getDistrict(d.slug) })),
];
export const feedUrl = (key: string) => `${SITE}/rss/${key}.xml`;
export const allFeed = { load: getAll };

export function rssXml(o: { title: string; self: string; page: string; desc: string; articles: Article[]; fetchedAt: string; lang?: string }) {
  const items = o.articles.filter((a) => !a.soft).slice(0, 60).map((a) => `<item><title>${esc(a.title)}</title><link>${esc(a.link)}</link><guid isPermaLink="false">${a.id}</guid>${a.publishedAt ? `<pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>` : ""}<source url="${esc(a.link)}">${esc(a.source)}</source>${a.summary ? `<description>${esc(a.summary)}</description>` : ""}${a.topics.map((t) => `<category>${esc(t)}</category>`).join("")}</item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(o.title)}</title><link>${SITE}${o.page}</link><atom:link href="${esc(o.self)}" rel="self" type="application/rss+xml"/><description>${esc(o.desc)}</description><language>${o.lang ?? "ta"}</language><lastBuildDate>${new Date(o.fetchedAt).toUTCString()}</lastBuildDate>${items}</channel></rss>`;
}
export const rssHeaders = { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" };
