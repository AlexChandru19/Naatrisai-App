/** AMFI daily NAVs for every Indian mutual fund scheme — portal.amfiindia.com/spages/NAVAll.txt (official, free). */
export type Nav = { code: string; isin: string; name: string; amc: string; cat: string; nav: number; date: string };
export const AMFI_URL = "https://portal.amfiindia.com/spages/NAVAll.txt";
let memo: { at: number; list: Nav[] } | null = null;
export async function getNavs(): Promise<Nav[]> {
  if (memo && Date.now() - memo.at < 30 * 60e3) return memo.list;
  const r = await fetch(AMFI_URL, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error("AMFI " + r.status);
  const txt = await r.text();
  const list: Nav[] = []; let cat = "", amc = "";
  for (const raw of txt.split(/\r?\n/)) {
    const l = raw.trim(); if (!l) continue;
    if (!l.includes(";")) { if (/schemes?\s*\(/i.test(l)) cat = l.replace(/^.*?\((.*)\)\s*$/, "$1"); else amc = l; continue; }
    const p = l.split(";"); if (p.length < 6 || !/^\d+$/.test(p[0])) continue;
    const nav = parseFloat(p[p.length - 2]); if (!isFinite(nav)) continue;
    const name = p.length >= 8 ? [p[3], p[4], p[5]].filter((x) => x && x !== "-").join(" · ") : p[3];
    list.push({ code: p[0], isin: p[1] !== "-" ? p[1] : p[2], name, amc, cat, nav, date: p[p.length - 1] });
  }
  memo = { at: Date.now(), list };
  return list;
}
export function searchNavs(list: Nav[], q: string, n = 40) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean); if (!words.length) return [];
  return list.filter((x) => { const h = `${x.name} ${x.amc} ${x.code} ${x.isin}`.toLowerCase(); return words.every((w) => h.includes(w)); })
    .sort((a, b) => Number(/direct/i.test(b.name)) - Number(/direct/i.test(a.name)) || a.name.length - b.name.length).slice(0, n);
}
