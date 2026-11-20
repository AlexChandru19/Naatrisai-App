"use client";
import { useSyncExternalStore } from "react";
/** Personal NSE watchlist (symbols), device-only; included in Settings backup because the key starts with ns-. */
const KEY = "ns-watchlist", EVT = "ns:watchlist";
let cache: { raw: string | null; v: string[] } = { raw: null, v: [] };
function read(): string[] {
  const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(KEY);
  if (raw !== cache.raw) { try { const v = raw ? JSON.parse(raw) : []; cache = { raw, v: Array.isArray(v) ? v.filter((x) => typeof x === "string") : [] }; } catch { cache = { raw, v: [] }; } }
  return cache.v;
}
const EMPTY: string[] = [];
const sub = (cb: () => void) => { window.addEventListener(EVT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); }; };
export function useWatchlist() {
  const list = useSyncExternalStore(sub, read, () => EMPTY);
  const write = (n: string[]) => { localStorage.setItem(KEY, JSON.stringify(n.slice(0, 40))); window.dispatchEvent(new Event(EVT)); };
  return { list, has: (s: string) => list.includes(s), toggle: (s: string) => { const l = read(); write(l.includes(s) ? l.filter((x) => x !== s) : [s, ...l]); }, remove: (s: string) => write(read().filter((x) => x !== s)) };
}
