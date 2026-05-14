import Link from "next/link";
import { redirect } from "next/navigation";
import { toggleUserBlockFormAction } from "@/app/admin/users/actions";
import { requireUser } from "@/lib/auth";

export default async function AdminUsersPage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name, is_blocked, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Thành viên</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/admin/reports" className="text-sm text-teal-700 hover:text-teal-900">
            Thống kê →
          </Link>
          <Link href="/admin/books" className="text-sm text-zinc-700 hover:text-zinc-950">
            ← Admin sách
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-600">
            <tr>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 w-52 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium">{u.display_name ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{u.id.slice(0, 8)}…</td>
                <td className="px-4 py-3">
                  {u.is_admin ? (
                    <span className="text-emerald-700">Admin</span>
                  ) : u.is_blocked ? (
                    <span className="text-red-700">Đã khóa</span>
                  ) : (
                    <span className="text-zinc-600">Hoạt động</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <Link href={`/admin/users/${u.id}/reading`} className="text-sm text-teal-700 hover:underline">
                      Lịch sử đọc
                    </Link>
                    {!u.is_admin ? (
                      <form action={toggleUserBlockFormAction} className="inline">
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="blocked" value={(!u.is_blocked).toString()} />
                        <button type="submit" className="text-sm text-zinc-700 underline hover:text-zinc-950">
                          {u.is_blocked ? "Mở khóa" : "Khóa"}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
