import "server-only";
import { XMLParser } from "fast-xml-parser";

export type Match = { title: string; link: string; india: boolean; live: boolean; upcoming?: boolean };
const parser = new XMLParser();

/** ESPNcricinfo's public live-scores RSS. `*` marks the side currently batting. */
export async function getCricket(): Promise<{ matches: Match[]; fetchedAt: string }> {
  try {
    const r = await fetch("https://static.cricinfo.com/rss/livescores.xml", { next: { revalidate: 120 }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) throw 0;
    const doc = parser.parse(await r.text());
    const items = doc?.rss?.channel?.item;
    const arr: { title?: string; link?: string; guid?: string }[] = Array.isArray(items) ? items : items ? [items] : [];
    const matches = arr.map((i) => {
      const title = String(i.title ?? "").replace(/\s+/g, " ").trim();
      const link = String(i.guid ?? i.link ?? "").trim().replace(/^http:/, "https:").replace(/\?.*$/, "");
      // "*" marks the batting side; it only means "in progress" next to a score that isn't all out.
      const live = /\d\s*\*/.test(title) && !/\/10\s*\*/.test(title);
      const upcoming = !/\b\d{1,3}(\/\d{1,2})?\b/.test(title);
      return { title, link, india: /\bIndia\b/i.test(title), live, upcoming };
    }).filter((m) => m.title);
    matches.sort((a, b) => Number(b.india) - Number(a.india) || Number(b.live) - Number(a.live));
    return { matches: matches.slice(0, 8), fetchedAt: new Date().toISOString() };
  } catch {
    return { matches: [], fetchedAt: new Date().toISOString() };
  }
}
