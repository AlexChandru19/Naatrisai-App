"use client";
import Link from "next/link";
import { useState } from "react";
import { usePrefs } from "./providers";
import { PageTitle, Bulletin } from "./hero";
import { ArticleCard } from "./article-card";
import { useLists } from "./lists";
import { StoryNote, useNotes } from "./notes";

export function SavedList() {
  const { saved, lang, ready, reactions } = usePrefs();
  const { lists, drop, rename, remove } = useLists();
  const { notes } = useNotes();
  const [onlyNotes, setOnlyNotes] = useState(false);
  const [tab, setTab] = useState<string>("");
  const ta = lang === "ta";
  const all = Object.values(saved).sort((a, b) => (b.savedAt || "").localeCompare(a.savedAt || ""));
  const names = Object.keys(lists);
  const cur = tab && lists[tab] ? tab : "";
  const base = cur ? lists[cur].map((id) => saved[id]).filter(Boolean) : all;
  const nNotes = all.filter((a) => notes[a.id]).length;
  const list = onlyNotes ? base.filter((a) => notes[a.id]) : base;
  const reacted = Object.keys(reactions).length;
  return (
    <>
      <PageTitle emoji="🔖" ta="சேமித்த செய்திகள்" en="Saved stories" subTa={`${all.length} சேமிப்புகள் · ${names.length} பட்டியல்கள் · ${reacted} உணர்வுகள் — இந்தச் சாதனத்தில் மட்டும்`} subEn={`${all.length} saved · ${names.length} lists · ${reacted} reactions — on this device only`} />
      {ready && all.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2" role="tablist">
          <button role="tab" aria-selected={!cur} onClick={() => setTab("")} className={`rounded-full px-3 py-1.5 text-sm font-bold ${!cur ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "border border-ink-100 dark:border-white/10"}`}>🔖 {ta ? "அனைத்தும்" : "All"} · {all.length}</button>
          {names.map((n) => <button key={n} role="tab" aria-selected={cur === n} onClick={() => setTab(n)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${cur === n ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "border border-ink-100 dark:border-white/10"}`}>📂 {n} · {lists[n].length}</button>)}
          {nNotes > 0 && <button aria-pressed={onlyNotes} onClick={() => setOnlyNotes((v) => !v)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${onlyNotes ? "bg-manjal-400 text-ink-900" : "border border-ink-100 dark:border-white/10"}`}>📝 {ta ? "குறிப்புள்ளவை" : "With notes"} · {nNotes}</button>}
          <span className="ml-auto"><Bulletin items={list} max={30} label={{ ta: `இவற்றைக் கேளுங்கள் (${Math.min(30, list.length)})`, en: `Listen to these (${Math.min(30, list.length)})` }} /></span>
        </div>
      )}
      {cur && (
        <div className="mt-2 flex gap-2 text-xs">
          <button onClick={() => { const n = prompt(ta ? "புதிய பெயர்" : "New name", cur)?.trim().slice(0, 40); if (n && n !== cur) { rename(cur, n); setTab(n); } }} className="rounded-full border border-ink-100 px-3 py-1 font-bold dark:border-white/10">✏️ {ta ? "பெயர் மாற்று" : "Rename"}</button>
          <button onClick={() => { if (confirm(ta ? `“${cur}” பட்டியலை நீக்கவா? (சேமித்த செய்திகள் இருக்கும்)` : `Delete the list “${cur}”? (Saved stories stay)`)) { drop(cur); setTab(""); } }} className="rounded-full border border-kumkum-600/40 px-3 py-1 font-bold text-kumkum-600">🗑️ {ta ? "பட்டியலை நீக்கு" : "Delete list"}</button>
        </div>
      )}
      {ready && all.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink-100 p-10 text-center dark:border-white/10">
          <div className="text-5xl">📑</div>
          <p className="mt-3 text-ink-900/70 dark:text-white/60">{ta ? "எந்தச் செய்தியிலும் 📑 பொத்தானை அழுத்திச் சேமியுங்கள்; ⋯ → “பட்டியலில் சேர்” மூலம் தொகுப்புகளை உருவாக்கலாம்." : "Tap 📑 on any story to save it; use ⋯ → “Add to reading list” to build collections."}</p>
          <Link href="/" className="mt-4 inline-block rounded-full bg-kumkum-600 px-5 py-2 font-bold text-white">{ta ? "செய்திகளுக்குச் செல்" : "Browse news"}</Link>
        </div>
      ) : (
        <div data-grid className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">{list.map((a, i) => (
          <div key={a.id} className="relative">
            <ArticleCard a={a} i={i} />
            <StoryNote id={a.id} ta={ta} />
            {cur && <button onClick={() => remove(cur, a.id)} className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold shadow dark:bg-ink-900/90">{ta ? "பட்டியலிலிருந்து நீக்கு ✕" : "Remove from list ✕"}</button>}
          </div>
        ))}</div>
      )}
    </>
  );
}
