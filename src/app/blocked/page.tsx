import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function BlockedPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-red-200/90 bg-gradient-to-br from-red-50 to-orange-50/80 p-8 text-center shadow-lg shadow-red-900/5">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700 ring-1 ring-red-200">
          <ShieldAlert className="h-8 w-8" strokeWidth={2} />
        </div>
        <h1 className="text-xl font-bold text-red-950">Tài khoản đã bị khóa</h1>
        <p className="mt-2 text-sm leading-relaxed text-red-900/85">
          Liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-800"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
