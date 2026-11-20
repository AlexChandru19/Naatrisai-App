import type { Metadata } from "next";
import { getHolidays, getOnThisDay, istDate } from "@/lib/calendar";
import { getTopic } from "@/lib/news";
import { WorldClock } from "@/components/world-clock";
import { PageTitle } from "@/components/hero";
import { TodayCard, HolidayList, OnThisDay } from "@/components/calendar-view";
import { Explorer } from "@/components/explorer";
import { L } from "@/components/providers";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "நாள்காட்டி & வரலாற்றில் இன்று · Calendar & on this day",
  description: "Upcoming public holidays and festivals in India with countdowns, plus what happened on this day in history.",
  alternates: { canonical: "/calendar" },
};

export default async function CalendarPage() {
  const [h, o, sp] = await Promise.all([getHolidays(), getOnThisDay(), getTopic("spiritual")]);
  const today = istDate();
  return (
    <>
      <PageTitle emoji="📅" ta="நாள்காட்டி & வரலாற்றில் இன்று" en="Calendar & on this day" subTa="விடுமுறைகள், விழாக்கள், இந்த நாளின் வரலாறு" subEn="Holidays, festivals and this day in history" />
      <WorldClock />
      <div className="mt-5 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-5"><TodayCard server={today} /><HolidayList list={h.list.filter((x) => x.date >= today).slice(0, 160)} server={today} /></div>
        <div className="space-y-5">
          <OnThisDay items={o.items} max={20} />
          <div>
            <h2 className="mb-3 text-xl font-extrabold">🛕 <L ta="ஆன்மிகம் & விழாச் செய்திகள்" en="Festivals & spiritual news" /></h2>
            <Explorer articles={sp.articles.slice(0, 60)} fetchedAt={sp.fetchedAt} showTopics={false} />
          </div>
        </div>
      </div>
    </>
  );
}
