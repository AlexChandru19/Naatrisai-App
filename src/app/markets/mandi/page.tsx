import type { Metadata } from "next";
import { PageTitle } from "@/components/hero";
import { MarketsNav } from "@/components/stocks-ui";

export const revalidate = 3600;
export const metadata: Metadata = { title: "மண்டி விலைகள் · Mandi (APMC) prices — Tamil Nadu", alternates: { canonical: "/markets/mandi" } };

type Rec = { state: string; district: string; market: string; commodity: string; variety: string; arrival_date: string; min_price: string; max_price: string; modal_price: string };
/** Agmarknet daily mandi prices via data.gov.in (Open Government Data). Needs a free API key in DATA_GOV_IN_KEY. */
async function getMandi(): Promise<Rec[] | null> {
  const key = process.env.DATA_GOV_IN_KEY;
  if (!key) return null;
  try {
    const u = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${encodeURIComponent(key)}&format=json&limit=500&filters[state]=Tamil%20Nadu`;
    const r = await fetch(u, { next: { revalidate: 3600 }, headers: { "User-Agent": "Mozilla/5.0 (compatible; NaatrisaiBot/1.0; +https://naatrisai.vercel.app/about)" }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) return [];
    return ((await r.json()).records ?? []) as Rec[];
  } catch { return []; }
}

export default async function MandiPage() {
  const recs = await getMandi();
  return (
    <>
      <PageTitle emoji="🌾" ta="மண்டி விலைகள் — தமிழ்நாடு" en="Mandi prices — Tamil Nadu" subTa="Agmarknet / data.gov.in — ஒழுங்குமுறை விற்பனைக் கூடங்களின் தினசரி விலை (₹/குவிண்டால்)" subEn="Agmarknet via data.gov.in — daily APMC prices (₹ per quintal)" />
      <MarketsNav />
      {recs === null ? (
        <section className="mt-5 rounded-2xl border border-dashed border-ink-200 bg-white p-5 dark:border-white/15 dark:bg-ink-900">
          <h2 className="text-lg font-extrabold">⏳ {`விரைவில் · Coming soon`}</h2>
          <p className="mt-1 text-sm opacity-80">{`அரசின் திறந்த தரவு (data.gov.in) API சாவி அமைக்கப்பட்டதும் இங்கு மாவட்ட வாரியான காய்கறி, தானிய விலைகள் தோன்றும். மதிப்பீடுகளைக் காட்டுவதில்லை.`} · {`District-wise vegetable and grain prices will appear here once a data.gov.in API key is configured. We don't show estimates in the meantime.`}</p>
        </section>
      ) : recs.length === 0 ? (
        <p className="mt-5 text-sm opacity-70">{`தரவு கிடைக்கவில்லை (data.gov.in பதிலளிக்கவில்லை).`} · {`No data right now (data.gov.in did not respond).`}</p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-ink-100 bg-white dark:border-white/10 dark:bg-ink-900">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase opacity-70"><th className="p-2">{`பொருள் · Commodity`}</th><th className="p-2">{`சந்தை · Market`}</th><th className="p-2 text-right">Min</th><th className="p-2 text-right">Modal</th><th className="p-2 text-right">Max</th><th className="p-2">{`தேதி · Date`}</th></tr></thead>
            <tbody>{recs.map((r, i) => <tr key={i} className="border-t border-ink-100 dark:border-white/10"><td className="p-2 font-semibold">{r.commodity}{r.variety && r.variety !== "Other" ? ` · ${r.variety}` : ""}</td><td className="p-2">{r.market}, {r.district}</td><td className="p-2 text-right tabular-nums">₹{r.min_price}</td><td className="p-2 text-right font-bold tabular-nums">₹{r.modal_price}</td><td className="p-2 text-right tabular-nums">₹{r.max_price}</td><td className="p-2 tabular-nums">{r.arrival_date}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[11px] opacity-70">{`ஆதாரம்: Agmarknet, வேளாண் அமைச்சகம் (data.gov.in, OGD உரிமம்)`} · {`Source: Agmarknet, Ministry of Agriculture (data.gov.in, Government Open Data Licence)`}</p>
    </>
  );
}
