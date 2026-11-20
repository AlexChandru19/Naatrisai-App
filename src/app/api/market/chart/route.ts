import { getSeries, RANGES, validSymbol, type RangeKey } from "@/lib/stocks";
/** Price series for the stock/index chart: /api/market/chart?s=TCS&r=1mo */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const s = (u.searchParams.get("s") ?? "").toUpperCase(), r = (u.searchParams.get("r") ?? "1d") as RangeKey;
  if (!validSymbol(s) || !(r in RANGES)) return Response.json({ error: "bad request" }, { status: 400 });
  const data = await getSeries(s, r);
  if (!data || data.c.length < 2) return Response.json({ error: "no data" }, { status: 404 });
  const ttl = r === "1d" ? 120 : r === "5d" ? 600 : 3600;
  return Response.json(data, { headers: { "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}` } });
}
