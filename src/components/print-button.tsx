"use client";
import { usePrefs } from "./providers";
export function PrintButton() {
  const { lang } = usePrefs();
  return <button onClick={() => window.print()} className="no-print rounded-full border border-ink-100 bg-white px-4 py-1.5 text-sm font-bold dark:border-white/10 dark:bg-ink-900">🖨️ {lang === "ta" ? "அச்சிடு / PDF" : "Print / PDF"}</button>;
}
