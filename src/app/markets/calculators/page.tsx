import type { Metadata } from "next";
import { getBullion } from "@/lib/bullion";
import { PageTitle } from "@/components/hero";
import { MarketsNav } from "@/components/stocks-ui";
import { GoldCalc, SipCalc } from "@/components/calculators";

export const revalidate = 1800;
export const metadata: Metadata = { title: "தங்க நகை & SIP கணிப்பான் · Gold jewellery & SIP calculators", description: "Gold jewellery price calculator with today's live Chennai and Tamil Nadu city rates (sovereign/pavan or grams, making charge, 3% GST), plus a SIP / lumpsum return estimator.", alternates: { canonical: "/markets/calculators" } };

export default async function Calculators() {
  const b = await getBullion();
  return (
    <>
      <PageTitle emoji="🧮" ta="கணிப்பான்கள்" en="Calculators" subTa="இன்றைய நேரடி தங்க விலையுடன் நகை விலைக் கணிப்பு · SIP / மொத்த முதலீட்டு வருமான மதிப்பீடு" subEn="Jewellery bill estimate using today's live gold rate · SIP / lumpsum return estimate" />
      <MarketsNav />
      <div className="mt-5 grid gap-5 lg:grid-cols-2"><GoldCalc cities={b.cities} date={b.goldDate} /><SipCalc /></div>
    </>
  );
}
