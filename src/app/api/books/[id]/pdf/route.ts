import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

/**
 * Proxy PDF cùng origin để pdf.js không bị chặn CORS khi tải từ Supabase Storage.
 * Chuyển tiếp Range để đọc từng phần (pdf.js dùng 206 Partial Content).
 */
export async function GET(request: Request, context: { params: Params }) {
  const { id: bookId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
  }

  const { data: book } = await supabase.from("books").select("pdf_path").eq("id", bookId).maybeSingle();
  if (!book?.pdf_path) {
    return NextResponse.json({ error: "Không có PDF" }, { status: 404 });
  }

  const signed = await supabase.storage.from("pdfs").createSignedUrl(book.pdf_path, 60 * 60);
  if (signed.error || !signed.data?.signedUrl) {
    return NextResponse.json({ error: signed.error?.message ?? "Không tạo được link" }, { status: 502 });
  }

  const range = request.headers.get("Range");
  const upstream = await fetch(signed.data.signedUrl, {
    headers: range ? { Range: range } : {},
    redirect: "follow",
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: `Lỗi tải PDF (${upstream.status})` }, { status: 502 });
  }

  const out = new Headers();
  const pass = [
    "content-type",
    "content-length",
    "accept-ranges",
    "content-range",
    "etag",
    "last-modified",
  ];
  upstream.headers.forEach((value, key) => {
    if (pass.includes(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  out.set("Cache-Control", "private, max-age=120");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}
