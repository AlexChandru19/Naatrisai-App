import type { Metadata } from "next";
import { RSS_FEEDS, SITE } from "@/lib/rss";
import { PageTitle } from "@/components/hero";
import { L } from "@/components/providers";
import { CopyFeed } from "@/components/copy-feed";

export const metadata: Metadata = { title: "RSS ஊட்டங்கள் · RSS feeds", description: "Follow Naatrisai sections, topics and all 38 Tamil Nadu districts in any RSS reader.", alternates: { canonical: "/rss" } };

export default function Rss() {
  const groups = [
    { ta: "முக்கியப் பிரிவுகள்", en: "Main sections", list: [{ key: "", ta: "முக்கியச் செய்திகள்", en: "Top stories", url: `${SITE}/feed.xml` }, ...RSS_FEEDS.filter((f) => !f.key.includes("-")).map((f) => ({ ...f, url: `${SITE}/rss/${f.key}.xml` }))] },
    { ta: "தலைப்புகள்", en: "Topics", list: RSS_FEEDS.filter((f) => f.key.startsWith("topic-")).map((f) => ({ ...f, url: `${SITE}/rss/${f.key}.xml` })) },
    { ta: "மாவட்டங்கள்", en: "Districts", list: RSS_FEEDS.filter((f) => f.key.startsWith("district-")).map((f) => ({ ...f, url: `${SITE}/rss/${f.key}.xml` })) },
  ];
  return (
    <>
      <PageTitle emoji="📡" ta="RSS ஊட்டங்கள்" en="RSS feeds" subTa="எந்த RSS செயலியிலும் (Feedly, Inoreader, NetNewsWire…) பின்தொடருங்கள் — இணைப்புகள் அசல் வெளியீட்டாளருக்கே செல்லும்" subEn="Follow in any RSS reader (Feedly, Inoreader, NetNewsWire…) — links go to the original publishers" />
      {groups.map((g) => (
        <section key={g.en} className="mt-6">
          <h2 className="text-lg font-extrabold"><L ta={g.ta} en={g.en} /> <span className="text-sm font-semibold opacity-60">· {g.list.length}</span></h2>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {g.list.map((f) => (
              <li key={f.url} className="flex items-center justify-between gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-ink-900">
                <span className="min-w-0"><b className="block truncate"><L ta={f.ta} en={f.en} /></b><a href={f.url} className="block truncate text-xs text-peacock-600 hover:underline">{f.url.replace("https://", "")}</a></span>
                <CopyFeed url={f.url} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
