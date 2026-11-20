import type { Metadata } from "next";
import { getSports } from "@/lib/sports";
import { getCricket } from "@/lib/cricket";
import { getTopic } from "@/lib/news";
import { PageTitle } from "@/components/hero";
import { Scoreboard } from "@/components/scoreboard";
import { CricketWidget } from "@/components/markets-widget";
import { Explorer } from "@/components/explorer";
import { L } from "@/components/providers";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "விளையாட்டு ஸ்கோர்கள் · Sports scores",
  description: "Live cricket, football (ISL, Premier League, Champions League, LaLiga), tennis and Formula 1 scores and fixtures, plus sports news.",
  alternates: { canonical: "/sports" },
};

export default async function SportsPage() {
  const [s, c, news] = await Promise.all([getSports(), getCricket(), getTopic("sports")]);
  return (
    <>
      <PageTitle emoji="🏆" ta="விளையாட்டு ஸ்கோர்கள்" en="Sports scores" subTa="கிரிக்கெட் · கால்பந்து · டென்னிஸ் · ஃபார்முலா 1 — நேரலை, முடிவுகள், அட்டவணை" subEn="Cricket · football · tennis · Formula 1 — live, results, fixtures" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4"><CricketWidget matches={c.matches} /></div>
        <Scoreboard leagues={s.leagues} />
      </div>
      <h2 className="mb-3 mt-8 text-xl font-extrabold">📰 <L ta="விளையாட்டுச் செய்திகள்" en="Sports news" /></h2>
      <Explorer articles={news.articles.slice(0, 120)} fetchedAt={news.fetchedAt} showTopics={false} />
    </>
  );
}
