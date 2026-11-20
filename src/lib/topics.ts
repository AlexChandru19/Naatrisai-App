export type Topic = { slug: string; en: string; ta: string; emoji: string; color: string; kw: string[]; neg?: string[]; gnTopic?: string; gnQuery?: string; gnQueryTa?: string };

// Rule-based keyword classifier (English + Tamil). Lower-cased matching.
export const TOPICS: Topic[] = [
  { slug: "politics", en: "Politics", ta: "அரசியல்", emoji: "🏛️", color: "#e11d48", gnQuery: "Tamil Nadu politics", gnQueryTa: "அரசியல்",
    kw: ["election", "minister", "bjp", "congress", "dmk", "aiadmk", "tvk", "assembly", "parliament", "lok sabha", "rajya sabha", "chief minister", "governor", "mla", " mp ", "poll", "vote", "opposition", "அரசியல்", "தேர்தல்", "அமைச்சர்", "முதல்வர்", "முதல்-அமைச்சர்", "திமுக", "அதிமுக", "தவெக", "பாஜக", "காங்கிரஸ்", "சட்டப்பேரவை", "சட்டசபை", "ஆளுநர்", "ஆளுநா்", "எம்எல்ஏ", "வாக்குப்பதிவு", "வாக்காளர்", "கட்சி", "பிரதமர்", "ஸ்டாலின்", "விஜய்", "சீமான்", "அண்ணாமலை", "எடப்பாடி"] },
  { slug: "business", en: "Business", ta: "வணிகம்", emoji: "💹", color: "#059669", gnTopic: "BUSINESS",
    kw: ["market", "sensex", "nifty", "stock", "~shares", "rbi", "gdp", "economy", "inflation", "bank", "rupee", "investment", "startup", "ipo", "tax", "gst", "budget", "trade", "gold price", "silver price", "fuel price", "petrol price", "வணிகம்", "பங்குச்சந்தை", "சென்செக்ஸ்", "நிஃப்டி", "தங்கம் விலை", "தங்கத்தின் விலை", "வெள்ளி விலை", "பொருளாதாரம்", "வங்கி", "முதலீடு", "ஜிஎஸ்டி", "வருமான வரி", "பட்ஜெட்", "~விலை", "~ரூபாய்", "தொழில் முதலீ", "தொழிற்சாலை"] },
  { slug: "sports", en: "Sports", ta: "விளையாட்டு", emoji: "🏏", color: "#2563eb", gnTopic: "SPORTS",
    kw: ["cricket", "ipl", "test match", "odi", "t20", "football", "hockey", "kabaddi", "chess", "tennis", "olympic", "fifa", "wicket", "~century", "kohli", "rohit", "dhoni", "csk", "world cup", "badminton", "athlet*", "விளையாட்டு", "கிரிக்கெட்", "ஐபிஎல்", "கால்பந்து", "ஹாக்கி", "கபடி", "செஸ்", "சதுரங்க", "டென்னிஸ்", "ஒலிம்பிக்", "உலகக் கோப்பை", "உலகக்கோப்பை", "விக்கெட்", "தோனி", "கோலி", "~போட்டியில் வென்ற", "டெஸ்ட் போட்டி"] },
  { slug: "cinema", en: "Cinema", ta: "சினிமா", emoji: "🎬", color: "#9333ea", gnTopic: "ENTERTAINMENT",
    kw: ["film", "movie", "actor", "actress", "kollywood", "bollywood", "box office", "trailer", "teaser", "~director", "ott", "netflix", "music director", "celebrity", "cinema", "சினிமா", "திரைப்படம்", "திரைப்பட", "நடிகர்", "நடிகை", "இயக்குநர்", "இயக்குனர்", "டிரைலர்", "டீசர்", "பாடல்", "இசையமைப்பாளர்", "ரஜினி", "கமல்ஹாசன்", "~அஜித்", "~சூர்யா", "தனுஷ்", "அனிருத்", "பிக் பாஸ்", "ஓடிடி"] },
  { slug: "tech", en: "Tech", ta: "தொழில்நுட்பம்", emoji: "💻", color: "#0891b2", gnTopic: "TECHNOLOGY",
    kw: ["tech", "technology", "ai", "artificial intelligence", "smartphone", "iphone", "android", "google", "iphone maker", "microsoft", "openai", "software", "app", "cyber", "isro", "satellite", "chip", "semiconductor", "5g", "internet", "தொழில்நுட்பம்", "செயற்கை நுண்ணறிவு", "ஸ்மார்ட்போன்", "மொபைல்", "இஸ்ரோ", "செயற்கைக்கோள்", "இணைய", "சைபர்", "ஏஐ"] },
  { slug: "education", en: "Education & Jobs", ta: "கல்வி & வேலை", emoji: "🎓", color: "#d97706", gnQuery: "education exam results India", gnQueryTa: "கல்வி தேர்வு",
    kw: ["school", "college", "university", "exam", "neet", "jee", "tnpsc", "upsc", "exam result", "students", "teacher", "admission", "scholarship", "recruitment", "jobs", "job fair", "vacancy", "கல்வி", "பள்ளி", "கல்லூரி", "பல்கலைக்கழக", "~தேர்வு", "தேர்வு முடிவு", "மாணவர்", "மாணவி", "ஆசிரியர்", "நீட்", "டிஎன்பிஎஸ்சி", "தேர்ச்சி", "வேலைவாய்ப்பு", "பணியிட", "சேர்க்கை"] },
  { slug: "health", en: "Health", ta: "உடல்நலம்", emoji: "🩺", color: "#16a34a", gnTopic: "HEALTH",
    kw: ["health", "hospital", "doctor", "disease", "virus", "covid", "dengue", "cancer", "vaccine", "medical", "patients", "diabetes", "fever", "உடல்நலம்", "மருத்துவ", "மருத்துவமனை", "டாக்டர்", "நோய்", "காய்ச்சல்", "டெங்கு", "புற்றுநோய்", "தடுப்பூசி", "சிகிச்சை", "நோயாளி", "ஆரோக்கிய"] },
  { slug: "crime", en: "Crime & Courts", ta: "குற்றம் & நீதிமன்றம்", emoji: "⚖️", color: "#475569", gnQuery: "Tamil Nadu police court", gnQueryTa: "நீதிமன்றம் காவல்துறை",
    kw: ["police", "arrest", "murder", "court", "high court", "supreme court", "verdict", "bail", "fraud", "theft", "crime", "killed", "accused", "காவல்", "போலீஸ்", "கைது", "கொலை", "நீதிமன்ற", "உயர் நீதிமன்ற", "உச்ச நீதிமன்ற", "ஜாமீன்", "மோசடி", "திருட்டு", "வழக்கில்", "வழக்குப்பதிவு", "குற்றவாளி", "சிறை", "தீர்ப்பு"] },
  { slug: "weather", en: "Weather & Environment", ta: "வானிலை & சூழல்", emoji: "🌦️", color: "#0284c7", gnQuery: "Tamil Nadu rain weather IMD", gnQueryTa: "மழை வானிலை",
    kw: ["rain", "cyclone", "monsoon", "weather", "flood", "imd", "heatwave", "storm", "climate change", "earthquake", "pollution", "wildlife", "forest", "மழை", "புயல்", "வானிலை", "பருவமழை", "வெள்ள", "வெயில்", "காற்றழுத்த", "நிலநடுக்க", "சுற்றுச்சூழல்", "வனத்துறை", "யானை", "காற்று மாசு"] },
  { slug: "agriculture", en: "Agriculture", ta: "விவசாயம்", emoji: "🌾", color: "#65a30d", gnQuery: "farmers agriculture India", gnQueryTa: "விவசாயிகள்",
    kw: ["farmer", "agricultur*", "crop", "paddy", "harvest", "fertiliser", "fertilizer", "irrigation", "cauvery", "mettur dam", "விவசாய", "விவசாயிகள்", "நெல் கொள்முதல்", "நெற்பயிர்", "பயிர்", "அறுவடை", "உரம்", "காவிரி", "அணையின்", "நீர்வரத்து", "பாசன", "கொள்முதல்"] },
  { slug: "spiritual", en: "Spiritual & Culture", ta: "ஆன்மிகம் & பண்பாடு", emoji: "🪔", color: "#ea580c", gnQueryTa: "கோவில் திருவிழா",
    kw: ["temple", "festival", "pongal", "deepavali", "diwali", "church", "mosque", "pilgrim", "culture", "heritage", "கோவில்", "கோயில்", "திருவிழா", "ஆன்மிக", "பொங்கல்", "தீபாவளி", "பக்தர்", "சஷ்டி", "கும்பாபிஷேக", "தேவாலய", "பள்ளிவாசல்", "~முருகன்", "பண்பாடு", "கலாச்சார"] },
  { slug: "science", en: "Science", ta: "அறிவியல்", emoji: "🔭", color: "#7c3aed", gnTopic: "SCIENCE",
    kw: ["science", "nasa", "space", "research", "scientist", "study finds", "planet", "lunar", "அறிவியல்", "விண்வெளி", "ஆராய்ச்சி", "விஞ்ஞானி", "நாசா", "சந்திரயான்", "கோள்களை"] },
];

// Negative keywords: if any appears in the TITLE, that topic is not assigned.
const NEG: Record<string, string[]> = {
  business: ["medal", "பதக்கம்", "olympic"],
  weather: ["box office", "film", "movie", "trailer", "திரைப்பட"],
  sports: ["election", "தேர்தல்", "stock market", "sensex"],
  crime: ["cricket", "கிரிக்கெட்"],
  politics: ["recipe", "ரெசிபி", "box office"],
  health: ["recipe", "ரெசிபி"],
  tech: ["box office"],
};
// URL path hints from publishers' own section names are strong evidence.
const PATH_HINTS: [RegExp, string][] = [
  [/\/(sport|sports|cricket|football|tennis)\//, "sports"],
  [/\/(cinema|entertainment|movies?|kollywood|bollywood|ott)\//, "cinema"],
  [/\/(business|economy|markets?|money|finance)\//, "business"],
  [/\/(technology|tech|gadgets|sci-tech\/technology)\//, "tech"],
  [/\/(science|sci-tech\/science)\//, "science"],
  [/\/(politics|elections?)\//, "politics"],
  [/\/(education|careers?|jobs)\//, "education"],
  [/\/health\//, "health"],
  [/\/(crime|court|courts)\//, "crime"],
  [/\/(agriculture|agri)\//, "agriculture"],
  [/\/(weather|environment)\//, "weather"],
  [/\/(spiritual|devotional|temples?|religion)\//, "spiritual"],
];

const PRIORITY = ["weather", "politics", "crime", "business", "agriculture", "education", "health", "science", "tech", "sports", "spiritual", "cinema"];
type Kw = { re?: RegExp; ta?: string; w: number };
const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isTa = (x: string) => /[\u0B80-\u0BFF]/.test(x);
function compile(k: string): Kw {
  let w = 1;
  if (k.startsWith("~")) { w = 0.5; k = k.slice(1); }
  k = k.trim().toLowerCase();
  if (isTa(k)) return { ta: k, w };
  const wild = k.endsWith("*");
  const body = esc(wild ? k.slice(0, -1) : k).replace(/\s+/g, "\\s+");
  // Word boundaries on both sides; allow simple plurals (s/es) unless wildcard.
  return { re: new RegExp(`\\b${body}${wild ? "\\w*" : "(?:s|es)?\\b"}`, "i"), w };
}
const COMPILED = TOPICS.map((t) => ({ slug: t.slug, kws: t.kw.map(compile), neg: (NEG[t.slug] ?? []).map(compile) }));
const hit = (k: Kw, txt: string) => (k.ta ? txt.includes(k.ta) : k.re!.test(txt));

/**
 * Weighted topic classifier. Title hits weigh 3x, summary/keyword hits 1x, URL section hints +4.
 * A topic needs a score >= 2.5 (i.e. at least one title hit, or several body hits). Returns the
 * strongest topic first; a second topic only if it is nearly as strong.
 */
export function classifyTopics(title: string, body = "", url = ""): string[] {
  const t = title.toLowerCase(), b = body.toLowerCase();
  let path = "";
  try { path = new URL(url).pathname.toLowerCase() + "/"; } catch {}
  const scored: [string, number][] = [];
  for (const c of COMPILED) {
    if (c.neg.some((k) => hit(k, t))) continue;
    let s = 0;
    for (const k of c.kws) {
      if (hit(k, t)) s += 3 * k.w;
      else if (b && hit(k, b)) s += 1 * k.w;
    }
    for (const [re, slug] of PATH_HINTS) if (slug === c.slug && re.test(path)) s += 4;
    if (s >= 2.5) scored.push([c.slug, s]);
  }
  // Strongest first; ties go to the harder-news topic.
  scored.sort((x, y) => y[1] - x[1] || (PRIORITY.indexOf(x[0]) - PRIORITY.indexOf(y[0])));
  if (!scored.length) return [];
  const out = [scored[0][0]];
  if (scored[1] && scored[1][1] >= Math.max(3, scored[0][1] * 0.7)) out.push(scored[1][0]);
  return out;
}
