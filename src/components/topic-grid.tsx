"use client";
import Link from "next/link";
import { TOPICS } from "@/lib/topics";
import { usePrefs } from "./providers";

export function TopicGrid({ active }: { active?: string }) {
  const { lang } = usePrefs();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {TOPICS.map((t, i) => (
        <Link key={t.slug} href={`/topic/${t.slug}`} className={`fade-up group relative overflow-hidden rounded-2xl border bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg dark:bg-ink-900 ${active === t.slug ? "ring-2" : "border-ink-100 dark:border-white/10"}`} style={{ animationDelay: `${i * 30}ms`, borderColor: active === t.slug ? t.color : undefined }}>
          <span className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-15 transition group-hover:scale-150" style={{ background: t.color }} />
          <span className="relative text-3xl">{t.emoji}</span>
          <span className="relative mt-2 block text-lg font-extrabold" style={{ color: t.color }}>{lang === "ta" ? t.ta : t.en}</span>
          <span className="relative block text-xs opacity-60">{lang === "ta" ? t.en : t.ta}</span>
        </Link>
      ))}
    </div>
  );
}
