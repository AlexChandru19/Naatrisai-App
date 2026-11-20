import "server-only";
import type { Article } from "./types";
import { STATES, DISTRICTS } from "./geo";

/** TNPSC / UPSC current-affairs buckets. Keyword rules over the headline + feed snippet (no AI, no rewriting). */
export type Bucket = "polity" | "economy" | "science" | "environment" | "international" | "tamilnadu" | "sports";
export const BUCKETS: { key: Bucket; ta: string; en: string; emoji: string; re: RegExp }[] = [
  { key: "sports", ta: "விளையாட்டு & விருதுகள்", en: "Sports & awards", emoji: "🏅", re: /\b(award(ed|s)?|prize|medal|champion(ship)?s?|trophy|world cup|olympic|padma|nobel|booker|grandmaster|chess|wins? (gold|silver|bronze|title)|test series|odi|t20|hockey|badminton|cricket|tennis|football|kabaddi|athletics|squash)\b|விருது|பதக்கம்|சாம்பியன்|கோப்பை|ஒலிம்பிக்|கிராண்ட்மாஸ்டர்|சதுரங்க|ஹாக்கி|பாட்மிண்டன்|கிரிக்கெட்|டென்னிஸ்|கால்பந்து|கபடி/i },
  { key: "science", ta: "அறிவியல் & தொழில்நுட்பம்", en: "Science & tech", emoji: "🔬", re: /\b(isro|nasa|drdo|satellite|rocket|launch(ed)? (of|a)|space|gaganyaan|chandrayaan|aditya|missile|artificial intelligence|\bai\b|quantum|semiconductor|research(ers)?|scientists?|vaccine|genome|nuclear|supercomputer|5g|6g|cyber)\b|இஸ்ரோ|செயற்கைக்கோள்|விண்வெளி|ஏவுகணை|ஆராய்ச்சி|விஞ்ஞானி|தடுப்பூசி|செயற்கை நுண்ணறிவு/i },
  { key: "environment", ta: "சுற்றுச்சூழல் & புவியியல்", en: "Environment & geography", emoji: "🌿", re: /\b(climate|cyclone|monsoon|rainfall|flood(s|ing)?|earthquake|landslide|forest|wildlife|tiger|elephant|pollution|air quality|aqi|emissions?|biodiversity|imd|heatwave|glacier|ramsar|wetland|coral|cop\d+|drought|tsunami)\b|புயல்|பருவமழை|வெள்ளம்|வெள்ளப்|நிலநடுக்கம்|நிலச்சரிவு|காடு|வனவிலங்கு|புலி|யானை|மாசு|காலநிலை|வானிலை ஆய்வு|கனமழை/i },
  { key: "economy", ta: "பொருளாதாரம்", en: "Economy", emoji: "💹", re: /\b(rbi|gdp|inflation|budget|gst|repo|fiscal|exports?|imports?|trade deal|sebi|rupee|tax(es)?|economy|economic|msme|fdi|disinvestment|niti aayog|unemployment|iip|pmi)\b|ரிசர்வ் வங்கி|பணவீக்கம்|ஜிஎஸ்டி|பட்ஜெட்|ஏற்றுமதி|இறக்குமதி|பொருளாதார|வருமான வரி|வரி விதிப்பு/i },
  { key: "polity", ta: "அரசியலமைப்பு & ஆட்சி", en: "Polity & governance", emoji: "⚖️", re: /\b(parliament|lok sabha|rajya sabha|supreme court|high court|constitution(al)?|bill|act|ordinance|amendment|election commission|governor|president murmu|cabinet|ministry|scheme|yojana|panchayat|census|delimitation|lokpal|cag|upsc|tnpsc|policy|governance|judgment|verdict)\b|உச்ச நீதிமன்ற|உயர் நீதிமன்ற|நாடாளுமன்ற|மக்களவை|மாநிலங்களவை|மசோதா|அரசியலமைப்பு|தேர்தல் ஆணைய|ஆளுநர்|குடியரசுத் தலைவர்|அமைச்சரவை|திட்டம்|தீர்ப்பு|சட்டப்பேரவை/i },
  { key: "international", ta: "சர்வதேச உறவுகள்", en: "International relations", emoji: "🌐", re: /\b(united nations|\bun\b|summit|bilateral|g20|g7|brics|asean|sco|quad|treaty|foreign minister|external affairs|jaishankar|embassy|nato|ceasefire|sanctions|visit to|diplomat(ic)?|mou|agreement with|talks with)\b|ஐ\.?நா|உச்சி மாநாடு|ஒப்பந்தம்|வெளியுறவு|பேச்சுவார்த்தை|தூதர/i },
  { key: "tamilnadu", ta: "தமிழ்நாடு நடப்புகள்", en: "Tamil Nadu affairs", emoji: "🛕", re: /\b(tamil nadu government|tn government|chief minister|stalin|state government|assembly|tamil nadu)\b|தமிழக அரசு|தமிழ்நாடு அரசு|முதல்வர்|முதல்-அமைச்சர்|அமைச்சர்|அரசாணை|சட்டப்பேரவை/i },
];
// Crime, accidents, celebrity and opinion pieces are rarely syllabus material.
const SKIP = /\b(lottery|raids?|murder|arrested|rape|accident|killed in|dies|died|stabbed|robbery|actor|actress|film|movie|box office|trailer|bigg boss|horoscope|opinion|editorial)\b|கொலை|கைது|விபத்து|நடிகர்|நடிகை|திரைப்பட|ராசி பலன்|வீட்டில் சோதனை|ரெய்டு|லாட்டரி/i;

export type DigestItem = { a: Article; bucket: Bucket; point: string };
const firstSentence = (s: string) => { const t = s.replace(/\s+/g, " ").trim(); const m = t.match(/^(.{40,200}?[.!?।])(\s|$)/); return (m ? m[1] : t.slice(0, 180)).trim(); };

export function buildDigest(pool: Article[], max = 14): Record<Bucket, DigestItem[]> {
  const out = Object.fromEntries(BUCKETS.map((b) => [b.key, [] as DigestItem[]])) as Record<Bucket, DigestItem[]>;
  const fresh = pool.filter((a) => !a.soft && !a.topics.includes("cinema") && !a.topics.includes("crime") && !SKIP.test(a.title) && (!a.publishedAt || Date.now() - Date.parse(a.publishedAt) < 36 * 3600e3));
  for (const a of fresh) {
    const t = `${a.title} ${a.summary}`;
    let b = BUCKETS.find((x) => x.key !== "tamilnadu" && x.key !== "international" && x.re.test(t))?.key;
    if (!b && (a.section === "world" || BUCKETS[5].re.test(t))) b = "international";
    if (!b && (a.section === "tamilnadu" || a.districts.length) && BUCKETS[6].re.test(t)) b = "tamilnadu";
    if (!b || out[b].length >= max) continue;
    // Keep the TN bucket for TN stories, and drop TN-local items from the national buckets only if they're tiny.
    out[b].push({ a, bucket: b, point: a.summary && a.summary.length > 30 && !a.summary.startsWith(a.title.slice(0, 30)) ? firstSentence(a.summary) : "" });
  }
  return out;
}

// ---- Quiz: fill the masked name in a real headline ----
const COUNTRIES: [string, string][] = [["China", "சீனா"], ["Pakistan", "பாகிஸ்தான்"], ["Bangladesh", "வங்கதேச"], ["Sri Lanka", "இலங்கை"], ["Nepal", "நேபாள"], ["Russia", "ரஷ்ய"], ["Ukraine", "உக்ரைன்"], ["Israel", "இஸ்ரேல்"], ["Iran", "ஈரான்"], ["Japan", "ஜப்பான்"], ["Australia", "ஆஸ்திரேலிய"], ["France", "பிரான்ஸ்"], ["Germany", "ஜெர்மனி"], ["Canada", "கனடா"], ["Singapore", "சிங்கப்பூர்"], ["Malaysia", "மலேசிய"], ["Saudi Arabia", "சவுதி"], ["Afghanistan", "ஆப்கானிஸ்தான்"], ["Myanmar", "மியான்மர்"], ["Maldives", "மாலத்தீவு"], ["Bhutan", "பூடான்"], ["Brazil", "பிரேசில்"], ["Indonesia", "இந்தோனேசிய"], ["Gaza", "காசா"], ["Qatar", "கத்தார்"]];
const ORGS: [string, string][] = [["ISRO", "இஸ்ரோ"], ["RBI", "ரிசர்வ் வங்கி"], ["SEBI", "செபி"], ["NASA", "நாசா"], ["WHO", "உலக சுகாதார"], ["IMF", "சர்வதேச நாணய நிதி"], ["BRICS", "பிரிக்ஸ்"], ["G20", "ஜி20"], ["ASEAN", "ஆசியான்"], ["NATO", "நேட்டோ"], ["DRDO", "டிஆர்டிஓ"], ["BCCI", "பிசிசிஐ"], ["ICC", "ஐசிசி"], ["UNESCO", "யுனெஸ்கோ"], ["Election Commission", "தேர்தல் ஆணைய"], ["Supreme Court", "உச்ச நீதிமன்ற"], ["TNPSC", "டிஎன்பிஎஸ்சி"]];
type Ent = { en: string; ta: string; kind: "state" | "district" | "country" | "org" };
const ENTS: Ent[] = [
  ...STATES.filter((s) => s.slug !== "tamil-nadu").map((s) => ({ en: s.en, ta: s.ta, kind: "state" as const })),
  ...DISTRICTS.filter((d) => !d.ambiguous).map((d) => ({ en: d.en, ta: d.ta, kind: "district" as const })),
  ...COUNTRIES.map(([en, ta]) => ({ en, ta, kind: "country" as const })),
  ...ORGS.map(([en, ta]) => ({ en, ta, kind: "org" as const })),
];
export type QuizQ = { id: string; text: string; answer: string; options: string[]; source: string; link: string; kind: Ent["kind"] };
function rng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildQuiz(items: DigestItem[], day: string, n = 8): QuizQ[] {
  const r = rng([...day].reduce((s, c) => s * 31 + c.charCodeAt(0), 7) >>> 0);
  const qs: QuizQ[] = []; const usedAns = new Set<string>();
  for (const { a } of [...items].sort(() => r() - 0.5)) {
    if (qs.length >= n) break;
    const ta = a.lang === "ta";
    const hit = ENTS.find((e) => { const name = ta ? e.ta : e.en; return name.length >= 2 && (ta ? a.title.includes(name) : new RegExp(`\\b${esc(name)}\\b`).test(a.title)); });
    if (!hit) continue;
    const name = ta ? hit.ta : hit.en;
    if (usedAns.has(name)) continue;
    const pool = ENTS.filter((e) => e.kind === hit.kind && (ta ? e.ta : e.en) !== name && !a.title.includes(ta ? e.ta : e.en));
    if (pool.length < 3) continue;
    const wrong = [...pool].sort(() => r() - 0.5).slice(0, 3).map((e) => (ta ? e.ta : e.en));
    usedAns.add(name);
    const text = ta ? a.title.split(name).join("_____") : a.title.replace(new RegExp(`\\b${esc(name)}\\b`, "g"), "_____");
    qs.push({ id: a.id, text, answer: name, options: [...wrong, name].sort(() => r() - 0.5), source: a.source, link: a.link, kind: hit.kind });
  }
  return qs;
}
