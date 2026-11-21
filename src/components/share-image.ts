import { SITE_HOST } from "@/lib/site";
import type { Article } from "@/lib/types";

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}

/** Renders a square headline card (Inshorts/Way2News-style) with the page's own Tamil font. */
export async function shareImage(a: Article, lang: "ta" | "en") {
  // Server-rendered card (HarfBuzz-shaped Tamil) — falls back to the in-browser canvas card if offline.
  let blob: Blob | null = null;
  try { const r = await fetch(`/og?${new URLSearchParams({ t: a.title, s: a.source, d: a.publishedAt ?? "", f: "square" })}`); if (r.ok) blob = await r.blob(); } catch {}
  if (!blob) return canvasCard(a, lang);
  return deliver(blob, a);
}
async function deliver(blob: Blob, a: Article) {
  const file = new File([blob], "naatrisai-headline.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: a.title, text: `${a.title}\n${a.link}` }); return "shared"; } catch { return "cancelled"; } }
  const url = URL.createObjectURL(blob); const el = document.createElement("a"); el.href = url; el.download = file.name; el.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "downloaded";
}
async function canvasCard(a: Article, lang: "ta" | "en") {
  const W = 1080, H = 1080, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const font = getComputedStyle(document.body).fontFamily;
  await document.fonts.ready;
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#a32514"); g.addColorStop(0.55, "#c8321a"); g.addColorStop(1, "#f0a500");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,.08)";
  for (let x = 0; x < W; x += 36) for (let y = 0; y < H; y += 36) { ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#fff"; ctx.font = `800 64px ${font}`; ctx.fillText("நாற்றிசை", 80, 150);
  ctx.font = `600 28px ${font}`; ctx.globalAlpha = 0.8; ctx.fillText(`NAATRISAI · ${SITE_HOST}`, 80, 196); ctx.globalAlpha = 1;
  let size = 72; let lines: string[] = [];
  for (; size >= 40; size -= 4) { ctx.font = `800 ${size}px ${font}`; lines = wrap(ctx, a.title, W - 160); if (lines.length * size * 1.3 <= 560) break; }
  ctx.font = `800 ${size}px ${font}`;
  lines.slice(0, 9).forEach((l, i) => ctx.fillText(l, 80, 320 + i * size * 1.3));
  ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.fillRect(0, H - 170, W, 170);
  ctx.fillStyle = "#fcd667"; ctx.font = `700 36px ${font}`; ctx.fillText(a.source, 80, H - 100);
  ctx.fillStyle = "#fff"; ctx.font = `500 28px ${font}`;
  const when = a.publishedAt ? new Date(a.publishedAt).toLocaleString(lang === "ta" ? "ta-IN" : "en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) + " IST" : "";
  ctx.fillText(when, 80, H - 55);
  const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
  return deliver(blob, a);
}
