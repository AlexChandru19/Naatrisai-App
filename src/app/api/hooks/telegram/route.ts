import { getBulletin } from "@/lib/bulletin";
/** Prepared hook: posts the bulletin to a Telegram channel at 7 am / 7 pm IST (Vercel Cron).
 *  Inactive until TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set; protected by CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return Response.json({ ok: false, skipped: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured" });
  const b = await getBulletin();
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chat, text: b.text.replace(/\*/g, "").replace(/_/g, ""), disable_web_page_preview: true }) });
  return Response.json({ ok: r.ok, status: r.status });
}
