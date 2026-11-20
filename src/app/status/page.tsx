import type { Metadata } from "next";
import Link from "next/link";
import { getAll } from "@/lib/news";
import { PageTitle } from "@/components/hero";

export const revalidate = 300;
export const metadata: Metadata = { title: "சேவை நிலை · Status & uptime", description: "Live health of Naatrisai's data sources — news feeds, markets, gold, fuel, alerts and calendars.", alternates: { canonical: "/status" } };
const UA = { "User-Agent": "Mozilla/5.0 (compatible; NaatrisaiBot/1.0; +https://naatrisai.vercel.app/about)" };
const CHECKS = [
  { ta: "பங்குச் சந்தை விலைகள்", en: "Market quotes (Yahoo Finance)", url: "https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?range=1d&interval=1d", ok: (t: string) => t.includes('"regularMarketPrice"') },
  { ta: "நிஃப்டி பட்டியல்கள்", en: "Index constituents (Wikipedia)", url: "https://en.wikipedia.org/w/api.php?action=parse&page=NIFTY_50&prop=wikitext&format=json&formatversion=2", ok: (t: string) => t.includes("constituents") },
  { ta: "மியூச்சுவல் ஃபண்ட் NAV", en: "Mutual fund NAV (AMFI)", url: "https://portal.amfiindia.com/spages/NAVAll.txt", ok: (t: string) => t.startsWith("Scheme Code"), head: true },
  { ta: "தங்கம் & எரிபொருள்", en: "Gold & fuel (Goodreturns)", url: "https://www.goodreturns.in/gold-rates/chennai.html", ok: (t: string) => /gold/i.test(t) },
  { ta: "பேரிடர் எச்சரிக்கைகள்", en: "Disaster alerts (NDMA SACHET)", url: "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml", ok: (t: string) => t.includes("<rss") || t.includes("<item") },
  { ta: "வரலாற்றில் இன்று", en: "On this day (Wikimedia)", url: "https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/01/01", ok: (t: string) => t.includes("selected") },
  { ta: "Google செய்திகள்", en: "Google News RSS", url: "https://news.google.com/rss?hl=ta&gl=IN&ceid=IN:ta", ok: (t: string) => t.includes("<item>") },
];
async function probe(c: (typeof CHECKS)[number]) {
  const t0 = Date.now();
  try {
    const r = await fetch(c.url, { headers: { ...UA, ...(c.head ? { Range: "bytes=0-2000" } : {}) }, next: { revalidate: 300 }, signal: AbortSignal.timeout(10000) });
    const txt = (await r.text()).slice(0, 200000);
    return { ...c, status: r.status, ms: Date.now() - t0, up: r.ok || r.status === 206 ? c.ok(txt) : false };
  } catch (e) { return { ...c, status: 0, ms: Date.now() - t0, up: false, err: String(e).slice(0, 80) }; }
}
const fmt = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", second: "2-digit" }) + " IST";

export default async function StatusPage() {
  const [checks, feeds] = await Promise.all([Promise.all(CHECKS.map(probe)), getAll()]);
  const live = feeds.status.filter((s) => s.count > 0).length;
  const upN = checks.filter((c) => c.up).length;
  const all = upN === checks.length && live >= feeds.status.length * 0.8;
  return (
    <>
      <PageTitle emoji="🩺" ta="சேவை நிலை" en="Status & uptime" subTa={`ஒவ்வொரு 5 நிமிடமும் நேரடிச் சோதனை · கடைசியாக ${fmt(new Date().toISOString())}`} subEn={`Live checks every 5 minutes · last run ${fmt(new Date().toISOString())}`} />
      <div className={`mt-4 rounded-2xl p-4 text-lg font-extrabold ${all ? "bg-green-700 text-white" : "bg-manjal-400 text-ink-900"}`} data-status-overall>{all ? "✅ எல்லாச் சேவைகளும் இயங்குகின்றன · All systems operational" : "⚠️ சில மூலங்களில் சிக்கல் · Some sources degraded"}</div>
      <section className="mt-5 rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
        <h2 className="font-extrabold">🔌 {`தரவு மூலங்கள் · Data sources`} · {upN}/{checks.length}</h2>
        <ul className="mt-2 divide-y divide-ink-100 dark:divide-white/10">
          {checks.map((c) => <li key={c.en} className="flex items-center gap-3 py-2.5 text-sm" data-check={c.up ? "up" : "down"}><span aria-hidden>{c.up ? "🟢" : "🔴"}</span><span className="min-w-0 flex-1"><b>{c.ta}</b> · {c.en}</span><span className="tabular-nums opacity-80">{c.status || "—"} · {c.ms} ms</span></li>)}
        </ul>
      </section>
      <section className="mt-5 rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
        <h2 className="font-extrabold">📰 {`செய்தி ஊட்டங்கள் · News feeds`} · {live}/{feeds.status.length} {`இயங்குகின்றன · live`}</h2>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10"><div className="h-full bg-green-600" style={{ width: `${(live / Math.max(1, feeds.status.length)) * 100}%` }} /></div>
        <p className="mt-2 text-sm">{feeds.articles.length} {`செய்திகள் தற்போது · stories in the live pool`} · <Link href="/sources" className="font-bold underline">{`ஒவ்வொரு ஊட்டமும் · per-feed detail`} →</Link></p>
        {feeds.status.some((s) => !s.count) && <p className="mt-2 text-xs opacity-80">{`பதிலளிக்காதவை · Not responding:`} {feeds.status.filter((s) => !s.count).map((s) => s.source).join(", ")}</p>}
      </section>
      <p className="mt-4 text-[11.5px] opacity-75">{`இந்தப் பக்கம் சேவையகத்திலிருந்து நேரடிக் கோரிக்கைகள் மூலம் சோதிக்கிறது; வரலாற்றுப் பதிவுக்கு தரவுத்தளம் தேவை (Supabase அமைக்கப்பட்டதும்). · Checks run live from the server on each refresh; uptime history needs the database (pending Supabase).`}</p>
    </>
  );
}
