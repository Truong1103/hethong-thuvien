import { BookOpen, Bookmark, CheckCircle2, Library } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { BookshelfStatus } from "@/app/books/[id]/actions";
import { linkBtnSecondary } from "@/lib/ui";
import { requireUser } from "@/lib/auth";

type BookRow = { id: string; title: string; author: string; cover_path: string | null };

export default async function ShelfPage() {
  const { supabase, user } = await requireUser();

  const { data: rows } = await supabase
    .from("user_bookshelves")
    .select("status, books ( id, title, author, cover_path )")
    .eq("user_id", user.id);

  function normalizeBook(b: unknown): BookRow | null {
    if (!b) return null;
    if (Array.isArray(b)) {
      const x = b[0];
      return x && typeof x === "object" && "id" in x ? (x as BookRow) : null;
    }
    return b as BookRow;
  }

  const byStatus = (s: BookshelfStatus) =>
    (rows ?? [])
      .filter((r: { status: string }) => r.status === s)
      .map((r: { books: unknown }) => normalizeBook(r.books))
      .filter((b): b is BookRow => b !== null);

  const reading = byStatus("reading");
  const finished = byStatus("finished");
  const wishlist = byStatus("wishlist");

  function coverUrl(path: string | null) {
    if (!path) return null;
    return supabase.storage.from("covers").getPublicUrl(path).data.publicUrl;
  }

  function ShelfColumn(props: {
    title: string;
    subtitle: string;
    books: BookRow[];
    icon: typeof BookOpen;
    gradient: string;
    ring: string;
    badge: string;
    emptyHint: string;
  }) {
    const Icon = props.icon;
    const count = props.books.length;
    return (
      <section
        className={`flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm ring-1 ${props.ring}`}
      >
        <div className={`border-b border-zinc-100 bg-gradient-to-r ${props.gradient} px-4 py-4 sm:px-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 shadow-sm ring-1 ring-white/60">
                <Icon className="h-5 w-5 text-zinc-800" strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-base font-bold tracking-tight text-zinc-900">{props.title}</h2>
                <p className="mt-0.5 text-xs text-zinc-600">{props.subtitle}</p>
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${props.badge}`}>{count}</span>
          </div>
        </div>
        <ul className="flex min-h-[120px] flex-1 flex-col gap-2 p-3 sm:p-4">
          {props.books.length === 0 ? (
            <li className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center">
              <Icon className="h-8 w-8 text-zinc-300" strokeWidth={1.25} />
              <p className="mt-2 text-sm text-zinc-600">Chưa có sách</p>
              <p className="mt-1 text-xs text-zinc-500">{props.emptyHint}</p>
            </li>
          ) : (
            props.books.map((b) => {
              const img = coverUrl(b.cover_path);
              return (
                <li key={b.id}>
                  <Link
                    href={`/books/${b.id}`}
                    className="group flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/40 p-2.5 transition hover:border-teal-200/80 hover:bg-white hover:shadow-md"
                  >
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 ring-1 ring-zinc-200/80">
                      {img ? (
                        <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                      ) : (
                        <BookOpen className="absolute inset-0 m-auto h-6 w-6 text-zinc-400" strokeWidth={1.25} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-teal-800">{b.title}</div>
                      <div className="mt-0.5 truncate text-xs text-zinc-600">{b.author}</div>
                      <span className="mt-1.5 inline-block text-[11px] font-semibold text-teal-700 opacity-0 transition group-hover:opacity-100">
                        Mở chi tiết →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </section>
    );
  }

  const total = reading.length + finished.length + wishlist.length;

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-teal-50/25 to-emerald-50/15 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-600/25">
              <Library className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Tủ sách</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Sách của bạn</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
                Ba danh sách: đang đọc, muốn đọc và đã xong. Đổi trạng thái tại trang chi tiết từng cuốn (mục Tủ sách trên trang sách).
              </p>
              <p className="mt-3 text-sm font-medium text-zinc-800">
                Tổng <span className="tabular-nums text-teal-700">{total}</span> cuốn trong tủ
              </p>
            </div>
          </div>
          <Link href="/books" className={`${linkBtnSecondary} shrink-0 self-start`}>
            <BookOpen className="h-4 w-4" />
            Kho sách
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <ShelfColumn
          title="Đang đọc"
          subtitle="Ưu tiên mỗi ngày một chút"
          books={reading}
          icon={BookOpen}
          gradient="from-amber-50 to-orange-50/50"
          ring="ring-amber-100/80"
          badge="bg-amber-100 text-amber-900 ring-1 ring-amber-200/80"
          emptyHint="Thêm sách từ kho hoặc chuyển từ “Muốn đọc”."
        />
        <ShelfColumn
          title="Đã đọc xong"
          subtitle="Niềm vui đã chinh phục"
          books={finished}
          icon={CheckCircle2}
          gradient="from-emerald-50 to-teal-50/50"
          ring="ring-emerald-100/80"
          badge="bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80"
          emptyHint="Đánh dấu hoàn thành ở trang chi tiết sách."
        />
        <ShelfColumn
          title="Muốn đọc"
          subtitle="Danh sách chờ"
          books={wishlist}
          icon={Bookmark}
          gradient="from-violet-50 to-indigo-50/40"
          ring="ring-violet-100/80"
          badge="bg-violet-100 text-violet-900 ring-1 ring-violet-200/80"
          emptyHint="Lưu sách hay để đọc sau từ trang chi tiết."
        />
      </div>
    </div>
  );
}
