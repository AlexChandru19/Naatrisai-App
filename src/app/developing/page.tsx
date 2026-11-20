import type { Metadata } from "next";
import Link from "next/link";
import { getAll } from "@/lib/news";
import { sourceCount } from "@/lib/types";
import { versionsOf, coverage } from "@/lib/coverage";
import { storyUrl } from "@/lib/story-url";
import { PageTitle } from "@/components/hero";

export const revalidate = 300;
export const metadata: Metadata = { title: "வளரும் செய்திகள் · Developing stories (live updates)", description: "Live update timelines assembled from every outlet's headlines on the biggest stories right now.", alternates: { canonical: "/developing" } };

const ist = (iso: string | null) => iso ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", day: "numeric", month: "short", hour12: true }).format(new Date(iso)) : "—";

export default async function DevelopingPage() {
  const { articles, fetchedAt } = await getAll();
  const since = new Date(fetchedAt).getTime() - 24 * 3600e3;
  const live = articles
    .filter((a) => sourceCount(a) >= 3 && a.publishedAt && new Date(a.publishedAt).getTime() > since)
    .sort((x, y) => sourceCount(y) - sourceCount(x) || (y.publishedAt ?? "").localeCompare(x.publishedAt ?? ""))
    .slice(0, 12);
  return (
    <>
      <PageTitle emoji="🔴" ta="வளரும் செய்திகள் — நேரலைப் பதிவுகள்" en="Developing stories — live updates" subTa="3 அல்லது அதற்கு மேற்பட்ட ஊடகங்கள் கடந்த 24 மணி நேரத்தில் வெளியிட்ட செய்திகள், நேர வரிசையில்" subEn="Stories 3+ outlets reported in the last 24 hours, as a timeline of each outlet's headline" />
      <p className="mt-3 rounded-xl bg-manjal-400/15 px-3 py-2 text-[12px]">{`தானியங்கித் தொகுப்பு: ஒவ்வொரு பதிவும் அந்த ஊடகத்தின் தலைப்பு மட்டுமே; நாற்றிசை எழுதியது அல்ல. நேரம் IST.`} · {`Auto-assembled: each entry is that outlet's own headline, not written by Naatrisai. Times in IST.`}</p>
      {live.length === 0 && <p className="mt-6 text-sm opacity-70">{`இப்போது வளரும் பெரிய செய்திகள் இல்லை.`} · {`No multi-outlet developing stories right now.`}</p>}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {live.map((a) => {
          const vs = versionsOf(a).sort((x, y) => (y.publishedAt ?? "").localeCompare(x.publishedAt ?? ""));
          const c = coverage(vs);
          return (
            <section key={a.id} className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-kumkum-700 dark:text-manjal-400">🔴 {sourceCount(a)} {`ஊடகங்கள் · outlets`} · {`தமிழ்`} {c.tamil} · {`தேசிய`} {c.national} · {`உலக`} {c.world}</p>
              <h2 className="mt-1 text-lg font-extrabold leading-snug">{a.title}</h2>
              <ol className="mt-3 border-l-2 border-kumkum-600/40 pl-4">
                {vs.map((v) => (
                  <li key={v.link} className="relative mb-3">
                    <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-kumkum-600" aria-hidden />
                    <p className="text-[11.5px] opacity-70"><time dateTime={v.publishedAt ?? undefined}>{ist(v.publishedAt)}</time> · <b>{v.source}</b></p>
                    <a href={v.link} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold leading-snug hover:underline">{v.title} ↗</a>
                  </li>
                ))}
              </ol>
              <Link href={storyUrl(a)} className="text-sm font-bold text-peacock-600 underline dark:text-teal-300">{`முழு கவரேஜ் · Full coverage`} →</Link>
            </section>
          );
        })}
      </div>
    </>
  );
}
