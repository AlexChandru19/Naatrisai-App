import type { Article } from "./types";
export { pickLeads } from "./rank";
export const newest = (list: Article[]) => [...list].sort((a, b) => (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0));
/** Breaking ticker: newest hard-news items from the last 6 hours (soft items excluded). */
export const tickerPick = (list: Article[]) => newest(list).filter((a) => !a.soft && a.publishedAt && Date.now() - Date.parse(a.publishedAt) < 6 * 3600e3).slice(0, 16);
