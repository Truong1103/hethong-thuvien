import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { deleteBookFormAction, updateBookMetadataAction } from "@/app/admin/actions";
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

  const bookId = book.id;

  async function saveAction(formData: FormData) {
    "use server";
    await updateBookMetadataAction(bookId, formData);
  }

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

      <form action={saveAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Tên sách</label>
            <input name="title" required defaultValue={book.title} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tác giả</label>
            <input name="author" required defaultValue={book.author} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Thể loại</label>
            <input name="genre" defaultValue={book.genre ?? ""} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">NXB</label>
            <input name="publisher" defaultValue={book.publisher ?? ""} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Năm</label>
            <input
              name="published_year"
              defaultValue={book.published_year ?? ""}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Mô tả</label>
          <textarea name="description" defaultValue={book.description ?? ""} className="min-h-28 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Lưu thay đổi
        </button>
      </form>

      <form action={deleteBookFormAction} className="rounded-xl border border-red-200 bg-red-50 p-4">
        <input type="hidden" name="book_id" value={book.id} />
        <p className="text-sm text-red-900">Xóa vĩnh viễn sách và các dữ liệu liên quan (theo ràng buộc DB).</p>
        <button type="submit" className="mt-3 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100">
          Xóa sách
        </button>
      </form>
    </div>
  );
}
