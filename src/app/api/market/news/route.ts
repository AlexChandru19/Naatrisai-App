import { getMarketNews, getCompanyNews } from "@/lib/market-news";
import { getNifty50List, getNiftyNext50List } from "@/lib/stocks";
import type { Article } from "@/lib/types";
/** "My watchlist news": recent stories about up to 8 pinned NSE stocks. */
export async function GET(req: Request) {
  const syms = [...new Set((new URL(req.url).searchParams.get("s") ?? "").toUpperCase().split(",").filter((x) => /^[A-Z0-9&-]{1,20}$/.test(x)))].slice(0, 8);
  if (!syms.length) return Response.json([]);
  const [pool, a, b] = await Promise.all([getMarketNews(), getNifty50List(), getNiftyNext50List()]);
  const known = [...a, ...b];
  const lists = await Promise.all(syms.map((s) => getCompanyNews(s, known.find((k) => k.sym === s)?.name ?? s, pool).then((l) => l.slice(0, 8))));
  const seen = new Set<string>(); const out: Article[] = [];
  for (const a of lists.flat()) if (!seen.has(a.id)) { seen.add(a.id); out.push(a); }
  out.sort((x, y) => (y.publishedAt ?? "").localeCompare(x.publishedAt ?? ""));
  return Response.json(out.slice(0, 48), { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" } });
}
