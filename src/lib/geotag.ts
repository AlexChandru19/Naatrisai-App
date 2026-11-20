import { DISTRICTS, STATES } from "./geo";

const isTamil = (s: string) => /[\u0B80-\u0BFF]/.test(s);
// Tamil nouns inflect (சேலம் → சேலத்தில், கரூர் → கரூரில்), so match a stem: drop a final ம் or
// a final virama/u-sign, but only if the stem stays >= 4 code points to avoid tiny, ambiguous stems.
function taStem(k: string) {
  let s = k;
  if (s.endsWith("ம்")) s = s.slice(0, -2);
  else if (/[\u0BCD\u0BC1]$/.test(s)) s = s.slice(0, -1);
  return [...s].length >= 4 ? s : k;
}
const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
type Item = { slug: string; en: string; ta: string; alt: string[]; ex?: string[]; ambiguous?: boolean };
type Matcher = { slug: string; ta: string[]; en: RegExp | null; ex: string[]; ambiguous: boolean };
function build(items: Item[]): Matcher[] {
  return items.map((d) => {
    const all = [d.en, d.ta, ...d.alt];
    const en = all.filter((x) => !isTamil(x)).map(esc);
    return {
      slug: d.slug,
      ta: all.filter(isTamil).map(taStem),
      // Proper nouns: case-sensitive and word-bounded ("Erode" the city, not "erode" the verb).
      en: en.length ? new RegExp(`(?<![\\p{L}])(${en.join("|")})(?![\\p{L}])`, "u") : null,
      ex: d.ex ?? [],
      ambiguous: !!d.ambiguous,
    };
  });
}
const DIST = build(DISTRICTS);
const STATE = build(STATES);
const TN_CONTEXT = /Tamil Nadu|\bTN\b|Chennai|Coimbatore|Madurai|Tiruchi|Trichy|Kongu|Cauvery|DMK|AIADMK|TVK|[\u0B80-\u0BFF]/;

function run(ms: Matcher[], title: string, body: string, tnContext: boolean): string[] {
  const scored: [string, number][] = [];
  for (const m of ms) {
    let t = title, b = body;
    for (const e of m.ex) { t = t.split(e).join(" "); b = b.split(e).join(" "); }
    const inTitleTa = m.ta.some((k) => t.includes(k));
    const inBodyTa = m.ta.some((k) => b.includes(k));
    const inTitleEn = !!m.en && m.en.test(t);
    const inBodyEn = !!m.en && m.en.test(b);
    // Ambiguous English names (Salem, Erode, Karur, Tirupathur) need Tamil Nadu context.
    const enOk = !m.ambiguous || tnContext;
    const s = (inTitleTa ? 3 : 0) + (inTitleEn && enOk ? 3 : 0) + (inBodyTa ? 1 : 0) + (inBodyEn && enOk ? 1 : 0);
    if (s > 0) scored.push([m.slug, s]);
  }
  scored.sort((a, b) => b[1] - a[1]);
  // Keep title mentions, plus body-only mentions when there are few places (avoid "list of 10 districts" noise).
  const titled = scored.filter((x) => x[1] >= 3);
  return (titled.length ? titled : scored.length <= 2 ? scored : []).slice(0, 3).map((x) => x[0]);
}

export function tagDistricts(title: string, body: string, section: string) {
  const ctx = section === "tamilnadu" || TN_CONTEXT.test(`${title} ${body}`);
  return run(DIST, title, body, ctx);
}
export function tagStates(title: string, body: string) {
  return run(STATE, title, body, true);
}
