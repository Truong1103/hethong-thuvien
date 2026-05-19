import { NextResponse } from "next/server";
import { aiChatCompletion } from "@/lib/ai";
import {
  formatCatalogForPrompt,
  pickTopSuggestions,
  searchBooksForChat,
  type ChatBookRow,
} from "@/lib/chat/books-retrieval";
import { LIBRARIAN_SYSTEM_PROMPT } from "@/lib/chat/librarian-prompt";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type HistoryMessage = { role: "user" | "assistant"; content: string };

const MAX_HISTORY = 12;

function normalizeHistory(raw: unknown): HistoryMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is HistoryMessage =>
        !!m &&
        typeof m === "object" &&
        (m as HistoryMessage).role !== undefined &&
        typeof (m as HistoryMessage).content === "string" &&
        ((m as HistoryMessage).role === "user" || (m as HistoryMessage).role === "assistant"),
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_HISTORY);
}

function toPublicBook(b: ChatBookRow, supabase: SupabaseClient) {
  const coverUrl = b.cover_path
    ? supabase.storage.from("covers").getPublicUrl(b.cover_path).data.publicUrl
    : null;
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    genre: b.genre,
    published_year: b.published_year,
    rating_avg: b.rating_avg,
    rating_count: b.rating_count,
    coverUrl,
  };
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });

  const body = (await request.json()) as { message?: string; history?: unknown };
  const message = (body.message ?? "").trim();
  if (message.length < 2) return NextResponse.json({ error: "Câu hỏi quá ngắn" }, { status: 400 });

  if (!process.env.GEMINI_API_KEY?.trim() && !process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Thiếu GEMINI_API_KEY hoặc OPENAI_API_KEY trong .env.local" },
      { status: 501 },
    );
  }

  const history = normalizeHistory(body.history);

  // Tra cứu theo câu hiện tại + vài câu user gần nhất để bắt chủ đề
  const searchContext = [...history.filter((m) => m.role === "user").slice(-2).map((m) => m.content), message].join(
    " ",
  );

  const books = await searchBooksForChat(supabase, searchContext, 40);
  const catalog = formatCatalogForPrompt(books);
  const suggestions = pickTopSuggestions(books, 6);

  const catalogBlock = `=== DANH MỤC SÁCH TRONG KHO (${books.length} đầu liên quan) ===
${catalog}
=== HẾT DANH MỤC ===`;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: LIBRARIAN_SYSTEM_PROMPT },
  ];

  if (history.length === 0) {
    messages.push({
      role: "user",
      content: `${catalogBlock}\n\n(Câu hỏi đầu tiên — dùng danh mục trên khi gợi ý sách.)\n\nNgười dùng hỏi:\n${message}`,
    });
  } else {
    messages.push({
      role: "user",
      content: `${catalogBlock}\n\n(Danh mục cập nhật cho lượt hỏi mới — chỉ gợi ý sách trong danh sách.)`,
    });
    messages.push({
      role: "assistant",
      content: "Đã nhận danh mục sách trong kho. Tôi sẽ trả lời dựa trên danh mục này khi gợi ý sách.",
    });
    for (const h of history) {
      messages.push({ role: h.role, content: h.content });
    }
    messages.push({ role: "user", content: message });
  }

  const reply = await aiChatCompletion(messages, { max_tokens: 2048, temperature: 0.55 });

  return NextResponse.json({
    reply,
    suggestions: suggestions.map((b) => toPublicBook(b, supabase)),
    catalogSize: books.length,
  });
}
