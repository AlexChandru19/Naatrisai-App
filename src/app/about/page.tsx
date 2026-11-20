import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/hero";
import { L } from "@/components/providers";

export const metadata: Metadata = {
  title: "எப்படி வேலை செய்கிறது · How it works & privacy",
  description: "How Naatrisai collects, ranks and groups news, where each live widget gets its data, and what stays on your device.",
  alternates: { canonical: "/about" },
};

const box = "rounded-2xl border border-ink-100 bg-white p-5 dark:border-white/10 dark:bg-ink-900";
const DATA: [string, string, string, string][] = [
  ["📰", "செய்திகள்", "News", "Publishers' public RSS feeds and Google News RSS (headline, short summary, image, link). Refreshed every few minutes."],
  ["🥇", "தங்கம் / வெள்ளி", "Gold / silver", "Goodreturns city rates and IBJA benchmark rates (published twice a day)."],
  ["⛽", "பெட்ரோல் / டீசல்", "Petrol / diesel", "Goodreturns daily retail prices for cities, states and Tamil Nadu districts."],
  ["📈", "பங்குச் சந்தை", "Stock market", "Yahoo Finance charts (indices, sectors, FX, commodities; may be delayed), index constituents from Wikipedia (NSE Indices blocks automated access), AMFI mutual fund NAVs."],
  ["⚠️", "எச்சரிக்கைகள்", "Alerts", "NDMA SACHET Common Alerting Protocol feed (IMD, state disaster authorities)."],
  ["🌦️", "வானிலை & காற்றுத் தரம்", "Weather & air quality", "Open-Meteo forecast and CAMS-based air-quality model (US AQI scale, not CPCB)."],
  ["🏏", "கிரிக்கெட்", "Cricket", "Public live-score RSS feed."],
  ["📺", "காணொளிகள்", "Videos", "Official YouTube channel RSS feeds of Tamil news channels."],
  ["📅", "நாள்காட்டி", "Calendar", "Google public 'Holidays in India' calendar; Wikipedia 'On this day' (CC BY-SA)."],
  ["💼", "வேலைவாய்ப்பு", "Jobs", "TNPSC's official home page, plus news search."],
  ["🔎", "தேடல் அட்டை", "Search card", "Wikipedia page summaries (CC BY-SA)."],
  ["✨", "AI உதவி", "AI assist", "Vercel AI Gateway (when switched on). Reads only the headline, short summary and other outlets' headlines shown on the page; generated only when you tap; cached."],
];

export default function AboutPage() {
  return (
    <>
      <PageTitle emoji="ℹ️" ta="நாற்றிசை எப்படி வேலை செய்கிறது" en="How Naatrisai works" subTa="மூலங்கள், தரவரிசை, தனியுரிமை" subEn="Sources, ranking and privacy" />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className={box}>
          <h2 className="mb-2 text-lg font-extrabold">🧭 <L ta="செய்திகள் எப்படித் தேர்வாகின்றன" en="How stories are picked" /></h2>
          <ul className="list-disc space-y-1.5 pl-5 text-[15px]">
            <li><L ta="பல தமிழ், இந்திய, சர்வதேச ஊடகங்களின் பொது RSS ஊட்டங்களிலிருந்து தலைப்புகள் சேகரிக்கப்படுகின்றன." en="Headlines are collected from the public RSS feeds of many Tamil, Indian and international outlets." /></li>
            <li><L ta="ஒரே நிகழ்வைப் பற்றிய வெவ்வேறு ஊடகச் செய்திகள் தலைப்பு ஒற்றுமையால் ஒரே தொகுப்பாக்கப்படுகின்றன (முழு கவரேஜ்)." en="Different outlets' reports on the same event are grouped by headline similarity (Full coverage)." /></li>
            <li><L ta="தரவரிசை: புதுமை, எத்தனை ஊடகங்கள் வெளியிட்டன, மூல நம்பகத்தன்மை, முக்கியத்துவம். விளம்பர/வாழ்க்கைமுறைச் செய்திகள் கீழே தள்ளப்படுகின்றன." en="Ranking blends recency, how many outlets carry it, source track record and importance. Sponsored/lifestyle items are pushed down." /></li>
            <li><L ta="செய்திகள் இங்கு எழுதப்படுவதில்லை — தலைப்பும் வெளியீட்டாளரின் சிறு குறிப்பும் மட்டுமே; முழுச் செய்திக்கு மூலத் தளத்திற்குச் செல்லும்." en="We don't write the news — only the headline and the publisher's own short summary are shown; tapping opens the original site." /></li>
            <li><L ta="✨ AI உதவி (நீங்கள் தட்டும்போது மட்டும்): இங்கு காட்டப்படும் தலைப்பு, சிறு குறிப்பு, பிற ஊடகத் தலைப்புகளை மட்டுமே படிக்கிறது; முழுக் கட்டுரையைப் படிப்பதில்லை. புதிய தகவல், எண், மேற்கோள் சேர்க்கக் கூடாது என அறிவுறுத்தப்படுகிறது; மூல உரையில் இல்லாத எண்கள் கொண்ட வாக்கியங்கள் தானாக நீக்கப்படுகின்றன. ஒவ்வொரு AI வரியும் “AI” எனக் குறிக்கப்படும்; தவறுகள் இருக்கலாம்." en="✨ AI assist (only when you tap): reads only the headline, short summary and other outlets' headlines shown here — never the full article. It is told not to add facts, numbers or quotes, and sentences with numbers not in the source text are removed automatically. Every AI line is labelled “AI” and may contain mistakes." /></li>
          </ul>
          <p className="mt-3 text-sm"><Link href="/sources" className="font-bold text-kumkum-600 underline dark:text-manjal-400"><L ta="அனைத்து மூலங்களும் →" en="All sources →" /></Link></p>
        </section>
        <section className={box}>
          <h2 className="mb-2 text-lg font-extrabold">🔒 <L ta="உங்கள் தனியுரிமை" en="Your privacy" /></h2>
          <ul className="list-disc space-y-1.5 pl-5 text-[15px]">
            <li><L ta="கணக்கு இல்லை, உள்நுழைவு இல்லை." en="No accounts, no sign-in." /></li>
            <li><L ta="மொழி, பின்தொடர்வுகள், சேமித்தவை, படித்த வரலாறு, ஊர், அமைப்புகள் — அனைத்தும் உங்கள் உலாவியின் localStorage-இல் மட்டுமே இருக்கும்; எங்கள் சேவையகத்திற்கு அனுப்பப்படுவதில்லை." en="Language, follows, saved stories, reading history, your town and settings live only in your browser's localStorage — they are not sent to our server." /></li>
            <li><L ta="“என் வாசிப்பு” புள்ளிவிவரங்கள் உங்கள் சாதனத்திலேயே கணக்கிடப்படுகின்றன." en="“My reading mix” stats are computed on your device." /></li>
            <li><L ta="அமைப்புகளில் உங்கள் தரவை JSON கோப்பாக ஏற்றுமதி/இறக்குமதி செய்யலாம் அல்லது முழுமையாக அழிக்கலாம்." en="From Settings you can export/import your data as a JSON file, or wipe it." /></li>
            <li><L ta="வானிலைக்குத் தேர்ந்த ஊர்/இருப்பிடம் Open-Meteo-விடம் நேரடியாகக் கேட்கப்படுகிறது. படங்கள் செய்தித் தளங்களிலிருந்து நேரடியாக ஏற்றப்படுகின்றன; காணொளிகள் YouTube-இலிருந்து." en="Weather for your chosen town/location is requested directly from Open-Meteo. Images load directly from publishers; videos from YouTube." /></li>
            <li><L ta="தளம் Vercel-இல் இயங்குகிறது; அவர்களின் வழக்கமான சேவையகப் பதிவுகள் (IP போன்றவை) பொருந்தும்." en="The site runs on Vercel; their standard server logs (such as IP addresses) apply." /></li>
          </ul>
        </section>
        <section className={`${box} lg:col-span-2`}>
          <h2 className="mb-3 text-lg font-extrabold">📡 <L ta="நேரலைத் தரவு மூலங்கள்" en="Live data sources" /></h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {DATA.map(([e, ta, en, d]) => (
              <div key={en} className="rounded-xl bg-ink-50 p-3 text-sm dark:bg-white/5"><div className="font-extrabold">{e} <L ta={ta} en={en} /></div><div className="opacity-80">{d}</div></div>
            ))}
          </div>
          <p className="mt-3 text-xs opacity-70"><L ta="தகவல் தவறாக இருந்தால் மூலத் தளமே இறுதியானது. விலை, எச்சரிக்கை போன்றவற்றை முக்கிய முடிவுகளுக்கு முன் அதிகாரப்பூர்வ மூலத்தில் சரிபார்க்கவும்." en="If something looks wrong, the original source is authoritative. Verify prices and alerts with the official source before acting on them." /></p>
        </section>
        <section className={`${box} lg:col-span-2`}>
          <h2 className="mb-2 text-lg font-extrabold">©️ <L ta="பதிப்புரிமை" en="Copyright" /></h2>
          <p className="text-[15px]"><L ta="செய்தித் தலைப்புகள், குறிப்புகள், படங்கள் அந்தந்த வெளியீட்டாளர்களுக்குச் சொந்தமானவை. நாற்றிசை ஒரு செய்தித் திரட்டி மட்டுமே; ஒவ்வொரு செய்தியும் மூலத்திற்கு இணைப்பு தருகிறது. விக்கிப்பீடியா உள்ளடக்கம் CC BY-SA உரிமத்தில்." en="Headlines, summaries and images belong to their publishers. Naatrisai is an aggregator; every story links to its source. Wikipedia content is used under CC BY-SA." /></p>
        </section>
      </div>
    </>
  );
}
