import type { Metadata } from "next";
import { PageTitle } from "@/components/hero";
import { WatchwordsView } from "@/components/watchwords";
export const metadata: Metadata = { title: "என் கண்காணிப்புச் சொற்கள் · My watchwords", alternates: { canonical: "/watchwords" }, robots: { index: false } };
export default function Watchwords() {
  return (
    <>
      <PageTitle emoji="🔔" ta="என் கண்காணிப்புச் சொற்கள்" en="My watchwords" subTa="நீங்கள் கவனிக்கும் சொற்கள் வரும் எல்லாச் செய்திகளும் ஒரே இடத்தில் — எ.கா. TNPSC, சென்னை மெட்ரோ, ISRO" subEn="Every story that mentions the words you track, in one place — e.g. TNPSC, Chennai Metro, ISRO" />
      <WatchwordsView />
    </>
  );
}
