"use client";

import { type BookshelfStatus, setShelfStatusAction } from "@/app/books/[id]/actions";
import { toast } from "@/lib/toast";
import { Bookmark, BookOpen, CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const pill =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50";

export function ShelfButtons(props: { bookId: string; current: BookshelfStatus | null }) {
  const router = useRouter();
  const [current, setCurrent] = useState(props.current);
  const [loading, setLoading] = useState(false);

  async function move(status: BookshelfStatus | null) {
    setLoading(true);
    try {
      await setShelfStatusAction(props.bookId, status);
      setCurrent(status);
      toast.success(
        status === null
          ? "Đã gỡ khỏi tủ sách."
          : status === "reading"
            ? "Đã thêm vào Đang đọc."
            : status === "finished"
              ? "Đã đánh dấu Đã đọc xong."
              : "Đã thêm vào Muốn đọc.",
      );
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không cập nhật được tủ sách");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/60 p-3 ring-1 ring-zinc-100">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Tủ sách</div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => move("reading")}
          className={`${pill} ${
            current === "reading"
              ? "border-amber-400 bg-amber-500 text-white shadow-sm shadow-amber-500/25"
              : "border-zinc-200 bg-white text-zinc-800 hover:border-amber-200 hover:bg-amber-50/80"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Đang đọc
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => move("finished")}
          className={`${pill} ${
            current === "finished"
              ? "border-emerald-400 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
              : "border-zinc-200 bg-white text-zinc-800 hover:border-emerald-200 hover:bg-emerald-50/80"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Đã xong
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => move("wishlist")}
          className={`${pill} ${
            current === "wishlist"
              ? "border-violet-400 bg-violet-600 text-white shadow-sm shadow-violet-600/20"
              : "border-zinc-200 bg-white text-zinc-800 hover:border-violet-200 hover:bg-violet-50/80"
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          Muốn đọc
        </button>
        {current ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => move(null)}
            className={`${pill} border-zinc-200 bg-white text-zinc-500 hover:border-red-200 hover:bg-red-50 hover:text-red-800`}
          >
            <X className="h-3.5 w-3.5" />
            Gỡ khỏi tủ
          </button>
        ) : null}
      </div>
    </div>
  );
}
