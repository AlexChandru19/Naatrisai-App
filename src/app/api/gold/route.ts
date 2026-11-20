import { getBullion } from "@/lib/bullion";
/** Chennai/TN retail gold rates (Goodreturns) for price alerts. */
export async function GET() {
  const b = await getBullion();
  return Response.json({ cities: b.cities.map(({ city, k22, k24 }) => ({ city, k22, k24 })), date: b.goldDate }, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } });
}
