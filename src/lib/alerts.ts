import "server-only";
import { districtsIn } from "./place";

export type Alert = { id: string; title: string; issuer: string; time: string; link: string; districts: string[]; tn: boolean; event?: string; severity?: string; expires?: string; area?: string };
export type Alerts = { tn: Alert[]; tnRecent: Alert[]; india: Alert[]; fetchedAt: string; ok: boolean };

const FEED = "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml";
const UA = { "User-Agent": "Mozilla/5.0 (compatible; NaatrisaiBot/1.0)" };
const tag = (s: string, t: string) => s.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`))?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() ?? "";
const dec = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();

async function cap(a: Alert): Promise<Alert> {
  try {
    const r = await fetch(a.link, { next: { revalidate: 1800 }, headers: UA, signal: AbortSignal.timeout(5000) });
    if (!r.ok) return a;
    const x = await r.text();
    const t = (n: string) => dec(tag(x, `cap:${n}`));
    const area = t("areaDesc");
    return { ...a, event: t("event") || undefined, severity: t("severity") || undefined, expires: t("expires") || undefined, area: area || undefined, districts: [...new Set([...a.districts, ...districtsIn(area).map((d) => d.slug)])] };
  } catch { return a; }
}

/** Official IMD / state disaster alerts (CAP) published on NDMA's SACHET portal. */
export async function getAlerts(): Promise<Alerts> {
  try {
    const r = await fetch(FEED, { next: { revalidate: 600 }, headers: UA, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw 0;
    const xml = await r.text();
    const now = Date.now();
    const items: Alert[] = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
      const s = m[1];
      const title = dec(tag(s, "title"));
      const issuer = dec(tag(s, "author")).replace(/^.*\(([^)]+)\).*$/, "$1");
      const t = Date.parse(tag(s, "pubDate"));
      const ds = districtsIn(title).map((d) => d.slug);
      const tn = /tamil ?nadu|puducherry|chennai/i.test(title) || /IMD Chennai|TNSDMA|Tamil/i.test(issuer) || ds.length > 0;
      return { id: tag(s, "guid"), title, issuer, time: Number.isFinite(t) ? new Date(t).toISOString() : "", link: tag(s, "link").replace(/^http:/, "https:"), districts: ds, tn };
    }).filter((a) => a.title && a.time && now - Date.parse(a.time) < 36 * 3600e3);
    // Enrich Tamil Nadu items with the CAP record (severity, expiry, area) and drop expired ones.
    const all = (await Promise.all(items.filter((a) => a.tn).slice(0, 16).map(cap))).sort((a, b) => b.time.localeCompare(a.time));
    const live = (a: Alert) => (a.expires ? Date.parse(a.expires) > now : now - Date.parse(a.time) < 6 * 3600e3);
    const tn = all.filter(live);
    const seen = new Set<string>();
    const dedupe = (l: Alert[]) => l.filter((a) => { const k = a.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
    const tnU = dedupe(tn);
    const tnRecent = dedupe(all.filter((a) => !live(a))).slice(0, 8);
    return { tn: tnU, tnRecent, india: dedupe(items.filter((a) => !a.tn)).slice(0, 40), fetchedAt: new Date().toISOString(), ok: true };
  } catch {
    return { tn: [], tnRecent: [], india: [], fetchedAt: new Date().toISOString(), ok: false };
  }
}
