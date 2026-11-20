import type { Article, Version } from "./types";
import { sourceKey } from "./types";

export type Bucket = "tamil" | "national" | "world";
const WORLD = new Set(["bbcnews", "aljazeera", "reuters", "apnews", "theguardian", "cnn", "nytimes", "washingtonpost", "dw", "france24", "bloomberg", "skynews", "abcnews", "cbsnews", "nbcnews", "npr", "foxnews"]);
/** Which part of the media landscape an outlet belongs to: Tamil-language, Indian English/national, or international. */
export function bucket(v: { source: string; lang: "ta" | "en" }): Bucket {
  if (v.lang === "ta") return "tamil";
  const k = sourceKey(v.source).replace(/^the/, "");
  return WORLD.has(k) || /bbc news$|al jazeera|reuters|associated press|guardian|cnn|new york times|washington post|dw|france 24|bloomberg|sky news/i.test(v.source) ? "world" : "national";
}
export const versionsOf = (a: Article): Version[] => [{ source: a.source, title: a.title, link: a.link, lang: a.lang, publishedAt: a.publishedAt }, ...(a.cluster ?? [])];

export function coverage(vs: Version[]) {
  const seen = new Map<string, Bucket>();
  for (const v of vs) seen.set(sourceKey(v.source), bucket(v));
  const c = { tamil: 0, national: 0, world: 0 } as Record<Bucket, number>;
  for (const b of seen.values()) c[b]++;
  const total = seen.size;
  const only = (Object.keys(c) as Bucket[]).filter((k) => c[k] > 0);
  return { ...c, total, only: only.length === 1 ? only[0] : null };
}
