import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PdfReader } from "@/components/PdfReader";

type Params = Promise<{ id: string }>;

export default async function ReadBookPage(props: { params: Params }) {
  const { id } = await props.params;
  const { supabase } = await requireUser();

  const [{ data: book }, { data: progress }] = await Promise.all([
    supabase.from("books").select("id,title,pdf_path").eq("id", id).maybeSingle(),
    supabase.from("user_book_progress").select("pdf_page").eq("book_id", id).maybeSingle(),
  ]);

  if (!book) return notFound();
  if (!book.pdf_path) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="text-lg font-semibold">Chưa có PDF</div>
          <p className="mt-1 text-sm text-zinc-600">Sách này chưa được đính kèm file PDF.</p>
          <Link href={`/books/${book.id}`} className="mt-4 inline-block text-sm text-zinc-700 hover:text-zinc-950">
            ← Quay lại
          </Link>
        </div>
      </div>
    );
  }

  /** Cùng origin — proxy server gọi Supabase, tránh CORS / worker pdf.js với URL signed trực tiếp. */
  const pdfUrl = `/api/books/${book.id}/pdf`;

  const initialPage = progress?.pdf_page ?? 1;

  return (
    <div className="flex flex-col gap-3 pb-4">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-zinc-200/80 pb-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">Đang đọc</div>
          <h1 className="truncate text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">{book.title}</h1>
        </div>
        <Link
          href={`/books/${book.id}`}
          className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
        >
          ← Chi tiết
        </Link>
      </div>

      <PdfReader url={pdfUrl} bookId={book.id} bookTitle={book.title} initialPage={initialPage} />
    </div>
  );
}
