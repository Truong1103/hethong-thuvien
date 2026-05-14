import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ReturnLoanButton } from "@/app/me/loans/ReturnLoanButton";

export default async function MyLoansPage() {
  const { supabase, user } = await requireUser();

  const { data: loans } = await supabase
    .from("loans")
    .select(
      `
      id,
      status,
      borrowed_at,
      due_at,
      returned_at,
      created_at,
      physical_copies ( qr_token, shelf_label, books ( title ) )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  type LoanRow = {
    id: string;
    status: string;
    borrowed_at: string | null;
    due_at: string | null;
    returned_at: string | null;
    created_at: string;
    physical_copies: {
      qr_token: string;
      shelf_label: string | null;
      books: { title: string } | { title: string }[] | null;
    } | null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mượn / trả sách giấy</h1>
          <p className="text-sm text-zinc-600">
            Quét QR trên sách để mượn hoặc trả ngay tại trang đó; bảng dưới là lịch sử mượn của bạn.
          </p>
        </div>
        <Link href="/me" className="text-sm text-zinc-700 hover:text-zinc-950">
          ← Tài khoản
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-600">
            <tr>
              <th className="px-4 py-3">Sách</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hạn trả</th>
              <th className="px-4 py-3 w-40"></th>
            </tr>
          </thead>
          <tbody>
            {(loans as LoanRow[] | null)?.map((row) => {
              const emb = row.physical_copies?.books;
              const title = Array.isArray(emb) ? emb[0]?.title : emb?.title;
              const overdue =
                row.status === "active" && row.due_at && new Date(row.due_at) < new Date() && !row.returned_at;
              return (
                <tr key={row.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-medium">{title ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        row.status === "returned"
                          ? "bg-zinc-100 text-zinc-700"
                          : row.status === "pending"
                            ? "bg-amber-100 text-amber-900"
                            : overdue
                              ? "bg-red-100 text-red-900"
                              : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {row.status === "pending"
                        ? "Chờ duyệt"
                        : row.status === "active"
                          ? overdue
                            ? "Quá hạn"
                            : "Đang mượn"
                          : row.status === "returned"
                            ? "Đã trả"
                            : row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {row.due_at ? new Date(row.due_at).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "active" || row.status === "pending" ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <ReturnLoanButton loanId={row.id} qrToken={row.physical_copies?.qr_token} />
                        {row.physical_copies?.qr_token ? (
                          <Link
                            href={`/p/${row.physical_copies.qr_token}`}
                            className="text-xs font-medium text-zinc-600 underline hover:text-zinc-950"
                          >
                            Mở trang QR (trả tại đây)
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(loans?.length ?? 0) === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-zinc-600">Chưa có lượt mượn nào.</div>
        ) : null}
      </div>
    </div>
  );
}
