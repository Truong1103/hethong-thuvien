"use client";

import { addPublicQuoteAction } from "@/app/books/[id]/actions";
import { btnPrimaryClass, inputClass } from "@/lib/ui";
import { Quote, Send } from "lucide-react";
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
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }

  const len = text.length;
  const remaining = MAX - len;

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-rose-50/20 to-violet-50/15 p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-rose-100">
          <Quote className="h-5 w-5 text-rose-600" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-tight text-zinc-900">Chia sẻ trích dẫn lên cộng đồng</h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600">
            Trích dẫn sẽ xuất hiện trên{" "}
            <span className="font-medium text-zinc-800">Feed trích dẫn công khai</span> để mọi người đọc. Hãy tự gõ
            hoặc dán từ sách giấy / PDF.
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
        <button type="submit" disabled={loading || text.trim().length < 3} className={`${btnPrimaryClass} gap-2`}>
          <Send className="h-4 w-4 shrink-0" />
          {loading ? "Đang đăng..." : "Đăng trích dẫn công khai"}
        </button>
      </form>
    </section>
  );
}
