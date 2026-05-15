"use client";

import { approveLoanAdminAction } from "@/app/actions/loans";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApproveLoanButton(props: { loanId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await approveLoanAdminAction(props.loanId);
      toast.success("Đã duyệt cho mượn.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không duyệt được");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" disabled={loading} onClick={onClick} className="text-sm font-medium text-emerald-700 hover:underline disabled:opacity-60">
      {loading ? "Đang xử lý..." : "Duyệt cho mượn"}
    </button>
  );
}
