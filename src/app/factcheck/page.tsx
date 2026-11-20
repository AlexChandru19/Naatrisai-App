import type { Metadata } from "next";
import { getFactChecks, FACTCHECKERS } from "@/lib/news";
import { PageTitle } from "@/components/hero";
import { Explorer } from "@/components/explorer";
import { L } from "@/components/providers";

export const revalidate = 900;
export const metadata: Metadata = {
  title: "உண்மை சரிபார்ப்பு · Fact checks",
  description: "Latest fact-checks of viral claims from Indian fact-checking organisations, in Tamil and English.",
  alternates: { canonical: "/factcheck", types: { "application/rss+xml": [{ url: "/rss/factcheck.xml", title: "Fact checks RSS" }] } },
};

const TIPS: [string, string][] = [
  ["அனுப்பும் முன் யோசியுங்கள் — “உடனே பகிருங்கள்” என்று வலியுறுத்தும் செய்திகள் சந்தேகத்துக்குரியவை.", "Pause before forwarding — messages that pressure you to “share immediately” are a red flag."],
  ["மூலம் எது? நம்பகமான செய்தி நிறுவனம் அல்லது அரசு அறிவிப்பில் இருக்கிறதா என்று பாருங்கள்.", "Check the source — is it reported by a reliable outlet or an official notice?"],
  ["படம்/வீடியோ பழையதா? Google Lens அல்லது தலைகீழ் படத் தேடலில் சரிபார்க்கலாம்.", "Old photo or video? Try Google Lens or a reverse image search."],
  ["AI உருவாக்கிய படங்கள், குரல்கள் அதிகரித்து வருகின்றன — விரல்கள், உதடு அசைவு, எழுத்துகளைக் கவனியுங்கள்.", "AI-made images and voices are rising — look closely at hands, lip-sync and text."],
];

export default async function FactCheckPage() {
  const res = await getFactChecks();
  return (
    <>
      <PageTitle emoji="🔍" ta="உண்மை சரிபார்ப்பு" en="Fact checks" subTa="வைரல் தகவல்கள் உண்மையா? — இந்திய உண்மை சரிபார்ப்பு நிறுவனங்களின் சமீபத்திய ஆய்வுகள்" subEn="Is that viral claim true? Latest checks from Indian fact-checking organisations" />
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div><Explorer articles={res.articles.slice(0, 100)} fetchedAt={res.fetchedAt} showTopics={false} emptyHint={{ ta: "இப்போது உண்மை சரிபார்ப்புகள் கிடைக்கவில்லை.", en: "No fact-checks available right now." }} /></div>
        <aside className="order-first space-y-4 lg:order-none lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-ink-100 bg-white p-4 text-sm dark:border-white/10 dark:bg-ink-900">
            <h2 className="mb-2 font-extrabold">🧠 <L ta="போலிச் செய்தியைக் கண்டறிய" en="Spotting fakes" /></h2>
            <ul className="list-disc space-y-1.5 pl-5">{TIPS.map(([t, e]) => <li key={e}><L ta={t} en={e} /></li>)}</ul>
          </section>
          <section className="rounded-2xl border border-ink-100 bg-white p-4 text-sm dark:border-white/10 dark:bg-ink-900">
            <h2 className="mb-2 font-extrabold">🏛️ <L ta="மூலங்கள்" en="Sources" /></h2>
            <ul className="space-y-1">{FACTCHECKERS.map((f) => { const n = res.status.find((s) => s.source === f.source)?.count ?? 0; return <li key={f.url} className="flex justify-between gap-2"><a href={f.home} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{f.source} ↗</a><span className="text-xs opacity-60">{n}</span></li>; })}</ul>
            <p className="mt-2 text-[11px] opacity-65"><L ta="ஒவ்வொரு நிறுவனத்தின் பொது RSS ஊட்டத்திலிருந்து. தீர்ப்புகள் அவர்களுடையவை — நாற்றிசை எதையும் மதிப்பிடுவதில்லை." en="From each organisation's public RSS feed. Verdicts are theirs — Naatrisai doesn't rate anything." /></p>
          </section>
        </aside>
      </div>
    </>
  );
}
