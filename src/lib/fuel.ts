import "server-only";
import { page, tables, num } from "./html-table";
import { STATES } from "./geo";

export type FuelCity = { city: string; ta: string; group: "metro" | "tn" | "state"; petrol?: number; diesel?: number; pCh?: number; dCh?: number };
export type Fuel = { cities: FuelCity[]; date: string | null; fetchedAt: string };

const GR = "https://www.goodreturns.in";
const REVAL = 3600; // pump prices are revised once a day (6 AM); hourly re-check is plenty
const TA: Record<string, string> = {
  "New Delhi": "புது டெல்லி", Kolkata: "கொல்கத்தா", Mumbai: "மும்பை", Chennai: "சென்னை", Gurgaon: "குருகிராம்", Noida: "நொய்டா", Bangalore: "பெங்களூரு",
  Bhubaneswar: "புவனேஸ்வர்", Chandigarh: "சண்டிகர்", Hyderabad: "ஹைதராபாத்", Jaipur: "ஜெய்ப்பூர்", Lucknow: "லக்னோ", Patna: "பாட்னா", Thiruvananthapuram: "திருவனந்தபுரம்",
  Ariyalur: "அரியலூர்", Chengalpattu: "செங்கல்பட்டு", Coimbatore: "கோயம்புத்தூர்", Cuddalore: "கடலூர்", Dharmapuri: "தருமபுரி", Dindigul: "திண்டுக்கல்", Erode: "ஈரோடு",
  Kallakurichi: "கள்ளக்குறிச்சி", Kanchipuram: "காஞ்சிபுரம்", Kanniyakumari: "கன்னியாகுமரி", Karur: "கரூர்", Krishnagiri: "கிருஷ்ணகிரி", Madurai: "மதுரை",
  Mayiladuthurai: "மயிலாடுதுறை", Nagapattinam: "நாகப்பட்டினம்", Namakkal: "நாமக்கல்", Nilgiris: "நீலகிரி", Perambalur: "பெரம்பலூர்", Pudukkottai: "புதுக்கோட்டை",
  Ramanathapuram: "ராமநாதபுரம்", Ranipet: "ராணிப்பேட்டை", Salem: "சேலம்", Sivaganga: "சிவகங்கை", Teni: "தேனி", Tenkasi: "தென்காசி", Thanjavur: "தஞ்சாவூர்",
  Thiruvarur: "திருவாரூர்", Tiruchchirappalli: "திருச்சிராப்பள்ளி", Tirunelveli: "திருநெல்வேலி", Tirupathur: "திருப்பத்தூர்", Tirupur: "திருப்பூர்", Tiruvallur: "திருவள்ளூர்",
  Tiruvannamalai: "திருவண்ணாமலை", Tuticorin: "தூத்துக்குடி", Vellore: "வேலூர்", Viluppuram: "விழுப்புரம்", Virudunagar: "விருதுநகர்",
};
const ok = (n: number) => Number.isFinite(n) && n > 40 && n < 250; // ₹/litre sanity bounds

function rows(html: string | null, head: string) {
  if (!html) return [] as { name: string; price: number; ch: number }[];
  return tables(html).filter((t) => t[0]?.[0] === head || (head === "City" && t[0]?.length === 3 && /^₹/.test(t[0][1] ?? "")))
    .flatMap((t) => t).filter((r) => r.length === 3 && /^₹/.test(r[1])).map((r) => ({ name: r[0], price: num(r[1]), ch: num(r[2]) })).filter((r) => ok(r.price));
}

/** Retail pump prices (₹/litre, incl. state taxes) as listed by Goodreturns, revised daily by oil companies. */
export async function getFuel(): Promise<Fuel> {
  const [pI, dI, pT, dT] = await Promise.all([
    page(`${GR}/petrol-price.html`, REVAL), page(`${GR}/diesel-price.html`, REVAL),
    page(`${GR}/petrol-price-in-tamil-nadu-s30.html`, REVAL), page(`${GR}/diesel-price-in-tamil-nadu-s30.html`, REVAL),
  ]);
  const map = new Map<string, FuelCity>();
  const add = (list: ReturnType<typeof rows>, group: FuelCity["group"], kind: "petrol" | "diesel") => {
    for (const r of list) {
      const k = `${group}:${r.name}`;
      const c = map.get(k) ?? { city: r.name, ta: TA[r.name] ?? STATES.find((s) => s.en.toLowerCase() === r.name.toLowerCase())?.ta ?? r.name, group };
      if (kind === "petrol") { c.petrol = r.price; c.pCh = r.ch; } else { c.diesel = r.price; c.dCh = r.ch; }
      map.set(k, c);
    }
  };
  // Index pages: first table = metro cities, second = state capitals/averages.
  const split = (html: string | null) => {
    if (!html) return { city: [], state: [] } as { city: ReturnType<typeof rows>; state: ReturnType<typeof rows> };
    const ts = tables(html);
    const conv = (t?: string[][]) => (t ?? []).filter((r) => r.length === 3 && /^₹/.test(r[1])).map((r) => ({ name: r[0], price: num(r[1]), ch: num(r[2]) })).filter((r) => ok(r.price));
    return { city: conv(ts.find((t) => t[0]?.[0] === "City")), state: conv(ts.find((t) => t[0]?.[0] === "State")) };
  };
  const p = split(pI), d = split(dI);
  add(p.city, "metro", "petrol"); add(d.city, "metro", "diesel");
  add(rows(pT, "City"), "tn", "petrol"); add(rows(dT, "City"), "tn", "diesel");
  add(p.state, "state", "petrol"); add(d.state, "state", "diesel");
  const date = (pI ?? pT ?? "").match(/<title>[^<]*Today \(([^)]+)\)/)?.[1] ?? null;
  return { cities: [...map.values()].filter((c) => c.petrol || c.diesel), date, fetchedAt: new Date().toISOString() };
}
