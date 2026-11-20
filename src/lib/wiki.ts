import "server-only";

export type WikiCard = { title: string; extract: string; description?: string; thumb?: string; url: string; lang: "ta" | "en" };

async function summary(q: string, lang: "ta" | "en"): Promise<WikiCard | null> {
  try {
    const r = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/ /g, "_"))}?redirect=true`, {
      next: { revalidate: 86400 }, headers: { "User-Agent": "Naatrisai/1.0 (https://naatrisai.vercel.app)" }, signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { type?: string; title: string; extract?: string; description?: string; thumbnail?: { source: string }; content_urls?: { desktop?: { page?: string } } };
    if (j.type !== "standard" || !j.extract || j.extract.length < 60) return null; // skip disambiguation / stubs
    return { title: j.title, extract: j.extract.length > 420 ? j.extract.slice(0, 420).replace(/\s\S*$/, "") + "…" : j.extract, description: j.description, thumb: j.thumbnail?.source, url: j.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(j.title)}`, lang };
  } catch { return null; }
}

const NAMED = /politician|actor|actress|city|town|district|state|territory|party|country|cricketer|minister|company|organi[sz]ation|film|player|singer|director|capital|village|river|temple|university|president|prime minister|chief minister|leader|businessman|agency|court|union|team|league|festival|religious|scientist|writer|poet|composer|airport|port|metro|railway|institute|association|federation|army|bank/i;

/** Background card for a search term (person, place, party…) from Wikipedia — Tamil first for Tamil queries. */
export async function wikiCard(q: string): Promise<WikiCard | null> {
  const term = q.trim();
  if (term.length < 3 || term.split(/\s+/).length > 5) return null;
  const ta = /[\u0B80-\u0BFF]/.test(term);
  const first = await summary(term, ta ? "ta" : "en");
  const card = first ?? (ta ? null : await summary(term.replace(/\b\w/g, (c) => c.toUpperCase()), "en"));
  // English cards only for named things (people, places, parties, organisations…), not common words like "rain".
  if (card && card.lang === "en" && !NAMED.test(card.description ?? "")) return null;
  return card;
}
