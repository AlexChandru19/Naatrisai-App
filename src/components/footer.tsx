"use client";
import Link from "next/link";
import { L } from "./providers";
import { CompassMark } from "./logo";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-ink-100 bg-white pb-24 pt-8 dark:border-white/10 dark:bg-ink-900 lg:pb-8">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 text-sm md:grid-cols-3">
        <div className="flex gap-3">
          <CompassMark className="h-10 w-10 shrink-0" />
          <p className="text-ink-900/70 dark:text-white/60">
            <b className="text-ink-900 dark:text-white">நாற்றிசை (Naatrisai)</b> —{" "}
            <L ta="“நான்கு திசைகள்”. தமிழ்நாடு, இந்தியா, உலகம் என எல்லாத் திசைச் செய்திகளையும் ஒரே இடத்தில் தொகுத்துத் தருகிறது." en="“the four directions”. Live headlines from Tamil Nadu, every Indian state and the world, gathered in one place." />
          </p>
        </div>
        <p className="text-ink-900/70 dark:text-white/60">
          <L ta="தலைப்புகளும் சுருக்கங்களும் வெளியீட்டாளர்களின் பொது RSS ஊட்டங்களிலிருந்து எடுக்கப்படுகின்றன; முழுச் செய்தியைப் படிக்க மூலத் தளத்திற்குச் செல்லவும். அனைத்து உரிமைகளும் அந்தந்த வெளியீட்டாளர்களுக்கே." en="Headlines and short summaries come from publishers’ public RSS feeds; tap through to read the full story on the original site. All rights belong to the respective publishers." />
        </p>
        <div className="flex flex-wrap content-start gap-x-4 gap-y-2 md:justify-end">
          <Link className="hover:text-kumkum-600" href="/for-you"><L ta="உங்களுக்காக" en="For You" /></Link>
          <Link className="hover:text-kumkum-600" href="/briefing"><L ta="இன்றைய சுருக்கம்" en="Daily briefing" /></Link>
          <Link className="hover:text-kumkum-600" href="/live"><L ta="நேரலை டிவி" en="Live TV" /></Link>
          <Link className="hover:text-kumkum-600" href="/coverage"><L ta="கவரேஜ் பார்வை" en="Coverage lens" /></Link>
          <Link className="hover:text-kumkum-600" href="/trending"><L ta="டிரெண்டிங்" en="Trending" /></Link>
          <Link className="hover:text-kumkum-600" href="/map"><L ta="செய்தி வரைபடம்" en="News map" /></Link>
          <Link className="hover:text-kumkum-600" href="/markets"><L ta="தங்கம் · பெட்ரோல் · சந்தை" en="Gold · fuel · markets" /></Link>
          <Link className="hover:text-kumkum-600" href="/sports"><L ta="விளையாட்டு" en="Sports scores" /></Link>
          <Link className="hover:text-kumkum-600" href="/exam-digest"><L ta="TNPSC/UPSC நடப்பு நிகழ்வுகள்" en="Exam current affairs" /></Link>
          <Link className="hover:text-kumkum-600" href="/markets/news"><L ta="சந்தைச் செய்திகள்" en="Market news" /></Link>
          <Link className="hover:text-kumkum-600" href="/markets/nifty50"><L ta="நிஃப்டி 50 வெப்ப வரைபடம்" en="NIFTY 50 heatmap" /></Link>
          <Link className="hover:text-kumkum-600" href="/markets/calculators"><L ta="தங்கம் & SIP கணிப்பான்" en="Gold & SIP calculators" /></Link>
          <Link className="hover:text-kumkum-600" href="/watchwords"><L ta="கண்காணிப்புச் சொற்கள்" en="Watchwords" /></Link>
          <Link className="hover:text-kumkum-600" href="/factcheck"><L ta="உண்மைச் சரிபார்ப்பு" en="Fact checks" /></Link>
          <Link className="hover:text-kumkum-600" href="/alerts"><L ta="எச்சரிக்கைகள்" en="Alerts" /></Link>
          <Link className="hover:text-kumkum-600" href="/jobs"><L ta="வேலை & தேர்வுகள்" en="Jobs & exams" /></Link>
          <Link className="hover:text-kumkum-600" href="/calendar"><L ta="நாள்காட்டி" en="Calendar" /></Link>
          <Link className="hover:text-kumkum-600" href="/photos"><L ta="படங்களில் செய்தி" en="In pictures" /></Link>
          <Link className="hover:text-kumkum-600" href="/about"><L ta="எப்படி இயங்குகிறது · தனியுரிமை" en="How it works · privacy" /></Link>
          <Link className="hover:text-kumkum-600" href="/topics"><L ta="தலைப்புகள்" en="Topics" /></Link>
          <Link className="hover:text-kumkum-600" href="/saved"><L ta="சேமித்தவை" en="Saved" /></Link>
          <Link className="hover:text-kumkum-600" href="/sources"><L ta="செய்தி மூலங்கள் & நிலை" en="Sources & feed status" /></Link>
          <Link className="hover:text-kumkum-600" href="/rss"><L ta="RSS ஊட்டங்கள்" en="RSS feeds" /></Link>
          <a className="hover:text-kumkum-600" href="/sitemap.xml"><L ta="தளவரைபடம்" en="Sitemap" /></a>
          <button className="hover:text-kumkum-600" onClick={() => window.dispatchEvent(new Event("ns:shortcuts"))}>⌨️ <L ta="குறுக்குவழிகள்" en="Shortcuts" /></button>
        </div>
      </div>
    </footer>
  );
}
