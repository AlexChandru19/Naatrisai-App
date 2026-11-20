import type { Metadata } from "next";
import { getNifty50List } from "@/lib/stocks";
import { PageTitle } from "@/components/hero";
import { MarketsNav, WatchlistView } from "@/components/stocks-ui";

export const revalidate = 86400;
export const metadata: Metadata = { title: "என் பங்குக் கண்காணிப்பு · My stock watchlist", alternates: { canonical: "/markets/watchlist" }, robots: { index: false } };

export default async function Watchlist() {
  const l = await getNifty50List();
  return (
    <>
      <PageTitle emoji="⭐" ta="என் பங்குக் கண்காணிப்பு" en="My stock watchlist" subTa="நீங்கள் சேர்த்த NSE பங்குகளின் விலைகளும் அவை பற்றிய செய்திகளும் — இந்தச் சாதனத்தில் மட்டும்" subEn="Live quotes and news for the NSE stocks you pin — stored on this device only" />
      <MarketsNav />
      <WatchlistView suggestions={l.map(({ sym, name }) => ({ sym, name }))} />
    </>
  );
}
