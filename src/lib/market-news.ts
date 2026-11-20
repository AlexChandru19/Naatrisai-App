import "server-only";
import { fetchSources, type FeedResult } from "./news";
import { gnSearch } from "./sources";
import type { Article } from "./types";

/**
 * Stock-market news hub. Every feed here was tested live from Vercel (iad1) before being kept.
 * Moneycontrol, Business Standard and NDTV Profit's own RSS block our bot (403), so they come in through
 * Google News searches restricted to their sites, or NDTV Profit's official FeedBurner feed.
 */
export const MARKET_FEEDS: { url: string; source: string; lang: "ta" | "en" }[] = [
  { url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", source: "ET Markets", lang: "en" },
  { url: "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms", source: "ET Markets", lang: "en" },
  { url: "https://economictimes.indiatimes.com/markets/ipos/fpos/rssfeeds/14655708.cms", source: "ET Markets", lang: "en" },
  { url: "https://economictimes.indiatimes.com/markets/commodities/rssfeeds/1808152121.cms", source: "ET Markets", lang: "en" },
  { url: "https://www.livemint.com/rss/markets", source: "Mint", lang: "en" },
  { url: "https://www.livemint.com/rss/companies", source: "Mint", lang: "en" },
  { url: "https://www.thehindubusinessline.com/markets/feeder/default.rss", source: "BusinessLine", lang: "en" },
  { url: "https://www.thehindubusinessline.com/markets/stock-markets/feeder/default.rss", source: "BusinessLine", lang: "en" },
  { url: "https://feeds.feedburner.com/ndtvprofit-latest", source: "NDTV Profit", lang: "en" },
  { url: gnSearch("site:moneycontrol.com markets OR stocks OR sensex OR nifty", "en"), source: "Google News", lang: "en" },
  { url: gnSearch("site:business-standard.com markets OR stocks OR sensex OR nifty", "en"), source: "Google News", lang: "en" },
  { url: gnSearch("NSE BSE stock market India Sensex Nifty", "en"), source: "Google News", lang: "en" },
  { url: gnSearch("IPO India listing subscription GMP", "en"), source: "Google News", lang: "en" },
  { url: gnSearch("quarterly results India Q2 OR Q3 profit net shares", "en"), source: "Google News", lang: "en" },
  { url: gnSearch("RBI monetary policy inflation India economy", "en"), source: "Google News", lang: "en" },
  { url: "https://www.vikatan.com/api/v1/collections/business.rss", source: "விகடன்", lang: "ta" },
  { url: gnSearch("பங்குச் சந்தை", "ta"), source: "Google செய்திகள்", lang: "ta" },
  { url: gnSearch("சென்செக்ஸ் நிஃப்டி", "ta"), source: "Google செய்திகள்", lang: "ta" },
  { url: gnSearch("தங்கம் விலை OR ரூபாய் மதிப்பு OR ரிசர்வ் வங்கி", "ta"), source: "Google செய்திகள்", lang: "ta" },
];

export type MarketCat = "all" | "stocks" | "indices" | "economy" | "ipo" | "commodities" | "global" | "tamil";
export const MARKET_CATS: { key: MarketCat; ta: string; en: string; emoji: string; re?: RegExp }[] = [
  { key: "all", ta: "அனைத்தும்", en: "All market news", emoji: "📰" },
  { key: "stocks", ta: "பங்குகள் & முடிவுகள்", en: "Stocks & earnings", emoji: "📈", re: /\b(shares?|stocks?|q[1-4]\b|results?|earnings|net profit|revenue|ebitda|target price|dividend|bonus|buyback|stock split|block deal|brokerage|upgrade|downgrade|rating)\b|பங்கு(?!ச் சந்தை)|லாபம்|ஈவுத்தொகை|காலாண்டு/i },
  { key: "indices", ta: "நிஃப்டி & சென்செக்ஸ்", en: "Nifty & Sensex", emoji: "📊", re: /\b(nifty|sensex|bank nifty|midcap|smallcap|dalal street|d-street|market (close|open|wrap|today)|fii|dii|gift nifty|india vix|closing bell|opening bell)\b|நிஃப்டி|சென்செக்ஸ்|பங்குச் சந்தை|பங்குச்சந்தை/i },
  { key: "economy", ta: "RBI & பொருளாதாரம்", en: "RBI & economy", emoji: "🏦", re: /\b(rbi|repo|monetary policy|inflation|cpi|wpi|gdp|fiscal|economy|economic|gst collection|iip|pmi|trade deficit|budget|sebi|finance ministry)\b|ரிசர்வ் வங்கி|பணவீக்கம்|பொருளாதார|ஜிடிபி|ரெப்போ/i },
  { key: "ipo", ta: "IPO & ஸ்டார்ட்அப்", en: "IPOs & startups", emoji: "🚀", re: /\b(ipos?|listing|listed|gmp|grey market|subscription|subscribed|anchor investors|drhp|sme ipo|startup|start-up|unicorn|funding round|raises? \$?₹?\d)\b|ஐபிஓ|புதிய பங்கு வெளியீடு|ஸ்டார்ட்அப்/i },
  { key: "commodities", ta: "பொருட்கள் & ரூபாய்", en: "Commodities & rupee", emoji: "🪙", re: /\b(gold|silver|crude|brent|oil prices?|commodit\w+|mcx|rupee|forex|dollar index|usd\/inr|copper|aluminium)\b|தங்கம்|வெள்ளி|கச்சா|ரூபாய்|டாலர்/i },
  { key: "global", ta: "உலகச் சந்தைகள்", en: "Global cues", emoji: "🌐", re: /\b(wall street|dow|nasdaq|s&p|fed|federal reserve|us markets?|asian markets?|nikkei|hang seng|ftse|global cues|treasury yields?|china|tariffs?|powell)\b|வால் ஸ்ட்ரீட்|அமெரிக்க சந்தை|உலகச் சந்தை/i },
  { key: "tamil", ta: "தமிழ் வணிகச் செய்திகள்", en: "Tamil business news", emoji: "🛕" },
];
export const catsOf = (a: Article): MarketCat[] => {
  const t = `${a.title} ${a.summary}`;
  const out = MARKET_CATS.filter((c) => c.re?.test(t)).map((c) => c.key);
  if (a.lang === "ta") out.push("tamil");
  return out;
};

// Business sites mix in non-market items (lifestyle, auto reviews); keep items that read as market/economy news.
const MARKETISH = /\b(market|stocks?|shares?|nifty|sensex|ipo|rbi|economy|inflation|profit|results?|rupee|gold|silver|crude|investors?|fund|bank|sebi|earnings|trade|tariff|rate|bond|yield|q[1-4])\b|பங்கு|சந்தை|தங்கம்|ரூபாய்|வங்கி|பொருளாதார|முதலீ|விலை|வணிக/i;

// Auto-generated "price prediction" pages are not news.
const JUNK = /price prediction|prediction for tomorrow|share price today live|stock price live updates/i;

export type MarketNews = FeedResult & { articles: (Article & { cats: MarketCat[] })[] };
/** All market news, last 4 days, each tagged with drill-down categories. */
export async function getMarketNews(): Promise<MarketNews> {
  const res = await fetchSources(MARKET_FEEDS.map((f) => ({ ...f, section: "india" as const })));
  const fresh = res.articles.filter((a) => (!a.publishedAt || Date.now() - Date.parse(a.publishedAt) < 4 * 86400e3) && MARKETISH.test(`${a.title} ${a.summary}`) && !JUNK.test(a.title));
  return { ...res, articles: fresh.map((a) => ({ ...a, topics: a.topics.includes("business") ? a.topics : ["business", ...a.topics], cats: catsOf(a) })) };
}

/** Plain company name for searching: "Tata Consultancy Services Ltd." → "Tata Consultancy Services". */
export const plainName = (n: string) => n.replace(/\b(ltd|limited|corporation|corp|company|co|inc)\.?$/i, "").replace(/\b(ltd|limited)\.?\b/gi, "").replace(/[.,]+$/g, "").replace(/\s+/g, " ").trim();
const ALIAS: Record<string, string[]> = {
  "M&M": ["Mahindra"], RELIANCE: ["Reliance"], TCS: ["TCS"], INFY: ["Infosys"], HDFCBANK: ["HDFC Bank"], ICICIBANK: ["ICICI Bank"], SBIN: ["SBI", "State Bank"], BHARTIARTL: ["Airtel"],
  HINDUNILVR: ["HUL", "Hindustan Unilever"], LT: ["L&T", "Larsen"], KOTAKBANK: ["Kotak"], AXISBANK: ["Axis Bank"], BAJFINANCE: ["Bajaj Finance"], MARUTI: ["Maruti"], SUNPHARMA: ["Sun Pharma"],
  TATAMOTORS: ["Tata Motors"], TMPV: ["Tata Motors"], TATASTEEL: ["Tata Steel"], ITC: ["ITC"], WIPRO: ["Wipro"], HCLTECH: ["HCLTech", "HCL Tech"], TECHM: ["Tech Mahindra"], ETERNAL: ["Eternal", "Zomato"],
  ADANIENT: ["Adani Enterprises"], ADANIPORTS: ["Adani Ports"], NTPC: ["NTPC"], ONGC: ["ONGC"], POWERGRID: ["Power Grid"], COALINDIA: ["Coal India"], ULTRACEMCO: ["UltraTech"], TITAN: ["Titan"],
  ASIANPAINT: ["Asian Paints"], NESTLEIND: ["Nestle"], JSWSTEEL: ["JSW Steel"], HINDALCO: ["Hindalco"], GRASIM: ["Grasim"], CIPLA: ["Cipla"], DRREDDY: ["Dr Reddy", "Dr. Reddy"], APOLLOHOSP: ["Apollo Hospitals"],
  EICHERMOT: ["Eicher", "Royal Enfield"], HEROMOTOCO: ["Hero MotoCorp"], BAJAJ_AUTO: ["Bajaj Auto"], "BAJAJ-AUTO": ["Bajaj Auto"], BAJAJFINSV: ["Bajaj Finserv"], SBILIFE: ["SBI Life"], HDFCLIFE: ["HDFC Life"],
  INDUSINDBK: ["IndusInd"], SHRIRAMFIN: ["Shriram Finance"], TRENT: ["Trent"], BEL: ["Bharat Electronics", "BEL"], JIOFIN: ["Jio Financial"], TATACONSUM: ["Tata Consumer"], MAXHEALTH: ["Max Healthcare"], INDIGO: ["IndiGo", "InterGlobe"],
};
export const companyTerms = (sym: string, name: string) => [...new Set([...(ALIAS[sym] ?? []), plainName(name), sym].filter((t) => t && t.length >= 3))];

/** News about one company: matches in the market feeds plus a live Google News search for it. */
export async function getCompanyNews(sym: string, name: string, pool?: MarketNews): Promise<Article[]> {
  const terms = companyTerms(sym, name);
  const q = `"${terms[0]}" share OR stock OR results`;
  const [base, gn] = await Promise.all([pool ?? getMarketNews(), fetchSources([{ url: gnSearch(q, "en"), source: "Google News", lang: "en", section: "india" }])]);
  const re = new RegExp(`\\b(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i");
  const seen = new Set<string>();
  const out: Article[] = [];
  for (const a of [...base.articles.filter((x) => re.test(x.title)), ...gn.articles.filter((x) => re.test(`${x.title} ${x.summary}`) && !JUNK.test(x.title))]) {
    const k = a.title.toLowerCase().slice(0, 60);
    if (seen.has(k)) continue; seen.add(k);
    if (a.publishedAt && Date.now() - Date.parse(a.publishedAt) > 30 * 86400e3) continue;
    out.push(a);
  }
  return out.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")).slice(0, 24);
}
