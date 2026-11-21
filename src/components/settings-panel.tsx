"use client";
import Link from "next/link";
import { useRef } from "react";
import { useCatchUpPref } from "./catch-up";
import { usePrefs, MODULES, type TextSize, type Module } from "./providers";
import { TOPICS } from "@/lib/topics";
import { DISTRICTS, STATES } from "@/lib/geo";
import { A11ySettings } from "./a11y";
import { AppearanceSettings } from "./appearance";

const MOD_L: Record<Module, [string, string]> = {
  alerts: ["⚠️ எச்சரிக்கைகள்", "⚠️ Alerts"], rates: ["🥇 தங்கம்·எரிபொருள்·சந்தை", "🥇 Gold·fuel·markets"], weather: ["🌦️ வானிலை", "🌦️ Weather"],
  town: ["📍 என் ஊர்", "📍 My town"], videos: ["📺 காணொளிகள்", "📺 Videos"], cricket: ["🏏 கிரிக்கெட்", "🏏 Cricket"],
  trending: ["🔥 டிரெண்டிங்", "🔥 Trending"], history: ["📜 வரலாற்றில் இன்று", "📜 On this day"], quiz: ["🧠 வினாடி வினா", "🧠 Quiz"],
};

/** Share of reads per key, computed only from this device's history. */
function mix(recs: { [k: string]: unknown }[], f: (r: never) => string[], n = 5) {
  const c = new Map<string, number>(); let tot = 0;
  for (const r of recs) for (const k of f(r as never)) { c.set(k, (c.get(k) ?? 0) + 1); tot++; }
  return { tot, top: [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, n) };
}

function Bars({ title, data, label }: { title: string; data: ReturnType<typeof mix>; label: (k: string) => string }) {
  if (!data.tot) return null;
  return (
    <div className="mt-2">
      <div className="text-xs font-bold opacity-70">{title}</div>
      {data.top.map(([k, v]) => (
        <div key={k} className="mt-1 flex items-center gap-2 text-xs">
          <span className="w-28 shrink-0 truncate">{label(k)}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10"><span className="block h-full rounded-full bg-kumkum-600" style={{ width: `${(v / data.tot) * 100}%` }} /></span>
          <span className="w-9 text-right tabular-nums">{Math.round((v / data.tot) * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const p = usePrefs();
  const cu = useCatchUpPref();
  const ta = p.lang === "ta";
  const row = "flex items-center justify-between gap-3 py-3 border-b border-ink-100 dark:border-white/10";
  const sw = (on: boolean, f: () => void, label: string) => (
    <button role="switch" aria-checked={on} aria-label={label} onClick={f} className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-kumkum-600" : "bg-ink-100 dark:bg-white/15"}`}>
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
  const sizes: { v: TextSize; l: string }[] = [{ v: "s", l: "அ-" }, { v: "m", l: "அ" }, { v: "l", l: "அ+" }, { v: "xl", l: "அ++" }, { v: "xxl", l: "அ+++" }];
  const name = (k: "topics" | "districts" | "states", v: string) => {
    const x = k === "topics" ? TOPICS.find((t) => t.slug === v) : k === "districts" ? DISTRICTS.find((d) => d.slug === v) : STATES.find((s) => s.slug === v);
    return x ? (ta ? x.ta : x.en) : v;
  };
  const follows = (["topics", "districts", "states"] as const).flatMap((k) => p.follows[k].map((v) => ({ k, v })));
  const file = useRef<HTMLInputElement>(null);
  const recs = Object.values(p.read) as unknown as { [k: string]: unknown }[];
  const SEC: Record<string, [string, string]> = { tamilnadu: ["தமிழ்நாடு", "Tamil Nadu"], india: ["இந்தியா", "India"], world: ["உலகம்", "World"], ta: ["தமிழ்", "Tamil"], en: ["ஆங்கிலம்", "English"] };
  const exportData = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; if (k.startsWith("ns-")) data[k] = localStorage.getItem(k)!; }
    const url = URL.createObjectURL(new Blob([JSON.stringify({ app: "naatrisai", v: 1, at: new Date().toISOString(), data }, null, 1)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `naatrisai-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  const importData = async (f: File) => {
    try {
      const j = JSON.parse(await f.text());
      if (j?.app !== "naatrisai" || typeof j.data !== "object") throw new Error("bad");
      for (const [k, v] of Object.entries(j.data)) if (k.startsWith("ns-") && typeof v === "string") localStorage.setItem(k, v);
      location.reload();
    } catch { alert(ta ? "இது சரியான நாற்றிசை காப்புக் கோப்பு அல்ல." : "That isn't a valid Naatrisai backup file."); }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 backdrop-blur-[2px] sm:place-items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label={ta ? "அமைப்புகள்" : "Settings"}>
      <div onClick={(e) => e.stopPropagation()} className="fade-up max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl dark:bg-ink-900">
        <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">⚙️ {ta ? "அமைப்புகள்" : "Settings"}</h2><button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink-100 dark:hover:bg-white/10">✕</button></div>
        <p className="mt-1 text-xs opacity-60">{ta ? "எல்லாம் இந்தச் சாதனத்தில் மட்டுமே சேமிக்கப்படும் — கணக்கு தேவையில்லை." : "Everything stays on this device — no account needed."}</p>
        <AppearanceSettings ta={ta} row={row} view={p.view} setView={p.setView} />
        <div className={row}>
          <div><b>{ta ? "எழுத்து அளவு" : "Text size"}</b></div>
          <div className="flex rounded-full border border-ink-100 p-0.5 dark:border-white/10" role="group" aria-label="Text size">
            {sizes.map((s) => <button key={s.v} aria-pressed={p.textSize === s.v} onClick={() => p.setTextSize(s.v)} className={`rounded-full px-3 py-1 text-sm font-bold ${p.textSize === s.v ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : ""}`}>{s.l}</button>)}
          </div>
        </div>
        <div className={row}><div><b>{ta ? "எளிய / முதியோர் பயன்முறை" : "Simple / elder mode"}</b><p className="text-xs opacity-60">{ta ? "பெரிய எழுத்து, அதிக வேறுபாடு, குறைவான அலங்காரம்" : "Bigger text, higher contrast, fewer extras"}</p></div>{sw(p.simple, () => p.setSimple(!p.simple), "Simple mode")}</div>
        <div className={row}><div><b>{ta ? "லைட் / டேட்டா சேமிப்பு" : "Lite / data saver"}</b><p className="text-xs opacity-60">{ta ? "படங்களை ஏற்றாது — மெதுவான இணையத்திற்கு" : "Skips images — for slow or metered data"}</p></div>{sw(p.lite, () => p.setLite(!p.lite), "Lite mode")}</div>
        <div className={row}><div><b>{ta ? "“கடைசி வருகைக்குப் பின்” பெட்டியைக் காட்டு" : "Show “since your last visit” box"}</b><p className="text-xs opacity-60">{ta ? "முகப்பில் நீங்கள் வராத நேரத்தின் புதிய செய்திகள்" : "New stories since you were last here, on the home page"}</p></div>{sw(cu.show, () => cu.setShow(!cu.show), ta ? "கடைசி வருகைக்குப் பின் பெட்டி" : "Since your last visit box")}</div>
        <A11ySettings ta={ta} row={row} sw={sw} />
        <div className={row}><div><b>{ta ? "இடைமுக மொழி" : "Interface language"}</b></div>
          <div className="flex rounded-full border border-ink-100 p-0.5 text-sm font-bold dark:border-white/10">
            <button aria-pressed={p.lang === "ta"} onClick={() => p.setLang("ta")} className={`rounded-full px-3 py-1 ${p.lang === "ta" ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : ""}`}>தமிழ்</button>
            <button aria-pressed={p.lang === "en"} onClick={() => p.setLang("en")} className={`rounded-full px-3 py-1 ${p.lang === "en" ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : ""}`}>English</button>
          </div>
        </div>
        <div className="py-3">
          <div className="flex items-center justify-between"><b>{ta ? "பின்தொடர்பவை" : "Following"} ({follows.length})</b><Link onClick={onClose} href="/for-you?setup=1" className="text-sm font-bold text-kumkum-600 dark:text-manjal-400">{ta ? "மாற்று →" : "Edit →"}</Link></div>
          <div className="mt-2 flex flex-wrap gap-1.5">{follows.length ? follows.map((f) => <button key={f.k + f.v} onClick={() => p.toggleFollow(f.k, f.v)} className="rounded-full border border-ink-100 px-2.5 py-1 text-xs font-semibold dark:border-white/10">{name(f.k, f.v)} ✕</button>) : <span className="text-sm opacity-60">{ta ? "இன்னும் எதுவும் இல்லை" : "Nothing yet"}</span>}</div>
        </div>
        {(p.hidden.sources.length > 0 || p.hidden.ids.length > 0) && (
          <div className="border-t border-ink-100 py-3 dark:border-white/10">
            <b>{ta ? "மறைத்தவை" : "Hidden"}</b>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.hidden.sources.map((s) => <button key={s} onClick={() => p.unhide("sources", s)} className="rounded-full border border-ink-100 px-2.5 py-1 text-xs font-semibold dark:border-white/10">🚫 {s} ↺</button>)}
              {p.hidden.ids.length > 0 && <button onClick={() => p.hidden.ids.forEach((i) => p.unhide("ids", i))} className="rounded-full border border-ink-100 px-2.5 py-1 text-xs font-semibold dark:border-white/10">🙈 {p.hidden.ids.length} {ta ? "செய்திகள் ↺" : "stories ↺"}</button>}
            </div>
          </div>
        )}
        <div className="border-t border-ink-100 py-3 text-sm dark:border-white/10">
          <b>{ta ? "உங்கள் வாசிப்பு" : "Your reading"}</b>
          <p className="mt-1 opacity-75">🔥 {ta ? `${p.streak} நாள் தொடர்` : `${p.streak}-day streak`} · 📖 {ta ? `இன்று ${p.readToday} செய்திகள்` : `${p.readToday} stories today`} · {ta ? `மொத்தம் ${Object.keys(p.read).length}` : `${Object.keys(p.read).length} total`}</p>
          {recs.length >= 3 ? (
            <div className="mt-2 rounded-2xl bg-ink-50 p-3 dark:bg-white/5">
              <div className="font-bold">📊 {ta ? "என் வாசிப்புக் கலவை" : "My reading mix"} <span className="text-xs font-normal opacity-60">({ta ? `கடைசி ${recs.length} செய்திகள்` : `last ${recs.length} stories`})</span></div>
              <Bars title={ta ? "பிரிவு" : "Section"} data={mix(recs, (r: { section?: string }) => r.section ? [r.section] : [])} label={(k) => SEC[k]?.[ta ? 0 : 1] ?? k} />
              <Bars title={ta ? "மொழி" : "Language"} data={mix(recs, (r: { lang?: string }) => r.lang ? [r.lang] : [])} label={(k) => SEC[k]?.[ta ? 0 : 1] ?? k} />
              <Bars title={ta ? "தலைப்புகள்" : "Topics"} data={mix(recs, (r: { topics: string[] }) => r.topics ?? [])} label={(k) => name("topics", k)} />
              <Bars title={ta ? "மூலங்கள்" : "Sources"} data={mix(recs, (r: { source: string }) => [r.source])} label={(k) => k} />
              <Bars title={ta ? "மாவட்டங்கள்" : "Districts"} data={mix(recs, (r: { districts: string[] }) => r.districts ?? [], 3)} label={(k) => name("districts", k)} />
              <p className="mt-2 text-[11px] opacity-60">{ta ? "நீங்கள் திறந்த செய்திகளிலிருந்து இந்தச் சாதனத்திலேயே கணக்கிடப்பட்டது. ஒரே மூலத்தை அதிகம் படித்தால், பிற பார்வைகளுக்கு “முழு கவரேஜ்” பாருங்கள்." : "Computed on this device from stories you opened. If one source dominates, try “Full coverage” for other perspectives."}</p>
            </div>
          ) : <p className="mt-1 text-xs opacity-60">{ta ? "3+ செய்திகள் படித்த பின் உங்கள் வாசிப்புக் கலவை இங்கே தோன்றும்." : "Read 3+ stories to see your reading mix here."}</p>}
          <button onClick={() => { if (confirm(ta ? "இந்தச் சாதனத்தில் உள்ள வாசிப்பு வரலாற்றை அழிக்கவா?" : "Clear reading history on this device?")) { localStorage.removeItem("ns-read"); location.reload(); } }} className="mt-2 rounded-full border border-ink-100 px-3 py-1 text-xs font-bold dark:border-white/10">{ta ? "வரலாற்றை அழி" : "Clear history"}</button>
        </div>
        <div className="border-t border-ink-100 py-3 dark:border-white/10">
          <b>{ta ? "முகப்புப் பகுதிகள்" : "Home page sections"}</b>
          <p className="text-xs opacity-60">{ta ? "முகப்பில் எவை தெரிய வேண்டும் என்பதைத் தேர்ந்தெடுங்கள்" : "Choose what shows on the home page"}</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {MODULES.map((m) => { const on = !p.offMods.includes(m); return <button key={m} role="switch" aria-checked={on} onClick={() => p.toggleMod(m)} className={`rounded-xl border px-2.5 py-2 text-left text-xs font-bold ${on ? "border-peacock-600 bg-peacock-600/10" : "border-ink-100 opacity-60 line-through dark:border-white/10"}`}>{on ? "✓ " : ""}{MOD_L[m][ta ? 0 : 1]}</button>; })}
          </div>
        </div>
        <div className="border-t border-ink-100 py-3 dark:border-white/10">
          <b>{ta ? "காப்பு / மாற்றம்" : "Backup / move device"}</b>
          <p className="text-xs opacity-60">{ta ? "சேமித்தவை, பின்தொடர்வுகள், அமைப்புகளை ஒரு கோப்பாகச் சேமித்து வேறு சாதனத்தில் ஏற்றலாம்." : "Save your saved stories, follows and settings to a file and load them on another device."}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={exportData} className="rounded-full border border-ink-100 px-3 py-1.5 text-xs font-bold dark:border-white/10">⬇️ {ta ? "ஏற்றுமதி" : "Export"}</button>
            <button onClick={() => file.current?.click()} className="rounded-full border border-ink-100 px-3 py-1.5 text-xs font-bold dark:border-white/10">⬆️ {ta ? "இறக்குமதி" : "Import"}</button>
            <input ref={file} type="file" accept="application/json,.json" className="hidden" aria-label="Import backup" onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); }} />
            <button onClick={() => { if (confirm(ta ? "இந்தச் சாதனத்தில் உள்ள எல்லா நாற்றிசை தரவையும் அழிக்கவா?" : "Erase all Naatrisai data on this device?")) { Object.keys(localStorage).filter((k) => k.startsWith("ns-")).forEach((k) => localStorage.removeItem(k)); location.reload(); } }} className="rounded-full border border-kumkum-600/40 px-3 py-1.5 text-xs font-bold text-kumkum-600">🗑️ {ta ? "அனைத்தையும் அழி" : "Erase all"}</button>
          </div>
        </div>
        <Link href="/about" onClick={onClose} className="mb-2 block text-center text-xs font-bold text-kumkum-600 underline dark:text-manjal-400">{ta ? "எப்படி வேலை செய்கிறது · தனியுரிமை" : "How it works · privacy"}</Link>
        <button onClick={() => { onClose(); window.dispatchEvent(new Event("ns:shortcuts")); }} className="mt-1 w-full rounded-2xl border border-ink-100 py-2.5 text-sm font-bold dark:border-white/10">⌨️ {ta ? "விசைப்பலகைக் குறுக்குவழிகள் ( ? )" : "Keyboard shortcuts ( ? )"}</button>
      </div>
    </div>
  );
}
