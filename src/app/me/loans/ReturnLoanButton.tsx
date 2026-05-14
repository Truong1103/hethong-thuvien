"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { returnLoanAction } from "@/app/actions/loans";

export function ReturnLoanButton(props: { loanId: string; qrToken?: string }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onReturn() {
    setErr(null);
    setLoading(true);
    try {
      await returnLoanAction(props.loanId, props.qrToken);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <button
        type="button"
        disabled={loading}
        onClick={onReturn}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-60"
      >
        {loading ? "..." : "Trả sách"}
      </button>
    </div>
  );
}
