import type { Metadata } from "next";
import { getAll, getSection } from "@/lib/news";
import { BUCKETS, buildDigest, buildQuiz } from "@/lib/exam";
import { istDate } from "@/lib/calendar";
import { PageTitle } from "@/components/hero";
import { ExamDigest } from "@/components/exam-view";

export const revalidate = 1800;
export const metadata: Metadata = {
  title: "TNPSC / UPSC நடப்பு நிகழ்வுகள் · Current affairs digest",
  description: "Today's hard news sorted into TNPSC & UPSC syllabus areas — polity, economy, science, environment, international relations, Tamil Nadu affairs, sports & awards — with a quiz from real headlines.",
  alternates: { canonical: "/exam-digest" },
};

export default async function ExamDigestPage() {
  const [all, tn, india, world] = await Promise.all([getAll(), getSection("tamilnadu"), getSection("india"), getSection("world")]);
  const seen = new Set<string>();
  const pool = [...all.articles, ...tn.articles, ...india.articles, ...world.articles].filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));
  const d = buildDigest(pool);
  const date = istDate();
  const quiz = buildQuiz(Object.values(d).flat(), date);
  return (
    <>
      <PageTitle emoji="📚" ta="TNPSC / UPSC நடப்பு நிகழ்வுகள்" en="TNPSC / UPSC current affairs" subTa="இன்றைய முக்கியச் செய்திகள் பாடத்திட்டப் பிரிவுகளாக — சுருக்கக் குறிப்புகள், படிப்புப் பட்டியல், அச்சு/PDF, உண்மைத் தலைப்புகளில் வினாடி-வினா" subEn="Today's hard news in syllabus buckets — study bullets, study list, print/PDF and a quiz built from real headlines" />
      <ExamDigest buckets={BUCKETS.map(({ key, ta, en, emoji }) => ({ key, ta, en, emoji }))} items={d} quiz={quiz} date={date} />
    </>
  );
}
