import { quotes, getNifty50List, getNiftyNext50List } from "@/lib/stocks";
/** Live quotes for a watchlist: /api/market/quotes?s=TCS,INFY (NSE symbols, max 40). */
export async function GET(req: Request) {
  const syms = [...new Set((new URL(req.url).searchParams.get("s") ?? "").toUpperCase().split(",").map((x) => x.trim()).filter((x) => /^[A-Z0-9&-]{1,20}$/.test(x)))].slice(0, 40);
  if (!syms.length) return Response.json([]);
  const known = [...(await getNifty50List()), ...(await getNiftyNext50List())];
  const list = syms.map((sym) => known.find((k) => k.sym === sym) ?? { sym, name: sym, industry: "" });
  const q = await quotes(list);
  return Response.json(q, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } });
}
