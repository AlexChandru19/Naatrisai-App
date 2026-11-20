import { DISTRICTS, type District } from "./geo";

/** Spelling-tolerant key: "Thoothukkudi", "Thoothukudi" → same; "Teni"/"Theni" → same. */
export const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "").replace(/h/g, "").replace(/(.)\1+/g, "$1");

const INDEX: [string, District][] = DISTRICTS.flatMap((d) => [d.en, ...d.alt.filter((a) => /^[A-Za-z ]+$/.test(a))].map((n) => [norm(n), d] as [string, District]));

/** Match a district by any English spelling of its name or alias. */
export const districtByName = (name: string) => { const k = norm(name); return INDEX.find(([n]) => n === k)?.[1]; };

/** All TN districts named anywhere in a free-text English string (e.g. an IMD alert). */
export function districtsIn(text: string): District[] {
  const words = text.split(/[^A-Za-z]+/).filter(Boolean);
  const found = new Set<District>();
  for (let i = 0; i < words.length; i++) {
    for (const len of [1, 2]) {
      const k = norm(words.slice(i, i + len).join(""));
      if (k.length < 4) continue;
      const d = INDEX.find(([n]) => n === k)?.[1];
      if (d) found.add(d);
    }
  }
  return [...found];
}

/** Map district slug → fuel price row, matching Goodreturns' TN city names to our districts. */
export function fuelByDistrict<T extends { city: string; group: string }>(rows: T[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const r of rows) { if (r.group !== "tn" && !/chennai/i.test(r.city)) continue; const d = districtByName(r.city); if (d && !out[d.slug]) out[d.slug] = r; }
  return out;
}
