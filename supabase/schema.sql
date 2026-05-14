-- Digital Library System (MVP)
-- Run in Supabase SQL editor.

-- Extensions
create extension if not exists "uuid-ossp";

-- Helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles (1-1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  favorite_genres text[] not null default '{}',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Books
create table if not exists public.books (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  author text not null,
  genre text,
  publisher text,
  published_year int,
  description text,
  cover_path text, -- storage object path
  pdf_path text,   -- storage object path
  audio_path text, -- storage object path
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  view_count bigint not null default 0,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0
);

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
before update on public.books
for each row execute function public.set_updated_at();

-- Enable trigram search (for title/author search)
create extension if not exists pg_trgm;

create index if not exists books_title_trgm_idx on public.books using gin (title gin_trgm_ops);
create index if not exists books_author_trgm_idx on public.books using gin (author gin_trgm_ops);
create index if not exists books_genre_idx on public.books (genre);
create index if not exists books_publisher_idx on public.books (publisher);
create index if not exists books_published_year_idx on public.books (published_year);
create index if not exists books_created_at_idx on public.books (created_at desc);

-- Reviews
create table if not exists public.book_reviews (
  id uuid primary key default uuid_generate_v4(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, user_id)
);

drop trigger if exists book_reviews_set_updated_at on public.book_reviews;
create trigger book_reviews_set_updated_at
before update on public.book_reviews
for each row execute function public.set_updated_at();

create index if not exists book_reviews_book_id_idx on public.book_reviews (book_id);
create index if not exists book_reviews_user_id_idx on public.book_reviews (user_id);

-- Bookshelf (reading/finished/wishlist)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'bookshelf_status') then
    create type public.bookshelf_status as enum ('reading', 'finished', 'wishlist');
  end if;
end$$;

create table if not exists public.user_bookshelves (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  status public.bookshelf_status not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

drop trigger if exists user_bookshelves_set_updated_at on public.user_bookshelves;
create trigger user_bookshelves_set_updated_at
before update on public.user_bookshelves
for each row execute function public.set_updated_at();

create index if not exists user_bookshelves_user_status_idx on public.user_bookshelves (user_id, status);

-- Progress for PDF/audio
create table if not exists public.user_book_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  pdf_page int,
  audio_position_seconds int,
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

-- Reading sessions (habit tracking)
create table if not exists public.reading_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  seconds_spent int,
  last_pdf_page int,
  created_at timestamptz not null default now()
);

create index if not exists reading_sessions_user_started_idx on public.reading_sessions (user_id, started_at desc);

-- Auth hook: create profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Admin helper
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.book_reviews enable row level security;
alter table public.user_bookshelves enable row level security;
alter table public.user_book_progress enable row level security;
alter table public.reading_sessions enable row level security;

-- Profiles policies
drop policy if exists "profiles_read_public" on public.profiles;
create policy "profiles_read_public"
on public.profiles for select
using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Books policies (public read, admin write)
drop policy if exists "books_read_public" on public.books;
create policy "books_read_public"
on public.books for select
using (true);

drop policy if exists "books_admin_write" on public.books;
create policy "books_admin_write"
on public.books for insert
with check (public.is_admin());

drop policy if exists "books_admin_update" on public.books;
create policy "books_admin_update"
on public.books for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "books_admin_delete" on public.books;
create policy "books_admin_delete"
on public.books for delete
using (public.is_admin());

-- Reviews (public read, auth write own)
drop policy if exists "reviews_read_public" on public.book_reviews;
create policy "reviews_read_public"
on public.book_reviews for select
using (true);

drop policy if exists "reviews_insert_auth" on public.book_reviews;
create policy "reviews_insert_auth"
on public.book_reviews for insert
with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.book_reviews;
create policy "reviews_update_own"
on public.book_reviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.book_reviews;
create policy "reviews_delete_own"
on public.book_reviews for delete
using (auth.uid() = user_id);

-- Bookshelves
drop policy if exists "shelves_select_own" on public.user_bookshelves;
create policy "shelves_select_own"
on public.user_bookshelves for select
using (auth.uid() = user_id);

drop policy if exists "shelves_upsert_own" on public.user_bookshelves;
create policy "shelves_upsert_own"
on public.user_bookshelves for insert
with check (auth.uid() = user_id);

drop policy if exists "shelves_update_own" on public.user_bookshelves;
create policy "shelves_update_own"
on public.user_bookshelves for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "shelves_delete_own" on public.user_bookshelves;
create policy "shelves_delete_own"
on public.user_bookshelves for delete
using (auth.uid() = user_id);

-- Progress
drop policy if exists "progress_select_own" on public.user_book_progress;
create policy "progress_select_own"
on public.user_book_progress for select
using (auth.uid() = user_id);

drop policy if exists "progress_upsert_own" on public.user_book_progress;
create policy "progress_upsert_own"
on public.user_book_progress for insert
with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.user_book_progress;
create policy "progress_update_own"
on public.user_book_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Reading sessions
drop policy if exists "sessions_select_own" on public.reading_sessions;
create policy "sessions_select_own"
on public.reading_sessions for select
using (auth.uid() = user_id);

drop policy if exists "sessions_insert_own" on public.reading_sessions;
create policy "sessions_insert_own"
on public.reading_sessions for insert
with check (auth.uid() = user_id);

drop policy if exists "sessions_update_own" on public.reading_sessions;
create policy "sessions_update_own"
on public.reading_sessions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Storage buckets + policies (run as service role in SQL editor)
-- Buckets: covers, pdfs, audios
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('audios', 'audios', false)
on conflict (id) do nothing;

-- Public cover read
drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read"
on storage.objects for select
using (bucket_id = 'covers');

-- PDF/Audio read: only authenticated users (can refine to borrower later)
drop policy if exists "media_auth_read" on storage.objects;
create policy "media_auth_read"
on storage.objects for select
using ((bucket_id in ('pdfs','audios')) and auth.role() = 'authenticated');

-- Media write: admin only
drop policy if exists "media_admin_write" on storage.objects;
create policy "media_admin_write"
on storage.objects for insert
with check (public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update"
on storage.objects for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete"
on storage.objects for delete
using (public.is_admin());

