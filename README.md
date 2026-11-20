# நாற்றிசை · Naatrisai

"The four directions" — a Tamil-first, bilingual live news aggregator: Tamil Nadu (all 38 districts), all 28 states + 8 UTs, and world news by region.

- Next.js 16 App Router · TypeScript · Tailwind v4
- Live public RSS feeds (see `src/lib/sources.ts`), revalidated every 5 minutes; headline + short summary + link back to the publisher (no full-article scraping)
- Rule-based topic, district and state tagging (`src/lib/topics.ts`, `src/lib/geo.ts`), headline de-duplication (`src/lib/news.ts`)
- Interactive: breaking ticker, swipe-card mode, district/state/region pickers, search (+ voice), bookmarks & reactions (localStorage), share, text-to-speech (single story + bulletin), headline quiz, Open-Meteo weather, dark mode
