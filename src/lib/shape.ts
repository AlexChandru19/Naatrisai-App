import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import * as hb from "harfbuzzjs";

/** Server-side text shaping with HarfBuzz so Tamil vowel signs and ligatures render correctly in images. */
type F = { font: hb.Font; upem: number };
let fonts: Promise<{ ta: F; en: F }> | null = null;
const loadFont = async (file: string): Promise<F> => {
  const data = await readFile(join(process.cwd(), "assets", file));
  const face = new hb.Face(new hb.Blob(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer));
  return { font: new hb.Font(face), upem: face.upem };
};
export const getFonts = () => (fonts ??= Promise.all([loadFont("NotoSansTamil-Bold.ttf"), loadFont("NotoSans-Bold.ttf")]).then(([ta, en]) => ({ ta, en })));

const TA = /[\u0B80-\u0BFF]/;
/** Split into runs: Tamil letters (plus spaces between them) use the Tamil font, everything else Noto Sans. */
const runs = (s: string) => { const out: { t: string; ta: boolean }[] = []; for (const ch of s) { const ta = TA.test(ch) || (ch === " " && out.length > 0 && out[out.length - 1].ta); const last = out[out.length - 1]; if (last && last.ta === ta) last.t += ch; else out.push({ t: ch, ta }); } return out; };

export type Shaped = { width: number; d: string[] };
export async function shape(text: string, size: number): Promise<Shaped> {
  const { ta, en } = await getFonts();
  let x = 0; const d: string[] = [];
  for (const r of runs(text)) {
    const f = r.ta ? ta : en; const s = size / f.upem;
    const buf = new hb.Buffer(); buf.addText(r.t); buf.guessSegmentProperties(); hb.shape(f.font, buf);
    const info = buf.getGlyphInfos(); const pos = buf.getGlyphPositions();
    info.forEach((g, i) => {
      const p = f.font.glyphToPath(g.codepoint);
      if (p) d.push(`<path transform="translate(${(x + pos[i].xOffset * s).toFixed(1)} ${(-pos[i].yOffset * s).toFixed(1)}) scale(${s.toFixed(5)} ${(-s).toFixed(5)})" d="${p}"/>`);
      x += pos[i].xAdvance * s;
    });
  }
  return { width: x, d };
}

/** Greedy word wrap using real shaped widths. */
export async function wrap(text: string, size: number, maxW: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean); const lines: string[] = []; let cur = "";
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (cur && (await shape(t, size)).width > maxW) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { const keep = lines.slice(0, maxLines); keep[maxLines - 1] += " …"; return keep; }
  return lines;
}

export const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
/** Shaped text as an SVG group at (x, baseline y). */
export async function textSvg(text: string, size: number, x: number, y: number, fill: string, opacity = 1) {
  const s = await shape(text, size);
  return `<g transform="translate(${x} ${y})" fill="${fill}" fill-opacity="${opacity}">${s.d.join("")}</g>`;
}
