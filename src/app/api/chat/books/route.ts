import { NextResponse } from "next/server";
import { aiChatCompletion } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });

  const body = (await request.json()) as { message?: string };
  const message = (body.message ?? "").trim();
  if (message.length < 2) return NextResponse.json({ error: "Câu hỏi quá ngắn" }, { status: 400 });

  if (!process.env.GEMINI_API_KEY?.trim() && !process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Thiếu GEMINI_API_KEY hoặc OPENAI_API_KEY trong .env.local" },
      { status: 501 },
    );
  }

  const words = message.split(/\s+/).filter((w) => w.length > 2).slice(0, 5);

  const base = supabase.from("books").select("title, author, genre, description, published_year").limit(25);
  const { data: books } =
    words.length > 0
      ? await base.or(words.flatMap((w) => [`title.ilike.%${w}%`, `author.ilike.%${w}%`]).join(","))
      : await supabase
          .from("books")
          .select("title, author, genre, description, published_year")
          .order("created_at", { ascending: false })
          .limit(25);

  const catalog = (books ?? [])
    .map(
      (b) =>
        `- ${b.title} (${b.author})${b.genre ? ` [${b.genre}]` : ""}${b.published_year ? ` ${b.published_year}` : ""}${b.description ? `: ${String(b.description).slice(0, 200)}` : ""}`,
    )
    .join("\n");

  const reply = await aiChatCompletion(
    [
      {
        role: "system",
        content:
          "Bạn là thủ thư Thư viện Số. Trả lời câu hỏi bằng tiếng Việt, dựa chủ yếu trên danh mục sách được cung cấp. Nếu danh mục không đủ, nói rõ và đưa gợi ý chung (không bịa chi tiết sách không có trong danh mục).",
      },
      {
        role: "user",
        content: `Danh mục sách (trích từ CSDL, có thể không đầy đủ):\n${catalog || "(trống)"}\n\nCâu hỏi:\n${message}`,
      },
    ],
    { max_tokens: 1400, temperature: 0.45 },
  );

  return NextResponse.json({ reply, matched: (books ?? []).length });
}
