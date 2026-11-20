import "server-only";

export type Group = "index" | "sector" | "fx" | "commodity";
export type Quote = { key: string; ta: string; en: string; group: Group; price: number; prev: number; change: number; pct: number; time: number; unit?: string; spark: number[]; note?: { ta: string; en: string } };
export type Markets = { quotes: Quote[]; source: string; fetchedAt: string };

const SYMBOLS: { sym: string; key: string; ta: string; en: string; group: Group; unit?: string }[] = [
  { sym: "^NSEI", key: "nifty", ta: "நிஃப்டி 50", en: "NIFTY 50", group: "index" },
  { sym: "^BSESN", key: "sensex", ta: "சென்செக்ஸ்", en: "SENSEX", group: "index" },
  { sym: "^NSEBANK", key: "banknifty", ta: "பேங்க் நிஃப்டி", en: "NIFTY Bank", group: "index" },
  { sym: "NIFTY_MIDCAP_100.NS", key: "midcap", ta: "நிஃப்டி மிட்கேப் 100", en: "NIFTY Midcap 100", group: "index" },
  { sym: "^CNXSC", key: "smallcap", ta: "நிஃப்டி ஸ்மால்கேப் 100", en: "NIFTY Smallcap 100", group: "index" },
  { sym: "^INDIAVIX", key: "vix", ta: "இந்தியா VIX (அச்சக் குறியீடு)", en: "India VIX (fear gauge)", group: "index" },
  { sym: "^CNXIT", key: "it", ta: "நிஃப்டி IT", en: "NIFTY IT", group: "sector" },
  { sym: "^CNXPHARMA", key: "pharma", ta: "நிஃப்டி பார்மா", en: "NIFTY Pharma", group: "sector" },
  { sym: "^CNXAUTO", key: "auto", ta: "நிஃப்டி ஆட்டோ", en: "NIFTY Auto", group: "sector" },
  { sym: "^CNXFMCG", key: "fmcg", ta: "நிஃப்டி FMCG", en: "NIFTY FMCG", group: "sector" },
  { sym: "^CNXMETAL", key: "metal", ta: "நிஃப்டி மெட்டல்", en: "NIFTY Metal", group: "sector" },
  { sym: "INR=X", key: "usdinr", ta: "டாலர் → ரூபாய்", en: "USD → INR", group: "fx", unit: "₹" },
  { sym: "AEDINR=X", key: "aedinr", ta: "திர்ஹாம் (UAE) → ரூபாய்", en: "UAE dirham → INR", group: "fx", unit: "₹" },
  { sym: "SGDINR=X", key: "sgdinr", ta: "சிங்கப்பூர் டாலர் → ரூபாய்", en: "Singapore dollar → INR", group: "fx", unit: "₹" },
  { sym: "MYRINR=X", key: "myrinr", ta: "மலேசிய ரிங்கிட் → ரூபாய்", en: "Malaysian ringgit → INR", group: "fx", unit: "₹" },
  { sym: "EURINR=X", key: "eurinr", ta: "யூரோ → ரூபாய்", en: "Euro → INR", group: "fx", unit: "₹" },
  { sym: "GBPINR=X", key: "gbpinr", ta: "பவுண்ட் → ரூபாய்", en: "Pound → INR", group: "fx", unit: "₹" },
  { sym: "JPYINR=X", key: "jpyinr", ta: "யென் → ரூபாய்", en: "Yen → INR", group: "fx", unit: "₹" },
  { sym: "GC=F", key: "gold", ta: "தங்கம் (சர்வதேச, COMEX)", en: "Gold (COMEX)", group: "commodity", unit: "$/oz" },
  { sym: "SI=F", key: "silver", ta: "வெள்ளி (சர்வதேச, COMEX)", en: "Silver (COMEX)", group: "commodity", unit: "$/oz" },
  { sym: "BZ=F", key: "brent", ta: "கச்சா எண்ணெய் (பிரெண்ட்)", en: "Brent crude", group: "commodity", unit: "$/bbl" },
];

const UA = { "User-Agent": "Mozilla/5.0 (compatible; NaatrisaiBot/1.0)" };
const REVAL = 120; // indices: 2-minute cache (Yahoo's own feed is ~delayed anyway)
type Chart = { chart?: { result?: { meta: { regularMarketPrice: number; chartPreviousClose?: number; previousClose?: number; regularMarketTime: number }; indicators: { quote: { close: (number | null)[] }[] } }[] } };

async function one(s: (typeof SYMBOLS)[number]): Promise<Quote | null> {
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.sym)}?interval=15m&range=1d`, { next: { revalidate: REVAL }, headers: UA, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const j = (await r.json()) as Chart;
    const res = j.chart?.result?.[0];
    if (!res) return null;
    const m = res.meta;
    const prev = m.chartPreviousClose ?? m.previousClose;
    if (!m.regularMarketPrice || !prev) return null;
    const spark = (res.indicators.quote[0]?.close ?? []).filter((x): x is number => typeof x === "number");
    const change = m.regularMarketPrice - prev;
    return { key: s.key, ta: s.ta, en: s.en, group: s.group, unit: s.unit, price: m.regularMarketPrice, prev, change, pct: (change / prev) * 100, time: m.regularMarketTime * 1000, spark };
  } catch { return null; }
}

const convert = (q: Quote, k: number, kp: number, key: string, ta: string, en: string, note: Quote["note"]): Quote => ({
  key, ta, en, group: "commodity", unit: "₹", price: q.price * k, prev: q.prev * kp, change: q.price * k - q.prev * kp, pct: ((q.price * k) / (q.prev * kp) - 1) * 100, time: q.time, spark: [], note,
});

/** Real quotes from Yahoo Finance's public chart endpoint (no key). Missing symbols are simply left out. */
export async function getMarkets(): Promise<Markets> {
  const qs = (await Promise.all(SYMBOLS.map(one))).filter((q): q is Quote => !!q);
  const usd = qs.find((q) => q.key === "usdinr");
  const gold = qs.find((q) => q.key === "gold");
  const silver = qs.find((q) => q.key === "silver");
  const note = { ta: "இறக்குமதி வரி, GST சேர்க்கப்படவில்லை — கடை விலை அல்ல", en: "Excludes import duty & GST — not the jeweller’s rate" };
  if (usd && gold) qs.push(convert(gold, (usd.price / 31.1035) * 10, (usd.prev / 31.1035) * 10, "gold-inr", "தங்கம் ₹/10கி (சர்வதேச விலை)", "Gold ₹/10g (intl. price)", note));
  if (usd && silver) qs.push(convert(silver, (usd.price / 31.1035) * 1000, (usd.prev / 31.1035) * 1000, "silver-inr", "வெள்ளி ₹/கிலோ (சர்வதேச விலை)", "Silver ₹/kg (intl. price)", note));
  return { quotes: qs, source: "Yahoo Finance", fetchedAt: new Date().toISOString() };
}

// ---- NIFTY 50 movers ----
export type Mover = { sym: string; name: string; price: number; pct: number; change: number; time: number };
export type Movers = { gainers: Mover[]; losers: Mover[]; breadth: { up: number; down: number; flat: number }; count: number; time: number | null };

async function constituents(): Promise<string[]> {
  for (const u of ["https://www.niftyindices.com/IndexConstituent/ind_nifty50list.csv", "https://nsearchives.nseindia.com/content/indices/ind_nifty50list.csv"]) {
    try {
      const r = await fetch(u, { next: { revalidate: 86400 }, headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0" }, signal: AbortSignal.timeout(6000) });
      if (!r.ok) continue;
      const syms = (await r.text()).split(/\r?\n/).slice(1).map((l) => l.split(",")[2]?.trim()).filter((s): s is string => !!s && /^[A-Z0-9&-]+$/.test(s));
      if (syms.length >= 45) return syms;
    } catch {}
  }
  return [];
}
type Spark = { spark?: { result?: { symbol: string; response: { meta: { regularMarketPrice?: number; chartPreviousClose?: number; regularMarketTime?: number; shortName?: string; longName?: string } }[] }[] } };

/** Top gainers/losers among NIFTY 50 stocks — constituents from NSE Indices, prices from Yahoo Finance. */
export async function getMovers(): Promise<Movers | null> {
  const syms = await constituents();
  if (!syms.length) return null;
  const chunks: string[][] = [];
  for (let i = 0; i < syms.length; i += 20) chunks.push(syms.slice(i, i + 20));
  const all: Mover[] = [];
  await Promise.all(chunks.map(async (c) => {
    try {
      const q = c.map((s) => encodeURIComponent(`${s}.NS`)).join(",");
      const r = await fetch(`https://query1.finance.yahoo.com/v7/finance/spark?symbols=${q}&range=1d&interval=1d`, { next: { revalidate: REVAL }, headers: UA, signal: AbortSignal.timeout(7000) });
      if (!r.ok) return;
      const j = (await r.json()) as Spark;
      for (const x of j.spark?.result ?? []) {
        const m = x.response?.[0]?.meta;
        if (!m?.regularMarketPrice || !m.chartPreviousClose) continue;
        const change = m.regularMarketPrice - m.chartPreviousClose;
        all.push({ sym: x.symbol.replace(/\.NS$/, ""), name: m.shortName ?? m.longName ?? x.symbol, price: m.regularMarketPrice, change, pct: (change / m.chartPreviousClose) * 100, time: (m.regularMarketTime ?? 0) * 1000 });
      }
    } catch {}
  }));
  if (all.length < 30) return null;
  const s = [...all].sort((a, b) => b.pct - a.pct);
  return {
    gainers: s.filter((m) => m.pct > 0).slice(0, 5), losers: s.filter((m) => m.pct < 0).reverse().slice(0, 5),
    breadth: { up: all.filter((m) => m.pct > 0.005).length, down: all.filter((m) => m.pct < -0.005).length, flat: all.filter((m) => Math.abs(m.pct) <= 0.005).length },
    count: all.length, time: Math.max(...all.map((m) => m.time)) || null,
  };
}

// ---- Market status: NSE's public market-status JSON, falling back to the IST session clock ----
export type MarketStatus = { open: boolean; label: { ta: string; en: string }; source: "NSE" | "clock"; tradeDate?: string };
export async function getMarketStatus(lastTrade?: number): Promise<MarketStatus> {
  try {
    const r = await fetch("https://www.nseindia.com/api/marketStatus", { next: { revalidate: 120 }, headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0", Accept: "application/json" }, signal: AbortSignal.timeout(5000) });
    if (r.ok) {
      const j = (await r.json()) as { marketState?: { market: string; marketStatus: string; tradeDate?: string; marketStatusMessage?: string }[] };
      const cm = j.marketState?.find((m) => m.market === "Capital Market");
      if (cm) {
        // NSE keeps marketStatus "Open" for the day but says "Normal Market has Closed" after 15:30.
        const open = /open/i.test(cm.marketStatus) && !/closed/i.test(cm.marketStatusMessage ?? "");
        return { open, source: "NSE", tradeDate: cm.tradeDate, label: open ? { ta: "சந்தை திறந்துள்ளது", en: "Market open" } : { ta: "சந்தை மூடப்பட்டுள்ளது", en: "Market closed" } };
      }
    }
  } catch {}
  const now = new Date(Date.now() + 5.5 * 3600e3);
  const mins = now.getUTCHours() * 60 + now.getUTCMinutes(), wd = now.getUTCDay();
  const inSession = wd >= 1 && wd <= 5 && mins >= 555 && mins <= 930;
  // A weekday holiday shows up as no trade in the last 20 minutes.
  const open = inSession && (!lastTrade || Date.now() - lastTrade < 20 * 60e3);
  return { open, source: "clock", label: open ? { ta: "சந்தை திறந்துள்ளது", en: "Market open" } : { ta: "சந்தை மூடப்பட்டுள்ளது", en: "Market closed" } };
}
