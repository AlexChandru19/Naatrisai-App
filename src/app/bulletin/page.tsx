import type { Metadata } from "next";
import { getBulletin } from "@/lib/bulletin";
import { PageTitle, Bulletin } from "@/components/hero";
import { BulletinShare } from "@/components/bulletin-share";

export const revalidate = 600;
export const metadata: Metadata = { title: "காலை / மாலைச் செய்திச் சுருக்கம் · WhatsApp bulletin", description: "Twice-daily (7 am & 7 pm IST) Tamil news bulletin ready to forward on WhatsApp or Telegram.", alternates: { canonical: "/bulletin" },
  openGraph: { images: [{ url: "/og?t=" + encodeURIComponent("நாற்றிசை — இன்றைய செய்திச் சுருக்கம்"), width: 1200, height: 630 }] } };

const t = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }) + " IST" : "");
export default async function BulletinPage() {
  const b = await getBulletin();
  const all = b.sections.flatMap((s) => s.items);
  return (
    <>
      <PageTitle emoji={b.edition.morning ? "🌅" : "🌆"} ta={`${b.edition.ta}`} en={b.edition.en} subTa={`${b.edition.dateTa} · WhatsApp / Telegram-இல் அனுப்பத் தயார்`} subEn={`${b.edition.dateEn} · ready to forward on WhatsApp / Telegram`} />
      <div className="mt-4 flex flex-wrap items-center gap-2"><BulletinShare text={b.text} /><Bulletin items={all} max={all.length} /></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          {b.sections.filter((s) => s.items.length).map((s) => (
            <section key={s.key} className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
              <h2 className="text-lg font-extrabold">{s.ta} <span className="text-sm font-semibold opacity-70">· {s.en}</span></h2>
              <ol className="mt-2 list-decimal space-y-2 pl-5">
                {s.items.map((a) => <li key={a.id}><a href={a.link} target="_blank" rel="noopener noreferrer" lang={a.lang} className="font-bold hover:underline">{a.title}</a> <span className="text-xs opacity-75">— {a.source} · {t(a.publishedAt)}</span></li>)}
              </ol>
            </section>
          ))}
        </div>
        <aside className="space-y-4">
          <section className="rounded-2xl border border-ink-100 bg-white p-4 text-sm dark:border-white/10 dark:bg-ink-900">
            <h2 className="font-extrabold">💹 {`சந்தை · Money`}</h2>
            <ul className="mt-2 space-y-1">
              {b.gold && <li>🪙 22K {`தங்கம் (சென்னை)`}: <b>₹{b.gold.k22.toLocaleString("en-IN")}</b>/g</li>}
              {b.fuel?.petrol && <li>⛽ {`பெட்ரோல் (சென்னை)`}: <b>₹{b.fuel.petrol.toFixed(2)}</b>{b.fuel.diesel ? <> · டீசல் <b>₹{b.fuel.diesel.toFixed(2)}</b></> : null}</li>}
              {b.nifty && <li>📈 NIFTY 50: <b>{b.nifty.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</b> ({b.nifty.pct >= 0 ? "+" : ""}{b.nifty.pct.toFixed(2)}%)</li>}
              {b.sensex && <li>📈 SENSEX: <b>{b.sensex.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</b> ({b.sensex.pct >= 0 ? "+" : ""}{b.sensex.pct.toFixed(2)}%)</li>}
            </ul>
            <p className="mt-2 text-[11px] opacity-75">Goodreturns · Yahoo Finance (delayed)</p>
          </section>
          <section className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
            <h2 className="text-sm font-extrabold">📱 {`WhatsApp உரை முன்னோட்டம் · Message preview`}</h2>
            <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-ink-50 p-3 text-[12.5px] leading-relaxed dark:bg-white/5" data-bulletin-text>{b.text}</pre>
            <p className="mt-2 text-[11px] opacity-75">{`தலைப்புகள் மட்டும் — ஒவ்வொரு வெளியீட்டாளரின் பெயருடன். · Headlines only, each credited to its publisher.`}</p>
          </section>
        </aside>
      </div>
    </>
  );
}
