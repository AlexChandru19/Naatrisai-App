export type Lang = "ta" | "en";
export type Section = "tamilnadu" | "india" | "world";
export type FeedDef = { id: string; url: string; source: string; lang: Lang; section: Section; weight?: number };

const GN = "https://news.google.com/rss";
export const gnSearch = (q: string, lang: Lang) =>
  lang === "ta"
    ? `${GN}/search?q=${encodeURIComponent(q)}&hl=ta&gl=IN&ceid=IN:ta`
    : `${GN}/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
export const gnTopic = (topic: string, lang: Lang) =>
  lang === "ta"
    ? `${GN}/headlines/section/topic/${topic}?hl=ta&gl=IN&ceid=IN:ta`
    : `${GN}/headlines/section/topic/${topic}?hl=en-IN&gl=IN&ceid=IN:en`;

// Every URL here was verified to return items (Nov 2026). Dead feeds (Hindu Tamil, News18 Tamil,
// Samayam, Zee Tamil, IE Tamil, Dinamalar, Maalaimalar) were dropped.
export const FEEDS: FeedDef[] = [
  // Tamil-language, Tamil Nadu focused
  { id: "dinamani", url: "https://www.dinamani.com/stories.rss", source: "தினமணி", lang: "ta", section: "tamilnadu" },
  { id: "dailythanthi", url: "https://www.dailythanthi.com/stories.rss", source: "தினத்தந்தி", lang: "ta", section: "tamilnadu" },
  { id: "bbctamil", url: "https://feeds.bbci.co.uk/tamil/rss.xml", source: "BBC தமிழ்", lang: "ta", section: "tamilnadu" },
  { id: "vikatan", url: "https://www.vikatan.com/stories.rss", source: "விகடன்", lang: "ta", section: "tamilnadu" },
  { id: "oneindia", url: "https://tamil.oneindia.com/rss/feeds/tamil-news-fb.xml", source: "Oneindia தமிழ்", lang: "ta", section: "tamilnadu" },
  { id: "asianet", url: "https://tamil.asianetnews.com/rss", source: "Asianet தமிழ்", lang: "ta", section: "tamilnadu" },
  { id: "pt", url: "https://www.puthiyathalaimurai.com/stories.rss", source: "புதிய தலைமுறை", lang: "ta", section: "tamilnadu" },
  { id: "kalki", url: "https://kalkionline.com/stories.rss", source: "கல்கி", lang: "ta", section: "tamilnadu" },
  { id: "gn-ta", url: "https://news.google.com/rss?hl=ta&gl=IN&ceid=IN:ta", source: "Google செய்திகள்", lang: "ta", section: "tamilnadu" },
  // English, Tamil Nadu
  { id: "hindu-tn", url: "https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss", source: "The Hindu", lang: "en", section: "tamilnadu" },
  { id: "toi-chennai", url: "https://timesofindia.indiatimes.com/rssfeeds/2950623.cms", source: "Times of India", lang: "en", section: "tamilnadu" },
  { id: "toi-coimbatore", url: "https://timesofindia.indiatimes.com/rssfeeds/7503091.cms", source: "Times of India", lang: "en", section: "tamilnadu" },
  { id: "toi-madurai", url: "https://timesofindia.indiatimes.com/rssfeeds/3942693.cms", source: "Times of India", lang: "en", section: "tamilnadu" },
  // India
  { id: "hindu-nat", url: "https://www.thehindu.com/news/national/feeder/default.rss", source: "The Hindu", lang: "en", section: "india" },
  { id: "ie-india", url: "https://indianexpress.com/section/india/feed/", source: "Indian Express", lang: "en", section: "india" },
  { id: "ndtv-india", url: "https://feeds.feedburner.com/ndtvnews-india-news", source: "NDTV", lang: "en", section: "india" },
  { id: "toi-india", url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms", source: "Times of India", lang: "en", section: "india" },
  { id: "ndtv-top", url: "https://feeds.feedburner.com/ndtvnews-top-stories", source: "NDTV", lang: "en", section: "india" },
  // World
  { id: "bbc-world", url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC News", lang: "en", section: "world" },
  { id: "aljazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera", lang: "en", section: "world" },
  { id: "hindu-intl", url: "https://www.thehindu.com/news/international/feeder/default.rss", source: "The Hindu", lang: "en", section: "world" },
  { id: "gn-world", url: gnTopic("WORLD", "en"), source: "Google News", lang: "en", section: "world" },
  { id: "gn-world-ta", url: gnTopic("WORLD", "ta"), source: "Google செய்திகள்", lang: "ta", section: "world" },
];

export const SECTION_FEEDS = (s: Section) => FEEDS.filter((f) => f.section === s);

export const TOPIC_EXTRA_FEEDS: Record<string, { url: string; source: string; lang: Lang }[]> = {
  business: [{ url: "https://www.thehindu.com/business/feeder/default.rss", source: "The Hindu", lang: "en" }],
  sports: [{ url: "https://www.thehindu.com/sport/feeder/default.rss", source: "The Hindu", lang: "en" }],
  cinema: [{ url: "https://www.thehindu.com/entertainment/feeder/default.rss", source: "The Hindu", lang: "en" }],
  tech: [{ url: "https://www.thehindu.com/sci-tech/feeder/default.rss", source: "The Hindu", lang: "en" }],
  science: [{ url: "https://www.thehindu.com/sci-tech/feeder/default.rss", source: "The Hindu", lang: "en" }],
};
