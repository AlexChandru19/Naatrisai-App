import type { Article } from "./types";
import { sourceCount } from "./types";

// ---- Source credibility (editorial track record / original reporting). Unknown outlets get 0.6.
const CRED: [RegExp, number][] = [
  [/^(BBC|The Hindu|Indian Express|The Indian Express|Reuters|Associated Press|AP News|Al Jazeera|PTI|Press Trust)/i, 1],
  [/^(BBC தமிழ்|தினமணி|Dinamani|இந்து தமிழ்|Hindu Tamil)/i, 1],
  [/^(Times of India|The Times of India|NDTV|Hindustan Times|Mint|Livemint|The Economic Times|Economic Times|Deccan Herald|The Print|ThePrint|Scroll|The Wire|DT Next|Business Standard|Moneycontrol|ESPNcricinfo|India Today)/i, 0.85],
  [/^(தினத்தந்தி|Daily Thanthi|Dailythanthi|புதிய தலைமுறை|Puthiya Thalaimurai|விகடன்|Vikatan|Ananda Vikatan|தினமலர்|Dinamalar|Dinakaran|தினகரன்|News18|Sun News|Polimer|Kalaignar|Thanthi TV|நக்கீரன்|Nakkheeran|மாலை மலர்|Maalaimalar)/i, 0.8],
  [/^(Oneindia|Asianet|கல்கி|Kalki|Samayam|Zee|ABP|Republic|Webdunia|Lokmat|Manorama|Mathrubhumi)/i, 0.65],
];
export const credibility = (src: string) => CRED.find(([re]) => re.test(src.trim()))?.[1] ?? 0.6;

// ---- Topic importance: hard news up, soft news down.
const IMPORTANCE: Record<string, number> = { politics: 1, weather: 1, crime: 0.9, business: 0.85, education: 0.8, agriculture: 0.8, health: 0.75, science: 0.65, tech: 0.6, sports: 0.6, spiritual: 0.4, cinema: 0.4 };
const ALERT = /\b(cyclone|flood|floods|earthquake|landslide|tsunami|heavy rain|red alert|orange alert|evacuat\w*|death toll|killed|dead|died|explosion|blast|fire|collapse|derail\w*|crash|stampede|accident|curfew|strike|bandh|verdict|sentenced|supreme court|high court|government order|ordinance|bill passed|budget|repo rate|ceasefire|missile|war)\b|புயல்|வெள்ள|கனமழை|நிலநடுக்க|நிலச்சரிவு|எச்சரிக்கை|ரெட் அலர்ட்|ஆரஞ்சு அலர்ட்|உயிரிழ|பலி|விபத்து|தீ விபத்து|வெடி|கைது|தீர்ப்பு|உயர் நீதிமன்ற|உச்ச நீதிமன்ற|உயர்நீதிமன்ற|அரசாணை|அறிவிப்பு|சட்டப்பேரவை|சட்டமன்ற|வேலைநிறுத்த|மறியல்/i;

// ---- Soft / lifestyle / how-to / listicle / sponsored detection (title + URL path).
const SOFT_TITLE = /\b(recipes?|how to|tips|hacks?|horoscope|zodiac|astrology|tarot|numerology|gossip|in pics|in photos|photo gallery|web ?stor(y|ies)|viral video|goes viral|sponsored|partner content|advertorial|brand ?spotlight|discount|best .{0,40} under|top \d+ (\w+ )?(places|things|picks|cars|bikes|phones|smartphones|movies|films|songs|foods|destinations|ways|tips|stocks|apps|gadgets)|\d+ (ways|things|reasons|tips|foods|signs|habits|best)|weight loss|skin ?care|hair ?care|beauty|benefits of|lifestyle|fashion|celebrity|wordle|crossword|quiz)\b|ரெசிபி|சமையல்|செய்வது எப்படி|எப்படி செய்வது|இப்படி செய்து|இப்படி செஞ்சு|செஞ்சு பாருங்க|டிப்ஸ்|அழகு குறிப்பு|ராசி பலன்|ராசிபலன்|இன்றைய ராசி|ஜோதிட|பஞ்சாங்க|எடை குறைக்க|நன்மைகள்|வைரல்|கிசுகிசு|போட்டோஸ்|பிக் பாஸ்|டாப் \d+|ராசிக்கார|அதிர்ஷ்டம் பெறும்/i;
const SOFT_PATH = /\/(lifestyle|life-style|food|health-food|recipes?|astrology|horoscope|rasi-?palan|jothidam|photo-?gallery|photogallery|bigg-boss|auto|gadgets|web-?stories|webstories|visual-?stories|viral|trending|fashion|beauty|relationships?|brand-?(post|stories)|sponsored|spotlight|partner|shopping|deals|amp\/stories|religion\/astrology)(\/|$|-)/i;

// Celebrity gossip: entertainment items about weddings, romances, net worth, photo sets.
const GOSSIP = /\b(wedding|marriage|marries|engaged|divorce|dating|net worth|affair|photos|pics)\b|திருமண|கல்யாண|விவாகரத்து|காதல|மணந்தார்|மணம் முடி|கரம் பிடி|கரம்பிடி|சொத்து மதிப்பு|புகைப்பட|வசூல்/i;

export function isSoft(a: Pick<Article, "title" | "link"> & { topics?: string[] }) {
  let path = "";
  try { path = new URL(a.link).pathname; } catch {}
  if (SOFT_TITLE.test(a.title) || SOFT_PATH.test(path)) return true;
  const ent = a.topics?.includes("cinema") || /\/(cinema|entertainment|movies?)\//i.test(path);
  return !!ent && GOSSIP.test(a.title);
}

export function scoreArticle(a: Article, now = Date.now()): number {
  const ageH = a.publishedAt ? Math.max(0, (now - Date.parse(a.publishedAt)) / 3600e3) : 48;
  const recency = Math.exp(-ageH / 8); // ~8h decay; a day-old story keeps ~5%
  const coverage = Math.min(1, (sourceCount(a) - 1) / 3); // 4+ outlets = full marks
  const cred = Math.max(credibility(a.source), ...(a.cluster ?? []).map((c) => credibility(c.source)));
  let imp = a.topics.length ? Math.max(...a.topics.map((t) => IMPORTANCE[t] ?? 0.5)) : 0.5;
  if (ALERT.test(a.title)) imp = Math.min(1, imp + 0.3);
  let s = 0.4 * recency + 0.25 * coverage + 0.15 * cred + 0.2 * imp;
  if (a.soft) s *= 0.35;
  return Math.round(s * 1000) / 1000;
}

/**
 * Rank by score, then re-order the top of the list for diversity: each additional story from the
 * same outlet / same primary topic / same section in the head is penalised.
 */
export function rank(list: Article[], head = 90): Article[] {
  const now = Date.now();
  const scored = list.map((a) => ({ ...a, soft: a.soft ?? isSoft(a) })).map((a) => ({ ...a, score: scoreArticle(a, now) }));
  scored.sort((x, y) => (y.score ?? 0) - (x.score ?? 0));
  const pool = scored.slice(0, Math.min(scored.length, head * 2));
  const rest = scored.slice(pool.length);
  const out: Article[] = [];
  const src: Record<string, number> = {}, top: Record<string, number> = {}, sec: Record<string, number> = {};
  while (pool.length && out.length < head) {
    let bi = 0, bv = -Infinity;
    for (let i = 0; i < pool.length; i++) {
      const a = pool[i];
      const t = a.topics[0] ?? "none";
      const v = (a.score ?? 0) - 0.07 * (src[a.source] ?? 0) - 0.04 * (top[t] ?? 0) - 0.02 * (sec[a.section] ?? 0);
      if (v > bv) { bv = v; bi = i; }
    }
    const a = pool.splice(bi, 1)[0];
    src[a.source] = (src[a.source] ?? 0) + 1;
    const t = a.topics[0] ?? "none";
    top[t] = (top[t] ?? 0) + 1;
    sec[a.section] = (sec[a.section] ?? 0) + 1;
    out.push(a);
  }
  return [...out, ...pool, ...rest];
}

/** Lead + side stories: never soft, must have an image; side stories from distinct outlets and sections. */
export function pickLeads(ranked: Article[], opts: { sides?: number; preferTamil?: boolean } = {}) {
  const n = opts.sides ?? 4;
  const withImg = ranked.filter((a) => !a.soft && a.image);
  // Leads should be hard news: skip entertainment/spiritual-led items when anything else is available.
  const hard = withImg.filter((a) => !["cinema", "spiritual"].includes(a.topics[0] ?? ""));
  const eligible = hard.length >= 3 ? hard : withImg;
  if (!eligible.length) return { lead: undefined, side: [] as Article[] };
  let lead = eligible[0];
  if (opts.preferTamil) {
    const ta = eligible.slice(0, 8).find((a) => a.lang === "ta" && (a.score ?? 0) >= (lead.score ?? 0) * 0.85);
    if (ta) lead = ta;
  }
  const side: Article[] = [];
  const usedSrc = new Set([lead.source]);
  const usedSec = new Set([lead.section]);
  const usedTopic = new Set([lead.topics[0]]);
  const cands = eligible.filter((a) => a.id !== lead.id).slice(0, 40);
  const take = (pred: (a: Article) => boolean) => {
    for (const a of cands) {
      if (side.length >= n) return;
      if (side.includes(a) || usedSrc.has(a.source) || !pred(a)) continue;
      side.push(a); usedSrc.add(a.source); usedSec.add(a.section); if (a.topics[0]) usedTopic.add(a.topics[0]);
    }
  };
  take((a) => !usedSec.has(a.section)); // cover other sections first
  take((a) => !a.topics[0] || !usedTopic.has(a.topics[0]));
  take(() => true);
  return { lead, side };
}
