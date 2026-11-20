import type { Metadata } from "next";
import { TopicGrid } from "@/components/topic-grid";
import { PageTitle } from "@/components/hero";

export const metadata: Metadata = { title: "தலைப்புகள் · Topics", alternates: { canonical: "/topics" } };
export default function Topics() {
  return (
    <>
      <PageTitle emoji="🗂️" ta="தலைப்பு வாரியாகச் செய்திகள்" en="News by topic" subTa="அரசியல் முதல் ஆன்மிகம் வரை — தானியங்கி வகைப்படுத்தல்" subEn="From politics to spirituality — automatically categorised" />
      <div className="mt-5"><TopicGrid /></div>
    </>
  );
}
