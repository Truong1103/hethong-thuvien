import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { createPhysicalCopyFormAction } from "@/app/admin/actions";
import { CopyUrlButton } from "@/components/CopyUrlButton";
import { requireUser } from "@/lib/auth";
import { siteUrlForPath } from "@/lib/site-url";

type Params = Promise<{ id: string }>;

export default async function AdminBookCopiesPage(props: { params: Params }) {
  const { id: bookId } = await props.params;
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const { data: book } = await supabase.from("books").select("id,title").eq("id", bookId).maybeSingle();
  if (!book) return notFound();

  const { data: copies } = await supabase
    .from("physical_copies")
    .select("id, qr_token, shelf_label, created_at")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  const copyRows = await Promise.all(
    (copies ?? []).map(async (c) => {
      const path = `/p/${c.qr_token}`;
      const fullUrl = await siteUrlForPath(path);
      const qrDataUrl = await QRCode.toDataURL(fullUrl, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      return { ...c, fullUrl, qrDataUrl, path };
    }),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Bản giấy & QR</h1>
          <p className="text-sm text-zinc-600">{book.title}</p>
        </div>
        <Link href="/admin/books" className="text-sm font-medium text-teal-700 hover:underline">
          ← Danh sách sách
        </Link>
      </div>

      <form action={createPhysicalCopyFormAction} className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm">
        <input type="hidden" name="book_id" value={bookId} />
        <div className="min-w-[200px] flex-1">
          <label className="text-xs font-medium text-zinc-700">Nhãn kệ (tuỳ chọn)</label>
          <input name="shelf_label" className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Kệ A3" />
        </div>
        <button type="submit" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
          Tạo mã QR mới
        </button>
      </form>

      <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Liên kết & QR in
        </div>
        <ul className="divide-y divide-zinc-100">
          {copyRows.map((c) => (
            <li key={c.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex shrink-0 justify-center sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.qrDataUrl}
                  width={200}
                  height={200}
                  className="rounded-lg bg-white p-1.5 shadow ring-1 ring-zinc-200/80"
                  alt={`QR ${c.path}`}
                />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-mono text-xs text-zinc-800">
                  Đường dẫn tương đối: <span className="font-semibold">{c.path}</span>
                </div>
                <div className="mt-2 break-all text-xs text-zinc-600">
                  URL đầy đủ (in / quét): <span className="text-zinc-900">{c.fullUrl}</span>
                </div>
                {c.shelf_label ? <div className="mt-2 text-xs text-zinc-600">Kệ: {c.shelf_label}</div> : null}
                <div className="mt-3">
                  <CopyUrlButton text={c.fullUrl} />
                </div>
              </div>
            </li>
          ))}
        </ul>
        {copyRows.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-zinc-600">Chưa có bản giấy — tạo mã phía trên.</div>
        ) : null}
      </div>
    </div>
  );
}
