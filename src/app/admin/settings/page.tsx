import Link from "next/link";
import { redirect } from "next/navigation";
import { updateSystemSettingsAction } from "@/app/admin/actions";
import { requireUser } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const { data: rows } = await supabase.from("system_settings").select("key, value").in("key", ["loan_default_days", "loan_max_active", "loan_auto_approve"]);

  const map = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));
  const days = typeof map.loan_default_days === "number" ? map.loan_default_days : Number(map.loan_default_days ?? 14);
  const max = typeof map.loan_max_active === "number" ? map.loan_max_active : Number(map.loan_max_active ?? 5);
  const auto = map.loan_auto_approve !== false && map.loan_auto_approve !== "false";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Cài đặt hệ thống</h1>
        <Link href="/admin/books" className="text-sm text-zinc-700 hover:text-zinc-950">
          ← Admin
        </Link>
      </div>

      <form action={updateSystemSettingsAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
        <div className="space-y-1">
          <label className="text-sm font-medium">Thời hạn mượn mặc định (ngày)</label>
          <input
            name="loan_default_days"
            type="number"
            min={1}
            defaultValue={Number.isFinite(days) ? days : 14}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Số sách tối đa mượn cùng lúc</label>
          <input
            name="loan_max_active"
            type="number"
            min={1}
            defaultValue={Number.isFinite(max) ? max : 5}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="loan_auto_approve" defaultChecked={auto} className="rounded border-zinc-300" />
          Tự động duyệt cho mượn (không chờ admin)
        </label>
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Lưu
        </button>
      </form>
    </div>
  );
}
