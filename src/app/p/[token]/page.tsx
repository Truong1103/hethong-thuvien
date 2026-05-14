import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { BorrowBar } from "@/app/p/[token]/BorrowBar";
import { CopyUrlButton } from "@/components/CopyUrlButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteUrlForPath } from "@/lib/site-url";

type Params = Promise<{ token: string }>;

type BookRow = {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  publisher: string | null;
  published_year: number | null;
};

export default async function PhysicalQrPage(props: { params: Params }) {
  const { token } = await props.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: row, error } = await supabase
    .from("physical_copies")
    .select("id, shelf_label, books ( id, title, author, genre, publisher, published_year )")
    .eq("qr_token", token)
    .maybeSingle();

  if (error || !row) return notFound();

  const embedded = row.books as BookRow | BookRow[] | null;
  const book = Array.isArray(embedded) ? embedded[0] : embedded;
  if (!book) return notFound();

  let myLoan: { id: string; status: string; due_at: string | null; borrowed_at: string | null } | null = null;
  if (user?.id) {
    const { data: loanRow } = await supabase
      .from("loans")
      .select("id, status, due_at, borrowed_at")
      .eq("physical_copy_id", row.id)
      .eq("user_id", user.id)
      .in("status", ["pending", "active"])
      .maybeSingle();
    if (loanRow) myLoan = loanRow;
  }

  const publicUrl = await siteUrlForPath(`/p/${token}`);
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    width: 280,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm text-zinc-700">
        <p className="font-semibold text-zinc-900">Mượn / trả sách giấy</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-zinc-600">
          <li>Quét mã QR trên sách → xem thông tin và mượn hoặc trả tại đây.</li>
          <li>Đăng nhập → <strong>Mượn ngay</strong> (ghi nhận người mượn, bản sách, ngày mượn, hạn trả).</li>
          <li>Thư viện duyệt hoặc tự động theo cài đặt; quét lại QR → <strong>Trả sách</strong> khi đã nộp sách.</li>
        </ol>
      </div>

      <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Sách giấy — quét mã QR</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">{book.title}</h1>
        <p className="text-sm text-zinc-600">{book.author}</p>
        {row.shelf_label ? (
          <p className="mt-2 text-sm text-zinc-700">
            Kệ / nhãn: <span className="font-medium">{row.shelf_label}</span>
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
          {book.genre ? <span className="rounded-full bg-zinc-100 px-2 py-1">{book.genre}</span> : null}
          {book.publisher ? <span className="rounded-full bg-zinc-100 px-2 py-1">{book.publisher}</span> : null}
          {book.published_year ? (
            <span className="rounded-full bg-zinc-100 px-2 py-1">{book.published_year}</span>
          ) : null}
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6">
          <p className="text-center text-sm font-semibold text-zinc-800">Mã QR (in màn hình hoặc dán nhãn)</p>
          <p className="mt-1 text-center text-xs text-zinc-500">Điện thoại quét sẽ mở đúng trang này.</p>
          <div className="mt-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL từ qrcode */}
            <img src={qrDataUrl} width={280} height={280} className="rounded-xl bg-white p-2 shadow-md ring-1 ring-zinc-200/80" alt="Mã QR mở trang bản giấy" />
          </div>
          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <code className="max-w-full break-all rounded-lg bg-white px-3 py-2 text-center text-xs text-zinc-800 ring-1 ring-zinc-200">
              {publicUrl}
            </code>
            <CopyUrlButton text={publicUrl} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-100 pt-6">
          <BorrowBar copyId={row.id} userId={user?.id ?? null} token={token} myLoan={myLoan} />
          <Link
            href={`/books/${book.id}`}
            className="inline-flex items-center rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-zinc-50"
          >
            Xem bản số (PDF/Audio)
          </Link>
        </div>
      </div>
    </div>
  );
}
