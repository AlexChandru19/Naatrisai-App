import type { Metadata } from "next";
import { getAll } from "@/lib/news";
import { PageTitle } from "@/components/hero";
import { L } from "@/components/providers";

export const revalidate = 300;
export const metadata: Metadata = { title: "செய்தி மூலங்கள் · Sources", alternates: { canonical: "/sources" } };

export default async function Sources() {
  const { status, fetchedAt } = await getAll();
  return (
    <>
      <PageTitle emoji="📡" ta="செய்தி மூலங்கள் & நேரடி நிலை" en="Sources & live feed status" subTa="ஒவ்வொரு 5 நிமிடத்திற்கும் புதுப்பிக்கப்படுகிறது" subEn="Refreshed every 5 minutes" />
      <div className="mt-5 overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-white/10 dark:bg-ink-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs uppercase tracking-wider dark:bg-white/5"><tr><th className="p-3"><L ta="மூலம்" en="Source" /></th><th className="p-3"><L ta="செய்திகள்" en="Items" /></th><th className="hidden p-3 sm:table-cell">Feed</th></tr></thead>
          <tbody>
            {status.map((s) => (
              <tr key={s.url} className="border-t border-ink-100 dark:border-white/10">
                <td className="p-3 font-semibold">{s.count > 0 ? "🟢" : "🔴"} {s.source}</td>
                <td className="p-3 tabular-nums">{s.count}</td>
                <td className="hidden max-w-md truncate p-3 text-xs opacity-60 sm:table-cell"><a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.url}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs opacity-60">Snapshot: {new Date(fetchedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST · <L ta="மாவட்டம், மாநிலம், தலைப்புப் பக்கங்கள் கூடுதலாக Google செய்திகள் RSS தேடலைப் பயன்படுத்துகின்றன. வகைப்படுத்தல் சொல் அடிப்படையிலான தானியங்கி முறை; சில நேரம் தவறலாம்." en="District, state and topic pages additionally use Google News RSS search. Categorisation is automatic keyword-based tagging and can occasionally be wrong." /></p>
    </>
  );
}
