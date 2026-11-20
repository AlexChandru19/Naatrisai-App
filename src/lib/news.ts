import "server-only";
import { XMLParser } from "fast-xml-parser";
import { FEEDS, Lang, Section, SECTION_FEEDS, TOPIC_EXTRA_FEEDS, gnSearch, gnTopic } from "./sources";
import { DISTRICTS, STATES, WORLD_REGIONS } from "./geo";
import { TOPICS, classifyTopics } from "./topics";
import { tagDistricts, tagStates } from "./geotag";
import { rank, credibility, isSoft } from "./rank";

export type { Article } from "./types";
import type { Article, Version } from "./types";

export const REVALIDATE = 300;
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "#text", processEntities: true, htmlEntities: true });

const ENT: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " ", "&#8217;": "’", "&#8216;": "‘", "&#8220;": "“", "&#8221;": "”", "&#8230;": "…", "&#8211;": "–", "&#8212;": "—" };
function decode(s: string) {
  return s.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m) => {
    if (ENT[m]) return ENT[m];
    if (m.startsWith("&#x")) return String.fromCodePoint(parseInt(m.slice(3, -1), 16));
    if (m.startsWith("&#")) return String.fromCodePoint(parseInt(m.slice(2, -1), 10));
    return m;
  });
}
const text = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return text(v[0]);
  if (typeof v === "object" && "#text" in (v as Record<string, unknown>)) return text((v as Record<string, unknown>)["#text"]);
  return "";
};
const strip = (html: string) => decode(decode(html).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const arr = <T,>(v: T | T[] | undefined): T[] => (v == null ? [] : Array.isArray(v) ? v : [v]);

function pickImage(it: Record<string, unknown>, rawDesc: string): string | null {
  const cands: unknown[] = [...arr(it["media:content"] as unknown), ...arr(it["media:thumbnail"] as unknown), ...arr(it["enclosure"] as unknown)];
  const group = it["media:group"] as Record<string, unknown> | undefined;
  if (group) cands.push(...arr(group["media:content"] as unknown), ...arr(group["media:thumbnail"] as unknown));
  let best: { url: string; w: number } | null = null;
  for (const c of cands) {
    if (!c || typeof c !== "object") continue;
    const o = c as Record<string, string>;
    const url = o["@_url"];
    if (!url) continue;
    const type = o["@_type"] || o["@_medium"] || "image";
    if (!/image|jpe?g|png|webp/i.test(type) && !/\.(jpe?g|png|webp)/i.test(url)) continue;
    const w = parseInt(o["@_width"] || "0", 10) || 0;
    if (!best || w > best.w) best = { url, w };
  }
  if (best) return upgrade(best.url);
  const m = decode(rawDesc).match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? upgrade(m[1]) : null;
}
// BBC serves 240px thumbs in RSS; the same path works at 800px.
const upgrade = (u: string) => u.replace(/^http:/, "https:").replace("/ace/ws/240/", "/ace/ws/800/").replace("/news/240/", "/news/800/");

function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const isTamil = (s: string) => /[\u0B80-\u0BFF]/.test(s);

// ---- Fetch + parse one feed ----
type Src = { url: string; source: string; lang: Lang; section: Section; id?: string };
async function fetchFeed(f: Src): Promise<Article[]> {
  try {
    const res = await fetch(f.url, {
      next: { revalidate: REVALIDATE },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NaatrisaiBot/1.0; +https://naatrisai.vercel.app)", Accept: "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const doc = parser.parse(xml);
    const items: Record<string, unknown>[] = arr(doc?.rss?.channel?.item ?? doc?.feed?.entry);
    const isGN = f.url.includes("news.google.com");
    return items.slice(0, 60).map((it) => {
      let title = strip(text(it.title));
      let source = f.source;
      if (isGN) {
        const s = text(it.source);
        if (s) { source = s; title = title.replace(new RegExp(`\\s+-\\s+${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), ""); }
      }
      const rawDesc = text(it.description) || text(it["content:encoded"]) || text(it.summary);
      let summary = isGN ? "" : strip(rawDesc);
      if (summary.startsWith(title.slice(0, 40))) summary = summary.slice(title.length).trim();
      if (summary.length > 240) summary = summary.slice(0, 237).replace(/\s+\S*$/, "") + "…";
      let link = text(it.link);
      if (!link && it.link && typeof it.link === "object") link = (it.link as Record<string, string>)["@_href"] || "";
      link = decode(link.trim());
      const d = new Date(text(it.pubDate) || text(it.published) || text(it.updated) || text(it["dc:date"]));
      const publishedAt = isNaN(d.getTime()) ? null : d.toISOString();
      const body = `${summary} ${text(it["media:keywords"])} ${text(it.category)}`;
      return {
        id: hash(link || title),
        title, summary, link,
        image: isGN ? null : pickImage(it, rawDesc),
        source, lang: f.lang, section: f.section, publishedAt,
        topics: classifyTopics(title, body, link),
        soft: false,
        districts: tagDistricts(title, body, f.section),
        states: tagStates(title, body),
      } satisfies Article;
    }).map((a) => ({ ...a, soft: isSoft(a) })).filter((a) => a.title && a.link.startsWith("http"));
  } catch {
    return [];
  }
}

// ---- De-duplication + story clustering by headline similarity ----
const STOP = new Set("the a an of in on at to for and or is are was were be by with from as after over into its it this that says said will new amid how why what who".split(" "));
const tokens = (s: string) => new Set(s.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)));
function overlap(a: Set<string>, b: Set<string>) {
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return { inter, sim: inter / Math.max(1, Math.min(a.size, b.size)) };
}
const sameStory = (a: Set<string>, b: Set<string>) => {
  const { inter, sim } = overlap(a, b);
  return (sim >= 0.6 && inter >= 3) || (sim >= 0.85 && inter >= 2);
};
const version = (a: Article): Version => ({ source: a.source, title: a.title, link: a.link, lang: a.lang, publishedAt: a.publishedAt });
const quality = (a: Article) => (a.image ? 2 : 0) + credibility(a.source) + Math.min(1, a.summary.length / 200);
function merge(x: Article, y: Article): Article {
  const [keep, other] = quality(y) > quality(x) ? [y, x] : [x, y];
  const seen = new Set([keep.link]);
  const cluster: Version[] = [];
  for (const v of [version(other), ...(other.cluster ?? []), ...(keep.cluster ?? [])]) {
    if (seen.has(v.link)) continue;
    seen.add(v.link); cluster.push(v);
  }
  const times = [keep.publishedAt, other.publishedAt].filter(Boolean) as string[];
  const topics = keep.topics.length ? keep.topics : other.topics;
  return {
    ...keep,
    cluster: cluster.slice(0, 12),
    topics,
    districts: [...new Set([...keep.districts, ...other.districts])].slice(0, 3),
    states: [...new Set([...keep.states, ...other.states])].slice(0, 3),
    // the displayed version decides, judged with the cluster's topics
    soft: keep.soft || isSoft({ title: keep.title, link: keep.link, topics }),
    // a cluster is as fresh as its newest report
    publishedAt: times.length ? times.sort().at(-1)! : keep.publishedAt,
  };
}
export function dedupe(list: Article[]): Article[] {
  const out: { a: Article; t: Set<string> }[] = [];
  const byId = new Map<string, number>();
  for (const a of list) {
    const known = byId.get(a.id);
    if (known !== undefined) { out[known].a = merge(out[known].a, a); continue; }
    const t = tokens(a.title);
    const i = out.findIndex((o) => sameStory(o.t, t));
    if (i >= 0) { out[i].a = merge(out[i].a, a); byId.set(a.id, i); continue; }
    byId.set(a.id, out.length);
    out.push({ a, t });
  }
  return out.map((o) => o.a);
}
const interleave = (list: Article[]) => rank(list);

async function gather(srcs: Src[]) {
  const results = await Promise.all(srcs.map(fetchFeed));
  const ok = srcs.map((s, i) => ({ source: s.source, url: s.url, count: results[i].length }));
  return { articles: interleave(dedupe(results.flat())), status: ok };
}

export type FeedResult = { articles: Article[]; status: { source: string; url: string; count: number }[]; fetchedAt: string };
const wrap = async (srcs: Src[]): Promise<FeedResult> => ({ ...(await gather(srcs)), fetchedAt: new Date().toISOString() });

export const getAll = () => wrap(FEEDS);
export const getSection = (s: Section) => wrap(SECTION_FEEDS(s));

export async function getDistrict(slug: string): Promise<FeedResult> {
  const d = DISTRICTS.find((x) => x.slug === slug);
  if (!d) return getSection("tamilnadu");
  const [pool, extra] = await Promise.all([
    getSection("tamilnadu"),
    wrap([
      { url: gnSearch(d.ta, "ta"), source: "Google செய்திகள்", lang: "ta", section: "tamilnadu" },
      { url: gnSearch(`${d.en} Tamil Nadu`, "en"), source: "Google News", lang: "en", section: "tamilnadu" },
    ]),
  ]);
  const local = pool.articles.filter((a) => a.districts.includes(slug));
  const gn = extra.articles.map((a) => ({ ...a, districts: a.districts.includes(slug) ? a.districts : [slug, ...a.districts] }));
  return { articles: interleave(dedupe([...local, ...gn])), status: [...extra.status], fetchedAt: extra.fetchedAt };
}

export async function getState(slug: string): Promise<FeedResult> {
  const s = STATES.find((x) => x.slug === slug);
  if (!s) return getSection("india");
  const [pool, extra] = await Promise.all([
    getSection("india"),
    wrap([
      { url: gnSearch(s.en === "Delhi" ? "Delhi news" : s.en, "en"), source: "Google News", lang: "en", section: "india" },
      { url: gnSearch(s.ta, "ta"), source: "Google செய்திகள்", lang: "ta", section: "india" },
    ]),
  ]);
  const local = pool.articles.filter((a) => a.states.includes(slug));
  const gn = extra.articles.map((a) => ({ ...a, states: a.states.includes(slug) ? a.states : [slug, ...a.states] }));
  return { articles: interleave(dedupe([...local, ...gn])), status: extra.status, fetchedAt: extra.fetchedAt };
}

export async function getRegion(slug: string): Promise<FeedResult> {
  const r = WORLD_REGIONS.find((x) => x.slug === slug);
  if (!r) return getSection("world");
  const srcs: Src[] = r.feeds.map((url) => ({ url, source: "BBC News", lang: "en" as Lang, section: "world" as Section }));
  if (r.gnQuery) srcs.push({ url: gnSearch(r.gnQuery, "en"), source: "Google News", lang: "en", section: "world" });
  if (r.gnQueryTa) srcs.push({ url: gnSearch(r.gnQueryTa, "ta"), source: "Google செய்திகள்", lang: "ta", section: "world" });
  if (!r.gnQueryTa) srcs.push({ url: gnSearch(r.ta, "ta"), source: "Google செய்திகள்", lang: "ta", section: "world" });
  return wrap(srcs);
}

export async function getTopic(slug: string): Promise<FeedResult> {
  const t = TOPICS.find((x) => x.slug === slug);
  if (!t) return getAll();
  const srcs: Src[] = [];
  if (t.gnTopic) srcs.push({ url: gnTopic(t.gnTopic, "ta"), source: "Google செய்திகள்", lang: "ta", section: "india" }, { url: gnTopic(t.gnTopic, "en"), source: "Google News", lang: "en", section: "india" });
  if (t.gnQueryTa) srcs.push({ url: gnSearch(t.gnQueryTa, "ta"), source: "Google செய்திகள்", lang: "ta", section: "tamilnadu" });
  if (t.gnQuery) srcs.push({ url: gnSearch(t.gnQuery, "en"), source: "Google News", lang: "en", section: "india" });
  for (const e of TOPIC_EXTRA_FEEDS[slug] ?? []) srcs.push({ ...e, section: "india" });
  const [pool, extra] = await Promise.all([getAll(), wrap(srcs)]);
  const tagged = pool.articles.filter((a) => a.topics.includes(slug));
  const ex = extra.articles.map((a) => ({ ...a, topics: a.topics.includes(slug) ? a.topics : [slug, ...a.topics] }));
  return { articles: interleave(dedupe([...tagged, ...ex])), status: extra.status, fetchedAt: extra.fetchedAt };
}

export type SearchAlias = { kind: "district" | "state" | "topic"; slug: string; ta: string; en: string; other: string };
const nk = (x: string) => x.toLowerCase().replace(/[^a-z\u0b80-\u0bff]/g, "");
/** Is the query exactly a district, state or topic name (in either language)? */
export function searchAlias(q: string): SearchAlias | null {
  const k = nk(q); if (k.length < 3) return null;
  const ta = isTamil(q);
  for (const [kind, list] of [["district", DISTRICTS], ["state", STATES], ["topic", TOPICS]] as const) {
    for (const x of list as readonly { slug: string; ta: string; en: string; alt?: string[] }[]) {
      if ([x.en, x.ta, ...(x.alt ?? [])].some((n) => nk(n) === k)) return { kind, slug: x.slug, ta: x.ta, en: x.en, other: ta ? x.en : x.ta };
    }
  }
  return null;
}

export async function search(q: string): Promise<FeedResult & { alias?: SearchAlias | null }> {
  const query = q.trim().slice(0, 100);
  if (!query) return { articles: [], status: [], fetchedAt: new Date().toISOString() };
  const ta = isTamil(query);
  const srcs: Src[] = [
    { url: gnSearch(query, "ta"), source: "Google செய்திகள்", lang: "ta", section: "tamilnadu" },
    { url: gnSearch(query, "en"), source: "Google News", lang: "en", section: "india" },
  ];
  // Cross-language expansion for place and topic names: "Madurai" also searches "மதுரை", and vice versa.
  const alias = searchAlias(query);
  if (alias && alias.other !== query) srcs.push({ url: gnSearch(alias.other, ta ? "en" : "ta"), source: ta ? "Google News" : "Google செய்திகள்", lang: ta ? "en" : "ta", section: ta ? "india" : "tamilnadu" });
  const [pool, extra] = await Promise.all([getAll(), wrap(ta ? srcs : [srcs[1], srcs[0], ...srcs.slice(2)])]);
  const needle = query.toLowerCase();
  const local = pool.articles.filter((a) => `${a.title} ${a.summary}`.toLowerCase().includes(needle) || (alias?.kind === "district" && a.districts.includes(alias.slug)) || (alias?.kind === "state" && a.states.includes(alias.slug)) || (alias?.kind === "topic" && a.topics.includes(alias.slug)));
  return { articles: rank(dedupe([...local, ...extra.articles])), status: extra.status, fetchedAt: extra.fetchedAt, alias };
}

// ---- Full coverage for one story: every outlet's version + a timeline ----
export type Coverage = { lead: Article | null; versions: (Version & { image?: string | null; summary?: string })[]; related: Article[]; more?: Article[]; fetchedAt: string };
const keyQuery = (title: string) => [...tokens(title)].filter((w) => !/^\d+$/.test(w)).slice(0, 8).join(" ");

export async function getStory(id: string, hint?: { title: string; link: string; source: string; lang: "ta" | "en" }): Promise<Coverage> {
  const pool = await getAll();
  let lead = pool.articles.find((a) => a.id === id || (a.cluster ?? []).some((v) => hash(v.link) === id)) ?? null;
  if (!lead && hint?.title && /^https?:\/\//.test(hint.link)) {
    lead = { id, title: hint.title, summary: "", link: hint.link, image: null, source: hint.source || "—", lang: hint.lang, section: "india", publishedAt: null, topics: classifyTopics(hint.title), districts: [], states: [] };
  }
  if (!lead) return { lead: null, versions: [], related: [], fetchedAt: pool.fetchedAt };
  const lt = tokens(lead.title);
  const q = keyQuery(lead.title);
  const more = q ? await wrap([
    { url: gnSearch(q, "ta"), source: "Google செய்திகள்", lang: "ta", section: lead.section },
    { url: gnSearch(q, "en"), source: "Google News", lang: "en", section: lead.section },
  ]) : { articles: [] as Article[] };
  // Looser match than clustering: this page is about one story, so 50% shared key words is enough.
  const close = (t: string) => { const { inter, sim } = overlap(lt, tokens(t)); return (sim >= 0.5 && inter >= 2) || sim >= 0.8; };
  const all = new Map<string, Coverage["versions"][number]>();
  const push = (v: Coverage["versions"][number]) => { if (!all.has(v.link)) all.set(v.link, v); };
  push({ ...version(lead), image: lead.image, summary: lead.summary });
  for (const v of lead.cluster ?? []) push(v);
  const flat = [...pool.articles, ...more.articles].flatMap((a) => [{ ...version(a), image: a.image, summary: a.summary }, ...(a.cluster ?? [])]);
  for (const v of flat) if (close(v.title)) push(v);
  const versions = [...all.values()].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")).slice(0, 40);
  const topic = lead.topics[0];
  const related = pool.articles.filter((a) => a.id !== lead!.id && !all.has(a.link) && !a.soft && (
    (topic && a.topics[0] === topic) || a.districts.some((d) => lead!.districts.includes(d)) || a.states.some((s) => lead!.states.includes(s))
  )).slice(0, 9);
  // "Continue reading": the strongest other stories right now, so a reader never hits a dead end.
  const skip = new Set([lead.id, ...related.map((a) => a.id)]);
  const moreTop = pool.articles.filter((a) => !skip.has(a.id) && !a.soft && !all.has(a.link)).slice(0, 12);
  return { lead, versions, related, more: moreTop, fetchedAt: pool.fetchedAt };
}

// ---- Jobs, exams & results news (Google News search over Indian outlets) ----
const JOB_WORDS = /recruit|vacanc|notification|exam|result|admit card|hall ticket|answer key|counsel|tnpsc|upsc|ssc|rrb|ibps|trb|tnusrb|neet|jee|cuet|gate|வேலைவாய்ப்பு|பணியிட|தேர்வு|முடிவு|ஹால் டிக்கெட்|விண்ணப்ப|டி\.?என்\.?பி\.?எஸ்\.?சி|காலிப்பணி|நியமன/i;
export async function getJobsNews(): Promise<FeedResult> {
  const res = await wrap([
    { url: gnSearch("TNPSC OR TRB OR TNUSRB OR வேலைவாய்ப்பு OR தேர்வு முடிவு", "ta"), source: "Google செய்திகள்", lang: "ta", section: "tamilnadu" },
    { url: gnSearch("TNPSC OR UPSC OR SSC OR RRB OR IBPS recruitment OR exam result OR admit card", "en"), source: "Google News", lang: "en", section: "india" },
  ]);
  return { ...res, articles: res.articles.filter((a) => JOB_WORDS.test(a.title) && (!a.publishedAt || Date.now() - Date.parse(a.publishedAt) < 10 * 86400e3)).map((a) => ({ ...a, topics: a.topics.includes("education") ? a.topics : [...a.topics, "education"] })) };
}

/** Fact-check roundup from Indian fact-checking organisations' own RSS feeds, newest first. */
export const FACTCHECKERS = [
  { url: "https://tamil.factcrescendo.com/feed/", source: "Fact Crescendo தமிழ்", lang: "ta", home: "https://tamil.factcrescendo.com/" },
  { url: "https://newschecker.in/ta/feed", source: "Newschecker தமிழ்", lang: "ta", home: "https://newschecker.in/ta/" },
  { url: "https://www.altnews.in/feed/", source: "Alt News", lang: "en", home: "https://www.altnews.in/" },
  { url: "https://factly.in/feed/", source: "Factly", lang: "en", home: "https://factly.in/" },
  { url: "https://newschecker.in/feed", source: "Newschecker", lang: "en", home: "https://newschecker.in/" },
  { url: "https://www.vishvasnews.com/tamil/feed/", source: "Vishvas News தமிழ்", lang: "ta", home: "https://www.vishvasnews.com/tamil/" },
  { url: "https://www.vishvasnews.com/english/feed/", source: "Vishvas News", lang: "en", home: "https://www.vishvasnews.com/english/" },
] as const;
export async function getFactChecks(): Promise<FeedResult> {
  const res = await wrap(FACTCHECKERS.map((f) => ({ url: f.url, source: f.source, lang: f.lang as Lang, section: (f.lang === "ta" ? "tamilnadu" : "india") as Section })));
  const fresh = res.articles.filter((a) => !a.publishedAt || Date.now() - Date.parse(a.publishedAt) < 21 * 86400e3);
  fresh.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  return { ...res, articles: fresh };
}

/** Fetch + dedupe + rank any list of RSS sources (used by the markets news hub). */
export const fetchSources = (srcs: { url: string; source: string; lang: Lang; section: Section }[]) => wrap(srcs);
