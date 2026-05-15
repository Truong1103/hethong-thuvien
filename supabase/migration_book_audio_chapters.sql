-- Audio chapters per book (run in Supabase SQL editor)

create table if not exists public.book_audio_chapters (
  id uuid primary key default uuid_generate_v4(),
  book_id uuid not null references public.books(id) on delete cascade,
  sort_order int not null default 0,
  title text not null,
  audio_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists book_audio_chapters_book_id_idx
  on public.book_audio_chapters (book_id, sort_order);

alter table public.book_audio_chapters enable row level security;

drop policy if exists "audio_chapters_read_auth" on public.book_audio_chapters;
create policy "audio_chapters_read_auth"
on public.book_audio_chapters for select
using (auth.role() = 'authenticated');

drop policy if exists "audio_chapters_admin_insert" on public.book_audio_chapters;
create policy "audio_chapters_admin_insert"
on public.book_audio_chapters for insert
with check (public.is_admin());

drop policy if exists "audio_chapters_admin_update" on public.book_audio_chapters;
create policy "audio_chapters_admin_update"
on public.book_audio_chapters for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "audio_chapters_admin_delete" on public.book_audio_chapters;
create policy "audio_chapters_admin_delete"
on public.book_audio_chapters for delete
using (public.is_admin());

alter table public.user_book_progress
  add column if not exists audio_chapter_id uuid references public.book_audio_chapters(id) on delete set null;
