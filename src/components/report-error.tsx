"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePrefs } from "./providers";

export function ReportError({ email }: { email: string }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const sp = useSearchParams();
  const [url, setUrl] = useState(sp.get("u") ?? ""); const [title] = useState(sp.get("t") ?? "");
  const [what, setWhat] = useState(""); const [copied, setCopied] = useState(false);
  const body = `Story: ${title}\nLink: ${url}\nPage: ${typeof location !== "undefined" ? location.origin : ""}\n\nWhat is wrong:\n${what}`;
  return (
    <form onSubmit={(e) => e.preventDefault()} className="mt-3 space-y-2" data-report>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={ta ? "செய்தி இணைப்பு (விருப்பம்)" : "Story link (optional)"} aria-label="Link" className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-ink-950" />
      {title && <p className="text-sm"><b>{title}</b></p>}
      <textarea value={what} onChange={(e) => setWhat(e.target.value)} rows={4} maxLength={2000} placeholder={ta ? "என்ன தவறு? (எ.கா. தவறான மாவட்டம், பழைய செய்தி, மொழிபெயர்ப்புப் பிழை)" : "What's wrong? (e.g. wrong district, stale story, wrong category)"} aria-label="Details" className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-ink-950" />
      <div className="flex flex-wrap gap-2">
        {email ? <a href={`mailto:${email}?subject=${encodeURIComponent("Naatrisai correction: " + (title || url).slice(0, 80))}&body=${encodeURIComponent(body)}`} className="rounded-full bg-kumkum-600 px-4 py-2 text-sm font-bold text-white">✉️ {ta ? "மின்னஞ்சல் அனுப்பு" : "Send by email"}</a>
          : <span className="rounded-full bg-ink-100 px-4 py-2 text-sm font-bold dark:bg-white/10">✉️ {ta ? "மின்னஞ்சல் முகவரி இன்னும் அமைக்கப்படவில்லை" : "Corrections email not set up yet"}</span>}
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(body); setCopied(true); } catch {} }} className="rounded-full border border-ink-100 px-4 py-2 text-sm font-bold dark:border-white/10">{copied ? "✓" : "📋"} {ta ? "விவரத்தை நகலெடு" : "Copy report"}</button>
      </div>
    </form>
  );
}
