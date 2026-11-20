import "server-only";

/** NSE stocks & indices from Yahoo Finance's public chart/spark endpoints; index constituents from NSE Indices CSVs. */
const UA = { "User-Agent": "Mozilla/5.0 (compatible; NaatrisaiBot/1.0)" };
const NSE_UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0" };
const Y = "https://query1.finance.yahoo.com";

export type Constituent = { sym: string; name: string; industry: string };
export type StockQuote = Constituent & { price: number; prev: number; change: number; pct: number; high?: number; low?: number; volume?: number; hi52?: number; lo52?: number; time: number };

export const SECTORS = [
  { slug: "it", ta: "தகவல் தொழில்நுட்பம் (IT)", en: "IT", csv: "ind_niftyitlist.csv", index: "^CNXIT", emoji: "💻", news: /\b(it stocks?|it sector|infosys|tcs|wipro|hcl ?tech|tech mahindra|ltimindtree|coforge|persistent|mphasis|software services)\b|ஐடி/i },
  { slug: "bank", ta: "வங்கிகள்", en: "Banks", csv: "ind_niftybanklist.csv", index: "^NSEBANK", emoji: "🏦", news: /\b(bank nifty|banks?|banking|hdfc bank|icici|sbi|axis bank|kotak|indusind|npa|lenders?|deposits?|loan growth)\b|வங்கி/i },
  { slug: "pharma", ta: "மருந்து (பார்மா)", en: "Pharma", csv: "ind_niftypharmalist.csv", index: "^CNXPHARMA", emoji: "💊", news: /\b(pharma\w*|drug ?makers?|usfda|sun pharma|cipla|dr\.? reddy|lupin|aurobindo|divi'?s|zydus|biocon|healthcare)\b|மருந்து/i },
  { slug: "auto", ta: "வாகனத் துறை", en: "Auto", csv: "ind_niftyautolist.csv", index: "^CNXAUTO", emoji: "🚗", news: /\b(auto stocks?|automakers?|auto sales|maruti|tata motors|mahindra|bajaj auto|hero motocorp|eicher|tvs motor|ashok leyland|ev sales|two-wheelers?|passenger vehicles?)\b|வாகன/i },
  { slug: "fmcg", ta: "நுகர்பொருள் (FMCG)", en: "FMCG", csv: "ind_niftyfmcglist.csv", index: "^CNXFMCG", emoji: "🛒", news: /\b(fmcg|consumer goods|hul|hindustan unilever|itc|nestle|britannia|dabur|marico|tata consumer|godrej consumer|colgate|rural demand)\b|நுகர்பொருள்/i },
  { slug: "metal", ta: "உலோகம்", en: "Metal", csv: "ind_niftymetallist.csv", index: "^CNXMETAL", emoji: "⚙️", news: /\b(metal stocks?|steel|tata steel|jsw steel|hindalco|vedanta|sail|nmdc|coal india|aluminium|copper|iron ore|zinc)\b|எஃகு|உலோக/i },
] as const;
export type SectorSlug = (typeof SECTORS)[number]["slug"];

async function csv(file: string): Promise<Constituent[]> {
  for (const base of ["https://www.niftyindices.com/IndexConstituent/", "https://nsearchives.nseindia.com/content/indices/"]) {
    try {
      const r = await fetch(base + file, { next: { revalidate: 86400 }, headers: NSE_UA, signal: AbortSignal.timeout(7000) });
      if (!r.ok) continue;
      const rows = (await r.text()).split(/\r?\n/).slice(1).map((l) => l.split(","));
      const out = rows.filter((c) => c.length >= 3 && /^[A-Z0-9&-]+$/.test(c[2]?.trim() ?? "")).map((c) => ({ name: c[0].trim(), industry: c[1].trim(), sym: c[2].trim() }));
      if (out.length >= 5) return out;
    } catch {}
  }
  return [];
}
export const getNifty50List = () => csv("ind_nifty50list.csv");
export const getNiftyNext50List = () => csv("ind_niftynext50list.csv");

type SparkMeta = { regularMarketPrice?: number; chartPreviousClose?: number; previousClose?: number; regularMarketTime?: number; regularMarketDayHigh?: number; regularMarketDayLow?: number; regularMarketVolume?: number; fiftyTwoWeekHigh?: number; fiftyTwoWeekLow?: number; shortName?: string; longName?: string };
/** Live-ish quotes for up to ~100 NSE symbols (Yahoo spark, 20 per request). Missing symbols are left out. */
export async function quotes(list: Constituent[], reval = 120): Promise<StockQuote[]> {
  const chunks: Constituent[][] = [];
  for (let i = 0; i < list.length; i += 20) chunks.push(list.slice(i, i + 20));
  const out: StockQuote[] = [];
  await Promise.all(chunks.map(async (c) => {
    try {
      const q = c.map((s) => encodeURIComponent(`${s.sym}.NS`)).join(",");
      const r = await fetch(`${Y}/v7/finance/spark?symbols=${q}&range=1d&interval=1d`, { next: { revalidate: reval }, headers: UA, signal: AbortSignal.timeout(8000) });
      if (!r.ok) return;
      const j = (await r.json()) as { spark?: { result?: { symbol: string; response: { meta: SparkMeta }[] }[] } };
      for (const x of j.spark?.result ?? []) {
        const m = x.response?.[0]?.meta; const sym = x.symbol.replace(/\.NS$/, "");
        const prev = m?.chartPreviousClose ?? m?.previousClose;
        if (!m?.regularMarketPrice || !prev) continue;
        const base = c.find((s) => s.sym === sym) ?? { sym, name: m.longName ?? m.shortName ?? sym, industry: "" };
        const change = m.regularMarketPrice - prev;
        out.push({ ...base, price: m.regularMarketPrice, prev, change, pct: (change / prev) * 100, high: m.regularMarketDayHigh, low: m.regularMarketDayLow, volume: m.regularMarketVolume, hi52: m.fiftyTwoWeekHigh, lo52: m.fiftyTwoWeekLow, time: (m.regularMarketTime ?? 0) * 1000 });
      }
    } catch {}
  }));
  return out;
}

export type Board = { stocks: StockQuote[]; time: number | null; listed: number };
export async function getNifty50Board(): Promise<Board> {
  const list = await getNifty50List();
  const stocks = list.length ? await quotes(list) : [];
  return { stocks, listed: list.length, time: stocks.length ? Math.max(...stocks.map((s) => s.time)) : null };
}
export async function getSectorBoard(slug: string) {
  const s = SECTORS.find((x) => x.slug === slug);
  if (!s) return null;
  const list = await csv(s.csv);
  const stocks = list.length ? await quotes(list) : [];
  return { sector: s, stocks, listed: list.length };
}

// ---- Single symbol: details + chart ----
export const RANGES = { "1d": { range: "1d", interval: "5m" }, "5d": { range: "5d", interval: "15m" }, "1mo": { range: "1mo", interval: "1d" }, "3mo": { range: "3mo", interval: "1d" }, "6mo": { range: "6mo", interval: "1d" }, "1y": { range: "1y", interval: "1d" } } as const;
export type RangeKey = keyof typeof RANGES;
export const validSymbol = (s: string) => /^\^?[A-Z0-9&_.=-]{1,24}$/.test(s);

type ChartJson = { chart?: { result?: { meta: SparkMeta & { fullExchangeName?: string; exchangeName?: string; currency?: string; instrumentType?: string }; timestamp?: number[]; indicators: { quote: { open?: (number | null)[]; close?: (number | null)[] }[] } }[] } };
export type Detail = {
  sym: string; yahoo: string; name: string; exchange: string; currency: string; price: number; prev: number; change: number; pct: number;
  open?: number; high?: number; low?: number; volume?: number; hi52?: number; lo52?: number; time: number;
};
export type Series = { t: number[]; c: number[]; prev?: number };

async function chart(yahoo: string, range: RangeKey, reval: number) {
  const { range: rg, interval } = RANGES[range];
  const r = await fetch(`${Y}/v8/finance/chart/${encodeURIComponent(yahoo)}?range=${rg}&interval=${interval}`, { next: { revalidate: reval }, headers: UA, signal: AbortSignal.timeout(8000) });
  if (!r.ok) return null;
  return ((await r.json()) as ChartJson).chart?.result?.[0] ?? null;
}
/** NSE stock (SYMBOL → SYMBOL.NS) or an index (^NSEI). Returns null unless Yahoo returns a real quote. */
export async function getDetail(sym: string): Promise<{ d: Detail; s: Series } | null> {
  if (!validSymbol(sym)) return null;
  const yahoo = sym.startsWith("^") || sym.includes(".") ? sym : `${sym}.NS`;
  try {
    const res = await chart(yahoo, "1d", 120);
    const m = res?.meta;
    if (!res || !m?.regularMarketPrice) return null;
    if (!sym.startsWith("^") && !/NSE|NSI/i.test(`${m.fullExchangeName} ${m.exchangeName}`)) return null;
    const prev = m.chartPreviousClose ?? m.previousClose ?? 0;
    const opens = (res.indicators.quote[0]?.open ?? []).filter((x): x is number => typeof x === "number");
    const change = prev ? m.regularMarketPrice - prev : 0;
    const d: Detail = { sym, yahoo, name: m.longName ?? m.shortName ?? sym, exchange: m.fullExchangeName ?? "NSE", currency: m.currency ?? "INR", price: m.regularMarketPrice, prev, change, pct: prev ? (change / prev) * 100 : 0,
      open: opens[0], high: m.regularMarketDayHigh, low: m.regularMarketDayLow, volume: m.regularMarketVolume, hi52: m.fiftyTwoWeekHigh, lo52: m.fiftyTwoWeekLow, time: (m.regularMarketTime ?? 0) * 1000 };
    return { d, s: toSeries(res, prev) };
  } catch { return null; }
}
function toSeries(res: NonNullable<Awaited<ReturnType<typeof chart>>>, prev?: number): Series {
  const t: number[] = [], c: number[] = [];
  const ts = res.timestamp ?? [], cl = res.indicators.quote[0]?.close ?? [];
  for (let i = 0; i < ts.length; i++) { const v = cl[i]; if (typeof v === "number") { t.push(ts[i] * 1000); c.push(Math.round(v * 100) / 100); } }
  return { t, c, prev };
}
export async function getSeries(sym: string, range: RangeKey): Promise<Series | null> {
  if (!validSymbol(sym) || !RANGES[range]) return null;
  const yahoo = sym.startsWith("^") || sym.includes(".") ? sym : `${sym}.NS`;
  try {
    const res = await chart(yahoo, range, range === "1d" ? 120 : range === "5d" ? 600 : 3600);
    if (!res) return null;
    return toSeries(res, res.meta.chartPreviousClose ?? res.meta.previousClose);
  } catch { return null; }
}

/** Yahoo symbol search, NSE equities only. */
export async function searchNse(q: string) {
  try {
    const r = await fetch(`${Y}/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`, { next: { revalidate: 3600 }, headers: UA, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return [];
    const j = (await r.json()) as { quotes?: { symbol: string; shortname?: string; longname?: string; exchange?: string; quoteType?: string }[] };
    return (j.quotes ?? []).filter((x) => x.exchange === "NSI" && x.quoteType === "EQUITY" && x.symbol.endsWith(".NS")).map((x) => ({ sym: x.symbol.replace(/\.NS$/, ""), name: x.longname ?? x.shortname ?? x.symbol }));
  } catch { return []; }
}

// ---- Global cues ----
export const GLOBAL = [
  { sym: "^GSPC", ta: "S&P 500 (அமெரிக்கா)", en: "S&P 500", flag: "🇺🇸" },
  { sym: "^DJI", ta: "டவ் ஜோன்ஸ் (அமெரிக்கா)", en: "Dow Jones", flag: "🇺🇸" },
  { sym: "^IXIC", ta: "நாஸ்டாக் (அமெரிக்கா)", en: "Nasdaq", flag: "🇺🇸" },
  { sym: "^FTSE", ta: "FTSE 100 (இங்கிலாந்து)", en: "FTSE 100", flag: "🇬🇧" },
  { sym: "^N225", ta: "நிக்கேய் 225 (ஜப்பான்)", en: "Nikkei 225", flag: "🇯🇵" },
  { sym: "^HSI", ta: "ஹாங் செங் (ஹாங்காங்)", en: "Hang Seng", flag: "🇭🇰" },
  { sym: "^STI", ta: "STI (சிங்கப்பூர்)", en: "Straits Times (Singapore)", flag: "🇸🇬" },
] as const;
export type GlobalQuote = { sym: string; ta: string; en: string; flag: string; price: number; prev: number; change: number; pct: number; time: number; tz?: string };
export async function getGlobal(): Promise<GlobalQuote[]> {
  const r = await Promise.all(GLOBAL.map(async (g) => {
    try {
      const res = await chart(g.sym, "1d", 300);
      const m = res?.meta as (SparkMeta & { exchangeTimezoneName?: string }) | undefined;
      const prev = m?.chartPreviousClose ?? m?.previousClose;
      if (!m?.regularMarketPrice || !prev) return null;
      const change = m.regularMarketPrice - prev;
      return { ...g, price: m.regularMarketPrice, prev, change, pct: (change / prev) * 100, time: (m.regularMarketTime ?? 0) * 1000, tz: m.exchangeTimezoneName } as GlobalQuote;
    } catch { return null; }
  }));
  return r.filter((x): x is GlobalQuote => !!x);
}
