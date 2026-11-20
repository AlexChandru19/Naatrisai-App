import * as A from "astronomy-engine";

/** Panchangam computed astronomically (astronomy-engine, Lahiri ayanamsa, Chennai). No external data. */
export const PLACE = { ta: "சென்னை", en: "Chennai", lat: 13.0827, lon: 80.2707 };
const TITHI_TA = ["பிரதமை", "துவிதியை", "திருதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி", "சப்தமி", "அஷ்டமி", "நவமி", "தசமி", "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்த்தசி"];
const TITHI_EN = ["Prathamai", "Dwitiyai", "Tritiyai", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dasami", "Ekadasi", "Dwadasi", "Trayodasi", "Chaturdasi"];
const NAK_TA = ["அஸ்வினி", "பரணி", "கிருத்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"];
const NAK_EN = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const YOGA_TA = ["விஷ்கம்பம்", "பிரீதி", "ஆயுஷ்மான்", "சௌபாக்கியம்", "சோபனம்", "அதிகண்டம்", "சுகர்மம்", "திருதி", "சூலம்", "கண்டம்", "விருத்தி", "துருவம்", "வியாகாதம்", "ஹர்ஷணம்", "வஜ்ரம்", "சித்தி", "வியதிபாதம்", "வரியான்", "பரிகம்", "சிவம்", "சித்தம்", "சாத்தியம்", "சுபம்", "சுப்பிரம்", "பிராம்மம்", "ஐந்திரம்", "வைதிருதி"];
const YOGA_EN = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
const KAR_TA = ["பவம்", "பாலவம்", "கௌலவம்", "தைதுலம்", "கரசை", "வணிசை", "பத்திரை (விஷ்டி)"], KAR_EN = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti (Bhadra)"];
const MONTH_TA = ["சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"];
const MONTH_EN = ["Chithirai", "Vaikasi", "Aani", "Aadi", "Aavani", "Purattasi", "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni"];
const YEARS_TA = ["பிரபவ", "விபவ", "சுக்ல", "பிரமோதூத", "பிரசோற்பத்தி", "ஆங்கீரச", "ஸ்ரீமுக", "பவ", "யுவ", "தாது", "ஈஸ்வர", "வெகுதானிய", "பிரமாதி", "விக்கிரம", "விஷு", "சித்திரபானு", "சுபானு", "தாரண", "பார்த்திப", "விய", "சர்வசித்து", "சர்வதாரி", "விரோதி", "விக்ருதி", "கர", "நந்தன", "விஜய", "ஜய", "மன்மத", "துன்முகி", "ஹேவிளம்பி", "விளம்பி", "விகாரி", "சார்வரி", "பிலவ", "சுபகிருது", "சோபகிருது", "குரோதி", "விசுவாவசு", "பராபவ", "பிலவங்க", "கீலக", "சௌமிய", "சாதாரண", "விரோதகிருது", "பரிதாபி", "பிரமாதீச", "ஆனந்த", "ராட்சச", "நள", "பிங்கள", "காளயுக்தி", "சித்தார்த்தி", "ரௌத்திரி", "துன்மதி", "துந்துபி", "ருத்ரோத்காரி", "ரக்தாட்சி", "குரோதன", "அட்சய"];
const WEEK_TA = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"];
// 1-based eighth-of-daytime segments, Sunday-first.
const RAHU = [8, 2, 7, 5, 6, 4, 3], YAMA = [5, 4, 3, 2, 1, 7, 6], KULI = [7, 6, 5, 4, 3, 2, 1];

const norm = (x: number) => ((x % 360) + 360) % 360;
const ayanamsa = (d: Date) => 23.8643 + ((d.getTime() / 864e5 + 2440587.5 - 2451545) / 365.25) * (50.2388 / 3600);
const sunLon = (d: Date) => A.SunPosition(d).elon;
const moonLon = (d: Date) => A.EclipticGeoMoon(d).lon;
const sid = (lon: number, d: Date) => norm(lon - ayanamsa(d));
const elong = (d: Date) => norm(moonLon(d) - sunLon(d));
const fns = {
  tithi: (d: Date) => Math.floor(elong(d) / 12),
  nak: (d: Date) => Math.floor(sid(moonLon(d), d) / (360 / 27)),
  yoga: (d: Date) => Math.floor(norm(sid(sunLon(d), d) + sid(moonLon(d), d)) / (360 / 27)),
  karana: (d: Date) => Math.floor(elong(d) / 6),
  sign: (d: Date) => Math.floor(sid(sunLon(d), d) / 30),
};
/** Next time (within `hours`) the index function changes value — 20-min steps, then bisection to ~1 min. */
function nextChange(f: (d: Date) => number, from: Date, hours = 36): Date | null {
  const v = f(from); let a = from.getTime();
  for (let t = a + 12e5; t <= a + hours * 36e5; t += 12e5) {
    if (f(new Date(t)) !== v) { let lo = t - 12e5, hi = t; while (hi - lo > 6e4) { const m = (lo + hi) / 2; if (f(new Date(m)) === v) lo = m; else hi = m; } return new Date(hi); }
    a = t;
  }
  return null;
}
function prevChange(f: (d: Date) => number, from: Date, days = 33): Date | null {
  const v = f(from);
  for (let t = from.getTime() - 216e5; t >= from.getTime() - days * 864e5; t -= 216e5) if (f(new Date(t)) !== v) return nextChange(f, new Date(t), 7);
  return null;
}
const istDay = (d: Date) => new Date(d.getTime() + 5.5 * 3600e3).toISOString().slice(0, 10);

export type Span = { from: string; to: string };
export function panchangam(dateIst: string) {
  const obs = new A.Observer(PLACE.lat, PLACE.lon, 6);
  const midnight = new Date(`${dateIst}T00:00:00+05:30`);
  const rise = A.SearchRiseSet(A.Body.Sun, obs, +1, midnight, 1)?.date ?? null;
  const set = A.SearchRiseSet(A.Body.Sun, obs, -1, midnight, 1)?.date ?? null;
  const moonrise = A.SearchRiseSet(A.Body.Moon, obs, +1, midnight, 1)?.date ?? null;
  const moonset = A.SearchRiseSet(A.Body.Moon, obs, -1, midnight, 1)?.date ?? null;
  const at = rise ?? new Date(midnight.getTime() + 6 * 36e5);
  const ti = fns.tithi(at), nk = fns.nak(at), yg = fns.yoga(at), kr = fns.karana(at);
  const paksha = ti < 15 ? { ta: "வளர்பிறை", en: "Shukla paksha (waxing)" } : { ta: "தேய்பிறை", en: "Krishna paksha (waning)" };
  const tName = (i: number) => (i === 14 ? { ta: "பௌர்ணமி", en: "Pournami (full moon)" } : i === 29 ? { ta: "அமாவாசை", en: "Amavasai (new moon)" } : { ta: TITHI_TA[i % 15], en: TITHI_EN[i % 15] });
  const kName = (k: number) => (k === 0 ? { ta: "கிம்ஸ்துக்னம்", en: "Kimstughna" } : k === 57 ? { ta: "சகுனி", en: "Shakuni" } : k === 58 ? { ta: "சதுஷ்பாதம்", en: "Chatushpada" } : k === 59 ? { ta: "நாகவம்", en: "Naga" } : { ta: KAR_TA[(k - 1) % 7], en: KAR_EN[(k - 1) % 7] });
  const eve = set ?? at; // Tamil solar month for the civil day is fixed at sunset
  const sign = fns.sign(eve);
  // Tamil solar date: month starts on the day of sankranti if it falls before sunset, else the next day.
  const sank = prevChange(fns.sign, eve);
  let day: number | null = null;
  if (sank) {
    const sd = istDay(sank); const sSet = A.SearchRiseSet(A.Body.Sun, obs, -1, new Date(`${sd}T00:00:00+05:30`), 1)?.date;
    const first = sSet && sank < sSet ? sd : istDay(new Date(new Date(`${sd}T12:00:00+05:30`).getTime() + 864e5));
    day = Math.round((Date.parse(dateIst) - Date.parse(first)) / 864e5) + 1;
  }
  // Tamil year (60-year cycle) begins at Chithirai 1 (~14 April); Prabhava began in 1987.
  const y = +dateIst.slice(0, 4); const yStart = +dateIst.slice(5, 7) <= 4 && sign !== 0 ? y - 1 : y; // Jan–early Apr belong to the previous Tamil year
  const cycle = (((yStart - 1987) % 60) + 60) % 60;
  const wd = new Date(`${dateIst}T12:00:00+05:30`).getUTCDay();
  const seg = (n: number): Span | null => { if (!rise || !set) return null; const len = (set.getTime() - rise.getTime()) / 8; return { from: new Date(rise.getTime() + (n - 1) * len).toISOString(), to: new Date(rise.getTime() + n * len).toISOString() }; };
  const iso = (d: Date | null) => (d ? d.toISOString() : null);
  return {
    date: dateIst, place: PLACE, weekday: { ta: WEEK_TA[wd], en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][wd] },
    sunrise: iso(rise), sunset: iso(set), moonrise: iso(moonrise), moonset: iso(moonset),
    tamil: { month: { ta: MONTH_TA[sign], en: MONTH_EN[sign] }, day, year: { ta: YEARS_TA[cycle], idx: cycle + 1 } },
    paksha,
    tithi: { ...tName(ti), ends: iso(nextChange(fns.tithi, at)), next: tName((ti + 1) % 30) },
    nakshatra: { ta: NAK_TA[nk], en: NAK_EN[nk], ends: iso(nextChange(fns.nak, at)), next: { ta: NAK_TA[(nk + 1) % 27], en: NAK_EN[(nk + 1) % 27] } },
    yoga: { ta: YOGA_TA[yg], en: YOGA_EN[yg], ends: iso(nextChange(fns.yoga, at)), next: { ta: YOGA_TA[(yg + 1) % 27], en: YOGA_EN[(yg + 1) % 27] } },
    karana: { ...kName(kr), ends: iso(nextChange(fns.karana, at)) },
    rahu: seg(RAHU[wd]), yama: seg(YAMA[wd]), kuligai: seg(KULI[wd]),
    moonPhase: A.MoonPhase(at),
  };
}
export type Panchangam = ReturnType<typeof panchangam>;
