import { getNavs, searchNavs } from "@/lib/amfi";
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams; const q = (u.get("q") ?? "").trim().slice(0, 60); const codes = (u.get("codes") ?? "").split(",").filter((c) => /^\d{3,7}$/.test(c)).slice(0, 30);
  try {
    const all = await getNavs();
    const items = codes.length ? all.filter((x) => codes.includes(x.code)) : q.length >= 2 ? searchNavs(all, q) : [];
    return Response.json({ items, total: all.length, source: "AMFI" }, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } });
  } catch (e) { return Response.json({ items: [], error: String(e) }, { status: 502 }); }
}
