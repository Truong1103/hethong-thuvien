"use client";

import { addPublicQuoteAction } from "@/app/books/[id]/actions";
import { toast } from "@/lib/toast";
import { btnPrimaryClass, inputClass, linkBtnGhost } from "@/lib/ui";
import { Quote, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX = 2000;

export function QuoteSnippetForm(props: { bookId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await addPublicQuoteAction(props.bookId, text);
      setText("");
      toast.success("Đã đăng trích dẫn lên cộng đồng.");
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Lỗi");
      toast.error(ex instanceof Error ? ex.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }

  const len = text.length;
  const remaining = MAX - len;

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-teal-50/25 to-emerald-50/15 p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-teal-100">
          <Quote className="h-5 w-5 text-teal-600" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-tight text-zinc-900">Chia sẻ trích dẫn lên cộng đồng</h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600">
            Trích dẫn sẽ xuất hiện trên{" "}
            <Link href="/community/quotes" className="font-semibold text-teal-700 underline-offset-2 hover:underline">
              Trích dẫn công khai
            </Link>{" "}
            để mọi người đọc. Hãy tự gõ hoặc dán từ sách giấy / PDF.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-zinc-500">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Chia sẻ câu hay bạn muốn lưu lại cùng cộng đồng
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="“Một câu hay, một đoạn ngắn bạn muốn lưu lại…”"
          rows={4}
          maxLength={MAX}
          className={`${inputClass} min-h-[110px] resize-y font-serif leading-relaxed placeholder:font-sans`}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={remaining < 80 ? "font-medium text-amber-700" : "text-zinc-500"}>
            {len}/{MAX} ký tự
          </span>
          <span className="text-zinc-500">Tối thiểu 3 ký tự để gửi.</span>
        </div>
        {err ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={loading || text.trim().length < 3} className={`${btnPrimaryClass} w-auto flex-1 gap-2 px-6 sm:flex-none`}>
            <Send className="h-4 w-4 shrink-0" />
            {loading ? "Đang đăng..." : "Đăng trích dẫn công khai"}
          </button>
          <Link href="/community/quotes" className={`${linkBtnGhost} shrink-0`}>
            Xem trích dẫn cộng đồng
          </Link>
        </div>
      </form>
    </section>
  );
}
