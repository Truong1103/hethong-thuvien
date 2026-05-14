"use client";

import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { btnPrimaryInlineClass, inputClass } from "@/lib/ui";
import { Bot, SendHorizontal, Sparkles, User } from "lucide-react";
import { useState } from "react";

export default function BookChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Lỗi");
      setMessages((m) => [...m, { role: "assistant", text: data.reply ?? "" }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: e instanceof Error ? e.message : "Lỗi không xác định" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <CommunitySubnav current="chat" />

      <div className="rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-violet-50/20 to-teal-50/15 p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
            <Sparkles className="h-6 w-6" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Chat AI — thủ thư ảo</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 sm:text-base">
              Đặt câu hỏi tiếng Việt; hệ thống dùng AI (Gemini khi đã cấu hình) để tra cứu nhanh trong{" "}
              <strong className="font-semibold text-zinc-800">danh mục sách có trong kho</strong>. Câu trả lời là gợi ý,
              không thay thế việc đọc kỹ nội dung sách.
            </p>
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-zinc-600">
              <li>Ví dụ: &quot;Gợi ý sách tâm lý dễ đọc cho người mới&quot;</li>
              <li>&quot;Trong kho có sách nào về kỹ năng giao tiếp không?&quot;</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex min-h-[min(420px,55vh)] flex-col rounded-3xl border border-zinc-200/90 bg-white shadow-inner shadow-zinc-100">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-10 text-center">
              <Bot className="h-10 w-10 text-violet-400" strokeWidth={1.25} />
              <p className="mt-3 max-w-sm text-sm text-zinc-600">
                Nhập câu hỏi bên dưới để bắt đầu. Nội dung dựa trên dữ liệu sách trong hệ thống.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white ring-teal-500/30"
                      : "bg-violet-100 text-violet-800 ring-violet-200/80"
                  }`}
                >
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-teal-600 to-emerald-600 text-white"
                      : "border border-violet-100 bg-violet-50/90 text-violet-950"
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wide ${msg.role === "user" ? "text-teal-100" : "text-violet-600"}`}>
                    {msg.role === "user" ? "Bạn" : "Thủ thư AI"}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))
          )}
          {loading ? (
            <p className="text-center text-xs font-medium text-zinc-500">Đang trả lời…</p>
          ) : null}
        </div>

        <div className="border-t border-zinc-100 bg-zinc-50/80 p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={2}
              className={`${inputClass} min-h-[44px] flex-1 resize-y sm:min-h-[48px]`}
              placeholder="Nhập câu hỏi… (Enter gửi, Shift+Enter xuống dòng)"
            />
            <button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => void send()}
              className={`${btnPrimaryInlineClass} shrink-0 gap-2 px-6 py-3`}
            >
              <SendHorizontal className="h-4 w-4" />
              Gửi
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-zinc-500">
            Nếu báo lỗi đăng nhập, mở lại phiên từ menu rồi thử gửi câu hỏi.
          </p>
        </div>
      </div>
    </div>
  );
}
