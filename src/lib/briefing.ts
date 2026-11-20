import { pickLeads } from "./rank";
import { sourceKey, type Article } from "./types";

// One story per outlet per section, hard news only, freshest-ranked first.
function top(list: Article[], n: number, used: Set<string>) {
  const out: Article[] = []; const src = new Set<string>();
  for (const a of list) {
    if (out.length >= n) break;
    if (a.soft || used.has(a.id) || src.has(sourceKey(a.source))) continue;
    out.push(a); used.add(a.id); src.add(sourceKey(a.source));
  }
  return out;
}

/** The briefing's story selection — shared by the page and the AI intro so both use the same headlines. */
export function briefingPicks(articles: Article[]) {
  const { lead, side } = pickLeads(articles, { preferTamil: true });
  const used = new Set<string>();
  const big = top([lead, ...side].filter(Boolean) as Article[], 5, used);
  const tn = top(articles.filter((a) => a.section === "tamilnadu"), 5, used);
  const india = top(articles.filter((a) => a.section === "india"), 4, used);
  const world = top(articles.filter((a) => a.section === "world"), 4, used);
  return { big, tn, india, world, all: [...big, ...tn, ...india, ...world] };
}
