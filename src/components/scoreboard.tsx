"use client";
import type { League, Game, Side } from "@/lib/sports";
import { usePrefs } from "./providers";

const when = (iso: string, ta: boolean) => new Date(iso).toLocaleString(ta ? "ta-IN" : "en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) + " IST";

function State({ g, ta }: { g: Game; ta: boolean }) {
  if (g.state === "in") return <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white"><span className="live-dot">●</span> {ta ? "நேரலை" : "LIVE"} · {g.detail}</span>;
  if (g.state === "post") return <span className="text-[11px] font-bold opacity-60">{ta ? "முடிந்தது" : "Final"}{g.detail && !/^(FT|Final)$/i.test(g.detail) ? ` · ${g.detail}` : ""}</span>;
  return <span className="text-[11px] font-semibold opacity-70" suppressHydrationWarning>{when(g.date, ta)}</span>;
}

function Team({ s, right }: { s?: Side; right?: boolean }) {
  return (
    <span className={`flex min-w-0 flex-1 items-center gap-2 ${right ? "flex-row-reverse text-right" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {s?.logo ? <img src={s.logo} alt="" className="h-6 w-6 shrink-0 object-contain" loading="lazy" /> : <span className="h-6 w-6 shrink-0" />}
      <span className={`truncate text-sm ${s?.winner ? "font-extrabold" : "font-semibold"}`}>{s?.short ?? "—"}</span>
    </span>
  );
}

function TeamGame({ g, ta }: { g: Game; ta: boolean }) {
  const score = g.state !== "pre" && g.home?.score != null;
  const body = (
    <div className="rounded-xl px-2 py-2 hover:bg-ink-50 dark:hover:bg-white/5">
      <div className="flex items-center gap-2">
        <Team s={g.home} />
        <span className="w-14 shrink-0 text-center font-black tabular-nums">{score ? `${g.home?.score} – ${g.away?.score}` : "vs"}</span>
        <Team s={g.away} right />
      </div>
      <div className="mt-1 text-center"><State g={g} ta={ta} /></div>
    </div>
  );
  return g.link ? <a href={g.link} target="_blank" rel="noopener noreferrer" className="block">{body}</a> : body;
}

function SidesGame({ g, ta, f1 }: { g: Game; ta: boolean; f1?: boolean }) {
  return (
    <div className="rounded-xl px-2 py-2">
      <div className="flex items-center justify-between gap-2 text-xs"><b>{g.title}</b><State g={g} ta={ta} /></div>
      {f1 ? (g.sides?.length ? <ol className="mt-1 text-sm">{g.sides.map((s, i) => <li key={s.name}>{i + 1}. {s.name}</li>)}</ol> : null) : (
        <div className="mt-1 space-y-0.5">
          {g.sides?.map((s) => <div key={s.name} className="flex items-center justify-between text-sm"><span className={s.winner ? "font-extrabold" : "font-semibold"}>{s.winner ? "✓ " : ""}{s.name}</span><span className="font-mono tabular-nums tracking-widest">{s.score ?? ""}</span></div>)}
        </div>
      )}
    </div>
  );
}

export function Scoreboard({ leagues, compact = false }: { leagues: League[]; compact?: boolean }) {
  const { lang } = usePrefs(); const ta = lang === "ta";
  const list = leagues.filter((l) => l.games.length);
  if (!list.length) return <p className="rounded-2xl border border-ink-100 p-4 text-sm opacity-70 dark:border-white/10">{ta ? "இப்போது ஸ்கோர் தரவு கிடைக்கவில்லை." : "No scores available right now."}</p>;
  return (
    <div className={compact ? "space-y-3" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"}>
      {list.map((l) => {
        const live = l.games.some((g) => g.state === "in");
        const games = compact ? l.games.filter((g) => g.state !== "pre").slice(0, 3) : l.games;
        if (compact && !games.length) return null;
        return (
          <section key={l.key} className="rounded-2xl border border-ink-100 bg-white p-3 dark:border-white/10 dark:bg-ink-900">
            <h3 className="mb-1 flex items-center gap-2 px-2 font-extrabold">{l.emoji} {ta ? l.ta : l.en}{live && <span className="live-dot text-xs text-red-600">●</span>}</h3>
            {l.event && <p className="px-2 text-xs opacity-65">{l.event}</p>}
            <div className="divide-y divide-ink-100 dark:divide-white/10">
              {games.map((g) => l.kind === "team" ? <TeamGame key={g.id} g={g} ta={ta} /> : <SidesGame key={g.id} g={g} ta={ta} f1={l.kind === "f1"} />)}
            </div>
          </section>
        );
      })}
      <p className="text-[11px] opacity-60 md:col-span-2 xl:col-span-3">{ta ? "தரவு: ESPN பொது ஸ்கோர்போர்டு · சில நிமிடங்கள் தாமதம் இருக்கலாம் · நேரங்கள் IST" : "Data: ESPN public scoreboard · may lag a few minutes · times in IST"}</p>
    </div>
  );
}
