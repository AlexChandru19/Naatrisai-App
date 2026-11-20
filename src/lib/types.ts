export type Version = { source: string; title: string; link: string; lang: "ta" | "en"; publishedAt: string | null };
export type Article = {
  id: string; title: string; summary: string; link: string; image: string | null; source: string;
  lang: "ta" | "en"; section: "tamilnadu" | "india" | "world"; publishedAt: string | null;
  topics: string[]; districts: string[]; states: string[]; savedAt?: string;
  /** Other outlets' versions of the same story (from headline clustering). */
  cluster?: Version[];
  /** Ranking score 0..1 (recency, coverage, credibility, importance). */
  score?: number;
  /** Soft/lifestyle/how-to/sponsored item: demoted and never used as a lead. */
  soft?: boolean;
};
// Canonical outlet key so "DinaMani" (via Google News) and "தினமணி" count as one source.
const ALIAS: [RegExp, string][] = [
  [/^(dinamani|தினமணி)/i, "dinamani"], [/^(daily ?thanthi|dailythanthi|தினத்தந்தி|thanthi tv)/i, "thanthi"],
  [/^(bbc news tamil|bbc tamil|bbc தமிழ்)/i, "bbctamil"], [/^(the )?times of india/i, "toi"], [/^(the )?hindu$/i, "thehindu"],
  [/^(the )?indian express/i, "ie"], [/^(ananda )?vikatan|^விகடன்/i, "vikatan"], [/^(puthiya thalaimurai|புதிய தலைமுறை)/i, "pt"],
  [/^(oneindia)/i, "oneindia"], [/^(asianet)/i, "asianet"], [/^(kalki|கல்கி)/i, "kalki"], [/^(ndtv)/i, "ndtv"], [/^(al jazeera)/i, "aljazeera"],
];
export const sourceKey = (s: string) => ALIAS.find(([re]) => re.test(s.trim()))?.[1] ?? s.trim().toLowerCase().replace(/\s+/g, "");
export const sourceCount = (a: Article) => new Set([a.source, ...(a.cluster ?? []).map((c) => c.source)].map(sourceKey)).size;
