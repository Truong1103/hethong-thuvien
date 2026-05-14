import { NextResponse } from "next/server";
import { aiChatCompletion } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });

  const body = (await request.json()) as { text?: string; bookTitle?: string };
  const text = (body.text ?? "").trim();
  if (text.length < 5) return NextResponse.json({ error: "Đoạn văn quá ngắn" }, { status: 400 });

  const title = (body.bookTitle ?? "").trim();
  if (!process.env.GEMINI_API_KEY?.trim() && !process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Thiếu GEMINI_API_KEY hoặc OPENAI_API_KEY trong .env.local" },
      { status: 501 },
    );
  }
  const reply = await aiChatCompletion(
    [
      {
        role: "system",
        content:
          "Bạn là giáo viên tiếng Việt. Giải thích đoạn trích ngắn gọn, dễ hiểu với học sinh THCS. Không bịa thêm nội dung không có trong đoạn. Trả lời bằng tiếng Việt.",
      },
      {
        role: "user",
        content: title ? `Sách: ${title}\n\nĐoạn cần giải thích:\n${text}` : `Đoạn cần giải thích:\n${text}`,
      },
    ],
    { max_tokens: 900, temperature: 0.4 },
  );

  return NextResponse.json({ reply });
}
