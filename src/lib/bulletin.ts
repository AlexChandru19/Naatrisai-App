import { SITE } from "./site";
import { getAll } from "./news";
import { briefingPicks } from "./briefing";
import { getBullion } from "./bullion";
import { getFuel } from "./fuel";
import { getMarkets } from "./markets";
import type { Article } from "./types";

export { SITE };
const n = (v: number, d = 0) => v.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d });

/** IST edition: morning (before 3 pm) or evening. */
export function edition(now = Date.now()) {
  const ist = new Date(now + 5.5 * 3600e3); const h = ist.getUTCHours();
  const morning = h < 15;
  const date = ist.toISOString().slice(0, 10);
  const dateTa = new Date(now).toLocaleDateString("ta-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const dateEn = new Date(now).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return { morning, date, dateTa, dateEn, ta: morning ? "காலைச் செய்திச் சுருக்கம் (7 மணி)" : "மாலைச் செய்திச் சுருக்கம் (7 மணி)", en: morning ? "Morning bulletin (7 am IST)" : "Evening bulletin (7 pm IST)" };
}

export type BulletinData = Awaited<ReturnType<typeof getBulletin>>;
export async function getBulletin() {
  const [all, gold, fuel, mk] = await Promise.all([getAll(), getBullion().catch(() => null), getFuel().catch(() => null), getMarkets().catch(() => null)]);
  const p = briefingPicks(all.articles);
  const sections: { key: string; ta: string; en: string; items: Article[] }[] = [
    { key: "big", ta: "முக்கியச் செய்திகள்", en: "Top stories", items: p.big },
    { key: "tn", ta: "தமிழ்நாடு", en: "Tamil Nadu", items: p.tn },
    { key: "india", ta: "இந்தியா", en: "India", items: p.india },
    { key: "world", ta: "உலகம்", en: "World", items: p.world },
  ];
  const chennaiGold = gold?.cities.find((c) => c.city === "Chennai") ?? null;
  const chennaiFuel = fuel?.cities.find((c) => c.city === "Chennai") ?? null;
  const nifty = mk?.quotes.find((q) => q.key === "nifty") ?? null, sensex = mk?.quotes.find((q) => q.key === "sensex") ?? null;
  const ed = edition();
  const lines: string[] = [`📰 *நாற்றிசை — ${ed.ta}*`, ed.dateTa, ""];
  for (const s of sections) { if (!s.items.length) continue; lines.push(`*${s.ta}*`); s.items.forEach((a, i) => lines.push(`${i + 1}. ${a.title} — _${a.source}_`)); lines.push(""); }
  const money: string[] = [];
  if (chennaiGold) money.push(`🪙 தங்கம் (சென்னை, 22K): ₹${n(chennaiGold.k22)}/கி`);
  if (chennaiFuel?.petrol) money.push(`⛽ பெட்ரோல் (சென்னை): ₹${n(chennaiFuel.petrol, 2)}${chennaiFuel.diesel ? ` · டீசல் ₹${n(chennaiFuel.diesel, 2)}` : ""}`);
  if (nifty) money.push(`📈 நிஃப்டி ${n(nifty.price, 2)} (${nifty.pct >= 0 ? "+" : ""}${n(nifty.pct, 2)}%)${sensex ? ` · சென்செக்ஸ் ${n(sensex.price, 2)} (${sensex.pct >= 0 ? "+" : ""}${n(sensex.pct, 2)}%)` : ""}`);
  if (money.length) lines.push(...money, "");
  lines.push(`முழு விவரம்: ${SITE}/bulletin`);
  return { edition: ed, sections, gold: chennaiGold, fuel: chennaiFuel, nifty, sensex, text: lines.join("\n"), fetchedAt: all.fetchedAt };
}
