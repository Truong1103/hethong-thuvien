import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSettingsForm } from "@/app/admin/AdminSettingsForm";
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

      <AdminSettingsForm
        loanDefaultDays={Number.isFinite(days) ? days : 14}
        loanMaxActive={Number.isFinite(max) ? max : 5}
        loanAutoApprove={auto}
      />
    </div>
  );
}
