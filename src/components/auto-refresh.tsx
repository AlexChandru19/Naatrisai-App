"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePrefs } from "./providers";

const AWAY_MS = 90_000; // refresh when the tab comes back after 1.5+ minutes away
const POLL_MS = 5 * 60_000; // and check quietly every 5 minutes while visible
const LISTS = /^\/($|tamilnadu|india|world|for-you|trending|topic|briefing|developing|coverage|markets\/news)/;

async function latest(): Promise<string[] | null> {
  try { const r = await fetch("/api/latest", { cache: "no-store" }); return r.ok ? ((await r.json()).ids as string[]) : null; } catch { return null; }
}

/** Keeps news fresh without jumping content mid-read: silently refreshes when you're at the top,
 *  otherwise shows a "N new stories — tap to load" pill. */
export function AutoRefresh() {
  const router = useRouter();
  const path = usePathname() || "/";
  const { lang } = usePrefs();
  const ta = lang === "ta";
  const base = useRef<Set<string> | null>(null);
  const hiddenAt = useRef(0);
  const lastCheck = useRef(0);
  const [pending, setPending] = useState(0);
  const [toast, setToast] = useState("");

  const apply = useCallback(async (n: number) => {
    router.refresh();
    base.current = new Set((await latest()) ?? []);
    setPending(0);
    setToast(n > 0 ? (ta ? `${n} புதிய செய்திகள் சேர்க்கப்பட்டன · இப்போது புதுப்பிக்கப்பட்டது` : `${n} new ${n === 1 ? "story" : "stories"} added · updated just now`) : (ta ? "இப்போது புதுப்பிக்கப்பட்டது" : "Updated just now"));
    setTimeout(() => setToast(""), 2600);
  }, [router, ta]);

  const check = useCallback(async (force = false) => {
    if (!force && Date.now() - lastCheck.current < 30_000) return;
    lastCheck.current = Date.now();
    const ids = await latest();
    if (!ids) return;
    if (!base.current) { base.current = new Set(ids); return; }
    const n = ids.filter((id) => !base.current!.has(id)).length;
    const atTop = window.scrollY < 250;
    if (n === 0) { if (force && atTop) router.refresh(); return; }
    if (atTop) await apply(n);
    else setPending(n);
  }, [apply, router]);

  // baseline on first load (app open / PWA launch)
  useEffect(() => { void check(true); }, [check]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") { hiddenAt.current = Date.now(); return; }
      navigator.serviceWorker?.getRegistration().then((r) => r?.update()).catch(() => {});
      if (hiddenAt.current && Date.now() - hiddenAt.current > AWAY_MS) void check(true);
    };
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) void check(true); }; // back/forward cache restore
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onShow);
    const t = setInterval(() => { if (document.visibilityState === "visible") void check(); }, POLL_MS);
    return () => { document.removeEventListener("visibilitychange", onVis); window.removeEventListener("pageshow", onShow); clearInterval(t); };
  }, [check]);

  const onList = LISTS.test(path);
  if (!toast && !(pending && onList)) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[72px] z-40 flex justify-center px-3" aria-live="polite">
      {pending > 0 && onList ? (
        <button data-new-stories onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); void apply(pending); }} className="pointer-events-auto fade-up rounded-full bg-kumkum-600 px-4 py-2 text-sm font-extrabold text-white shadow-lg">
          ↑ {ta ? `${pending} புதிய செய்திகள் — ஏற்ற தட்டவும்` : `${pending} new ${pending === 1 ? "story" : "stories"} — tap to load`}
        </button>
      ) : (
        <span data-updated className="fade-up rounded-full bg-ink-900/85 px-3 py-1.5 text-xs font-bold text-white shadow dark:bg-white/90 dark:text-ink-900">✓ {toast}</span>
      )}
    </div>
  );
}
