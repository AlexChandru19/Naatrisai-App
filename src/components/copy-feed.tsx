"use client";
import { useState } from "react";
import { usePrefs } from "./providers";
export function CopyFeed({ url }: { url: string }) {
  const { lang } = usePrefs(); const [ok, setOk] = useState(false);
  return <button onClick={async () => { try { await navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 1500); } catch {} }} className="shrink-0 rounded-full border border-ink-100 px-2.5 py-1 text-xs font-bold dark:border-white/10">{ok ? "✓" : lang === "ta" ? "நகலெடு" : "Copy"}</button>;
}
