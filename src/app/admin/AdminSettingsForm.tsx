"use client";

import { updateSystemSettingsAction } from "@/app/admin/actions";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  loanDefaultDays: number;
  loanMaxActive: number;
  loanAutoApprove: boolean;
};

export function AdminSettingsForm(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await updateSystemSettingsAction(fd);
      toast.success("Đã lưu cài đặt mượn trả.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không lưu được");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
      <div className="space-y-1">
        <label className="text-sm font-medium">Thời hạn mượn mặc định (ngày)</label>
        <input
          name="loan_default_days"
          type="number"
          min={1}
          defaultValue={props.loanDefaultDays}
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Số sách tối đa mượn cùng lúc</label>
        <input
          name="loan_max_active"
          type="number"
          min={1}
          defaultValue={props.loanMaxActive}
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="loan_auto_approve" defaultChecked={props.loanAutoApprove} className="rounded border-zinc-300" />
        Tự động duyệt cho mượn (không chờ admin)
      </label>
      <button type="submit" disabled={loading} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {loading ? "Đang lưu..." : "Lưu"}
      </button>
    </form>
  );
}
