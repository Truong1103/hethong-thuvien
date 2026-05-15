"use client";

import { deleteBookAdminAction, updateBookMetadataAction } from "@/app/admin/actions";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  publisher: string | null;
  published_year: number | null;
  description: string | null;
};

export function AdminBookMetadataForm(props: { book: Book }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const b = props.book;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await updateBookMetadataAction(b.id, fd);
      toast.success("Đã lưu thông tin sách.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không lưu được");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tên sách</label>
          <input name="title" required defaultValue={b.title} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Tác giả</label>
          <input name="author" required defaultValue={b.author} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Thể loại</label>
          <input name="genre" defaultValue={b.genre ?? ""} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">NXB</label>
          <input name="publisher" defaultValue={b.publisher ?? ""} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Năm</label>
          <input name="published_year" defaultValue={b.published_year ?? ""} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Mô tả</label>
        <textarea name="description" defaultValue={b.description ?? ""} className="min-h-28 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
      </div>
      <button type="submit" disabled={loading} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}

export function AdminDeleteBookButton(props: { bookId: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm(`Xóa vĩnh viễn sách «${props.title}»? Hành động không hoàn tác.`)) return;
    setLoading(true);
    try {
      await deleteBookAdminAction(props.bookId);
      toast.success("Đã xóa sách.");
      router.push("/admin/books");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không xóa được");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-900">Xóa vĩnh viễn sách và các dữ liệu liên quan (theo ràng buộc DB).</p>
      <button
        type="button"
        disabled={loading}
        onClick={onClick}
        className="mt-3 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60"
      >
        {loading ? "Đang xóa..." : "Xóa sách"}
      </button>
    </div>
  );
}
