import { LogIn } from "lucide-react";
import Link from "next/link";
import { linkBtnPrimary, linkBtnSecondary } from "@/lib/ui";

export function CommunityLoginGate({
  nextPath,
  title,
  description,
}: {
  nextPath: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-teal-50/30 to-violet-50/20 p-8 text-center shadow-lg shadow-zinc-900/5">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-teal-100">
        <LogIn className="h-7 w-7 text-teal-600" strokeWidth={2} />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-zinc-900">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{description}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className={linkBtnPrimary}>
          Đăng nhập
        </Link>
        <Link href="/signup" className={linkBtnSecondary}>
          Tạo tài khoản
        </Link>
      </div>
    </div>
  );
}
