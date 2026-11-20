import { searchNse } from "@/lib/stocks";
/** NSE equity search (Yahoo Finance): /api/market/search?q=tata */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 40);
  if (q.length < 2) return Response.json([]);
  return Response.json(await searchNse(q), { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
