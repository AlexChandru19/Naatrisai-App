import type { Metadata } from "next";
import { getMarketNews } from "@/lib/market-news";
import { PageTitle } from "@/components/hero";
import { MarketsNav } from "@/components/stocks-ui";
import { ArticleCard } from "@/components/article-card";

export const revalidate = 900;
export const metadata: Metadata = { title: "IPO & காலாண்டு முடிவுகள் · IPO & results tracker", description: "IPO openings, subscriptions, listings and quarterly results — tracked from market news headlines.", alternates: { canonical: "/markets/ipo" } };
const RE = {
  open: /\b(ipo (opens?|to open|price band|subscription|day [1-3]|subscribed)|price band|anchor (book|investors)|subscribed \d|subscription status)\b|ஐபிஓ|பங்கு வெளியீடு/i,
  listing: /\b(listing|lists? at|debut|listed at|listing gains?|allotment)\b/i,
  drhp: /\b(drhp|rhp|files? (for|draft)|sebi (nod|approval)|gets sebi)\b/i,
  results: /\b(q[1-4] (results?|earnings|profit|net)|quarterly (results?|earnings)|net profit (rises|falls|jumps|drops|up|down)|results? (preview|today|date)|earnings (beat|miss))\b|காலாண்டு (முடிவு|லாபம்)|நிகர லாபம்/i,
};
export default async function IpoPage() {
  const { articles } = await getMarketNews();
  const groups = [
    { key: "open", ta: "திறந்த / வரவிருக்கும் IPO-கள்", en: "Open & upcoming IPOs", emoji: "🚀" },
    { key: "listing", ta: "பட்டியலிடல் & ஒதுக்கீடு", en: "Listings & allotment", emoji: "🔔" },
    { key: "drhp", ta: "SEBI ஆவணங்கள் (DRHP)", en: "Filings & SEBI approvals (DRHP)", emoji: "📄" },
    { key: "results", ta: "காலாண்டு முடிவுகள்", en: "Quarterly results", emoji: "📊" },
  ] as const;
  const used = new Set<string>();
  const by = Object.fromEntries(groups.map((g) => [g.key, articles.filter((a) => { const t = `${a.title} ${a.summary}`; if (used.has(a.id) || !RE[g.key].test(t)) return false; used.add(a.id); return true; }).slice(0, 12)]));
  return (
    <>
      <PageTitle emoji="🗓️" ta="IPO & காலாண்டு முடிவுகள்" en="IPO & results tracker" subTa="சந்தைச் செய்தித் தலைப்புகளிலிருந்து — திறப்பு, சந்தா, பட்டியலிடல், DRHP, காலாண்டு முடிவுகள்" subEn="Built from market news headlines — openings, subscription, listings, DRHP filings and quarterly results" />
      <MarketsNav />
      <nav className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">{groups.map((g) => <a key={g.key} href={`#${g.key}`} className="shrink-0 rounded-full border border-ink-100 bg-white px-3 py-1.5 text-sm font-bold dark:border-white/10 dark:bg-ink-900">{g.emoji} {g.en} · {by[g.key].length}</a>)}</nav>
      {groups.map((g) => (
        <section key={g.key} id={g.key} className="mt-6 scroll-mt-24">
          <h2 className="text-xl font-extrabold">{g.emoji} {g.ta} <span className="text-sm font-semibold opacity-70">· {g.en}</span></h2>
          {by[g.key].length ? <div data-grid className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">{by[g.key].map((a, i) => <ArticleCard key={a.id} a={a} i={i} />)}</div> : <p className="mt-2 text-sm opacity-75">{`தற்போது செய்திகள் இல்லை · Nothing in the last 4 days.`}</p>}
        </section>
      ))}
      <p className="mt-8 rounded-2xl border border-ink-100 p-4 text-[12px] leading-relaxed opacity-85 dark:border-white/10">ℹ️ {`NSE/BSE-இன் IPO மற்றும் முடிவுகள் நாள்காட்டி API-கள் தானியங்கி அணுகலைத் தடுக்கின்றன; எனவே இந்தப் பக்கம் வெளியீட்டாளர் தலைப்புகளிலிருந்து மட்டுமே உருவாக்கப்படுகிறது. GMP (grey market premium) அதிகாரபூர்வமற்றது, நம்பகமான இலவச மூலம் இல்லாததால் காட்டப்படவில்லை.`}<br />{`NSE/BSE's IPO and results-calendar APIs block automated access, so this tracker is built only from publishers' headlines. Grey-market premium (GMP) is unofficial and has no reliable free source, so it is not shown.`}</p>
    </>
  );
}
