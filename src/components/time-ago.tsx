"use client";
import { useEffect, useState } from "react";
import { usePrefs } from "./providers";

export function timeAgo(iso: string | null, lang: "ta" | "en", now = Date.now()) {
  if (!iso) return "";
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  const m = Math.round(s / 60), h = Math.round(s / 3600), d = Math.round(s / 86400);
  if (lang === "ta") {
    if (s < 60) return "இப்போது";
    if (m < 60) return `${m} நிமிடம் முன்`;
    if (h < 24) return `${h} மணி நேரம் முன்`;
    return `${d} நாள் முன்`;
  }
  if (s < 60) return "just now";
  if (m < 60) return `${m} min ago`;
  if (h < 24) return `${h} hr ago`;
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

export function TimeAgo({ iso }: { iso: string | null }) {
  const { lang } = usePrefs();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!iso || now === null) return null;
  return <time dateTime={iso} title={new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST"}>{timeAgo(iso, lang, now)}</time>;
}
