import { NextResponse } from "next/server";
import { aiChatCompletion } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export async function POST(req: Request, context: { params: Params }) {
  const { id: bookId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });

  let force = false;
  try {
    const raw = await req.text();
    if (raw.trim()) {
      const j = JSON.parse(raw) as { force?: boolean };
      force = Boolean(j?.force);
    }
  } catch {
    force = false;
  }

  const { data: cached } = await supabase.from("book_summaries").select("summary").eq("book_id", bookId).maybeSingle();
  if (cached?.summary && !force) return NextResponse.json({ summary: cached.summary });

  const { data: book, error: bookErr } = await supabase
    .from("books")
    .select("title, author, description, genre, publisher, published_year")
    .eq("id", bookId)
    .maybeSingle();
  if (bookErr || !book) return NextResponse.json({ error: "Không tìm thấy sách" }, { status: 404 });

  if (!process.env.GEMINI_API_KEY?.trim() && !process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Thiếu GEMINI_API_KEY hoặc OPENAI_API_KEY trong .env.local" },
      { status: 501 },
    );
  }

  const system = [
    "Bạn là trợ lý thư viện, viết tiếng Việt.",
    "Chỉ dùng thông tin được cung cấp; không bịa chi tiết không có trong dữ liệu.",
    "Viết một bản tóm tắt hoàn chỉnh:",
    "- Độ dài khoảng 500–900 chữ (tối thiểu ~400 chữ nếu dữ liệu rất ít).",
    "- Ít nhất 3 đoạn văn liền mạch; không dừng sau tiêu đề hay sau một câu mở đầu.",
    "- Nêu: chủ đề / góc nhìn của sách (theo mô tả), đối tượng độc giả nếu suy ra được, và 1–2 ý nổi bật từ mô tả.",
    "- Không lặp lại nhiều lần chỉ tên sách + tác giả; không dùng bullet chỉ có một chữ.",
    "Không bọc toàn bộ trong một cặp **markdown** duy nhất ở đầu rồi bỏ trống.",
  ].join(" ");

  const userMsg = [
    `Tên sách: ${book.title}`,
    `Tác giả: ${book.author}`,
    book.genre ? `Thể loại: ${book.genre}` : "",
    book.publisher ? `NXB: ${book.publisher}` : "",
    book.published_year ? `Năm: ${book.published_year}` : "",
    book.description
      ? `Mô tả / giới thiệu trong hệ thống (khai thác hết ý có thể):\n${book.description}`
      : "Không có mô tả chi tiết trong hệ thống — hãy viết đoạn tóm tắt ngắn (vẫn đủ 3 đoạn) chỉ từ meta (tên, tác giả, thể loại, NXB, năm), không bịa nội dung sách.",
  ]
    .filter(Boolean)
    .join("\n");

  const summary = await aiChatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: userMsg },
    ],
    { max_tokens: 8192, temperature: 0.45 },
  );

  const { error: rpcErr } = await supabase.rpc("upsert_book_summary", {
    p_book_id: bookId,
    p_summary: summary,
  });
  if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 });

  return NextResponse.json({ summary });
}
