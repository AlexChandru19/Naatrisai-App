import { getAll, fetchSources } from "@/lib/news";
import { gnSearch } from "@/lib/sources";
import type { Article } from "@/lib/types";
/** Watchwords: /api/watch?w=TNPSC|Chennai Metro → recent stories per word (our feeds + a Google News search). */
export async function GET(req: Request) {
  const words = [...new Set((new URL(req.url).searchParams.get("w") ?? "").split("|").map((w) => w.trim().slice(0, 40)).filter((w) => w.length >= 2))].slice(0, 12);
  if (!words.length) return Response.json([]);
  const pool = (await getAll()).articles;
  const out = await Promise.all(words.map(async (w) => {
    const ta = /[\u0B80-\u0BFF]/.test(w);
    const gn = await fetchSources([{ url: gnSearch(`"${w}"`, ta ? "ta" : "en"), source: ta ? "Google செய்திகள்" : "Google News", lang: ta ? "ta" : "en", section: "india" }]);
    const k = w.toLowerCase();
    const has = (a: Article) => `${a.title} ${a.summary}`.toLowerCase().includes(k);
    const seen = new Set<string>(); const list: Article[] = [];
    for (const a of [...pool.filter(has), ...gn.articles.filter(has)]) {
      if (a.publishedAt && Date.now() - Date.parse(a.publishedAt) > 3 * 86400e3) continue;
      const key = a.title.toLowerCase().slice(0, 50); if (seen.has(key)) continue; seen.add(key); list.push(a);
    }
    list.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    return { word: w, count: list.length, articles: list.slice(0, 24) };
  }));
  return Response.json(out, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
}
