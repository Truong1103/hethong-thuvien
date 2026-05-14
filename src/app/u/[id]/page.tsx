import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FollowButton } from "@/app/u/[id]/FollowButton";
import { BadgeCollection } from "@/components/BadgeCollection";
import { computeGamificationBadges } from "@/lib/badges";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export default async function PublicProfilePage(props: { params: Params }) {
  const { id } = await props.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: me },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, bio, favorite_genres, avatar_url, stats_public")
    .eq("id", id)
    .maybeSingle();

  if (!profile) return notFound();

  let following = false;
  if (me && me.id !== id) {
    const { data: f } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", me.id)
      .eq("following_id", id)
      .maybeSingle();
    following = !!f;
  }

  let finished = 0;
  let minutes = 0;
  let badges: ReturnType<typeof computeGamificationBadges> | null = null;
  if (profile.stats_public) {
    const [{ count }, { data: sessions }] = await Promise.all([
      supabase.from("user_bookshelves").select("*", { count: "exact", head: true }).eq("user_id", id).eq("status", "finished"),
      supabase
        .from("reading_sessions")
        .select("started_at, seconds_spent")
        .eq("user_id", id)
        .order("started_at", { ascending: false })
        .limit(4000),
    ]);
    finished = count ?? 0;
    minutes = Math.round(((sessions ?? []).reduce((a, s) => a + (s.seconds_spent ?? 0), 0) ?? 0) / 60);
    badges = computeGamificationBadges({
      finishedBookCount: finished,
      sessionStartedAts: (sessions ?? []).map((s) => s.started_at),
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-100">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill className="object-cover" />
              ) : null}
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{profile.display_name ?? "Thành viên"}</h1>
              {me && me.id !== profile.id ? (
                <div className="mt-2">
                  <FollowButton targetUserId={profile.id} initialFollowing={following} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {profile.bio ? <p className="mt-2 text-sm text-zinc-700">{profile.bio}</p> : null}
        {(profile.favorite_genres as string[])?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {(profile.favorite_genres as string[]).map((g) => (
              <span key={g} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                {g}
              </span>
            ))}
          </div>
        ) : null}

        {profile.stats_public ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4 text-sm">
              <div>
                <div className="text-xs uppercase text-zinc-500">Sách đã đọc xong</div>
                <div className="text-lg font-semibold">{finished}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-zinc-500">Phút đọc/nghe (ước lượng)</div>
                <div className="text-lg font-semibold">{minutes}</div>
              </div>
            </div>
            {badges ? <BadgeCollection badges={badges} variant="profile" /> : null}
          </>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">Người dùng đã tắt hiển thị thống kê công khai.</p>
        )}
      </div>

      <Link href="/books" className="text-sm text-zinc-700 hover:text-zinc-950">
        ← Kho sách
      </Link>
    </div>
  );
}
