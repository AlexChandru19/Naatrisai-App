import "server-only";

const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " ", "#8377": "₹" };
export const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&(\w+);/g, (m, e) => ENT[e] ?? m).replace(/\s+/g, " ").trim();

/** Every <table> on the page as rows of plain-text cells. */
export function tables(html: string): string[][][] {
  return [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((t) =>
    [...t[0].matchAll(/<tr(?:\s[^>]*)?>[\s\S]*?<\/tr>/gi)].map((r) => [...r[0].matchAll(/<t[hd](?:\s[^>]*)?>([\s\S]*?)<\/t[hd]>/gi)].map((c) => text(c[1]))),
  );
}

/** "₹1,30,140 (-10)" → 130140 ; returns NaN when no number. */
export const num = (s: string | undefined) => { const m = (s ?? "").replace(/,/g, "").match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : NaN; };
/** The bracketed change in "₹14,197 (-1)" or "- ₹0.10". */
export const delta = (s: string | undefined) => {
  const b = (s ?? "").match(/\(([+-]?\s?[\d,.]+)\)/);
  if (b) return num(b[1].replace(/\s/g, ""));
  const d = (s ?? "").replace(/,/g, "").match(/^([+-])\s*₹?\s*(\d+(\.\d+)?)/);
  return d ? Number(d[1] + d[2]) : NaN;
};

export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
export async function page(url: string, revalidate: number): Promise<string | null> {
  try {
    const r = await fetch(url, { next: { revalidate }, headers: { "User-Agent": UA, Accept: "text/html" }, signal: AbortSignal.timeout(9000) });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}
