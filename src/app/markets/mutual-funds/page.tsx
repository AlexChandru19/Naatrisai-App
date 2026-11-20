import type { Metadata } from "next";
import { PageTitle } from "@/components/hero";
import { MarketsNav } from "@/components/stocks-ui";
import { MutualFunds } from "@/components/mf-view";
export const metadata: Metadata = { title: "மியூச்சுவல் ஃபண்ட் NAV · Mutual fund NAV lookup", description: "Search the latest NAV of any Indian mutual fund scheme — official AMFI data.", alternates: { canonical: "/markets/mutual-funds" } };
export default function MfPage() {
  return (
    <>
      <PageTitle emoji="🏦" ta="மியூச்சுவல் ஃபண்ட் NAV" en="Mutual fund NAV lookup" subTa="எல்லா இந்தியத் திட்டங்களின் சமீபத்திய NAV — AMFI அதிகாரபூர்வத் தரவு, தினமும் புதுப்பிப்பு" subEn="Latest NAV for every Indian scheme — official AMFI data, updated daily" />
      <MarketsNav />
      <MutualFunds />
      <p className="mt-4 text-[11.5px] opacity-75">{`NAV என்பது முந்தைய வணிக நாளின் இறுதி மதிப்பு; முதலீட்டு ஆலோசனை அல்ல. · NAV is the previous business day's closing value, as published by AMFI. Not investment advice.`}</p>
    </>
  );
}
