import { getNifty50List } from "@/lib/stocks";
/** NIFTY 50 constituents (Wikipedia table citing NSE Indices) for the command palette. */
export async function GET() {
  const l = await getNifty50List();
  return Response.json(l.map(({ sym, name }) => ({ sym, name })), { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800" } });
}
