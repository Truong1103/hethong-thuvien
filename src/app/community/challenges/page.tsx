import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { JoinChallengeButton } from "@/app/community/challenges/JoinChallengeButton";
import { ChallengeProgressForm } from "@/app/community/challenges/ChallengeProgressForm";
import { CalendarRange, Medal, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ChallengesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: challenges } = await supabase
    .from("reading_challenges")
    .select("id, title, description, starts_at, ends_at, target_books")
    .order("starts_at", { ascending: false })
    .limit(50);

  let joinedSet = new Set<string>();
  const challengeIds = (challenges ?? []).map((c) => c.id);
  let progressMap: Record<string, number> = {};
  if (user && challengeIds.length > 0) {
    const { data: parts } = await supabase
      .from("challenge_participants")
      .select("challenge_id, books_completed")
      .eq("user_id", user.id)
      .in("challenge_id", challengeIds);
    joinedSet = new Set((parts ?? []).map((p) => p.challenge_id));
    progressMap = Object.fromEntries((parts ?? []).map((p) => [p.challenge_id, p.books_completed ?? 0]));
  }

  const { data: leaderboard } = await supabase
    .from("challenge_participants")
    .select("challenge_id, books_completed, user_id")
    .order("books_completed", { ascending: false })
    .limit(30);

  const lbIds = [...new Set((leaderboard ?? []).map((r) => r.user_id))];
  const { data: lbProfs } =
    lbIds.length > 0 ? await supabase.from("profiles").select("id, display_name").in("id", lbIds) : { data: [] };
  const lbNames = Object.fromEntries((lbProfs ?? []).map((p) => [p.id, p.display_name]));

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <CommunitySubnav current="challenges" />
        <div className="rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-amber-50/25 to-orange-50/15 p-6 shadow-sm sm:p-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
            <Sparkles className="h-4 w-4" />
            Thử thách đọc sách
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Cùng nhau đọc có mục tiêu</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Tham gia thử thách do quản trị tạo, cập nhật số sách đã hoàn thành trong khoảng thời gian quy định. Bảng xếp
            hạng hiển thị một phần người chơi theo số cuốn đã báo cáo.
          </p>
          {!user ? (
            <p className="mt-4 text-sm text-amber-900/90">
              <Link href="/login?next=/community/challenges" className="font-semibold underline">
                Đăng nhập
              </Link>{" "}
              để tham gia và cập nhật tiến độ.
            </p>
          ) : null}
        </div>
      </header>

      <div className="grid gap-5">
        {(challenges ?? []).map((c) => (
          <article
            key={c.id}
            className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition hover:border-amber-200/60 hover:shadow-md"
          >
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                    <Trophy className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">{c.title}</h2>
                    {c.description ? <p className="mt-2 text-sm leading-relaxed text-zinc-600">{c.description}</p> : null}
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <CalendarRange className="h-3.5 w-3.5" />
                        {new Date(c.starts_at).toLocaleDateString("vi-VN")} — {new Date(c.ends_at).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700">
                        Mục tiêu: {c.target_books} cuốn
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-2 sm:min-w-[220px] sm:items-end">
                {user ? <JoinChallengeButton challengeId={c.id} joined={joinedSet.has(c.id)} /> : null}
                {user && joinedSet.has(c.id) ? (
                  <ChallengeProgressForm challengeId={c.id} current={progressMap[c.id] ?? 0} target={c.target_books} />
                ) : null}
              </div>
            </div>
          </article>
        ))}
        {(challenges?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
            <p className="text-sm text-zinc-600">Chưa có thử thách nào.</p>
            <p className="mt-2 text-xs text-zinc-500">
              Quản trị có thể tạo tại <Link className="font-semibold text-teal-700 underline" href="/admin/challenges/new">/admin/challenges/new</Link>.
            </p>
          </div>
        ) : null}
      </div>

      <section className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-zinc-50 to-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2">
          <Medal className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-bold text-zinc-900">Bảng xếp hạng (tổng hợp)</h2>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Top theo số sách hoàn thành đã báo trong bảng tham gia (có thể gồm nhiều thử thách).
        </p>
        <ol className="mt-5 divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
          {(leaderboard ?? []).slice(0, 10).map((row, i) => {
            const name = lbNames[row.user_id] ?? row.user_id.slice(0, 8);
            return (
              <li key={`${row.challenge_id}-${row.user_id}-${i}`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm first:rounded-t-xl last:rounded-b-xl">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                    {i + 1}
                  </span>
                  <span className="truncate font-medium text-zinc-900">{name}</span>
                </span>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  {row.books_completed} cuốn
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
