import type { Article } from "./types";
import { sourceKey } from "./types";

export type Trend = { term: string; count: number; sources: number; lang: "ta" | "en" };

const EN_STOP = new Set("The A An And Of In On At To For With From By As After Over Into Its It This That Says Said Will New How Why What Who When Where Is Are Was Were Be Has Have Had Not No More Than Up Down Out Off Amid Live Updates Today News Video Watch Top India Indian Here Day Year Govt Government Police Court State Minister Chief CM PM Man Woman Two Three One First Last Big Report Day's Can May Could Would Should Over Under Against Before During Now Get Set Make Takes Gets Says' Mr Ms Dr".split(" "));
const TA_STOP = new Set("மற்றும் இந்த அந்த ஒரு என்ன எப்படி ஏன் எந்த இது அது என்று என்ற உள்ள உள்ளது இல்லை வேண்டும் முதல் பற்றி மூலம் மீது பின் பிறகு வரை தான் மேலும் புதிய அரசு செய்திகள் செய்தி இன்று நாளை நேற்று பெரிய அதிக மிக போது மட்டும் கூட இருந்து குறித்து தொடர்ந்து அறிவிப்பு எதிராக முக்கிய இருக்கும் வந்த வரும் செய்த கொண்டு உடன் அதிகாரிகள் மக்கள் பேர் லட்சம் கோடி ஆண்டு நிலையில் தமிழக தமிழ்நாடு தமிழ்நாட்டில் இந்தியா இந்திய அடுத்த மீண்டும் பின்னர் வருகிறது வருகின்றன உள்ளன இருக்கிறது செய்யும் செய்து இல்லாத அனைத்து எல்லா புதிதாக பெற வழங்க தொடர்பாக காரணமாக அதிர்ச்சி முழு விவரம் விவரம் லைவ் வீடியோ".split(" "));

// Strip common Tamil case endings so "சென்னையில்", "சென்னைக்கு" count with "சென்னை".
const taStem = (w: string) => {
  for (const suf of ["த்தில்", "க்கு", "யில்", "வில்", "இல்", "ின்", "ில்", "ிற்கு", "ுக்கு", "யை", "வை", "ஐ", "ால்", "ுடன்", "ும்"]) {
    if (w.endsWith(suf) && [...w].length - [...suf].length >= 3) return w.slice(0, w.length - suf.length);
  }
  return w;
};

/** Most-mentioned names and words in recent headlines, counted by distinct outlet. */
export function trending(list: Article[], hours = 18, max = 24): Trend[] {
  const cutoff = Date.now() - hours * 3600_000;
  const m = new Map<string, { term: string; n: number; src: Set<string>; lang: "ta" | "en"; forms: Map<string, number> }>();
  const add = (key: string, form: string, lang: "ta" | "en", src: string) => {
    let e = m.get(key);
    if (!e) { e = { term: form, n: 0, src: new Set(), lang, forms: new Map() }; m.set(key, e); }
    e.n++; e.src.add(src); e.forms.set(form, (e.forms.get(form) ?? 0) + 1);
  };
  for (const a of list) {
    if (a.soft || (a.publishedAt && Date.parse(a.publishedAt) < cutoff)) continue;
    const src = sourceKey(a.source);
    const seen = new Set<string>();
    // English proper-noun phrases: runs of Capitalised words (allowing "of", "de").
    for (const mm of a.title.matchAll(/\b([A-Z][a-zA-Z'’.-]{1,}(?:\s+(?:of\s+|de\s+)?[A-Z][a-zA-Z'’.-]{1,}){0,3})/g)) {
      const words = mm[1].replace(/['’]s$/, "").split(/\s+/).filter((w) => !EN_STOP.has(w));
      if (!words.length) continue;
      const phrase = words.join(" ");
      if (phrase.length < 3 || /^[A-Z]{1,2}$/.test(phrase)) continue;
      const key = "en:" + phrase.toLowerCase();
      if (!seen.has(key)) { seen.add(key); add(key, phrase, "en", src); }
    }
    for (const w of a.title.split(/[^\u0B80-\u0BFF]+/)) {
      if ([...w].length < 3 || TA_STOP.has(w)) continue;
      const st = taStem(w);
      if (TA_STOP.has(st) || [...st].length < 3) continue;
      const key = "ta:" + st;
      if (!seen.has(key)) { seen.add(key); add(key, w, "ta", src); }
    }
  }
  return [...m.values()]
    .filter((e) => e.src.size >= 2 && e.n >= 3)
    .map((e) => ({ term: [...e.forms.entries()].sort((a, b) => b[1] - a[1])[0][0], count: e.n, sources: e.src.size, lang: e.lang }))
    .sort((a, b) => b.sources * 2 + b.count - (a.sources * 2 + a.count))
    .slice(0, max);
}
