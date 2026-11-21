import { SITE_HOST } from "@/lib/site";
import { Resvg } from "@resvg/resvg-js";
import { textSvg, wrap } from "@/lib/shape";

export const runtime = "nodejs";

/** Shareable story card PNG: /og?t=<headline>&s=<source>&d=<ISO time>&f=square|wide.
 *  Text is the publisher's headline as-is; HarfBuzz shapes Tamil so vowel signs render correctly. */
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  const t = (u.get("t") || "நாற்றிசை — தமிழ்நாடு, இந்தியா, உலகச் செய்திகள் ஒரே இடத்தில்").replace(/\s+/g, " ").trim().slice(0, 240);
  const src = (u.get("s") ?? "").slice(0, 60);
  const d = u.get("d"); const sq = u.get("f") === "square";
  const W = sq ? 1080 : 1200, H = sq ? 1080 : 630, P = sq ? 80 : 64;
  const when = d && !isNaN(Date.parse(d)) ? new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) + " IST" : "";
  const areaH = sq ? 560 : 300; let size = sq ? 80 : 62; let lines: string[] = [];
  for (; size >= (sq ? 44 : 34); size -= 4) { lines = await wrap(t, size, W - 2 * P, 99); if (lines.length * size * 1.45 <= areaH) break; }
  lines = await wrap(t, size, W - 2 * P, Math.max(1, Math.floor(areaH / (size * 1.45))));
  const top = sq ? 300 : 190;
  const body = (await Promise.all(lines.map((l, i) => textSvg(l, size, P, top + size + i * size * 1.45, "#fff")))).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a32514"/><stop offset=".55" stop-color="#c8321a"/><stop offset="1" stop-color="#f0a500"/></linearGradient>
<pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#fff" fill-opacity=".08"/></pattern></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#dots)"/>
<circle cx="${P + 32}" cy="${P + 30}" r="32" fill="#fff"/><path transform="translate(${P + 32} ${P + 30})" d="M0-22 L6-6 L22 0 L6 6 L0 22 L-6 6 L-22 0 L-6-6Z" fill="#c8321a"/>
${await textSvg("நாற்றிசை", 46, P + 84, P + 34, "#fff")}${await textSvg("NAATRISAI", 20, P + 86, P + 62, "#fff", 0.85)}
${body}
<rect y="${H - (sq ? 170 : 120)}" width="${W}" height="${sq ? 170 : 120}" fill="#000" fill-opacity=".22"/>
${src ? await textSvg(src, sq ? 36 : 30, P, H - (sq ? 100 : 68), "#fcd667") : ""}${when ? await textSvg(when, sq ? 26 : 22, P, H - (sq ? 55 : 32), "#fff", 0.9) : ""}
${await textSvg(SITE_HOST, 22, W - P - 230, H - (sq ? 55 : 32), "#fff", 0.9)}
</svg>`;
  const png = new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } });
}
