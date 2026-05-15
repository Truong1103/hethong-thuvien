"use client";

import { createPhysicalCopyAction } from "@/app/admin/actions";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreatePhysicalCopyForm(props: { bookId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const shelf = String(fd.get("shelf_label") ?? "");
      await createPhysicalCopyAction(props.bookId, shelf);
      toast.success("Đã tạo mã QR bản giấy mới.");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không tạo được bản sao");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm">
      <div className="min-w-[200px] flex-1">
        <label className="text-xs font-medium text-zinc-700">Nhãn kệ (tuỳ chọn)</label>
        <input name="shelf_label" className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Kệ A3" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Đang tạo..." : "Tạo mã QR mới"}
      </button>
    </form>
  );
}
