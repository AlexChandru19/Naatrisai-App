"use client";
import { useState, useSyncExternalStore } from "react";

/** Private notes on saved stories — localStorage "ns-notes" (exported with the Settings backup). */
const KEY = "ns-notes", EVT = "ns:notes";
let cache: { raw: string | null; v: Record<string, { t: string; at: string }> } = { raw: null, v: {} };
const read = () => { const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(KEY); if (raw !== cache.raw) { try { cache = { raw, v: raw ? JSON.parse(raw) : {} }; } catch { cache = { raw, v: {} }; } } return cache.v; };
const EMPTY = {};
export function useNotes() {
  const notes = useSyncExternalStore((cb) => { window.addEventListener(EVT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); }; }, read, () => EMPTY as ReturnType<typeof read>);
  const set = (id: string, t: string) => { const n = { ...read() }; const v = t.trim().slice(0, 2000); if (v) n[id] = { t: v, at: new Date().toISOString() }; else delete n[id]; localStorage.setItem(KEY, JSON.stringify(n)); window.dispatchEvent(new Event(EVT)); };
  return { notes, set };
}

export function StoryNote({ id, ta }: { id: string; ta: boolean }) {
  const { notes, set } = useNotes();
  const note = notes[id];
  const [edit, setEdit] = useState(false); const [draft, setDraft] = useState("");
  if (edit) return (
    <div className="mt-1.5 rounded-xl border border-manjal-400/60 bg-manjal-300/15 p-2" data-note-edit>
      <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} rows={3} aria-label={ta ? "உங்கள் குறிப்பு" : "Your note"} placeholder={ta ? "இந்தச் செய்தி பற்றிய உங்கள் குறிப்பு…" : "Your note on this story…"} className="w-full resize-y rounded-lg border border-ink-100 bg-white p-2 text-sm dark:border-white/10 dark:bg-ink-950" />
      <div className="mt-1 flex gap-2 text-xs font-bold">
        <button onClick={() => { set(id, draft); setEdit(false); }} className="rounded-full bg-kumkum-600 px-3 py-1 text-white">{ta ? "சேமி" : "Save"}</button>
        <button onClick={() => setEdit(false)} className="rounded-full border border-ink-100 px-3 py-1 dark:border-white/10">{ta ? "ரத்து" : "Cancel"}</button>
        {note && <button onClick={() => { set(id, ""); setEdit(false); }} className="ml-auto rounded-full px-2 py-1 text-kumkum-600">🗑️ {ta ? "நீக்கு" : "Delete"}</button>}
      </div>
    </div>
  );
  return note ? (
    <button onClick={() => { setDraft(note.t); setEdit(true); }} data-note className="mt-1.5 block w-full rounded-xl border-l-4 border-manjal-400 bg-manjal-300/15 px-3 py-2 text-left text-sm">
      <span className="whitespace-pre-wrap">📝 {note.t}</span>
      <span className="mt-0.5 block text-[11px] opacity-70">{new Date(note.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} IST · {ta ? "திருத்த தட்டவும்" : "tap to edit"}</span>
    </button>
  ) : (
    <button onClick={() => { setDraft(""); setEdit(true); }} data-note-add className="mt-1 text-xs font-bold opacity-75 hover:opacity-100">📝 {ta ? "குறிப்பு சேர்" : "Add note"}</button>
  );
}
