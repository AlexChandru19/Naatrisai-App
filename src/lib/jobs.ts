import "server-only";
import { text } from "./html-table";

export type Notice = { title: string; link: string; kind: string };
/** "What's new" list on the TNPSC home page (official). The site publishes no dates for these entries. */
export async function getTnpsc(): Promise<{ items: Notice[]; ok: boolean }> {
  try {
    const r = await fetch("https://www.tnpsc.gov.in/", { next: { revalidate: 3600 }, headers: { "User-Agent": "Mozilla/5.0 (compatible; NaatrisaiBot/1.0; +https://naatrisai.vercel.app/about)" }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw 0;
    const html = await r.text();
    const seen = new Set<string>();
    const items: Notice[] = [];
    for (const m of html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      const href = m[1], t = text(m[2]);
      if (!/press_releases|latest_results|Counselling|checkmemo|examdashboard/i.test(href) || t.length < 40 || /^announcements/i.test(t)) continue;
      const key = t.slice(0, 80).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const kind = /result|mark|rank/i.test(t) ? "result" : /notification/i.test(t) ? "notification" : /counsel/i.test(href + t) ? "counselling" : /certificate verification|oral test|interview/i.test(t) ? "verification" : "press";
      items.push({ title: t.replace(/\s+/g, " "), link: new URL(href.replace(/^\.\.\//, "/"), "https://www.tnpsc.gov.in/").toString(), kind });
      if (items.length >= 14) break;
    }
    return { items, ok: items.length > 0 };
  } catch { return { items: [], ok: false }; }
}
