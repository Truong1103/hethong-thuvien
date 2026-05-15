-- Chạy một lần trên Supabase (SQL editor) nếu project đã áp dụng schema cũ.
-- Cho phép: (1) xem tủ sách / phiên đọc của người mình follow (feed);
-- (2) xem tủ sách + phiên của user có stats_public (hồ sơ công khai).

-- user_bookshelves: thêm đọc theo follow + stats công khai
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

-- reading_sessions: cùng logic (phút đọc / huy hiệu trên /u/[id])
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
