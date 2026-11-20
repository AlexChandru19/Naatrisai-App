"use client";
import { useState } from "react";
import { usePrefs } from "./providers";

export function BulletinShare({ text }: { text: string }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [done, setDone] = useState(false);
  const btn = "rounded-full px-4 py-2 text-sm font-bold";
  return (
    <div className="no-print flex flex-wrap gap-2" data-bulletin-share>
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#128c4a] text-white`}>🟢 {ta ? "WhatsApp-இல் அனுப்பு" : "Send on WhatsApp"}</a>
      <a href={`https://t.me/share/url?url=${encodeURIComponent("https://naatrisai.vercel.app/bulletin")}&text=${encodeURIComponent(text.replace(/[*_]/g, ""))}`} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#1f6fa8] text-white`}>✈️ Telegram</a>
      <button onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); } catch {} }} className={`${btn} border border-ink-100 bg-white dark:border-white/10 dark:bg-ink-900`}>{done ? "✓ " + (ta ? "நகலெடுக்கப்பட்டது" : "Copied") : "📋 " + (ta ? "உரையை நகலெடு" : "Copy text")}</button>
    </div>
  );
}
