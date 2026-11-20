import { NextResponse, type NextRequest } from "next/server";
import { getAll, getStory, getSection, getDistrict, getState, getRegion, getTopic, getJobsNews, search } from "@/lib/news";
import { DISTRICTS, STATES, WORLD_REGIONS } from "@/lib/geo";
import { TOPICS } from "@/lib/topics";
import type { Article } from "@/lib/types";
import { briefingPicks } from "@/lib/briefing";
import { allow, cacheKey, generate, peek, storyText, type AiLang, type Feature } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

const FEATURES: Feature[] = ["summary", "explain", "differ", "translate", "ask", "briefing"];
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const slot = () => { const d = new Date(Date.now() + 5.5 * 3600e3); return `${d.toISOString().slice(0, 10)}-${Math.floor(d.getUTCHours() / 6)}`; };

export async function POST(req: NextRequest) {
  let b: { feature?: string; id?: string; lang?: string; q?: string; peek?: boolean; path?: string };
  try { b = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const feature = b.feature as Feature;
  const lang: AiLang = b.lang === "en" ? "en" : "ta";
  if (!FEATURES.includes(feature)) return json({ error: "bad_request" }, 400);
  const q = feature === "ask" ? String(b.q ?? "").replace(/\s+/g, " ").trim().slice(0, 200) : "";
  if (feature === "ask" && q.length < 3) return json({ error: "bad_request", detail: "question too short" }, 400);
  const id = feature === "briefing" ? slot() : String(b.id ?? "").replace(/[^a-z0-9]/gi, "").slice(0, 40);
  if (!id) return json({ error: "bad_request" }, 400);

  const key = cacheKey(feature, id, lang, q);
  const hit = await peek(key);
  if (hit || b.peek) return json(hit ?? { cached: false });

  const ip = (req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "anon").trim();
  if (!(await allow(ip))) return json({ error: "rate_limited" }, 429);

  // Build the model's context only from server-side data — never from text the browser sends.
  let src = ""; let sources: string[] = [];
  if (feature === "briefing") {
    const { articles } = await getAll();
    const { all } = briefingPicks(articles);
    if (!all.length) return json({ error: "not_found" }, 404);
    src = "TODAY'S BRIEFING HEADLINES (selected by the site):\n" + all.map((a, i) => `${i + 1}. [${a.source}] ${a.title}`).join("\n");
  } else {
    const s = await getStory(id);
    let lead = s.lead; let versions = s.versions as { link: string; source: string; title: string; summary?: string; lang: string; publishedAt: string | null }[];
    if (!lead) {
      // Not in the main pool: look it up in the (server-fetched) feed of the page the reader is on.
      const a = await fromPage(id, String(b.path ?? ""));
      if (a) { lead = a; versions = a.cluster ?? []; }
    }
    if (!lead) return json({ error: "not_found", detail: "story is no longer in the live feed" }, 404);
    const others = versions.filter((v) => v.link !== lead!.link).map((v) => ({ source: v.source, title: v.title, summary: v.summary, lang: v.lang, publishedAt: v.publishedAt }));
    src = storyText({ lead, others });
    sources = [...new Set([lead.source, ...others.map((o) => o.source)])];
    if (feature === "differ" && sources.length < 2) return json({ feature, lang, data: { insufficient: true, overview: "", angles: [] }, model: "none", at: new Date().toISOString() });
  }
  const out = await generate(feature, lang, src, key, { sources, q, ttl: feature === "briefing" ? 6 * 3600 : 172800 });
  if ("error" in out) return json(out, out.error === "busy" ? 503 : out.error === "quota" ? 402 : 500);
  return json(out);
}

async function fromPage(id: string, path: string): Promise<Article | null> {
  let u: URL; try { u = new URL(path, "https://x.invalid"); } catch { return null; }
  const [, a, b] = u.pathname.split("/");
  const has = (list: readonly { slug: string }[], v?: string) => !!v && list.some((x) => x.slug === v);
  let feed: { articles: Article[] } | null = null;
  if (a === "tamilnadu" && has(DISTRICTS, b)) feed = await getDistrict(b!);
  else if (a === "india" && has(STATES, b)) feed = await getState(b!);
  else if (a === "world" && has(WORLD_REGIONS, b)) feed = await getRegion(b!);
  else if (a === "topic" && has(TOPICS, b)) feed = await getTopic(b!);
  else if ((a === "tamilnadu" || a === "india" || a === "world") && !b) feed = await getSection(a);
  else if (a === "jobs") feed = await getJobsNews();
  else if (a === "search" && u.searchParams.get("q")) feed = await search(u.searchParams.get("q")!.slice(0, 100));
  return feed?.articles.find((x) => x.id === id) ?? null;
}
