"use client";

import { createChallengeAction } from "@/app/admin/actions";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateChallengeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await createChallengeAction(fd);
      toast.success("Đã tạo thử thách đọc.");
      router.push("/community/challenges");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không tạo được");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
      <div className="space-y-1">
        <label className="text-sm font-medium">Tiêu đề</label>
        <input name="title" required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Mô tả</label>
        <textarea name="description" className="min-h-24 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Bắt đầu</label>
          <input name="starts_at" type="datetime-local" required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Kết thúc</label>
          <input name="ends_at" type="datetime-local" required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Số sách cần đọc</label>
        <input name="target_books" type="number" min={1} defaultValue={3} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
      </div>
      <button type="submit" disabled={loading} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {loading ? "Đang tạo..." : "Tạo"}
      </button>
    </form>
  );
}
