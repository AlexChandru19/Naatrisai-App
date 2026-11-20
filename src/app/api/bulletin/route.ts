import { getBulletin } from "@/lib/bulletin";
/** Machine-readable bulletin for bots/newsletters: ?format=text gives the WhatsApp/Telegram-ready text. */
export async function GET(req: Request) {
  const b = await getBulletin();
  const h = { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" };
  if (new URL(req.url).searchParams.get("format") === "text") return new Response(b.text, { headers: { ...h, "Content-Type": "text/plain; charset=utf-8" } });
  return Response.json({ edition: b.edition, text: b.text, sections: b.sections.map((s) => ({ ...s, items: s.items.map(({ title, link, source, publishedAt, lang }) => ({ title, link, source, publishedAt, lang })) })), fetchedAt: b.fetchedAt }, { headers: h });
}
