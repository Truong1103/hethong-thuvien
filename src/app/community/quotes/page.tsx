import { QuoteCard } from "@/components/community/QuoteCard";
import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { linkBtnPrimary, linkBtnSecondary } from "@/lib/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BookOpen, Heart, Library, PenLine, Quote, Sparkles, Users } from "lucide-react";
import Link from "next/link";

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
    bookIds.length > 0
      ? supabase.from("books").select("id, title, author, cover_path").in("id", bookIds)
      : { data: [] },
    userIds.length > 0 ? supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds) : { data: [] },
  ]);

  const bookMap = Object.fromEntries(
    (books ?? []).map((b) => [
      b.id,
      {
        title: b.title,
        author: b.author,
        coverUrl: b.cover_path ? supabase.storage.from("covers").getPublicUrl(b.cover_path).data.publicUrl : null,
      },
    ]),
  );
  const profMap = Object.fromEntries((profs ?? []).map((p) => [p.id, p]));

  const count = quotes?.length ?? 0;

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <CommunitySubnav current="quotes" />

        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-teal-50/35 to-emerald-50/25 p-6 shadow-sm sm:p-8">
          <Quote
            className="pointer-events-none absolute -right-4 -top-6 h-32 w-32 text-teal-100/80 sm:h-40 sm:w-40"
            strokeWidth={0.75}
            aria-hidden
          />
          <div className="relative flex flex-wrap items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/25">
              <Quote className="h-7 w-7" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-800 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Trích dẫn cộng đồng
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Những dòng chữ đáng nhớ
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                Các câu hay được thành viên chia sẻ công khai từ trang chi tiết sách — khám phá qua góc nhìn người đọc,
                rồi mở sách gốc để đọc trọn vẹn ngữ cảnh.
              </p>
              {count > 0 ? (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-100/80 px-3 py-1.5 text-sm font-semibold text-teal-900">
                  <Heart className="h-4 w-4 fill-teal-500 text-teal-500" />
                  {count} trích dẫn đang hiển thị
                </p>
              ) : null}
            </div>
          </div>

          <ul className="relative mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: PenLine,
                title: "Chia sẻ từ sách",
                desc: "Đăng nhập, mở sách và gửi đoạn bạn thích lên cộng đồng.",
              },
              {
                icon: Users,
                title: "Góc nhìn độc giả",
                desc: "Đọc trích dẫn của người khác trước khi chọn sách mới.",
              },
              {
                icon: Library,
                title: "Mở ngay nguồn",
                desc: "Mỗi trích dẫn dẫn thẳng tới trang sách trong thư viện.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                className="flex gap-3 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-600">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {count > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {(quotes ?? []).map((q) => {
            const book = bookMap[q.book_id];
            const prof = profMap[q.user_id];
            return (
              <QuoteCard
                key={q.id}
                id={q.id}
                content={q.content}
                createdAt={q.created_at}
                userId={q.user_id}
                userName={prof?.display_name ?? "Ẩn danh"}
                userAvatar={prof?.avatar_url ?? null}
                bookId={q.book_id}
                bookTitle={book?.title ?? "Sách"}
                bookAuthor={book?.author ?? null}
                coverUrl={book?.coverUrl ?? null}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-teal-200/80 bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/30 px-6 py-14 text-center shadow-inner">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-teal-100">
            <Quote className="h-8 w-8 text-teal-500" strokeWidth={1.5} />
          </span>
          <h2 className="mt-5 text-lg font-bold text-zinc-900">Chưa có trích dẫn công khai</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
            Hãy là người đầu tiên! Đăng nhập, mở một cuốn sách yêu thích và đăng câu / đoạn trích bạn muốn lưu lại cho
            cộng đồng.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/books" className={linkBtnPrimary}>
              <BookOpen className="h-4 w-4" />
              Khám phá kho sách
            </Link>
            <Link href="/community" className={linkBtnSecondary}>
              Về trung tâm cộng đồng
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
