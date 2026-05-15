"use client";

import { toast } from "@/lib/toast";
import { btnPrimaryInlineClass } from "@/lib/ui";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export function BookAiSummary(props: { bookId: string; initialSummary: string | null }) {
  const [text, setText] = useState(props.initialSummary ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function summarize() {
    setError(null);
    setLoading(true);
    try {
      const force = Boolean(text.trim());
      const res = await fetch(`/api/books/${props.bookId}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = (await res.json()) as { summary?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Không tóm tắt được");
      if (data.summary) {
        setText(data.summary);
        toast.success("Đã tạo tóm tắt AI.");
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : "Lỗi";
      setError(m);
      toast.error(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-violet-50/30 to-teal-50/20 p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-100">
            <Sparkles className="h-5 w-5 text-violet-600" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900">Tóm tắt AI</h2>
            <p className="text-xs text-zinc-500">
              Gemini — khoảng 500–900 chữ, 3 đoạn trở lên. Lần đầu lưu cache; &quot;Tạo lại&quot; gọi API và ghi đè.
            </p>
          </div>
        </div>
        <button type="button" onClick={summarize} disabled={loading} className={btnPrimaryInlineClass}>
          {loading ? "Đang tạo..." : text ? "Tạo lại tóm tắt" : "Tóm tắt sách"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {text ? (
        <p className="mt-5 whitespace-pre-wrap rounded-2xl border border-zinc-100 bg-white/80 p-4 text-sm leading-relaxed text-zinc-800">
          {text}
        </p>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-zinc-600">
          Nhấn nút để AI tóm tắt dựa trên thông tin sách trong hệ thống. Kết quả được lưu để không gọi API lặp lại.
        </p>
      )}
    </div>
  );
}
