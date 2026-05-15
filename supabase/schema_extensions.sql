-- Phase 2 extensions (run AFTER schema.sql in Supabase SQL editor)

-- Profiles: public stats toggle + lock account
alter table public.profiles
  add column if not exists stats_public boolean not null default true;
alter table public.profiles
  add column if not exists is_blocked boolean not null default false;

-- View counter (callable by anyone visiting book page)
create or replace function public.increment_book_views(p_book_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.books set view_count = view_count + 1 where id = p_book_id;
end;
$$;

grant execute on function public.increment_book_views(uuid) to anon, authenticated;

-- Keep rating_avg / rating_count in sync with reviews
create or replace function public.sync_book_rating_after_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bid uuid;
  avg_r numeric;
  cnt int;
begin
  bid := coalesce(new.book_id, old.book_id);
  select count(*)::int, coalesce(avg(rating)::numeric(3,2), 0)
    into cnt, avg_r
  from public.book_reviews
  where book_id = bid;

  update public.books
  set rating_avg = avg_r,
      rating_count = cnt
  where id = bid;

  return coalesce(new, old);
end;
$$;

drop trigger if exists book_reviews_sync_rating on public.book_reviews;
create trigger book_reviews_sync_rating
after insert or update or delete on public.book_reviews
for each row execute function public.sync_book_rating_after_review();

-- Review votes (like / dislike)
create table if not exists public.review_votes (
  review_id uuid not null references public.book_reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create index if not exists review_votes_review_id_idx on public.review_votes (review_id);

alter table public.review_votes enable row level security;

drop policy if exists "review_votes_select" on public.review_votes;
create policy "review_votes_select"
on public.review_votes for select using (true);

drop policy if exists "review_votes_upsert_own" on public.review_votes;
create policy "review_votes_upsert_own"
on public.review_votes for insert with check (auth.uid() = user_id);

drop policy if exists "review_votes_update_own" on public.review_votes;
create policy "review_votes_update_own"
on public.review_votes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "review_votes_delete_own" on public.review_votes;
create policy "review_votes_delete_own"
on public.review_votes for delete using (auth.uid() = user_id);

-- Physical copy + QR token
create table if not exists public.physical_copies (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  qr_token text not null unique,
  shelf_label text,
  created_at timestamptz not null default now()
);

create index if not exists physical_copies_book_id_idx on public.physical_copies (book_id);

alter table public.physical_copies enable row level security;

drop policy if exists "physical_copies_read_all" on public.physical_copies;
create policy "physical_copies_read_all"
on public.physical_copies for select using (true);

drop policy if exists "physical_copies_admin_write" on public.physical_copies;
create policy "physical_copies_admin_write"
on public.physical_copies for insert with check (public.is_admin());

drop policy if exists "physical_copies_admin_update" on public.physical_copies;
create policy "physical_copies_admin_update"
on public.physical_copies for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "physical_copies_admin_delete" on public.physical_copies;
create policy "physical_copies_admin_delete"
on public.physical_copies for delete using (public.is_admin());

-- Loans (paper books)
create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  physical_copy_id uuid not null references public.physical_copies(id) on delete cascade,
  status text not null check (status in ('pending', 'active', 'returned', 'cancelled')),
  borrowed_at timestamptz,
  due_at timestamptz,
  returned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists loans_set_updated_at on public.loans;
create trigger loans_set_updated_at
before update on public.loans
for each row execute function public.set_updated_at();

create index if not exists loans_user_idx on public.loans (user_id, created_at desc);
create index if not exists loans_copy_idx on public.loans (physical_copy_id);
create index if not exists loans_status_idx on public.loans (status);

alter table public.loans enable row level security;

drop policy if exists "loans_select_own_or_admin" on public.loans;
create policy "loans_select_own_or_admin"
on public.loans for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "loans_insert_own" on public.loans;
create policy "loans_insert_own"
on public.loans for insert with check (auth.uid() = user_id);

drop policy if exists "loans_update_own_or_admin" on public.loans;
create policy "loans_update_own_or_admin"
on public.loans for update using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

-- System settings (loan duration, auto-approve, max concurrent)
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.system_settings enable row level security;

drop policy if exists "settings_read_auth" on public.system_settings;
create policy "settings_read_auth"
on public.system_settings for select using (auth.role() = 'authenticated');

drop policy if exists "settings_admin_write" on public.system_settings;
create policy "settings_admin_write"
on public.system_settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.system_settings (key, value) values
  ('loan_default_days', '14'::jsonb),
  ('loan_max_active', '5'::jsonb),
  ('loan_auto_approve', 'true'::jsonb)
on conflict (key) do nothing;

-- Reading goals (books per year)
create table if not exists public.reading_goals (
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  target_books int not null check (target_books > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, year)
);

drop trigger if exists reading_goals_set_updated_at on public.reading_goals;
create trigger reading_goals_set_updated_at
before update on public.reading_goals
for each row execute function public.set_updated_at();

alter table public.reading_goals enable row level security;

drop policy if exists "reading_goals_own" on public.reading_goals;
create policy "reading_goals_own"
on public.reading_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cached AI summaries
create table if not exists public.book_summaries (
  book_id uuid primary key references public.books(id) on delete cascade,
  summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists book_summaries_set_updated_at on public.book_summaries;
create trigger book_summaries_set_updated_at
before update on public.book_summaries
for each row execute function public.set_updated_at();

alter table public.book_summaries enable row level security;

drop policy if exists "book_summaries_read_auth" on public.book_summaries;
create policy "book_summaries_read_auth"
on public.book_summaries for select using (auth.role() = 'authenticated');

-- Inserts/updates chỉ qua RPC (tránh client ghi trực tiếp)
drop policy if exists "book_summaries_admin_write" on public.book_summaries;

create or replace function public.upsert_book_summary(p_book_id uuid, p_summary text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.book_summaries (book_id, summary)
  values (p_book_id, p_summary)
  on conflict (book_id) do update
  set summary = excluded.summary,
      updated_at = now();
end;
$$;

grant execute on function public.upsert_book_summary(uuid, text) to authenticated;

-- Follows
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create index if not exists follows_following_idx on public.follows (following_id);

alter table public.follows enable row level security;

drop policy if exists "follows_select" on public.follows;
create policy "follows_select" on public.follows for select using (true);

drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own"
on public.follows for insert with check (auth.uid() = follower_id);

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own"
on public.follows for delete using (auth.uid() = follower_id);

-- Quotes + likes
create table if not exists public.book_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  content text not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists book_quotes_public_idx on public.book_quotes (created_at desc) where is_public = true;

alter table public.book_quotes enable row level security;

drop policy if exists "quotes_select" on public.book_quotes;
create policy "quotes_select"
on public.book_quotes for select
using (is_public = true or auth.uid() = user_id);

drop policy if exists "quotes_insert_own" on public.book_quotes;
create policy "quotes_insert_own"
on public.book_quotes for insert with check (auth.uid() = user_id);

drop policy if exists "quotes_update_own" on public.book_quotes;
create policy "quotes_update_own"
on public.book_quotes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "quotes_delete_own" on public.book_quotes;
create policy "quotes_delete_own"
on public.book_quotes for delete using (auth.uid() = user_id);

create table if not exists public.quote_likes (
  quote_id uuid not null references public.book_quotes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (quote_id, user_id)
);

alter table public.quote_likes enable row level security;

drop policy if exists "quote_likes_select" on public.quote_likes;
create policy "quote_likes_select" on public.quote_likes for select using (true);

drop policy if exists "quote_likes_mutate_own" on public.quote_likes;
create policy "quote_likes_mutate_own"
on public.quote_likes for insert with check (auth.uid() = user_id);

drop policy if exists "quote_likes_delete_own" on public.quote_likes;
create policy "quote_likes_delete_own"
on public.quote_likes for delete using (auth.uid() = user_id);

-- Reading challenges
create table if not exists public.reading_challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  target_books int not null default 1,
  created_at timestamptz not null default now()
);

alter table public.reading_challenges enable row level security;

drop policy if exists "challenges_read" on public.reading_challenges;
create policy "challenges_read" on public.reading_challenges for select using (true);

drop policy if exists "challenges_admin_write" on public.reading_challenges;
create policy "challenges_admin_write"
on public.reading_challenges for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.challenge_participants (
  challenge_id uuid not null references public.reading_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  books_completed int not null default 0,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

alter table public.challenge_participants enable row level security;

drop policy if exists "challenge_participants_read" on public.challenge_participants;
create policy "challenge_participants_read"
on public.challenge_participants for select using (true);

drop policy if exists "challenge_participants_own" on public.challenge_participants;
create policy "challenge_participants_own"
on public.challenge_participants for insert with check (auth.uid() = user_id);

drop policy if exists "challenge_participants_update_own" on public.challenge_participants;
create policy "challenge_participants_update_own"
on public.challenge_participants for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Avatars bucket (optional upload)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "avatars_own_write" on storage.objects;
create policy "avatars_own_write"
on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatars_own_update" on storage.objects;
create policy "avatars_own_update"
on storage.objects for update using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatars_own_delete" on storage.objects;
create policy "avatars_own_delete"
on storage.objects for delete using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin xem phiên đọc của mọi người
drop policy if exists "sessions_select_admin" on public.reading_sessions;
create policy "sessions_select_admin"
on public.reading_sessions for select using (public.is_admin());

-- Admin cập nhật hồ sơ (khóa tài khoản, v.v.)
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- Feed cộng đồng + hồ sơ công khai: đọc tủ sách / phiên đọc của người được follow hoặc stats_public
drop policy if exists "shelves_select_followers" on public.user_bookshelves;
create policy "shelves_select_followers"
on public.user_bookshelves for select
using (
  auth.uid() is not null
  and exists (
    select 1 from public.follows f
    where f.follower_id = auth.uid()
      and f.following_id = user_bookshelves.user_id
  )
);

drop policy if exists "shelves_select_if_profile_stats_public" on public.user_bookshelves;
create policy "shelves_select_if_profile_stats_public"
on public.user_bookshelves for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = user_bookshelves.user_id
      and coalesce(p.stats_public, true) = true
  )
);

drop policy if exists "sessions_select_followers" on public.reading_sessions;
create policy "sessions_select_followers"
on public.reading_sessions for select
using (
  auth.uid() is not null
  and exists (
    select 1 from public.follows f
    where f.follower_id = auth.uid()
      and f.following_id = reading_sessions.user_id
  )
);

drop policy if exists "sessions_select_if_profile_stats_public" on public.reading_sessions;
create policy "sessions_select_if_profile_stats_public"
on public.reading_sessions for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = reading_sessions.user_id
      and coalesce(p.stats_public, true) = true
  )
);
