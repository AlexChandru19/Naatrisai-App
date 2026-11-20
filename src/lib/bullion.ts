import "server-only";
import { page, tables, num, delta } from "./html-table";

export type CityGold = { city: string; ta: string; k24: number; k22: number; k18: number; ch24?: number; ch22?: number; url: string };
export type Ibja = { date: string; session: "AM" | "PM"; g999: number; g995: number; g916: number; silver: number; prev?: { date: string; session: "AM" | "PM"; g999: number; g916: number; silver: number } };
export type Bullion = {
  cities: CityGold[]; goldDate: string | null; history: { date: string; k24: number; k22: number }[];
  silver: { city: string; ta: string; kg: number }[]; silverChange?: number;
  ibja: Ibja | null; fetchedAt: string;
};

const GR = "https://www.goodreturns.in";
const CITY_TA: Record<string, string> = {
  Chennai: "சென்னை", Mumbai: "மும்பை", Delhi: "டெல்லி", Kolkata: "கொல்கத்தா", Bangalore: "பெங்களூரு", Hyderabad: "ஹைதராபாத்", Kerala: "கேரளா",
  Pune: "புனே", Vadodara: "வதோதரா", Ahmedabad: "அகமதாபாத்", Coimbatore: "கோயம்புத்தூர்", Madurai: "மதுரை", Trichy: "திருச்சி", Salem: "சேலம்",
};
// Tamil Nadu cities fetched individually (the national page lists only ten big cities).
const TN_PAGES = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"];
const REVAL = 1800; // gold/silver retail rates change a few times a day at most

function cityPage(city: string, html: string | null): CityGold | null {
  if (!html) return null;
  const t = tables(html).find((tb) => /gram/i.test(tb[0]?.[0] ?? "") && /24K/.test(tb[0]?.join(" ") ?? ""));
  const row = t?.find((r) => r[0] === "1");
  if (!row) return null;
  const g = { city, ta: CITY_TA[city] ?? city, k24: num(row[1]), k22: num(row[2]), k18: num(row[3]), ch24: delta(row[1]), ch22: delta(row[2]), url: `${GR}/gold-rates/${city.toLowerCase()}.html` };
  return plausible(g.k24) && plausible(g.k22) ? g : null;
}
// Sanity bounds for ₹/gram so a layout change can't print garbage as a price.
const plausible = (n: number) => Number.isFinite(n) && n > 3000 && n < 60000;

async function ibja(): Promise<Ibja | null> {
  const html = await page("https://ibjarates.com/", REVAL);
  if (!html) return null;
  const pick = (id: string) => {
    const i = html.indexOf(`id="${id}"`);
    if (i < 0) return null;
    const ts = tables(html.slice(i, i + 20000))[0];
    return ts?.filter((r) => /^\d{2}\/\d{2}\/\d{4}$/.test(r[0] ?? "")).map((r) => ({ date: r[0], g999: num(r[1]), g995: num(r[2]), g916: num(r[3]), silver: num(r[6]) })) ?? null;
  };
  const am = pick("tab-am"), pm = pick("tab-pm");
  const key = (d: string) => d.split("/").reverse().join("");
  const cands = [...(am ?? []).map((r) => ({ ...r, session: "AM" as const })), ...(pm ?? []).map((r) => ({ ...r, session: "PM" as const }))]
    .filter((r) => r.g999 > 30000 && r.g999 < 600000)
    .sort((a, b) => key(b.date).localeCompare(key(a.date)) || (a.session === "PM" ? -1 : 1));
  const top = cands[0];
  if (!top) return null;
  // previous published session (this morning's AM rate, or the last trading day's PM)
  const prev = cands[1];
  return { date: top.date, session: top.session, g999: top.g999, g995: top.g995, g916: top.g916, silver: top.silver, prev: prev && { date: prev.date, session: prev.session, g999: prev.g999, g916: prev.g916, silver: prev.silver } };
}

/** Retail gold/silver: Goodreturns city tables (indicative jeweller rates) + IBJA benchmark (official bullion association). */
export async function getBullion(): Promise<Bullion> {
  const [idx, sil, ib, ...tn] = await Promise.all([
    page(`${GR}/gold-rates/`, REVAL), page(`${GR}/silver-rates/`, REVAL), ibja(),
    ...TN_PAGES.map((c) => page(`${GR}/gold-rates/${c.toLowerCase()}.html`, REVAL)),
  ]);
  const cities: CityGold[] = [];
  let history: Bullion["history"] = [];
  let goldDate: string | null = null;
  TN_PAGES.forEach((c, i) => { const g = cityPage(c, tn[i]); if (g) cities.push(g); });
  if (idx) {
    goldDate = idx.match(/Gold Rate Today \(([^)]+)\)/)?.[1] ?? null;
    const ts = tables(idx);
    const ct = ts.find((t) => t[0]?.[0] === "City" && /24K/.test(t[0].join(" ")));
    for (const r of ct?.slice(1) ?? []) {
      if (cities.some((c) => c.city === r[0])) continue;
      const g = { city: r[0], ta: CITY_TA[r[0]] ?? r[0], k24: num(r[1]), k22: num(r[2]), k18: num(r[3]), url: `${GR}/gold-rates/${r[0].toLowerCase()}.html` };
      if (plausible(g.k24) && plausible(g.k22)) cities.push(g);
    }
    const ht = ts.find((t) => t[0]?.[0] === "Date" && /24K/.test(t[0].join(" ")));
    history = (ht?.slice(1) ?? []).map((r) => ({ date: r[0], k24: num(r[1]), k22: num(r[2]) })).filter((h) => plausible(h.k24));
  }
  let silver: Bullion["silver"] = [];
  let silverChange: number | undefined;
  if (sil) {
    const ts = tables(sil);
    const ct = ts.find((t) => t[0]?.[0] === "City" && /1 Kg/i.test(t[0].join(" ")));
    silver = (ct?.slice(1) ?? []).map((r) => ({ city: r[0], ta: CITY_TA[r[0]] ?? r[0], kg: num(r[3]) })).filter((s) => s.kg > 20000 && s.kg < 2000000);
    const tt = ts.find((t) => t[0]?.[0] === "Gram" && /Today/.test(t[0].join(" ")));
    const kg = tt?.find((r) => r[0] === "1000");
    if (kg) { const d = num(kg[1]) - num(kg[2]); if (Number.isFinite(d)) silverChange = d; }
  }
  return { cities, goldDate, history, silver, silverChange, ibja: ib, fetchedAt: new Date().toISOString() };
}
