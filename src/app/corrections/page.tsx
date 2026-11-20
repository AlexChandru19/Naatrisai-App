import type { Metadata } from "next";
import { Suspense } from "react";
import { CORRECTIONS, CORRECTIONS_EMAIL } from "@/lib/corrections";
import { PageTitle } from "@/components/hero";
import { ReportError } from "@/components/report-error";

export const metadata: Metadata = { title: "திருத்தங்கள் & பிழை புகார் · Corrections & report an error", alternates: { canonical: "/corrections" } };
export default function CorrectionsPage() {
  return (
    <>
      <PageTitle emoji="🛠️" ta="திருத்தங்கள் & பிழை புகார்" en="Corrections & report an error" subTa="நாற்றிசை செய்தித் தலைப்புகளை மாற்றுவதில்லை — எங்கள் தொகுப்பு, வகைப்படுத்தல், மொழிபெயர்ப்புப் பிழைகளை இங்கே பதிவு செய்கிறோம்" subEn="We never edit publishers' headlines — this log covers our own grouping, tagging and feature mistakes" />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
          <h2 className="text-lg font-extrabold">🚩 {`பிழையைப் புகாரளி · Report an error`}</h2>
          <p className="mt-1 text-sm opacity-80">{`செய்தியின் உள்ளடக்கத்தில் பிழை இருந்தால் அதை வெளியிட்ட ஊடகத்திடமே தெரிவியுங்கள்; எங்கள் தொகுப்பில் பிழை இருந்தால் இங்கே.`} · {`Errors in a story's content belong with its publisher; errors in how we grouped, tagged or showed it belong here.`}</p>
          <Suspense><ReportError email={CORRECTIONS_EMAIL} /></Suspense>
        </section>
        <section className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
          <h2 className="text-lg font-extrabold">📜 {`திருத்தப் பதிவு · Corrections log`}</h2>
          <ol className="mt-2 space-y-3">{CORRECTIONS.map((c, i) => <li key={i} className="border-l-4 border-manjal-400 pl-3 text-sm" data-correction><div className="text-xs font-bold opacity-75">{new Date(c.date + "T12:00:00+05:30").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div><p>{c.ta}</p><p className="opacity-80">{c.en}</p></li>)}</ol>
        </section>
      </div>
    </>
  );
}
