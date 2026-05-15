import { BookMarked, Library } from "lucide-react";
import Link from "next/link";
import { CommunityLoginGate } from "@/app/community/_components/CommunityLoginGate";
import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { linkBtnPrimary, linkBtnSecondary } from "@/lib/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CommunityFeedPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-8">
        <CommunitySubnav current="feed" />
        <CommunityLoginGate
          nextPath="/community/feed"
          title="Feed dành cho thành viên"
          description="Đăng nhập để xem hoạt động tủ sách của những người bạn theo dõi — cập nhật đang đọc, đã xong và muốn đọc."
        />
      </div>
    );
  }

  const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
  const rawIds = (follows ?? []).map((f) => f.following_id);
  const { data: activeFollowed } =
    rawIds.length > 0
      ? await supabase.from("profiles").select("id").in("id", rawIds).eq("is_blocked", false)
      : { data: [] as { id: string }[] };
  const ids = (activeFollowed ?? []).map((p) => p.id);

  if (rawIds.length === 0) {
    return (
      <div className="space-y-8">
        <header className="space-y-4">
          <CommunitySubnav current="feed" />
          <div className="rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-sky-50/30 to-cyan-50/20 p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Feed đọc sách</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Chưa có ai trong danh sách theo dõi</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              Khi bạn theo dõi thành viên khác, mỗi lần họ cập nhật tủ sách sẽ hiện ở đây theo thời gian thực. Hãy khám phá
              gợi ý hoặc mở hồ sơ công khai và bấm <strong className="text-zinc-800">Theo dõi</strong>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/community/suggestions" className={linkBtnPrimary}>
                Gợi ý theo dõi
              </Link>
              <Link href="/books" className={linkBtnSecondary}>
                <Library className="h-4 w-4" />
                Tìm sách & hồ sơ
              </Link>
            </div>
          </div>
        </header>
      </div>
    );
  }

  if (rawIds.length > 0 && ids.length === 0) {
    return (
      <div className="space-y-8">
        <header className="space-y-4">
          <CommunitySubnav current="feed" />
          <div className="rounded-3xl border border-zinc-200/90 bg-amber-50/80 p-6 shadow-sm sm:p-8">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">Không có feed khả dụng</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-700 sm:text-base">
              Các tài khoản bạn theo dõi hiện không hiển thị hoạt động (ví dụ đã bị khóa). Hãy cập nhật danh sách theo
              dõi tại{" "}
              <Link href="/community/suggestions" className="font-semibold text-teal-800 underline">
                Gợi ý theo dõi
              </Link>
              .
            </p>
          </div>
        </header>
      </div>
    );
  }

  const { data: shelves } = await supabase
    .from("user_bookshelves")
    .select("status, updated_at, user_id, book_id, books ( id, title )")
    .in("user_id", ids)
    .order("updated_at", { ascending: false })
    .limit(40);

  const shelfRows = shelves ?? [];
  const shelfUserIds = [...new Set(shelfRows.map((s) => s.user_id))];
  const { data: names } = await supabase.from("profiles").select("id, display_name").in("id", shelfUserIds);
  const nameMap = Object.fromEntries((names ?? []).map((n) => [n.id, n.display_name]));

  const statusLabel: Record<string, string> = {
    reading: "đang đọc",
    finished: "đã đọc xong",
    wishlist: "muốn đọc",
  };

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <CommunitySubnav current="feed" />
        <div className="rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-sky-50/25 to-teal-50/15 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Feed đọc sách</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Hoạt động từ người bạn theo dõi</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Cập nhật tủ sách mới nhất: đang đọc, đã hoàn thành hoặc muốn đọc — kèm liên kết tới sách và hồ sơ.
          </p>
        </div>
      </header>

      {shelfRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center text-sm text-zinc-600">
          Chưa có cập nhật tủ sách từ người bạn theo dõi (họ chưa thêm sách vào đang đọc / đã xong / muốn đọc). Hãy
          quay lại sau hoặc theo dõi thêm thành viên khác.
        </div>
      ) : (
      <ul className="space-y-3">
        {shelfRows.map((row) => {
          const b = row.books as { id?: string; title?: string } | { id?: string; title?: string }[] | null;
          const book = Array.isArray(b) ? b[0] : b;
          const title = book?.title;
          const bookId = book?.id ?? row.book_id;
          const who = nameMap[row.user_id] ?? "Thành viên";
          const st = statusLabel[row.status] ?? row.status;
          return (
            <li
              key={`${row.user_id}-${row.book_id}-${row.updated_at}`}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition hover:border-teal-200/80 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                  <BookMarked className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0 text-sm">
                  <div>
                    <Link href={`/u/${row.user_id}`} className="font-semibold text-zinc-900 hover:text-teal-800 hover:underline">
                      {who}
                    </Link>
                    <span className="text-zinc-600"> {st} </span>
                    <Link href={`/books/${bookId}`} className="font-semibold text-teal-800 hover:underline">
                      {title ?? "Sách"}
                    </Link>
                  </div>
                  <time className="mt-1 block text-xs text-zinc-400" dateTime={row.updated_at}>
                    {new Date(row.updated_at).toLocaleString("vi-VN")}
                  </time>
                </div>
              </div>
              <Link
                href={`/books/${bookId}`}
                className="shrink-0 self-start rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 sm:self-center"
              >
                Mở sách
              </Link>
            </li>
          );
        })}
      </ul>
      )}
    </div>
  );
}

