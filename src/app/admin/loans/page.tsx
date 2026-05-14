import Link from "next/link";
import { redirect } from "next/navigation";
import { approveLoanFormAction } from "@/app/admin/loans/actions";
import { requireUser } from "@/lib/auth";

export default async function AdminLoansPage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const { data: loans } = await supabase
    .from("loans")
    .select(
      `
      id,
      status,
      user_id,
      borrowed_at,
      due_at,
      returned_at,
      created_at,
      physical_copies ( qr_token, books ( title ) )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  type Row = {
    id: string;
    status: string;
    user_id: string;
    borrowed_at: string | null;
    due_at: string | null;
    returned_at: string | null;
    physical_copies: {
      qr_token: string;
      books: { title: string } | { title: string }[] | null;
    } | null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mượn / trả</h1>
          <p className="text-sm text-zinc-600">Duyệt yêu cầu chờ (nếu không bật tự động).</p>
        </div>
        <Link href="/admin/settings" className="text-sm text-zinc-700 hover:text-zinc-950">
          Cài đặt mượn →
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-600">
            <tr>
              <th className="px-4 py-3">Sách</th>
              <th className="px-4 py-3">Người mượn</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hạn trả</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(loans as Row[] | null)?.map((row) => {
              const emb = row.physical_copies?.books;
              const title = Array.isArray(emb) ? emb[0]?.title : emb?.title;
              return (
                <tr key={row.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-medium">{title ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">{row.user_id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {row.due_at ? new Date(row.due_at).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "pending" ? (
                      <form action={approveLoanFormAction}>
                        <input type="hidden" name="loan_id" value={row.id} />
                        <button type="submit" className="text-sm font-medium text-emerald-700 hover:underline">
                          Duyệt cho mượn
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
