import "server-only";
import { XMLParser } from "fast-xml-parser";

// Official channel IDs, resolved from each channel's @handle page on youtube.com (Nov 2026).
export const CHANNELS = [
  { id: "UC-JFyL0zDFOsPMpuWu39rPA", ta: "தந்தி டிவி", en: "Thanthi TV", handle: "thanthitv" },
  { id: "UCmyKnNRH0wH-r8I-ceP-dsg", ta: "புதிய தலைமுறை", en: "Puthiya Thalaimurai", handle: "PuthiyathalaimuraiTV" },
  { id: "UC8Z-VjXBtDJTvq6aqkIskPg", ta: "பாலிமர் நியூஸ்", en: "Polimer News", handle: "PolimerNews" },
  { id: "UCGyZswzm4G-wEfRQHgMSAuw", ta: "நியூஸ்7 தமிழ்", en: "News7 Tamil", handle: "news7tamil" },
  { id: "UCYlh4lH762HvHt6mmiecyWQ", ta: "சன் நியூஸ்", en: "Sun News", handle: "SunNewsTamil" },
  { id: "UCkqnbsrq2DNeZyblRKFJu7g", ta: "நியூஸ் தமிழ் 24x7", en: "News Tamil 24x7", handle: "NewsTamil24x7" },
  { id: "UCxD03AhBg9LWQuJfijnzhhQ", ta: "BBC தமிழ்", en: "BBC News Tamil", handle: "BBCNewsTamil" },
] as const;

export type Video = { id: string; title: string; published: string; channel: string; channelId: string; live: boolean };
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

// "15h ago", "3 min ago", "2 weeks ago", "1mo ago" → seconds.
const agoSecs = (n: number, u: string) => n * (u.startsWith("mo") ? 2592000 : u.startsWith("s") ? 1 : u.startsWith("m") ? 60 : u.startsWith("h") ? 3600 : u.startsWith("d") ? 86400 : u.startsWith("w") ? 604800 : 31536000);
type Ch = (typeof CHANNELS)[number];

/** Fallback when YouTube's RSS endpoint is down: read titles/ids from the channel's public videos page.
 *  The page only gives "N minutes ago", so `published` is an approximation to that precision. */
async function fromPage(c: Ch): Promise<Video[]> {
  try {
    const r = await fetch(`https://www.youtube.com/channel/${c.id}/videos`, { headers: { "User-Agent": "Mozilla/5.0 (compatible; NaatrisaiBot/1.0; +https://naatrisai.vercel.app/about)", "Accept-Language": "en" }, next: { revalidate: 900 }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return [];
    const m = (await r.text()).match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/);
    if (!m) return [];
    const out: Video[] = [];
    const walk = (o: unknown): void => {
      if (out.length >= 6 || !o || typeof o !== "object") return;
      if (Array.isArray(o)) { o.forEach(walk); return; }
      const lv = (o as Record<string, unknown>).lockupViewModel as Record<string, unknown> | undefined;
      if (lv) {
        const j = JSON.stringify(lv);
        const id = String(lv.contentId ?? "");
        const title = j.match(/"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/)?.[1];
        const ago = j.match(/"content":"(\d+)\s*([a-z]{1,7})\s+ago"/);
        const live = /"text":"LIVE"/.test(j);
        // Scheduled premieres (no viewers yet) haven't been published — skip them.
        const scheduled = /"text":"PREMIERE"/.test(j) && !/\d[\d,.]*\s+watching/.test(j);
        if (id && title && !scheduled) {
          const t = JSON.parse(`"${title}"`) as string;
          const published = new Date(Date.now() - (ago ? agoSecs(Number(ago[1]), ago[2]) * 1000 : 0)).toISOString();
          out.push({ id, title: t, published, channel: c.ta, channelId: c.id, live: live || /🔴\s*LIVE|LIVE\s*:|நேரலை/i.test(t) });
        }
        return;
      }
      Object.values(o).forEach(walk);
    };
    walk(JSON.parse(m[1]));
    return out;
  } catch { return []; }
}

/** Latest uploads from each channel's public RSS feed (falls back to the channel page). */
export async function getVideos(): Promise<Video[]> {
  const lists = await Promise.all(CHANNELS.map(async (c) => {
    try {
      const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${c.id}`, { next: { revalidate: 600 }, signal: AbortSignal.timeout(7000) });
      if (!r.ok) return fromPage(c);
      const doc = parser.parse(await r.text());
      const e = doc?.feed?.entry;
      const arr: Record<string, unknown>[] = Array.isArray(e) ? e : e ? [e] : [];
      return arr.slice(0, 6).map((x) => {
        const title = String(x.title ?? "");
        return { id: String(x["yt:videoId"] ?? ""), title, published: String(x.published ?? ""), channel: c.ta, channelId: c.id, live: /🔴\s*LIVE|LIVE\s*:|நேரலை/i.test(title) };
      }).filter((v) => v.id);
    } catch { return fromPage(c); }
  }));
  return lists.flat().sort((a, b) => b.published.localeCompare(a.published));
}

export type LiveInfo = { channelId: string; videoId: string | null; live: boolean; embeddable: boolean; title: string | null; fallback: Video | null; via?: string; note?: string };
const YT_UA = { "User-Agent": "Mozilla/5.0 (compatible; NaatrisaiBot/1.0; +https://naatrisai.in/about)", "Accept-Language": "en" };

/** Is a specific video allowed in embeds? YouTube's oEmbed answers 401/403 when the owner disabled embedding. */
async function embeddable(id: string): Promise<boolean> {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, { next: { revalidate: 3600 }, headers: YT_UA, signal: AbortSignal.timeout(5000) });
    return r.ok;
  } catch { return true; } // unknown: let the player's own error handler decide
}

/** Resolve the channel's current live stream from its public /live page (redirects to the live watch page when on air). */
async function liveOf(c: Ch, latest: Video[]): Promise<LiveInfo> {
  const base: LiveInfo = { channelId: c.id, videoId: null, live: false, embeddable: false, title: null, fallback: null };
  try {
    const r = await fetch(`https://www.youtube.com/channel/${c.id}/live`, { next: { revalidate: 180 }, headers: YT_UA, signal: AbortSignal.timeout(8000) });
    base.note = `live-page ${r.status}`;
    if (r.ok) {
      const t = await r.text();
      base.note += ` len=${t.length}${/consent\.youtube|Before you continue/.test(t) ? " consent" : ""}${/confirm you.re not a bot|"LOGIN_REQUIRED"/.test(t) ? " botcheck" : ""}${/"videoDetails"/.test(t) ? " vd" : ""}`;
      const vid = t.match(/"videoDetails":\{"videoId":"([\w-]{11})"/)?.[1];
      const owner = t.match(/"videoDetails":\{[^}]*?"channelId":"([\w-]+)"/)?.[1];
      const isLive = /"videoDetails":\{[^}]*?"isLive":true/.test(t) || /"isLiveNow":true/.test(t);
      const okPlay = /"playabilityStatus":\{"status":"OK"/.test(t);
      const embedOk = !/"playableInEmbed":false/.test(t);
      const title = t.match(/"videoDetails":\{[^}]*?"title":"((?:[^"\\]|\\.)*)"/)?.[1];
      // YouTube sometimes answers server requests with a sign-in/bot challenge for *playback* (LOGIN_REQUIRED) while still
      // naming the live video in public metadata. We only read that metadata — playback happens in the viewer's browser —
      // and confirm embeddability separately through oEmbed.
      const challenged = /"playabilityStatus":\{"status":"LOGIN_REQUIRED"/.test(t);
      if (vid && isLive && (okPlay || challenged) && (!owner || owner === c.id)) {
        base.videoId = vid; base.live = true; base.title = title ? JSON.parse(`"${title}"`) : null;
        base.embeddable = okPlay ? embedOk : await embeddable(vid);
      }
    }
  } catch {}
  if (base.live) base.via = "live-page";
  // If YouTube didn't give us the live page (e.g. it challenges server requests), use the newest feed entry
  // titled as a live stream — clearly labelled as unconfirmed, since it may already have ended.
  if (!base.live && !/ vd/.test(base.note ?? "")) {
    const cand = latest.filter((x) => x.channelId === c.id && x.live && Date.now() - Date.parse(x.published) < 12 * 3600e3)[0];
    if (cand && (await embeddable(cand.id))) { base.videoId = cand.id; base.title = cand.title; base.embeddable = true; base.via = "feed"; }
  }
  // Not live (or live but not embeddable): the newest upload that allows embedding.
  if (!base.videoId || !base.embeddable) {
    for (const v of latest.filter((x) => x.channelId === c.id && !x.live).slice(0, 4)) {
      if (await embeddable(v.id)) { base.fallback = v; break; }
    }
  }
  return base;
}
export async function getLiveInfo(videos: Video[]): Promise<LiveInfo[]> {
  return Promise.all(CHANNELS.map((c) => liveOf(c, videos)));
}
