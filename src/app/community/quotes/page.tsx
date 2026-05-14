import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { BookOpen, Quote } from "lucide-react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function QuotesFeedPage() {
  const supabase = await createSupabaseServerClient();

  const { data: quotes } = await supabase
    .from("book_quotes")
    .select("id, content, created_at, user_id, book_id")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(40);

  const bookIds = [...new Set((quotes ?? []).map((q) => q.book_id))];
  const userIds = [...new Set((quotes ?? []).map((q) => q.user_id))];

  const [{ data: books }, { data: profs }] = await Promise.all([
    bookIds.length > 0 ? supabase.from("books").select("id, title").in("id", bookIds) : { data: [] },
    userIds.length > 0 ? supabase.from("profiles").select("id, display_name").in("id", userIds) : { data: [] },
  ]);

  const bookMap = Object.fromEntries((books ?? []).map((b) => [b.id, b.title]));
  const profMap = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name]));

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <CommunitySubnav current="quotes" />
        <div className="rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-rose-50/20 to-violet-50/15 p-6 shadow-sm sm:p-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-800">
            <Quote className="h-4 w-4" />
            Trích dẫn cộng đồng
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Những dòng chữ đáng nhớ</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Các trích dẫn được thành viên đánh dấu công khai từ trang chi tiết sách. Dùng đây để khám phá sách qua góc nhìn
            người đọc — rồi mở sách gốc để đọc ngữ cảnh đầy đủ.
          </p>
        </div>
      </header>

      <div className="space-y-4">
        {(quotes ?? []).map((q) => (
          <blockquote
            key={q.id}
            className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition hover:border-rose-200/60 hover:shadow-md sm:p-6"
          >
            <Quote className="pointer-events-none absolute -right-1 -top-1 h-16 w-16 text-rose-100/90" strokeWidth={1} />
            <p className="relative text-sm italic leading-relaxed text-zinc-800 sm:text-base">&ldquo;{q.content}&rdquo;</p>
            <footer className="relative mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
              <span className="font-medium text-zinc-700">{profMap[q.user_id] ?? "Ẩn danh"}</span>
              <span className="text-zinc-300">•</span>
              <Link href={`/books/${q.book_id}`} className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline">
                <BookOpen className="h-3.5 w-3.5" />
                {bookMap[q.book_id] ?? "Sách"}
              </Link>
              <span className="text-zinc-300">•</span>
              <time dateTime={q.created_at}>{new Date(q.created_at).toLocaleString("vi-VN")}</time>
            </footer>
          </blockquote>
        ))}
        {(quotes?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
            <p className="text-sm text-zinc-600">Chưa có trích dẫn công khai nào.</p>
            <p className="mt-2 text-xs text-zinc-500">
              Đăng nhập, mở một cuốn sách và dùng mục trích dẫn (nếu được bật) để chia sẻ lên đây.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
