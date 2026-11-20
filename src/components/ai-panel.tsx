"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePrefs } from "./providers";

type Lang = "ta" | "en";
type Feature = "summary" | "explain" | "differ" | "translate" | "ask" | "briefing";
type Res = { feature: Feature; lang: Lang; data: Record<string, unknown>; model: string; at: string; cached?: boolean };
type St = { s: "idle" | "loading" | "done" | "error"; r?: Res; err?: string };

const ERR: Record<string, [string, string]> = {
  needs_setup: ["AI வசதிகள் தயார் — தள உரிமையாளர் AI சேவையை இயக்கியதும் கிடைக்கும்.", "AI features are built and will appear once the site owner switches on the AI service."],
  disabled: ["AI வசதி தற்போது அணைக்கப்பட்டுள்ளது.", "AI features are switched off right now."],
  not_configured: ["AI சேவை இணைக்கப்படவில்லை.", "The AI service isn't connected."],
  quota: ["இன்றைய AI ஒதுக்கீடு தீர்ந்துவிட்டது. பிறகு முயலவும்.", "The AI quota is used up for now. Please try later."],
  busy: ["AI சேவை பரபரப்பாக உள்ளது. சிறிது நேரத்தில் மீண்டும் முயலவும்.", "The AI service is busy. Try again shortly."],
  rate_limited: ["சற்று அதிகமான கோரிக்கைகள் — சில நிமிடங்களில் முயலவும்.", "Too many requests — try again in a few minutes."],
  not_found: ["இந்தச் செய்தி நேரலைத் தொகுப்பில் இல்லை; AI கிடைக்காது.", "This story has left the live feed, so AI isn't available."],
  bad_request: ["கோரிக்கை சரியில்லை.", "That request wasn't valid."],
  failed: ["AI உருவாக்க முடியவில்லை. மீண்டும் முயலவும்.", "Couldn't generate that. Please try again."],
};

async function call(feature: Feature, lang: Lang, id?: string, q?: string, peek = false): Promise<Res | { error: string } | { cached: false }> {
  try {
    const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feature, lang, id, q, peek, path: location.pathname + location.search }) });
    return await r.json();
  } catch { return { error: "failed" }; }
}

let statusP: Promise<{ enabled: boolean; reason?: string }> | null = null;
function useAiStatus() {
  const [st, setSt] = useState<{ enabled: boolean; reason?: string } | null>(null);
  useEffect(() => {
    statusP ??= fetch("/api/ai/status").then((r) => r.json()).catch(() => ({ enabled: false, reason: "failed" }));
    let live = true; statusP.then((s) => { if (live) setSt(s); }); return () => { live = false; };
  }, []);
  return st;
}

function useAi(feature: Feature, lang: Lang, id?: string) {
  const [st, setSt] = useState<St>({ s: "idle" });
  // Free "peek": show an already-generated (cached) result without spending anything.
  useEffect(() => {
    let live = true;
    setSt({ s: "idle" }); // eslint-disable-line react-hooks/set-state-in-effect
    if (feature !== "ask") call(feature, lang, id, undefined, true).then((r) => { if (live && "data" in r) setSt({ s: "done", r }); });
    return () => { live = false; };
  }, [feature, lang, id]);
  const run = useCallback(async (q?: string) => {
    setSt({ s: "loading" });
    const r = await call(feature, lang, id, q);
    if ("data" in r) setSt({ s: "done", r }); else setSt({ s: "error", err: "error" in r ? r.error : "failed" });
  }, [feature, lang, id]);
  return { st, run };
}

export function useAiEnabled() { const s = useAiStatus(); return !!s?.enabled; }

export function AiLabel({ r, ta }: { r?: Res; ta: boolean }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] leading-snug opacity-70">
      <span className="rounded bg-violet-600/15 px-1.5 py-0.5 font-black text-violet-700 dark:text-violet-300">✨ AI</span>
      <span>{ta ? "AI உருவாக்கியது — இங்கு காட்டப்படும் தலைப்பு/குறிப்புகளிலிருந்து மட்டுமே; தவறுகள் இருக்கலாம். மூலச் செய்தியைப் படிக்கவும்." : "AI-generated from only the headline/summaries shown here — may contain mistakes. Read the original."}</span>
      {r && <span suppressHydrationWarning>· {r.model.split("/").pop()} · {new Date(r.at).toLocaleString(ta ? "ta-IN" : "en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", day: "numeric", month: "short" })} IST{r.cached ? (ta ? " · சேமிப்பிலிருந்து" : " · cached") : ""}</span>}
    </p>
  );
}

function LangToggle({ v, set }: { v: Lang; set: (l: Lang) => void }) {
  return (
    <div className="flex rounded-full border border-ink-100 p-0.5 text-xs font-bold dark:border-white/10" role="group" aria-label="AI output language">
      {(["ta", "en"] as const).map((l) => <button key={l} aria-pressed={v === l} onClick={() => set(l)} className={`rounded-full px-2.5 py-0.5 ${v === l ? "bg-violet-600 text-white" : ""}`}>{l === "ta" ? "தமிழ்" : "English"}</button>)}
    </div>
  );
}

const Spinner = ({ ta }: { ta: boolean }) => <p className="animate-pulse py-3 text-sm opacity-70">✨ {ta ? "உருவாக்குகிறது…" : "Generating…"}</p>;
const Thin = ({ ta }: { ta: boolean }) => <p className="text-sm opacity-80">ℹ️ {ta ? "இங்கு கிடைக்கும் உரை மிகக் குறைவு — AI இதைச் சுருக்க முடியாது. முழு விவரத்திற்கு மூலச் செய்தியைத் திறக்கவும்." : "There's too little text available for AI to work with — open the original article for details."}</p>;

function Body({ r, ta }: { r: Res; ta: boolean }) {
  const d = r.data as Record<string, unknown>;
  if (d.insufficient) return <Thin ta={ta} />;
  if (r.feature === "summary") {
    const pts = (d.points as string[]) ?? []; const ents = (d.entities as { name: string; label: string; kind: string }[]) ?? [];
    if (!pts.length) return <Thin ta={ta} />;
    return (
      <div>
        <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed" lang={r.lang}>{pts.map((p, i) => <li key={i}>{p}</li>)}</ul>
        {ents.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{ents.map((e) => <Link key={e.name} href={`/search?q=${encodeURIComponent(e.name)}`} className="rounded-full border border-violet-500/30 px-2 py-0.5 text-xs font-semibold hover:bg-violet-500/10">{e.kind === "person" ? "👤" : e.kind === "place" ? "📍" : e.kind === "organisation" ? "🏛️" : "🔖"} {e.label || e.name}</Link>)}</div>}
      </div>
    );
  }
  if (r.feature === "explain") return d.text ? <p className="text-[15px] leading-relaxed" lang={r.lang}>{String(d.text)}</p> : <Thin ta={ta} />;
  if (r.feature === "differ") {
    const ang = (d.angles as { source: string; note: string }[]) ?? [];
    if (!d.overview && !ang.length) return <p className="text-sm opacity-80">ℹ️ {ta ? "ஒப்பிட ஒன்றுக்கு மேற்பட்ட ஊடகங்களின் செய்தி இல்லை." : "Not enough different outlets to compare."}</p>;
    return <div lang={r.lang}><p className="text-[15px] leading-relaxed">{String(d.overview ?? "")}</p><ul className="mt-2 space-y-1 text-sm">{ang.map((a) => <li key={a.source}><b>{a.source}:</b> {a.note}</li>)}</ul></div>;
  }
  if (r.feature === "translate") return <div lang={r.lang}><p className="font-bold">{String(d.title ?? "")}</p>{d.summary ? <p className="mt-1 text-[15px]">{String(d.summary)}</p> : null}<p className="mt-1 text-[11px] opacity-70">🌐 {ta ? "இயந்திர மொழிபெயர்ப்பு — மூல மொழியில் உள்ளதே இறுதியானது." : "Machine translation — the original-language text is authoritative."}</p></div>;
  if (r.feature === "ask") return <p className={`text-[15px] leading-relaxed ${d.answerable ? "" : "opacity-80"}`} lang={r.lang}>{d.answerable ? "" : "ℹ️ "}{String(d.answer ?? "")}</p>;
  if (r.feature === "briefing") return <p className="text-[15px] leading-relaxed" lang={r.lang}>{String(d.intro ?? "")}</p>;
  return null;
}

const TABS: { f: Feature; ta: string; en: string; btnTa: string; btnEn: string }[] = [
  { f: "summary", ta: "முக்கியக் குறிப்புகள்", en: "Key points", btnTa: "AI முக்கியக் குறிப்புகளை உருவாக்கு", btnEn: "Generate AI key points" },
  { f: "explain", ta: "எளிமையாக", en: "Explain simply", btnTa: "எளிமையாக விளக்கு", btnEn: "Explain like I'm 15" },
  { f: "differ", ta: "ஊடக வேறுபாடு", en: "How outlets differ", btnTa: "ஊடகங்களின் பார்வை வேறுபாட்டைக் காட்டு", btnEn: "Compare how outlets frame it" },
  { f: "translate", ta: "மொழிபெயர்", en: "Translate", btnTa: "மொழிபெயர்", btnEn: "Translate" },
  { f: "ask", ta: "கேள்", en: "Ask", btnTa: "கேள்", btnEn: "Ask" },
];

function Tab({ f, lang, id, ta, btn, original }: { f: Feature; lang: Lang; id: string; ta: boolean; btn: string; original?: string }) {
  const { st, run } = useAi(f, lang, id);
  const [q, setQ] = useState("");
  return (
    <div>
      {f === "ask" && (
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim().length >= 3) run(q); }} className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={200} placeholder={ta ? "இந்தச் செய்தி பற்றி கேளுங்கள்… (எ.கா. எங்கு நடந்தது?)" : "Ask about this story… (e.g. where did it happen?)"} className="min-w-0 flex-1 rounded-full border border-ink-100 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-ink-950" aria-label={ta ? "கேள்வி" : "Question"} />
          <button disabled={st.s === "loading" || q.trim().length < 3} className="rounded-full bg-violet-600 px-4 text-sm font-bold text-white disabled:opacity-50">{btn}</button>
        </form>
      )}
      {f === "ask" && <p className="mt-1 text-[11px] opacity-60">{ta ? "பதில் இங்கு காட்டப்படும் உரையிலிருந்து மட்டுமே. அதில் இல்லையெனில் அப்படியே சொல்லும்." : "Answers come only from the text shown here; if it isn't there, it will say so."}</p>}
      {st.s === "idle" && f !== "ask" && <button onClick={() => run()} className="rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-violet-500">✨ {btn}</button>}
      {st.s === "loading" && <Spinner ta={ta} />}
      {st.s === "error" && <p className="mt-2 text-sm text-kumkum-600">⚠️ {ERR[st.err ?? "failed"]?.[ta ? 0 : 1] ?? ERR.failed[ta ? 0 : 1]} <button onClick={() => run(f === "ask" ? q : undefined)} className="underline">{ta ? "மீண்டும்" : "Retry"}</button></p>}
      {st.s === "done" && st.r && <div className="mt-2"><Body r={st.r} ta={ta} /><AiLabel r={st.r} ta={ta} />{original && <a href={original} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-bold text-kumkum-600 underline dark:text-manjal-400">{ta ? "மூலச் செய்தியைப் படிக்க ↗" : "Read the original ↗"}</a>}</div>}
    </div>
  );
}

function Disabled({ ta, reason }: { ta: boolean; reason?: string }) {
  return <p className="text-sm opacity-75">⚠️ {ERR[reason ?? "not_configured"]?.[ta ? 0 : 1] ?? ERR.not_configured[ta ? 0 : 1]}</p>;
}

/** Full AI panel for the story (full-coverage) page. */
export function AiStoryPanel({ id, articleLang, outlets, original }: { id: string; articleLang: Lang; outlets: number; original: string }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const st = useAiStatus();
  const [tab, setTab] = useState<Feature>("summary");
  const [out, setOut] = useState<Lang>(lang);
  useEffect(() => { setOut(lang); }, [lang]); // eslint-disable-line react-hooks/set-state-in-effect
  const tabs = TABS.filter((t) => t.f !== "differ" || outlets >= 2);
  // Translation goes to the language the story is NOT in.
  const outLang: Lang = tab === "translate" ? (articleLang === "ta" ? "en" : "ta") : out;
  return (
    <section className="no-print rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-transparent p-4 sm:p-5" aria-label="AI">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold">✨ {ta ? "AI உதவி" : "AI assist"} <span className="text-xs font-semibold opacity-60">{ta ? "· தேவைப்படும்போது மட்டும்" : "· on demand"}</span></h2>
        {tab !== "translate" && <LangToggle v={out} set={setOut} />}
      </div>
      {st && !st.enabled ? <div className="mt-2"><Disabled ta={ta} reason={st.reason} /></div> : (
        <>
          <div className="no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1" role="tablist">
            {tabs.map((t) => <button key={t.f} role="tab" aria-selected={tab === t.f} onClick={() => setTab(t.f)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${tab === t.f ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "border border-ink-100 dark:border-white/10"}`}>{ta ? t.ta : t.en}</button>)}
          </div>
          <div className="mt-3">
            {tabs.filter((t) => t.f === tab).map((t) => <Tab key={t.f + outLang} f={t.f} lang={outLang} id={id} ta={ta} btn={ta ? t.btnTa : t.btnEn} original={original} />)}
            {tab === "translate" && <p className="mt-1 text-[11px] opacity-60">{articleLang === "ta" ? (ta ? "தமிழ் → ஆங்கிலம்" : "Tamil → English") : (ta ? "ஆங்கிலம் → தமிழ்" : "English → Tamil")}</p>}
          </div>
        </>
      )}
    </section>
  );
}

/** Compact "✨ AI key points" sheet for article cards. */
export function AiQuick({ id, link, onClose }: { id: string; link: string; onClose: () => void }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [out, setOut] = useState<Lang>(lang);
  const st = useAiStatus();
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label="AI">
      <div onClick={(e) => e.stopPropagation()} className="fade-up max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl dark:bg-ink-900">
        <div className="flex items-center justify-between gap-2"><h2 className="font-extrabold">✨ {ta ? "AI முக்கியக் குறிப்புகள்" : "AI key points"}</h2><div className="flex items-center gap-2"><LangToggle v={out} set={setOut} /><button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink-100 dark:hover:bg-white/10">✕</button></div></div>
        <div className="mt-3">{st && !st.enabled ? <Disabled ta={ta} reason={st.reason} /> : <Tab key={out} f="summary" lang={out} id={id} ta={ta} btn={ta ? "AI முக்கியக் குறிப்புகளை உருவாக்கு" : "Generate AI key points"} original={link} />}</div>
        <Link href={`/story/${id}`} onClick={onClose} className="mt-3 block text-sm font-bold text-violet-700 dark:text-violet-300">{ta ? "எளிமையான விளக்கம், ஊடக ஒப்பீடு, மொழிபெயர்ப்பு, கேள்வி-பதில் →" : "Explain simply, compare outlets, translate, ask →"}</Link>
      </div>
    </div>
  );
}

/** AI intro for the daily briefing, written from the headlines the briefing selected. */
export function AiBriefing() {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const [out, setOut] = useState<Lang>(lang);
  useEffect(() => { setOut(lang); }, [lang]); // eslint-disable-line react-hooks/set-state-in-effect
  const st = useAiStatus();
  if (st && !st.enabled) return null;
  return (
    <section className="no-print mt-4 rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-transparent p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-extrabold">✨ {ta ? "AI அறிமுகம்" : "AI intro"} <span className="text-xs font-semibold opacity-60">{ta ? "· இந்தச் சுருக்கத்தின் தலைப்புகளிலிருந்து" : "· from this briefing's headlines"}</span></h2><LangToggle v={out} set={setOut} /></div>
      <div className="mt-2"><Tab key={out} f="briefing" lang={out} id="briefing" ta={ta} btn={ta ? "இன்றைய AI அறிமுகத்தை உருவாக்கு" : "Write today's AI intro"} /></div>
    </section>
  );
}
