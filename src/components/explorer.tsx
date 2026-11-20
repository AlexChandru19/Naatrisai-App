"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/types";
import { TOPICS } from "@/lib/topics";
import { usePrefs, type ContentLang } from "./providers";
import { ArticleCard } from "./article-card";
import { CardDeck } from "./card-deck";

const PAGE = 18;

export function Explorer({ articles, fetchedAt, showTopics = true, emptyHint }: { articles: Article[]; fetchedAt: string; showTopics?: boolean; emptyHint?: { ta: string; en: string } }) {
  const { lang, content, setContent, view, setView, prevVisit, isHidden, read, hideRead, setHideRead } = usePrefs();
  const [fresh, setFresh] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [topic, setTopic] = useState<string | null>(null);
  const [sort, setSort] = useState<"top" | "latest">("top");
  const [limit, setLimit] = useState(PAGE);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh every 5 minutes (server revalidates feeds every 5 min)
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 5 * 60_000);
    return () => clearInterval(t);
  }, [router]);
  useEffect(() => { setRefreshing(false); }, [fetchedAt]); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => {
    const on = () => { setFresh(true); setLimit(PAGE); ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
    window.addEventListener("ns:fresh", on);
    return () => window.removeEventListener("ns:fresh", on);
  }, []);

  const filtered = useMemo(() => {
    const f = articles.filter((a) => (content === "all" || a.lang === content) && (!topic || a.topics.includes(topic)) && !isHidden(a) && !(hideRead && read[a.id]) && (!fresh || !prevVisit || (a.publishedAt && Date.parse(a.publishedAt) > prevVisit)));
    return sort === "latest" ? [...f].sort((a, b) => (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0)) : f;
  }, [articles, content, topic, sort, fresh, prevVisit, isHidden, hideRead, read]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of articles) if (content === "all" || a.lang === content) for (const t of a.topics) c[t] = (c[t] || 0) + 1;
    return c;
  }, [articles, content]);

  const chip = (on: boolean) => `shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition active:scale-95 ${on ? "border-ink-900 bg-ink-900 text-white dark:border-white dark:bg-white dark:text-ink-900" : "border-ink-100 bg-white hover:border-kumkum-400 dark:border-white/10 dark:bg-ink-900"}`;
  const langOpts: { v: ContentLang; ta: string; en: string }[] = [{ v: "all", ta: "அனைத்தும்", en: "All" }, { v: "ta", ta: "தமிழ்", en: "Tamil" }, { v: "en", ta: "ஆங்கிலம்", en: "English" }];

  const freshCount = prevVisit ? articles.filter((a) => a.publishedAt && Date.parse(a.publishedAt) > prevVisit).length : 0;
  return (
    <div ref={ref} className="scroll-mt-28">
      <div className="z-30 -mx-3 mb-4 space-y-2 bg-ink-50/90 px-3 py-2 backdrop-blur sm:sticky sm:top-[84px] sm:-mx-5 sm:px-5 dark:bg-ink-950/90">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible">
          <div className="flex shrink-0 rounded-full border border-ink-100 bg-white p-0.5 dark:border-white/10 dark:bg-ink-900">
            {langOpts.map((o) => (
              <button key={o.v} onClick={() => { setContent(o.v); setLimit(PAGE); }} className={`whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-bold transition ${content === o.v ? "bg-kumkum-600 text-white" : "opacity-70"}`}>{lang === "ta" ? o.ta : o.en}</button>
            ))}
          </div>
          <div className="flex shrink-0 rounded-full border border-ink-100 bg-white p-0.5 dark:border-white/10 dark:bg-ink-900" role="group" aria-label="Sort">
            <button onClick={() => { setSort("top"); setLimit(PAGE); }} className={`whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-bold ${sort === "top" ? "bg-manjal-400 text-ink-900" : "opacity-70"}`}>⭐ {lang === "ta" ? "முக்கியம்" : "Top"}</button>
            {freshCount > 0 && <button onClick={() => { setFresh(!fresh); setLimit(PAGE); }} aria-pressed={fresh} className={`whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-bold ${fresh ? "bg-peacock-600 text-white" : "opacity-70"}`}>🆕 {lang === "ta" ? `புதியவை ${freshCount}` : `New ${freshCount}`}</button>}
            <button onClick={() => { setSort("latest"); setLimit(PAGE); }} className={`whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-bold ${sort === "latest" ? "bg-manjal-400 text-ink-900" : "opacity-70"}`}>🕘 {lang === "ta" ? "அண்மை" : "Latest"}</button>
          </div>
          <div className="flex shrink-0 rounded-full border border-ink-100 bg-white p-0.5 sm:ml-auto dark:border-white/10 dark:bg-ink-900">
            <button onClick={() => setView("feed")} className={`whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-bold ${view === "feed" ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "opacity-70"}`}>☰ {lang === "ta" ? "பட்டியல்" : "Feed"}</button>
            <button onClick={() => setView("cards")} className={`whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-bold ${view === "cards" ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "opacity-70"}`}>🃏 {lang === "ta" ? "ஸ்வைப் கார்டு" : "Swipe cards"}</button>
          </div>
          <button onClick={() => { setHideRead(!hideRead); setLimit(PAGE); }} aria-pressed={hideRead} className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] font-bold ${hideRead ? "border-peacock-600 bg-peacock-600 text-white" : "border-ink-100 bg-white opacity-80 dark:border-white/10 dark:bg-ink-900"}`} title={lang === "ta" ? "படித்த செய்திகளை மறை" : "Hide stories you've read"}>👁️ {lang === "ta" ? "படித்தவை மறை" : "Hide read"}</button>
          <button onClick={() => { setRefreshing(true); router.refresh(); setTimeout(() => setRefreshing(false), 4000); }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink-100 bg-white text-sm dark:border-white/10 dark:bg-ink-900" title={lang === "ta" ? "புதுப்பி" : "Refresh"} aria-label="Refresh">
            <span className={refreshing ? "inline-block animate-spin" : ""}>↻</span>
          </button>
        </div>
        {showTopics && (
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
            <button className={chip(!topic)} onClick={() => setTopic(null)}>✨ {lang === "ta" ? "எல்லாம்" : "Everything"}</button>
            {TOPICS.filter((t) => counts[t.slug]).map((t) => (
              <button key={t.slug} className={chip(topic === t.slug)} onClick={() => { setTopic(topic === t.slug ? null : t.slug); setLimit(PAGE); }}>
                {t.emoji} {lang === "ta" ? t.ta : t.en} <span className="opacity-50">{counts[t.slug]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-100 p-10 text-center text-ink-900/60 dark:border-white/10 dark:text-white/50">
          {emptyHint ? (lang === "ta" ? emptyHint.ta : emptyHint.en) : lang === "ta" ? "இந்த வடிகட்டலுக்குச் செய்திகள் இல்லை. வேறு மொழி/தலைப்பைத் தேர்வுசெய்யுங்கள்." : "No stories for this filter right now. Try another language or topic."}
        </div>
      ) : view === "cards" ? (
        <CardDeck items={filtered.slice(0, 60)} />
      ) : (
        <>
          <div data-grid className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {filtered.slice(0, limit).map((a, i) => <ArticleCard key={a.id} a={a} i={i % PAGE} />)}
          </div>
          {limit < filtered.length && (
            <div className="mt-6 text-center">
              <button onClick={() => setLimit((l) => l + PAGE)} className="rounded-full bg-kumkum-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-kumkum-600/25 transition hover:bg-kumkum-700 active:scale-95">
                {lang === "ta" ? `மேலும் செய்திகள் (${filtered.length - limit})` : `Load more (${filtered.length - limit})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
