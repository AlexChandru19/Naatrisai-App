"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Article } from "@/lib/types";
import { usePrefs } from "./providers";

/** Named reading lists ("collections"), stored on this device: { listName: storyIds[] }. Stories themselves live in Saved. */
type Lists = Record<string, string[]>;
const KEY = "ns-lists";
const EVT = "ns:lists";
let cache: { raw: string | null; v: Lists } = { raw: null, v: {} };
function read(): Lists {
  const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(KEY);
  if (raw !== cache.raw) { try { cache = { raw, v: raw ? JSON.parse(raw) : {} }; } catch { cache = { raw, v: {} }; } }
  return cache.v;
}
const EMPTY: Lists = {};
export function useLists() {
  const lists = useSyncExternalStore((cb) => { window.addEventListener(EVT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); }; }, read, () => EMPTY);
  const write = (n: Lists) => { localStorage.setItem(KEY, JSON.stringify(n)); window.dispatchEvent(new Event(EVT)); };
  return {
    lists,
    add: (name: string, id: string) => { const l = read(); write({ ...l, [name]: [...new Set([id, ...(l[name] ?? [])])].slice(0, 300) }); },
    remove: (name: string, id: string) => { const l = read(); write({ ...l, [name]: (l[name] ?? []).filter((x) => x !== id) }); },
    drop: (name: string) => { const l = { ...read() }; delete l[name]; write(l); },
    rename: (from: string, to: string) => { const l = { ...read() }; if (!to || l[to]) return; l[to] = l[from] ?? []; delete l[from]; write(l); },
  };
}

/** Sheet to put a story in a named list (also saves it). */
export function ListPicker({ a, onClose }: { a: Article; onClose: () => void }) {
  const { lang, saved, toggleSave } = usePrefs(); const ta = lang === "ta";
  const { lists, add, remove } = useLists();
  const [name, setName] = useState("");
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const put = (n: string) => { if (!saved[a.id]) toggleSave(a); add(n, a.id); };
  const names = Object.keys(lists);
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label={ta ? "வாசிப்புப் பட்டியல்" : "Reading list"}>
      <div onClick={(e) => e.stopPropagation()} className="fade-up w-full max-w-sm rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-ink-900 shadow-2xl sm:rounded-3xl dark:bg-ink-900 dark:text-white">
        <div className="flex items-center justify-between"><h2 className="font-extrabold">📂 {ta ? "பட்டியலில் சேர்" : "Add to a reading list"}</h2><button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink-100 dark:hover:bg-white/10">✕</button></div>
        <p className="mt-1 line-clamp-2 text-xs opacity-70">{a.title}</p>
        <div className="mt-3 space-y-1.5">
          {names.map((n) => { const inIt = lists[n].includes(a.id); return (
            <button key={n} onClick={() => (inIt ? remove(n, a.id) : put(n))} aria-pressed={inIt} className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-bold ${inIt ? "border-peacock-600 bg-peacock-600/10" : "border-ink-100 dark:border-white/10"}`}><span>{inIt ? "✓ " : ""}{n}</span><span className="text-xs opacity-60">{lists[n].length}</span></button>); })}
          {!names.length && <p className="text-sm opacity-70">{ta ? "இன்னும் பட்டியல்கள் இல்லை — புதியதை உருவாக்குங்கள்." : "No lists yet — create one."}</p>}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const n = name.trim().slice(0, 40); if (n) { put(n); setName(""); } }} className="mt-3 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder={ta ? "புதிய பட்டியல் (எ.கா. வார இறுதி)" : "New list (e.g. Weekend reads)"} aria-label={ta ? "பட்டியல் பெயர்" : "List name"} className="min-w-0 flex-1 rounded-full border border-ink-100 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-ink-950" />
          <button className="rounded-full bg-kumkum-600 px-4 text-sm font-bold text-white">{ta ? "உருவாக்கு" : "Create"}</button>
        </form>
      </div>
    </div>
  );
}
