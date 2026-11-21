import { getAll } from "@/lib/news";

/** Lightweight freshness probe for the auto-refresh indicator: newest story ids in the live pool. */
export const revalidate = 60;
export async function GET() {
  const { articles, fetchedAt } = await getAll();
  const fresh = articles.filter((a) => !a.soft && a.publishedAt).sort((x, y) => (y.publishedAt ?? "").localeCompare(x.publishedAt ?? "")).slice(0, 80);
  return Response.json({ fetchedAt, ids: fresh.map((a) => a.id) }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=60" } });
}
