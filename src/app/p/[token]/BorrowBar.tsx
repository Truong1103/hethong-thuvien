"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { borrowPhysicalCopyAction, returnLoanAction } from "@/app/actions/loans";

export type MyLoanOnCopy = {
  id: string;
  status: string;
  due_at: string | null;
  borrowed_at: string | null;
};

export function BorrowBar(props: { copyId: string; userId: string | null; token: string; myLoan: MyLoanOnCopy | null }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function borrow() {
    if (!props.userId) return;
    setErr(null);
    setLoading(true);
    try {
      await borrowPhysicalCopyAction(props.copyId, props.token);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không mượn được");
    } finally {
      setLoading(false);
    }
  }

  async function ret() {
    if (!props.myLoan) return;
    setErr(null);
    setLoading(true);
    try {
      await returnLoanAction(props.myLoan.id, props.token);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không trả được");
    } finally {
      setLoading(false);
    }
  }

  if (!props.userId) {
    return (
      <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:max-w-md">
        <p className="font-medium">Mượn sách giấy</p>
        <p className="text-amber-900/90">
          <Link href={`/login?next=${encodeURIComponent(`/p/${props.token}`)}`} className="font-semibold underline">
            Đăng nhập
          </Link>{" "}
          rồi nhấn <strong>Mượn ngay</strong> — hệ thống ghi nhận ngày mượn và hạn trả (duyệt tự động hoặc qua thủ thư).
        </p>
      </div>
    );
  }

  if (props.myLoan) {
    const pending = props.myLoan.status === "pending";
    const dueLabel =
      props.myLoan.due_at && !pending ? new Date(props.myLoan.due_at).toLocaleDateString("vi-VN") : null;

    return (
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/90 p-4 sm:max-w-md">
        {pending ? (
          <p className="text-sm font-medium text-amber-900">
            Yêu cầu mượn đang <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs">chờ thư viện duyệt</span>.
          </p>
        ) : (
          <p className="text-sm font-medium text-emerald-900">
            Bạn đang mượn bản giấy này{dueLabel ? ` — hạn trả: ${dueLabel}` : ""}.
          </p>
        )}
        <p className="text-xs text-zinc-600">
          Quét lại mã QR trên sách rồi nhấn <strong>Trả sách</strong> khi đã nộp lại tại quầy. Sau khi trả, bạn sẽ nhận email xác nhận (nếu đã cấu hình gửi mail).
        </p>
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={ret}
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Trả sách"}
          </button>
          <Link href="/me/loans" className="text-sm font-medium text-zinc-700 underline hover:text-zinc-950">
            Xem tất cả mượn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:max-w-md">
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      <button
        type="button"
        disabled={loading}
        onClick={borrow}
        className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Đang xử lý..." : "Mượn ngay"}
      </button>
      <p className="text-xs text-zinc-500">
        Nếu bản này đang được người khác mượn, hệ thống sẽ báo khi bạn nhấn mượn.
      </p>
    </div>
  );
}
