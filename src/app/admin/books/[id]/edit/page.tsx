import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminBookEditForm, AdminDeleteBookButton } from "@/app/admin/books/AdminBookEditForms";
import { requireUser } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export default async function EditBookPage(props: { params: Params }) {
  const { id } = await props.params;
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const [{ data: book }, { data: chapters }] = await Promise.all([
    supabase
      .from("books")
      .select(
        "id,title,author,genre,publisher,published_year,description,cover_path,pdf_path,audio_path",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("book_audio_chapters")
      .select("id,title,audio_path,sort_order")
      .eq("book_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!book) return notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sửa sách</h1>
          <p className="mt-1 text-sm text-zinc-600">Cập nhật thông tin, bìa, PDF và audio theo chapter.</p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href={`/admin/books/${book.id}/copies`} className="text-zinc-700 hover:text-zinc-950">
            QR bản giấy
          </Link>
          <Link href="/admin/books" className="text-zinc-700 hover:text-zinc-950">
            ← Danh sách
          </Link>
        </div>
      </div>

      <AdminBookEditForm book={book} initialChapters={chapters ?? []} />

      <AdminDeleteBookButton bookId={book.id} title={book.title} />
    </div>
  );
}
