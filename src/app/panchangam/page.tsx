import type { Metadata } from "next";
import Link from "next/link";
import { panchangam, type Span } from "@/lib/panchangam";
import { istDate } from "@/lib/calendar";
import { PageTitle } from "@/components/hero";

export const metadata: Metadata = { title: "இன்றைய பஞ்சாங்கம் · Panchangam (Chennai)", description: "Tithi, nakshatra, yoga, karana, Rahu kalam, Yamagandam, sunrise and sunset for Chennai — computed astronomically.", alternates: { canonical: "/panchangam" } };
type P = { searchParams: Promise<{ d?: string }> };
const okDate = (d?: string) => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d) && Math.abs(Date.parse(d) - Date.now()) < 3 * 365 * 864e5;
const shift = (d: string, n: number) => new Date(Date.parse(d + "T12:00:00Z") + n * 864e5).toISOString().slice(0, 10);

export default async function PanchangamPage({ searchParams }: P) {
  const { d } = await searchParams;
  const date = okDate(d) ? d! : istDate();
  const cur = date;
  const tm = (s: string | null) => (s ? new Date(s).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }) + (new Date(s).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) !== cur ? " (" + new Date(s).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" }) + ")" : "") : "—");
  const span = (s: Span | null) => (s ? `${tm(s.from)} – ${tm(s.to)}` : "—");

  const p = panchangam(date);
  const row = ({ k, ta, en, ends, next }: { k: string; ta: string; en: string; ends?: string | null; next?: { ta: string; en: string } }) => (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900" data-pc={k}>
      <div className="text-xs font-bold uppercase tracking-wide opacity-70">{k}</div>
      <div className="mt-1 text-xl font-extrabold">{ta} <span className="text-sm font-semibold opacity-75">· {en}</span></div>
      {ends !== undefined && <div className="mt-1 text-sm opacity-85">{`வரை · until`} <b>{tm(ends)}</b>{next && <> → {next.ta} · {next.en}</>}</div>}
    </div>
  );
  const pretty = new Date(date + "T12:00:00+05:30").toLocaleDateString("ta-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <>
      <PageTitle emoji="🪔" ta="பஞ்சாங்கம்" en="Panchangam" subTa={`${pretty} · ${p.place.ta} · வானியல் கணக்கீடு`} subEn={`${p.weekday.en}, ${date} · ${p.place.en} · computed astronomically`} />
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold">
        <Link href={`/panchangam?d=${shift(date, -1)}`} className="rounded-full border border-ink-100 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-ink-900">← {`முந்தைய நாள்`}</Link>
        <Link href="/panchangam" className="rounded-full bg-kumkum-600 px-3 py-1.5 text-white">{`இன்று · Today`}</Link>
        <Link href={`/panchangam?d=${shift(date, 1)}`} className="rounded-full border border-ink-100 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-ink-900">{`அடுத்த நாள்`} →</Link>
      </div>
      <section className="mt-4 rounded-3xl bg-gradient-to-br from-kumkum-600 to-manjal-500 p-5 text-white">
        <div className="text-sm font-bold opacity-90">{p.tamil.year.ta} {`ஆண்டு`} · {p.weekday.ta}</div>
        <div className="mt-1 text-3xl font-black">{p.tamil.month.ta} {p.tamil.day ?? ""}</div>
        <div className="text-sm opacity-90">{p.tamil.month.en} {p.tamil.day ?? ""} · {p.paksha.ta} ({p.paksha.en})</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div>🌅 {`சூரிய உதயம்`}<br /><b>{tm(p.sunrise)}</b></div><div>🌇 {`சூரிய அஸ்தமனம்`}<br /><b>{tm(p.sunset)}</b></div>
          <div>🌙 {`சந்திர உதயம்`}<br /><b>{tm(p.moonrise)}</b></div><div>🌘 {`சந்திர அஸ்தமனம்`}<br /><b>{tm(p.moonset)}</b></div>
        </div>
      </section>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {row({ k: "திதி · Tithi", ta: p.tithi.ta, en: p.tithi.en, ends: p.tithi.ends, next: p.tithi.next })}
        {row({ k: "நட்சத்திரம் · Nakshatra", ta: p.nakshatra.ta, en: p.nakshatra.en, ends: p.nakshatra.ends, next: p.nakshatra.next })}
        {row({ k: "யோகம் · Yoga", ta: p.yoga.ta, en: p.yoga.en, ends: p.yoga.ends, next: p.yoga.next })}
        {row({ k: "கரணம் · Karana", ta: p.karana.ta, en: p.karana.en, ends: p.karana.ends })}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {([["⛔ ராகு காலம் · Rahu kalam", p.rahu], ["⚠️ எமகண்டம் · Yamagandam", p.yama], ["🔸 குளிகை · Kuligai", p.kuligai]] as const).map(([k, s]) => <div key={k} className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900"><div className="text-sm font-bold">{k}</div><div className="mt-1 text-lg font-extrabold tabular-nums">{span(s)}</div></div>)}
      </div>
      <p className="mt-5 rounded-2xl border border-manjal-400/50 bg-manjal-300/15 p-4 text-[12.5px] leading-relaxed">
        ℹ️ {`இந்தப் பஞ்சாங்கம் வானியல் கணக்கீட்டால் உருவாக்கப்பட்டது (astronomy-engine நூலகம், லாஹிரி அயனாம்சம், சென்னை) — எந்த வெளி இணையதளத்திலிருந்தும் எடுக்கப்படவில்லை. நேரங்கள் அச்சிடப்பட்ட பஞ்சாங்கங்களுடன் சில நிமிடங்கள் வேறுபடலாம்; திருமணம், விரதம் போன்ற சமயக் காரியங்களுக்கு உங்கள் குடும்பப் பஞ்சாங்கம் / ஜோதிடரை அணுகவும்.`}<br />
        {`Computed astronomically (astronomy-engine, Lahiri ayanamsa, Chennai). Not copied from any website. Times can differ by a few minutes from printed panchangams — check your family panchangam for religious observances. Rahu kalam / Yamagandam / Kuligai use the standard one-eighth-of-daytime method.`}
      </p>
    </>
  );
}
