import "server-only";

/** Scores & fixtures from ESPN's public scoreboard JSON (same data as espn.com). */
export type Side = { name: string; short: string; score?: string; logo?: string; winner?: boolean };
export type Game = { id: string; date: string; state: "pre" | "in" | "post"; detail: string; home?: Side; away?: Side; title?: string; sides?: Side[]; link?: string };
export type League = { key: string; ta: string; en: string; emoji: string; kind: "team" | "tennis" | "f1"; games: Game[]; event?: string };

const LEAGUES = [
  { key: "soccer/ind.1", ta: "இந்தியன் சூப்பர் லீக் (ISL)", en: "Indian Super League", emoji: "⚽", kind: "team" },
  { key: "soccer/eng.1", ta: "பிரீமியர் லீக்", en: "Premier League", emoji: "⚽", kind: "team" },
  { key: "soccer/uefa.champions", ta: "சாம்பியன்ஸ் லீக்", en: "Champions League", emoji: "⚽", kind: "team" },
  { key: "soccer/esp.1", ta: "லா லிகா", en: "LaLiga", emoji: "⚽", kind: "team" },
  { key: "tennis/atp", ta: "டென்னிஸ் — ATP", en: "Tennis — ATP", emoji: "🎾", kind: "tennis" },
  { key: "tennis/wta", ta: "டென்னிஸ் — WTA", en: "Tennis — WTA", emoji: "🎾", kind: "tennis" },
  { key: "racing/f1", ta: "ஃபார்முலா 1", en: "Formula 1", emoji: "🏎️", kind: "f1" },
] as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
const side = (c: any): Side => ({
  name: c?.team?.displayName ?? c?.athlete?.displayName ?? c?.roster?.displayName ?? "—",
  short: c?.team?.shortDisplayName ?? c?.athlete?.shortName ?? c?.athlete?.displayName ?? "—",
  score: c?.score ?? (Array.isArray(c?.linescores) && c.linescores.length ? c.linescores.map((l: any) => l.value).join(" ") : undefined),
  logo: c?.team?.logo, winner: !!c?.winner,
});

async function one(l: (typeof LEAGUES)[number]): Promise<League> {
  try {
    const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${l.key}/scoreboard`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(7000) });
    if (!r.ok) return { ...l, games: [] };
    const d: any = await r.json();
    const events: any[] = d.events ?? [];
    if (l.kind === "team") {
      const games = events.map((e) => {
        const c = e.competitions?.[0] ?? {}; const cs: any[] = c.competitors ?? [];
        return { id: e.id, date: e.date, state: e.status?.type?.state, detail: e.status?.type?.shortDetail ?? "", home: side(cs.find((x) => x.homeAway === "home")), away: side(cs.find((x) => x.homeAway === "away")), link: e.links?.[0]?.href } as Game;
      });
      return { ...l, games: games.slice(0, 12) };
    }
    if (l.kind === "tennis") {
      // Singles only: live first, then the latest finished, then the next scheduled.
      const e = events[0]; if (!e) return { ...l, games: [] };
      const comps: any[] = (e.groupings ?? []).filter((g: any) => /singles/i.test(g.grouping?.displayName ?? "")).flatMap((g: any) => g.competitions ?? []);
      const games = comps.map((c) => ({ id: c.id, date: c.date, state: c.status?.type?.state, detail: c.status?.type?.detail ?? "", sides: (c.competitors ?? []).map(side), title: c.round?.displayName } as Game));
      const ord = { in: 0, post: 1, pre: 2 } as const;
      games.sort((a, b) => ord[a.state] - ord[b.state] || (a.state === "pre" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
      return { ...l, event: e.name, games: games.slice(0, 6) };
    }
    const e = events[0]; if (!e) return { ...l, games: [] };
    const games = (e.competitions ?? []).map((c: any) => ({ id: c.id, date: c.date, state: c.status?.type?.state, detail: c.type?.abbreviation ?? "", title: c.type?.abbreviation, sides: (c.competitors ?? []).filter((x: any) => x.order <= 3).sort((a: any, b: any) => a.order - b.order).map(side) } as Game));
    return { ...l, event: e.name, games };
  } catch { return { ...l, games: [] }; }
}

export async function getSports(): Promise<{ leagues: League[]; fetchedAt: string }> {
  const leagues = await Promise.all(LEAGUES.map(one));
  return { leagues, fetchedAt: new Date().toISOString() };
}
