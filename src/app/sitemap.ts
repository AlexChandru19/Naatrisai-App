import type { MetadataRoute } from "next";
import { DISTRICTS, STATES, WORLD_REGIONS } from "@/lib/geo";
import { TOPICS } from "@/lib/topics";
const B = "https://naatrisai.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed = ["", "/tamilnadu", "/india", "/world", "/for-you", "/briefing", "/live", "/coverage", "/developing", "/markets/mandi", "/trending", "/map", "/markets", "/markets/news", "/markets/nifty50", "/markets/calculators", "/markets/sector/it", "/markets/sector/bank", "/markets/sector/pharma", "/markets/sector/auto", "/markets/sector/fmcg", "/markets/sector/metal", "/exam-digest", "/bulletin", "/panchangam", "/markets/mutual-funds", "/markets/ipo", "/status", "/corrections", "/sports", "/factcheck", "/rss", "/topics", "/sources", "/alerts", "/jobs", "/calendar", "/photos", "/about"];
  return [
    ...fixed.map((p) => ({ url: B + p, lastModified: now, changeFrequency: "hourly" as const, priority: p === "" ? 1 : 0.8 })),
    ...DISTRICTS.map((d) => ({ url: `${B}/tamilnadu/${d.slug}`, lastModified: now, changeFrequency: "hourly" as const, priority: 0.7 })),
    ...STATES.map((s) => ({ url: `${B}/india/${s.slug}`, lastModified: now, changeFrequency: "hourly" as const, priority: 0.6 })),
    ...WORLD_REGIONS.map((r) => ({ url: `${B}/world/${r.slug}`, lastModified: now, changeFrequency: "hourly" as const, priority: 0.6 })),
    ...TOPICS.map((t) => ({ url: `${B}/topic/${t.slug}`, lastModified: now, changeFrequency: "hourly" as const, priority: 0.6 })),
  ];
}
