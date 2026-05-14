import { BookAiSummary } from "@/app/books/[id]/BookAiSummary";
import { QuoteSnippetForm } from "@/app/books/[id]/QuoteSnippetForm";
import { ReviewsSection } from "@/app/books/[id]/ReviewsSection";
import { ShelfButtons } from "@/app/books/[id]/ShelfButtons";
import { ViewIncrement } from "@/app/books/[id]/ViewIncrement";
import type { BookshelfStatus } from "@/app/books/[id]/actions";
import { linkBtnGhost, linkBtnPrimary, linkBtnSecondary } from "@/lib/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ArrowLeft, BookOpen, Headphones } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function BookDetailPage(props: { params: Params }) {
  const { id } = await props.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: book, error } = await supabase
    .from("books")
    .select(
      "id,title,author,genre,publisher,published_year,description,cover_path,pdf_path,audio_path,view_count,rating_avg,rating_count,created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !book) return notFound();

  const [{ data: summaryRow }, { data: shelfRow }, { data: reviews }, { data: myReviewRow }] = await Promise.all([
    supabase.from("book_summaries").select("summary").eq("book_id", id).maybeSingle(),
    user
      ? supabase.from("user_bookshelves").select("status").eq("book_id", id).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null } as const),
    supabase
      .from("book_reviews")
      .select("id, rating, content, created_at, user_id")
      .eq("book_id", id)
      .order("created_at", { ascending: false }),
    user
      ? supabase
          .from("book_reviews")
          .select("rating, content")
          .eq("book_id", id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null } as const),
  ]);

  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))];
  const { data: profs } =
    userIds.length > 0
      ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
      : { data: [] as { id: string; display_name: string | null }[] };

  const pmap = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name]));
  const reviewIds = (reviews ?? []).map((r) => r.id);

  const { data: voteRows } =
    reviewIds.length > 0
      ? await supabase.from("review_votes").select("review_id, vote, user_id").in("review_id", reviewIds)
      : { data: [] as { review_id: string; vote: number; user_id: string }[] };

  const voteUp: Record<string, number> = {};
  const voteDown: Record<string, number> = {};
  const myVotes: Record<string, 1 | -1> = {};

  for (const v of voteRows ?? []) {
    if (v.vote === 1) voteUp[v.review_id] = (voteUp[v.review_id] ?? 0) + 1;
    if (v.vote === -1) voteDown[v.review_id] = (voteDown[v.review_id] ?? 0) + 1;
    if (user && v.user_id === user.id) myVotes[v.review_id] = v.vote as 1 | -1;
  }

  const reviewsForUi = (reviews ?? []).map((r) => ({
    ...r,
    profiles: { display_name: pmap[r.user_id] ?? null },
  }));

  const shelfStatus = (shelfRow?.status as BookshelfStatus | undefined) ?? null;

  const coverUrl = book.cover_path
    ? supabase.storage.from("covers").getPublicUrl(book.cover_path).data.publicUrl
    : null;

  const disabledPrimary = `${linkBtnPrimary} pointer-events-none cursor-not-allowed opacity-45`;
  const disabledSecondary = `${linkBtnSecondary} pointer-events-none cursor-not-allowed opacity-45`;

  return (
    <div className="space-y-8">
      <ViewIncrement bookId={book.id} />

      <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white shadow-xl shadow-zinc-900/5">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-start lg:gap-10">
          <div className="relative mx-auto aspect-[2/3] w-full max-w-[260px] overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 shadow-lg ring-1 ring-zinc-200/80 sm:max-w-[300px] lg:mx-0 lg:max-w-none">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={`Bìa sách: ${book.title}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 260px, 300px"
                priority
              />
            ) : (
              <BookOpen className="absolute inset-0 m-auto h-24 w-24 text-zinc-400" strokeWidth={1} />
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">{book.title}</h1>
            <p className="text-base text-zinc-600">{book.author}</p>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              {book.genre ? (
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-800 ring-1 ring-teal-100">
                  {book.genre}
                </span>
              ) : null}
              {book.publisher ? (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700">{book.publisher}</span>
              ) : null}
              {book.published_year ? (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700">{book.published_year}</span>
              ) : null}
            </div>

            <div className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
              {book.description ?? "Chưa có mô tả."}
            </div>

            {user ? (
              <div className="mt-2">
                <ShelfButtons bookId={book.id} current={shelfStatus} />
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              {book.pdf_path ? (
                <Link href={`/books/${book.id}/read`} className={linkBtnPrimary}>
                  <BookOpen className="h-4 w-4 shrink-0" />
                  Đọc PDF
                </Link>
              ) : (
                <span className={disabledPrimary} title="Sách chưa có file PDF">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  Đọc PDF
                </span>
              )}
              {book.audio_path ? (
                <Link href={`/books/${book.id}/listen`} className={linkBtnSecondary}>
                  <Headphones className="h-4 w-4 shrink-0" />
                  Nghe audio
                </Link>
              ) : (
                <span className={disabledSecondary} title="Sách chưa có file audio">
                  <Headphones className="h-4 w-4 shrink-0" />
                  Nghe audio
                </span>
              )}
              <Link href="/books" className={linkBtnGhost}>
                <ArrowLeft className="h-4 w-4 shrink-0" />
                Quay lại kho sách
              </Link>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Lượt xem: {book.view_count} • Đánh giá ★ {Number(book.rating_avg).toFixed(1)} ({book.rating_count})
            </p>

            {!book.pdf_path ? (
              <div className="mt-2 rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Sách này chưa có file PDF.
              </div>
            ) : null}
            {!book.audio_path ? (
              <div className="mt-1 rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Sách này chưa có file audio.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <BookAiSummary bookId={book.id} initialSummary={summaryRow?.summary ?? null} />

      <ReviewsSection
        bookId={book.id}
        reviews={reviewsForUi}
        voteUp={voteUp}
        voteDown={voteDown}
        myVotes={myVotes}
        myUserId={user?.id ?? null}
        myReview={myReviewRow ? { rating: myReviewRow.rating, content: myReviewRow.content } : null}
      />

      {user ? <QuoteSnippetForm bookId={book.id} /> : null}
    </div>
  );
}
