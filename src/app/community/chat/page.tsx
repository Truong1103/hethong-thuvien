"use client";

import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { btnPrimaryInlineClass, inputClass, linkBtnSecondary } from "@/lib/ui";
import { toast } from "@/lib/toast";
import { BookOpen, Bot, SendHorizontal, Sparkles, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  suggestions?: BookSuggestion[];
};

type BookSuggestion = {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  published_year: number | null;
  rating_avg: number;
  rating_count: number;
  coverUrl: string | null;
};

export default function BookChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");

    const history = messages.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history }),
      });
      const data = (await res.json()) as {
        reply?: string;
        suggestions?: BookSuggestion[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Lỗi");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: data.reply ?? "",
          suggestions: data.suggestions,
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Lỗi không xác định";
      toast.error(msg);
      setMessages((prev) => [...prev, { role: "assistant", text: msg }]);
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
              Hỏi mọi thứ về đọc sách, thể loại, kỹ năng… AI trả lời đầy đủ và{" "}
              <strong className="font-semibold text-zinc-800">gợi ý sách có thật trong kho</strong> kèm link xem chi
              tiết.
            </p>
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-zinc-600">
              <li>&quot;Gợi ý 3 cuốn tâm lý dễ đọc cho người mới&quot;</li>
              <li>&quot;So sánh đọc PDF và nghe audio — nên chọn cách nào?&quot;</li>
              <li>&quot;Trong thư viện có sách về lãnh đạo không?&quot;</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex min-h-[min(480px,60vh)] flex-col rounded-3xl border border-zinc-200/90 bg-white shadow-inner shadow-zinc-100">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-10 text-center">
              <Bot className="h-10 w-10 text-violet-400" strokeWidth={1.25} />
              <p className="mt-3 max-w-sm text-sm text-zinc-600">
                Nhập câu hỏi bên dưới. Bạn có thể hỏi tiếp nhiều lượt — AI nhớ ngữ cảnh cuộc trò chuyện.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
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
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wide ${msg.role === "user" ? "text-teal-100" : "text-violet-600"}`}
                    >
                      {msg.role === "user" ? "Bạn" : "Thủ thư AI"}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>

                {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 ? (
                  <div className="ml-12 w-full max-w-[calc(100%-3rem)] space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Sách gợi ý trong kho</p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {msg.suggestions.map((b) => (
                        <li key={b.id}>
                          <Link
                            href={`/books/${b.id}`}
                            className="flex gap-3 rounded-xl border border-teal-100 bg-white p-3 shadow-sm transition hover:border-teal-200 hover:bg-teal-50/50"
                          >
                            <div className="relative h-[4.5rem] w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 ring-1 ring-zinc-200/80">
                              {b.coverUrl ? (
                                <Image
                                  src={b.coverUrl}
                                  alt={`Bìa: ${b.title}`}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <BookOpen
                                  className="absolute inset-0 m-auto h-6 w-6 text-zinc-400"
                                  strokeWidth={1.25}
                                />
                              )}
                            </div>
                            <span className="min-w-0">
                              <span className="line-clamp-2 text-sm font-semibold text-zinc-900">{b.title}</span>
                              <span className="mt-0.5 block truncate text-xs text-zinc-600">{b.author}</span>
                              <span className="mt-1 block text-[11px] text-zinc-500">
                                {[b.genre, b.published_year ? String(b.published_year) : null]
                                  .filter(Boolean)
                                  .join(" · ")}
                                {b.rating_count > 0 ? ` · ★${Number(b.rating_avg).toFixed(1)}` : ""}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href="/books" className={`${linkBtnSecondary} text-xs`}>
                      Xem toàn bộ kho sách
                    </Link>
                  </div>
                ) : null}
              </div>
            ))
          )}
          {loading ? (
            <p className="text-center text-xs font-medium text-zinc-500">Đang tra kho sách và soạn câu trả lời…</p>
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
              placeholder="Hỏi bất cứ điều gì về sách hoặc đọc sách… (Enter gửi)"
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
            Cần đăng nhập. Gợi ý sách chỉ từ dữ liệu trong hệ thống — thêm sách trong Admin để mở rộng gợi ý.
          </p>
        </div>
      </div>
    </div>
  );
}
