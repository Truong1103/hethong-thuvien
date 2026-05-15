import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminBookMetadataForm, AdminDeleteBookButton } from "@/app/admin/books/AdminBookEditForms";
import { requireUser } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export default async function EditBookPage(props: { params: Params }) {
  const { id } = await props.params;
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const { data: book } = await supabase
    .from("books")
    .select("id,title,author,genre,publisher,published_year,description")
    .eq("id", id)
    .maybeSingle();
  if (!book) return notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Sửa sách</h1>
        <div className="flex gap-3 text-sm">
          <Link href={`/admin/books/${book.id}/copies`} className="text-zinc-700 hover:text-zinc-950">
            QR bản giấy
          </Link>
          <Link href="/admin/books" className="text-zinc-700 hover:text-zinc-950">
            ← Danh sách
          </Link>
        </div>
      </div>

      <AdminBookMetadataForm book={book} />

      <AdminDeleteBookButton bookId={book.id} title={book.title} />
    </div>
  );
}
