# Naatrisai — optional services and the env vars that switch them on

Everything below is optional. Without it, the site runs and shows "coming soon" or "not set up" in the relevant place.
Add the vars in Vercel → naatrisai → Settings → Environment Variables, then redeploy.

| Feature | Env vars | Where to get it |
|---|---|---|
| Report-an-error mailto | `NEXT_PUBLIC_CORRECTIONS_EMAIL` | any inbox you read |
| Telegram 7am/7pm bulletin push | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `CRON_SECRET` | @BotFather → new bot; add it as admin of your channel; CRON_SECRET = any long random string |
| Mandi prices | `DATA_GOV_IN_KEY` | free sign-up at data.gov.in → My Account → API key |
| Android app (TWA) | `TWA_PACKAGE`, `TWA_SHA256` | from Bubblewrap / Play Console app-signing certificate |
| Canonical links in bulletins | `NEXT_PUBLIC_SITE_URL` | your custom domain, e.g. https://naatrisai.in |
| Archive, search, trends, this-day-last-year, status history, newsletter, polls, leaderboard, magic-link sync | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | a Supabase project; run `supabase/schema.sql` |
| Web push | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (+ Supabase) | `npx web-push generate-vapid-keys` |
| Newsletter sending | e.g. `RESEND_API_KEY` (+ Supabase) | resend.com (free tier 3,000 emails/month) |

Vercel crons (`vercel.json`) call `/api/hooks/telegram` at 01:30 and 13:30 UTC (7:00 / 19:00 IST; Hobby plan runs within ±1 h).
