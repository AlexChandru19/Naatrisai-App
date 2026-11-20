"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePrefs, L } from "./providers";
import { CompassMark } from "./logo";
import { SettingsPanel } from "./settings-panel";
import { ThemeButton } from "./appearance";

export const NAV = [
  { href: "/", ta: "முதன்மை", en: "Top", icon: "🏠" },
  { href: "/for-you", ta: "உங்களுக்கு", en: "For You", icon: "✨" },
  { href: "/tamilnadu", ta: "தமிழ்நாடு", en: "Tamil Nadu", icon: "🛕" },
  { href: "/india", ta: "இந்தியா", en: "India", icon: "🇮🇳" },
  { href: "/world", ta: "உலகம்", en: "World", icon: "🌍" },
  { href: "/briefing", ta: "சுருக்கம்", en: "Briefing", icon: "☀️", desktopOnly: true },
  { href: "/live", ta: "நேரலை", en: "Live TV", icon: "📺", desktopOnly: true },
];
export const MORE = [
  { href: "/briefing", ta: "இன்றைய சுருக்கம்", en: "Daily briefing", icon: "☀️" },
  { href: "/live", ta: "நேரலை டிவி & வீடியோ", en: "Live TV & videos", icon: "📺" },
  { href: "/coverage", ta: "கவரேஜ் பார்வை", en: "Coverage lens", icon: "⚖️" },
  { href: "/trending", ta: "டிரெண்டிங்", en: "Trending", icon: "📈" },
  { href: "/map", ta: "செய்தி வரைபடம்", en: "News map", icon: "🗺️" },
  { href: "/markets", ta: "தங்கம் · பெட்ரோல் · சந்தை", en: "Gold · fuel · markets", icon: "💹" },
  { href: "/markets/news", ta: "சந்தைச் செய்திகள்", en: "Market news", icon: "🗞️" },
  { href: "/markets/nifty50", ta: "நிஃப்டி 50 வெப்ப வரைபடம்", en: "NIFTY 50 heatmap", icon: "🟩" },
  { href: "/markets/calculators", ta: "தங்க நகை & SIP கணிப்பான்", en: "Gold & SIP calculators", icon: "🧮" },
  { href: "/exam-digest", ta: "TNPSC/UPSC நடப்பு நிகழ்வுகள்", en: "Exam current affairs", icon: "📚" },
  { href: "/developing", ta: "வளரும் செய்திகள் (நேரலை)", en: "Developing stories (live)", icon: "🔴" },
  { href: "/bulletin", ta: "WhatsApp செய்திச் சுருக்கம்", en: "WhatsApp bulletin", icon: "🟢" },
  { href: "/panchangam", ta: "பஞ்சாங்கம்", en: "Panchangam", icon: "🪔" },
  { href: "/markets/mutual-funds", ta: "மியூச்சுவல் ஃபண்ட் NAV", en: "Mutual fund NAV", icon: "🏦" },
  { href: "/markets/ipo", ta: "IPO & காலாண்டு முடிவுகள்", en: "IPO & results", icon: "🗓️" },
  { href: "/watchwords", ta: "கண்காணிப்புச் சொற்கள்", en: "My watchwords", icon: "🔔" },
  { href: "/sports", ta: "விளையாட்டு ஸ்கோர்கள்", en: "Sports scores", icon: "⚽" },
  { href: "/factcheck", ta: "உண்மைச் சரிபார்ப்பு", en: "Fact checks", icon: "🔍" },
  { href: "/alerts", ta: "வானிலை எச்சரிக்கைகள்", en: "Weather & disaster alerts", icon: "⚠️" },
  { href: "/jobs", ta: "வேலை & தேர்வுகள்", en: "Jobs & exams", icon: "💼" },
  { href: "/calendar", ta: "நாள்காட்டி & வரலாற்றில் இன்று", en: "Calendar & on this day", icon: "📅" },
  { href: "/photos", ta: "படங்களில் செய்தி", en: "In pictures", icon: "📸" },
  { href: "/topics", ta: "தலைப்புகள்", en: "Topics", icon: "🗂️" },
  { href: "/saved", ta: "சேமித்தவை", en: "Saved", icon: "🔖" },
  { href: "/sources", ta: "மூலங்கள் & நிலை", en: "Sources & status", icon: "📡" },
  { href: "/rss", ta: "RSS ஊட்டங்கள்", en: "RSS feeds", icon: "📰" },
  { href: "/status", ta: "சேவை நிலை", en: "Status & uptime", icon: "🩺" },
  { href: "/corrections", ta: "திருத்தங்கள் & பிழை புகார்", en: "Corrections", icon: "🛠️" },
  { href: "/about", ta: "எப்படி இயங்குகிறது · தனியுரிமை", en: "How it works · privacy", icon: "ℹ️" },
];

export function Header() {
  const raw = usePathname() || "/";
  // Vercel's ISR render of "/" can report "/index"; normalise so server and client markup match.
  const path = raw === "/index" ? "/" : raw;
  const { lang, setLang, saved, streak, ready } = usePrefs();
  const [today, setToday] = useState("");
  const [more, setMore] = useState(false);
  const [settings, setSettings] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(new Date().toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }));
  }, [lang]);
  useEffect(() => { setMore(false); }, [path]); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => {
    const o = () => setSettings(true);
    window.addEventListener("ns:settings", o);
    return () => window.removeEventListener("ns:settings", o);
  }, []);
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  const savedCount = Object.keys(saved).length;
  const t = (n: { ta: string; en: string }) => (lang === "ta" ? n.ta : n.en);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-white">{lang === "ta" ? "உள்ளடக்கத்திற்குச் செல்" : "Skip to content"}</a>
      <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/85">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:px-5">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="நாற்றிசை — முகப்பு / Naatrisai home">
            <CompassMark className="h-9 w-9 transition-transform duration-500 group-hover:rotate-90" />
            <span className="leading-none">
              <span className="block bg-gradient-to-r from-kumkum-600 to-manjal-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">நாற்றிசை</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-900/60 dark:text-white/60">Naatrisai</span>
            </span>
          </Link>
          <nav className="ml-3 hidden items-center gap-0.5 lg:flex" aria-label={lang === "ta" ? "முதன்மை வழிசெலுத்தல்" : "Main"}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined} className={`${n.desktopOnly ? "hidden xl:inline-block" : ""} whitespace-nowrap rounded-full px-3 py-1.5 text-[14.5px] font-semibold transition ${active(n.href) ? "bg-kumkum-600 text-white shadow-sm shadow-kumkum-600/30" : "text-ink-900/75 hover:bg-kumkum-50 hover:text-kumkum-700 dark:text-white/75 dark:hover:bg-white/10"}`}>
                {t(n)}
              </Link>
            ))}
            <button onClick={() => setMore(true)} className="rounded-full px-3 py-1.5 text-[14.5px] font-semibold text-ink-900/75 hover:bg-kumkum-50 dark:text-white/75 dark:hover:bg-white/10" aria-haspopup="dialog">{lang === "ta" ? "மேலும் ▾" : "More ▾"}</button>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            {ready && streak > 1 && <span className="hidden rounded-full bg-manjal-300/40 px-2 py-1 text-xs font-bold text-ink-900 sm:inline dark:text-manjal-300" title={lang === "ta" ? "தொடர் வாசிப்பு நாட்கள்" : "Daily reading streak"}>🔥 {streak}</span>}
            <button onClick={() => window.dispatchEvent(new Event("ns:palette"))} data-palette-btn aria-label={lang === "ta" ? "விரைவுத் தேடல் (Ctrl+K)" : "Quick jump (Ctrl+K)"} title={lang === "ta" ? "விரைவுத் தேடல் (Ctrl/⌘ + K)" : "Quick jump (Ctrl/⌘ + K)"} className="grid h-9 w-9 place-items-center rounded-full text-[15px] font-black hover:bg-ink-100 dark:hover:bg-white/10">⌘</button>
            <Link href="/search" aria-label={lang === "ta" ? "தேடல்" : "Search"} className="hidden h-9 w-9 place-items-center sm:grid rounded-full hover:bg-ink-100 dark:hover:bg-white/10" title={lang === "ta" ? "தேடல் ( / )" : "Search ( / )"}>🔍</Link>
            <div className="flex rounded-full border border-ink-100 p-0.5 text-xs font-bold dark:border-white/10" role="group" aria-label="Language / மொழி">
              <button onClick={() => setLang("ta")} aria-pressed={lang === "ta"} className={`rounded-full px-2.5 py-1 transition ${lang === "ta" ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "opacity-70"}`}>தமிழ்</button>
              <button onClick={() => setLang("en")} aria-pressed={lang === "en"} className={`rounded-full px-2.5 py-1 transition ${lang === "en" ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "opacity-70"}`}>EN</button>
            </div>
            <ThemeButton ta={lang === "ta"} />
            <button onClick={() => setSettings(true)} aria-label={lang === "ta" ? "அமைப்புகள்" : "Settings"} className="grid h-9 w-9 place-items-center rounded-full text-lg transition hover:bg-ink-100 dark:hover:bg-white/10">⚙️</button>
          </div>
        </div>
        <div className="mx-auto hidden max-w-7xl items-center justify-between px-5 pb-1.5 text-xs text-ink-900/65 sm:flex dark:text-white/60">
          <span>{today}</span>
          <span><L ta="நாற்றிசைச் செய்திகளும் ஒரே இடத்தில்" en="News from all four directions, in one place" /></span>
        </div>
      </header>
      {/* Mobile bottom tab bar */}
      <nav aria-label={lang === "ta" ? "கீழ் வழிசெலுத்தல்" : "Tabs"} className="fx-hide-simple fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-ink-950/95">
        {NAV.filter((n) => !n.desktopOnly).map((n) => (
          <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined} className={`relative flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-semibold ${active(n.href) ? "text-kumkum-600 dark:text-manjal-400" : "text-ink-900/65 dark:text-white/60"}`}>
            <span className="text-lg leading-none" aria-hidden>{n.icon}</span>
            <span className="truncate">{t(n)}</span>
            {active(n.href) && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-kumkum-600 dark:bg-manjal-400" />}
          </Link>
        ))}
        <button onClick={() => setMore(true)} aria-haspopup="dialog" className="relative flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-semibold text-ink-900/65 dark:text-white/60">
          <span className="text-lg leading-none" aria-hidden>☰</span>
          <span>{lang === "ta" ? "மேலும்" : "More"}</span>
          {savedCount > 0 && <span className="absolute right-3 top-1 rounded-full bg-manjal-400 px-1 text-[9px] text-ink-900">{savedCount}</span>}
        </button>
      </nav>
      {more && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 backdrop-blur-[2px] sm:place-items-center" onClick={() => setMore(false)} role="dialog" aria-modal="true" aria-label={lang === "ta" ? "மேலும்" : "More"}>
          <div onClick={(e) => e.stopPropagation()} className="fade-up w-full max-w-lg rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl dark:bg-ink-900">
            <div className="mb-2 flex items-center justify-between"><b className="text-lg">{lang === "ta" ? "நாற்றிசையில் மேலும்" : "More in Naatrisai"}</b><button onClick={() => setMore(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink-100 dark:hover:bg-white/10" aria-label="Close">✕</button></div>
            <div className="grid grid-cols-3 gap-2">
              {MORE.map((m) => (
                <Link key={m.href} href={m.href} className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-center text-[13px] font-bold transition hover:-translate-y-0.5 ${active(m.href) ? "border-kumkum-600 bg-kumkum-50 dark:bg-white/10" : "border-ink-100 dark:border-white/10"}`}>
                  <span className="text-2xl" aria-hidden>{m.icon}</span>{t(m)}
                  {m.href === "/saved" && savedCount > 0 && <span className="rounded-full bg-manjal-400 px-1.5 text-[10px] text-ink-900">{savedCount}</span>}
                </Link>
              ))}
              <button onClick={() => { setMore(false); setSettings(true); }} className="flex flex-col items-center gap-1 rounded-2xl border border-ink-100 p-3 text-[13px] font-bold dark:border-white/10"><span className="text-2xl" aria-hidden>⚙️</span>{lang === "ta" ? "அமைப்புகள்" : "Settings"}</button>
              <button onClick={() => { setMore(false); window.dispatchEvent(new Event("ns:shortcuts")); }} className="flex flex-col items-center gap-1 rounded-2xl border border-ink-100 p-3 text-[13px] font-bold dark:border-white/10"><span className="text-2xl" aria-hidden>⌨️</span>{lang === "ta" ? "விசைக் குறுக்குவழிகள்" : "Shortcuts"}</button>
            </div>
          </div>
        </div>
      )}
      {settings && <SettingsPanel onClose={() => setSettings(false)} />}
    </>
  );
}
