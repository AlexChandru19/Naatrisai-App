-- Naatrisai v9 — Supabase schema (groundwork; NOT yet applied: the account's free-project limit was reached).
-- Apply in the Supabase SQL editor once a project exists, then set the Vercel env vars listed in SETUP.md.
-- Policy model: the public (anon) key can only read public tables and insert into sign-up / vote tables;
-- all ingest writes use the service-role key from the Vercel cron (server only, never shipped to browsers).

create table if not exists articles (
  id text primary key,                 -- same hash as the site's story id
  title text not null,
  summary text,                        -- publisher's RSS summary only (headline + summary + link policy)
  link text not null unique,
  source text not null,
  lang text not null check (lang in ('ta','en')),
  topics text[] default '{}',
  districts text[] default '{}',
  source_count int default 1,
  published_at timestamptz,
  first_seen timestamptz default now()
);
create index if not exists articles_published_idx on articles (published_at desc);
create index if not exists articles_fts_idx on articles using gin (to_tsvector('simple', title || ' ' || coalesce(summary,'')));
alter table articles enable row level security;
create policy "articles are public" on articles for select using (true);

create table if not exists feed_checks (       -- /status uptime history
  id bigserial primary key, name text not null, ok boolean not null, ms int, checked_at timestamptz default now()
);
alter table feed_checks enable row level security;
create policy "status is public" on feed_checks for select using (true);

create table if not exists newsletter_signups (
  id bigserial primary key, email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  edition text default 'morning', confirmed boolean default false, created_at timestamptz default now()
);
alter table newsletter_signups enable row level security;
create policy "anyone can sign up" on newsletter_signups for insert with check (confirmed = false);
-- no select policy: emails are readable only with the service role

create table if not exists push_subscriptions (
  endpoint text primary key, p256dh text not null, auth text not null, topics text[] default '{}', created_at timestamptz default now()
);
alter table push_subscriptions enable row level security;
create policy "anyone can subscribe" on push_subscriptions for insert with check (true);

create table if not exists polls (id text primary key, question_ta text, question_en text, options jsonb not null, closes_at timestamptz);
create table if not exists poll_votes (poll_id text references polls(id), option int not null, voter text not null, created_at timestamptz default now(), primary key (poll_id, voter));
alter table polls enable row level security; alter table poll_votes enable row level security;
create policy "polls are public" on polls for select using (true);
create policy "vote once" on poll_votes for insert with check (true);
create view poll_results as select poll_id, option, count(*) as votes from poll_votes group by 1, 2;

create table if not exists quiz_scores (            -- weekly leaderboard (signed-in users only)
  user_id uuid references auth.users(id) on delete cascade, day date not null, score int not null, display_name text,
  primary key (user_id, day)
);
alter table quiz_scores enable row level security;
create policy "leaderboard is public" on quiz_scores for select using (true);
create policy "own scores only" on quiz_scores for insert with check (auth.uid() = user_id);

create table if not exists user_sync (              -- magic-link sync of saved stories, follows, watchlist
  user_id uuid primary key references auth.users(id) on delete cascade, data jsonb not null default '{}', updated_at timestamptz default now()
);
alter table user_sync enable row level security;
create policy "own data" on user_sync for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
