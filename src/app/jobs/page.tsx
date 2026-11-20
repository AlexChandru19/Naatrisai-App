import type { Metadata } from "next";
import { getTnpsc } from "@/lib/jobs";
import { getJobsNews } from "@/lib/news";
import { PageTitle } from "@/components/hero";
import { Explorer } from "@/components/explorer";
import { L } from "@/components/providers";
import { When } from "@/components/money";
import { FollowButton } from "@/components/follow-button";

export const revalidate = 1800;
export const metadata: Metadata = {
  title: "வேலைவாய்ப்பு & தேர்வுகள் · Jobs & exams",
  description: "Latest TNPSC notices from the official site, plus recruitment, exam and result news from Tamil and English outlets.",
  alternates: { canonical: "/jobs", types: { "application/rss+xml": [{ url: "/rss/jobs.xml", title: "Jobs RSS" }] } },
};
const KIND: Record<string, { ta: string; en: string; c: string }> = {
  result: { ta: "முடிவு", en: "Result", c: "bg-green-600/15 text-green-700 dark:text-green-400" },
  notification: { ta: "அறிவிப்பு", en: "Notification", c: "bg-kumkum-600/15 text-kumkum-700 dark:text-kumkum-400" },
  counselling: { ta: "கலந்தாய்வு", en: "Counselling", c: "bg-peacock-600/15 text-peacock-600 dark:text-peacock-500" },
  verification: { ta: "சான்றிதழ் சரிபார்ப்பு", en: "Verification", c: "bg-manjal-400/30 text-ink-900 dark:text-manjal-300" },
  press: { ta: "செய்திக் குறிப்பு", en: "Press note", c: "bg-ink-100 dark:bg-white/10" },
};

export default async function JobsPage() {
  const [t, news] = await Promise.all([getTnpsc(), getJobsNews()]);
  return (
    <>
      <PageTitle emoji="💼" ta="வேலைவாய்ப்பு & தேர்வுகள்" en="Jobs & exams" subTa="TNPSC அதிகாரப்பூர்வ அறிவிப்புகள் · வேலை, தேர்வு, முடிவுச் செய்திகள்" subEn="Official TNPSC notices · recruitment, exam and result news"><FollowButton kind="topics" value="education" /></PageTitle>
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div><Explorer articles={news.articles.slice(0, 120)} fetchedAt={news.fetchedAt} showTopics={false} emptyHint={{ ta: "இப்போது வேலைவாய்ப்புச் செய்திகள் இல்லை.", en: "No jobs news right now." }} /></div>
        <aside className="order-first space-y-4 lg:order-none lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
            <h2 className="mb-2 font-extrabold">🏛️ <L ta="TNPSC — சமீபத்திய அறிவிப்புகள்" en="TNPSC — latest notices" /></h2>
            {t.items.length ? (
              <ul className="space-y-2">
                {t.items.map((n) => { const k = KIND[n.kind]; return (
                  <li key={n.title}><a href={n.link} target="_blank" rel="noopener noreferrer" className="block rounded-xl p-2 text-sm hover:bg-ink-50 dark:hover:bg-white/5">
                    <span className={`mr-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${k.c}`}><L ta={k.ta} en={k.en} /></span>
                    <span className="font-semibold leading-snug">{n.title.length > 170 ? n.title.slice(0, 170) + "…" : n.title}</span>
                  </a></li>); })}
              </ul>
            ) : <p className="text-sm opacity-70"><L ta="TNPSC தளத்தை இப்போது அணுக முடியவில்லை." en="Couldn't reach the TNPSC site right now." /></p>}
            <p className="mt-2 text-[11px] opacity-65"><L ta="மூலம்: tnpsc.gov.in முகப்புப் பக்கம் (தேதிகள் அங்கு குறிப்பிடப்படவில்லை). விண்ணப்பிக்கும் முன் அதிகாரப்பூர்வ அறிவிப்பைப் படிக்கவும்." en="Source: tnpsc.gov.in home page (it lists no dates). Always read the official notification before applying." /> · <When t={new Date().toISOString()} /></p>
          </section>
          <section className="rounded-2xl border border-ink-100 bg-white p-4 text-sm dark:border-white/10 dark:bg-ink-900">
            <h2 className="mb-2 font-extrabold">🔗 <L ta="அதிகாரப்பூர்வ தளங்கள்" en="Official sites" /></h2>
            <ul className="grid grid-cols-2 gap-1.5">
              {[["TNPSC", "https://www.tnpsc.gov.in/"], ["TN TRB", "https://www.trb.tn.gov.in/"], ["TNUSRB", "https://www.tnusrb.tn.gov.in/"], ["TN MRB", "https://www.mrb.tn.gov.in/"], ["TN DGE (results)", "https://www.dge.tn.gov.in/"], ["UPSC", "https://upsc.gov.in/"], ["SSC", "https://ssc.gov.in/"], ["RRB (Chennai)", "https://www.rrbchennai.gov.in/"], ["IBPS", "https://www.ibps.in/"], ["NTA", "https://nta.ac.in/"]].map(([n, u]) => (
                <li key={n}><a href={u} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-ink-100 px-2 py-1.5 font-semibold hover:bg-ink-50 dark:border-white/10 dark:hover:bg-white/5">{n} ↗</a></li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
