import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { btnPrimaryInlineClass, inputClass } from "@/lib/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const filterInput = `${inputClass} mt-1`;

export default async function BooksPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const genre = typeof searchParams.genre === "string" ? searchParams.genre.trim() : "";
  const publisher = typeof searchParams.publisher === "string" ? searchParams.publisher.trim() : "";
  const year = typeof searchParams.year === "string" ? searchParams.year.trim() : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "newest";

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("books")
    .select("id,title,author,genre,publisher,published_year,cover_path,created_at,view_count,rating_avg,rating_count")
    .limit(50);

  if (q) {
    query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
  }
  if (genre) query = query.eq("genre", genre);
  if (publisher) query = query.eq("publisher", publisher);
  if (year && /^\d{4}$/.test(year)) query = query.eq("published_year", Number(year));

  if (sort === "popular") query = query.order("view_count", { ascending: false });
  else if (sort === "top") query = query.order("rating_avg", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: books, error } = await query;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Kho sách</h1>
          <p className="mt-1 text-sm text-zinc-600">Tìm kiếm, xem bìa và mở sách để đọc hoặc nghe.</p>
        </div>
      </div>

      <form className="grid gap-4 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Từ khóa</label>
          <input
            name="q"
            defaultValue={q}
            className={filterInput}
            placeholder="Tên sách / Tác giả"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Thể loại</label>
          <input name="genre" defaultValue={genre} className={filterInput} placeholder="VD: Kỹ năng" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">NXB</label>
          <input name="publisher" defaultValue={publisher} className={filterInput} placeholder="VD: Trẻ" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Năm</label>
          <input name="year" defaultValue={year} className={filterInput} placeholder="2025" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Sắp xếp</label>
          <select name="sort" defaultValue={sort} className={filterInput}>
            <option value="newest">Mới nhất</option>
            <option value="popular">Phổ biến</option>
            <option value="top">Đánh giá cao</option>
          </select>
        </div>
        <div className="sm:col-span-6">
          <button type="submit" className={`${btnPrimaryInlineClass} px-6`}>
            Tìm kiếm
          </button>
        </div>
      </form>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error.message}</div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(books ?? []).map((b) => {
          const coverUrl = b.cover_path
            ? supabase.storage.from("covers").getPublicUrl(b.cover_path).data.publicUrl
            : null;
          return (
            <Link
              key={b.id}
              href={`/books/${b.id}`}
              className="group flex gap-4 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition hover:border-teal-200/80 hover:shadow-md"
            >
              <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 ring-1 ring-zinc-200/80">
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt=""
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="96px"
                  />
                ) : (
                  <BookOpen className="absolute inset-0 m-auto h-10 w-10 text-zinc-400" strokeWidth={1.25} />
                )}
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <div className="line-clamp-2 text-base font-semibold tracking-tight text-zinc-900 group-hover:text-teal-800">
                  {b.title}
                </div>
                <div className="mt-1 text-sm text-zinc-600">{b.author}</div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-zinc-600">
                  {b.genre ? (
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 font-medium text-teal-800">{b.genre}</span>
                  ) : null}
                  {b.publisher ? <span className="rounded-full bg-zinc-100 px-2 py-0.5">{b.publisher}</span> : null}
                  {b.published_year ? (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5">{b.published_year}</span>
                  ) : null}
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  Lượt xem: {b.view_count} • ★ {Number(b.rating_avg).toFixed(1)} ({b.rating_count})
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {!error && (books?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 py-12 text-center">
          <BookOpen className="h-12 w-12 text-zinc-300" strokeWidth={1.25} />
          <p className="mt-3 text-sm font-medium text-zinc-700">Không có sách phù hợp.</p>
          <p className="mt-1 text-xs text-zinc-500">Thử bỏ bớt bộ lọc hoặc từ khóa khác.</p>
        </div>
      ) : null}
    </div>
  );
}
