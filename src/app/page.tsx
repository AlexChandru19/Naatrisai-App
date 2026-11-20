import { getAll } from "@/lib/news";
import { getMarkets, getMarketStatus } from "@/lib/markets";
import { getBullion } from "@/lib/bullion";
import { getFuel } from "@/lib/fuel";
import { DailyRates } from "@/components/money";
import { getCricket } from "@/lib/cricket";
import { trending } from "@/lib/trending";
import { CatchUp } from "@/components/catch-up";
import { TrendingChips } from "@/components/trending-chips";
import { CricketWidget } from "@/components/markets-widget";
import Link from "next/link";
import { pickLeads, tickerPick } from "@/lib/pick";
import { Ticker } from "@/components/ticker";
import { Hero, Bulletin, Strip } from "@/components/hero";
import { Explorer } from "@/components/explorer";
import { WeatherWidget } from "@/components/weather";
import { HeadlineQuiz } from "@/components/quiz";
import { DistrictPicker } from "@/components/pickers";
import { SectionLinks } from "@/components/section-links";
import { L } from "@/components/providers";
import { getAlerts } from "@/lib/alerts";
import { getVideos } from "@/lib/youtube";
import { getHolidays, getOnThisDay, istDate } from "@/lib/calendar";
import { fuelByDistrict } from "@/lib/place";
import { AlertBanner } from "@/components/alerts-view";
import { VideoStrip } from "@/components/video-strip";
import { TownCard } from "@/components/town-card";
import { HolidayList, OnThisDay } from "@/components/calendar-view";

export const revalidate = 300;

export default async function Home() {
  const [{ articles, fetchedAt }, markets, cricket, bullion, fuel, alerts, videos, hol, otd] = await Promise.all([getAll(), getMarkets(), getCricket(), getBullion(), getFuel(), getAlerts(), getVideos().catch(() => []), getHolidays(), getOnThisDay()]);
  // Slim copies for widgets that only need headline/source/time (keeps the page payload small).
  const slim = articles.slice(0, 120).map((a) => ({ ...a, summary: "", image: null, cluster: undefined }));
  const local = slim.filter((a) => a.districts.length).slice(0, 60);
  const today = istDate();
  // Two newest per channel so one channel can't flood the strip.
  const perCh = new Map<string, number>();
  const vids = [...videos].sort((a, b) => Date.parse(b.published) - Date.parse(a.published)).filter((v) => { const n = perCh.get(v.channelId) ?? 0; perCh.set(v.channelId, n + 1); return n < 2; }).slice(0, 14);
  const status = await getMarketStatus(Math.max(0, ...markets.quotes.filter((q) => q.group === "index").map((q) => q.time)) || undefined);
  const { lead, side } = pickLeads(articles, { preferTamil: true });
  const used = new Set([lead?.id, ...side.map((s) => s.id)]);
  const rest = articles.filter((a) => !used.has(a.id));
  // Strips show 12 per language toggle; send no more than that.
  const cap = (xs: typeof rest) => { let t = 0, e = 0; return xs.filter((a) => (a.lang === "ta" ? t++ : e++) < 12); };
  const tn = rest.filter((a) => a.section === "tamilnadu");
  const india = rest.filter((a) => a.section === "india");
  const world = rest.filter((a) => a.section === "world");
  return (
    <>
      <h1 className="sr-only">நாற்றிசை — தமிழ்நாடு, இந்தியா, உலகச் செய்திகள் · Naatrisai — Tamil Nadu, India and world news</h1>
      <Ticker items={tickerPick(articles)} />
      <AlertBanner alerts={alerts.tn} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <SectionLinks counts={{ tn: tn.length, india: india.length, world: world.length }} />
        <Bulletin items={articles.slice(0, 20)} />
      </div>
      <div className="mt-2" data-mod="trending"><TrendingChips trends={trending(articles)} /></div>
      <CatchUp articles={slim.slice(0, 100)} />
      {lead && <Hero lead={lead} side={side} />}
      <div data-mod="rates"><DailyRates b={bullion} f={fuel} m={markets} status={status} strip /></div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
        <Link href="/briefing" className="rounded-full border border-ink-100 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-ink-900">☀️ <L ta="இன்றைய சுருக்கம்" en="Daily briefing" /></Link>
        <Link href="/for-you" className="rounded-full border border-ink-100 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-ink-900">✨ <L ta="உங்களுக்காக" en="For You" /></Link>
        <Link href="/coverage" className="rounded-full border border-ink-100 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-ink-900">⚖️ <L ta="கவரேஜ் பார்வை" en="Coverage lens" /></Link>
        <Link href="/live" className="rounded-full border border-ink-100 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-ink-900">📺 <L ta="நேரலை டிவி" en="Live TV" /></Link>
        <Link href="/map" className="rounded-full border border-ink-100 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-ink-900">🗺️ <L ta="செய்தி வரைபடம்" en="News map" /></Link>
      </div>
      <Strip title={{ ta: "🛕 தமிழ்நாடு", en: "🛕 Tamil Nadu" }} href="/tamilnadu" items={cap(tn)} accent="#c8321a" />
      <Strip title={{ ta: "🇮🇳 இந்தியா", en: "🇮🇳 India" }} href="/india" items={cap(india)} accent="#f0a500" />
      <Strip title={{ ta: "🌍 உலகம்", en: "🌍 World" }} href="/world" items={cap(world)} accent="#0e8f8a" />
      <VideoStrip videos={vids} />
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <h2 className="mb-3 text-xl font-extrabold sm:text-2xl">⚡ <L ta="அண்மைச் செய்திகள்" en="Latest stories" /></h2>
          <Explorer articles={rest.slice(0, 160)} fetchedAt={fetchedAt} />
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <TownCard fuelBy={fuelByDistrict(fuel.cities)} gold={bullion.cities.find((c) => /chennai/i.test(c.city))} alerts={alerts.tn} items={local} />
          <div data-mod="weather"><WeatherWidget /></div>
          <div data-mod="rates"><DailyRates b={bullion} f={fuel} m={markets} status={status} /></div>
          <div data-mod="cricket"><CricketWidget matches={cricket.matches} /></div>
          <OnThisDay items={otd.items} max={4} compact />
          <HolidayList list={hol.list.filter((h) => h.date >= today && h.kind === "public").slice(0, 8)} server={today} compact />
          <div className="fx-hide" data-mod="quiz"><HeadlineQuiz pool={slim.slice(0, 80)} /></div>
          <DistrictPicker compact />
        </aside>
      </div>
    </>
  );
}
