import { FollowButton } from "@/app/u/[id]/FollowButton";
import { CommunityLoginGate } from "@/app/community/_components/CommunityLoginGate";
import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { linkBtnPrimary } from "@/lib/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export default async function SuggestionsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-8">
        <CommunitySubnav current="suggestions" />
        <CommunityLoginGate
          nextPath="/community/suggestions"
          title="Gợi ý theo dõi"
          description="Đăng nhập để xem thành viên có thể loại tương đồng với hồ sơ của bạn và bấm Theo dõi để đưa họ vào Feed."
        />
      </div>
    );
  }

  const { data: meProf } = await supabase.from("profiles").select("favorite_genres").eq("id", user.id).maybeSingle();
  const myGenres = (meProf?.favorite_genres as string[] | null) ?? [];
  const first = myGenres[0];

  const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
  const followingSet = new Set((follows ?? []).map((f) => f.following_id));

  let candidates: { id: string; display_name: string | null; favorite_genres: string[] | null }[] = [];

  if (first) {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, favorite_genres")
      .neq("id", user.id)
      .contains("favorite_genres", [first])
      .limit(20);
    candidates = (data ?? []) as typeof candidates;
  } else {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, favorite_genres")
      .neq("id", user.id)
      .limit(12);
    candidates = (data ?? []) as typeof candidates;
  }

  const scored = candidates
    .filter((c) => !followingSet.has(c.id))
    .map((c) => {
      const g = (c.favorite_genres as string[] | null) ?? [];
      const overlap = myGenres.length ? g.filter((x) => myGenres.includes(x)).length : 0;
      return { ...c, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 12);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <CommunitySubnav current="suggestions" />
        <div className="rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-emerald-50/25 to-teal-50/15 p-6 shadow-sm sm:p-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            <UserPlus className="h-4 w-4" />
            Gợi ý theo dõi
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Mở rộng vòng bạn đọc</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Danh sách gợi ý dựa trên thể loại trong hồ sơ của bạn (ưu tiên trùng thể loại). Theo dõi vài người để Feed
            luôn có hoạt động tủ sách mới.
          </p>
          <Link href="/community/feed" className={`${linkBtnPrimary} mt-5 inline-flex w-fit gap-2`}>
            Đi tới Feed
          </Link>
        </div>
      </header>

      {!first ? (
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Thêm thể loại yêu thích tại{" "}
          <Link href="/me/edit" className="font-semibold text-amber-900 underline">
            Sửa hồ sơ
          </Link>{" "}
          để gợi ý khớp sở thích tốt hơn.
        </div>
      ) : null}

      <ul className="space-y-3">
        {scored.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-4 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition hover:border-teal-200/70 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="min-w-0">
              <Link href={`/u/${c.id}`} className="text-base font-semibold text-zinc-900 hover:text-teal-800 hover:underline">
                {c.display_name ?? "Thành viên"}
              </Link>
              <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-zinc-600">
                {(c.favorite_genres ?? []).slice(0, 6).map((g) => (
                  <span key={g} className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700">
                    {g}
                  </span>
                ))}
                {!c.favorite_genres?.length ? <span className="text-zinc-400">Chưa khai thể loại</span> : null}
                {myGenres.length ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-900">
                    Trùng {c.overlap} thể loại
                  </span>
                ) : null}
              </div>
            </div>
            <FollowButton targetUserId={c.id} initialFollowing={false} />
          </li>
        ))}
      </ul>

      {scored.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center text-sm text-zinc-600">
          Chưa có gợi ý phù hợp. Thử cập nhật thể loại yêu thích hoặc quay lại sau.
        </p>
      ) : null}
    </div>
  );
}
