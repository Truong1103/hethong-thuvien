import { BarChart2, ClipboardList, FileSpreadsheet, Plus, Settings, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { btnPrimaryInlineClass } from "@/lib/ui";
import { requireUser } from "@/lib/auth";

const quickNav = [
  {
    href: "/admin/reports",
    label: "Thống kê",
    hint: "Lượt đọc, sách hot, thành viên",
    icon: BarChart2,
    color: "text-teal-600",
    ring: "ring-teal-100",
    bg: "bg-teal-50",
  },
  {
    href: "/admin/loans",
    label: "Mượn / trả",
    hint: "Kỳ hạn, trạng thái mượn",
    icon: ClipboardList,
    color: "text-rose-600",
    ring: "ring-rose-100",
    bg: "bg-rose-50",
  },
  {
    href: "/admin/settings",
    label: "Cài đặt",
    hint: "Email, thông báo, hệ thống",
    icon: Settings,
    color: "text-zinc-600",
    ring: "ring-zinc-200",
    bg: "bg-zinc-50",
  },
  {
    href: "/admin/users",
    label: "Thành viên",
    hint: "Tài khoản & quyền",
    icon: Users,
    color: "text-indigo-600",
    ring: "ring-indigo-100",
    bg: "bg-indigo-50",
  },
  {
    href: "/admin/challenges/new",
    label: "Thử thách",
    hint: "Tạo thử thách đọc",
    icon: Trophy,
    color: "text-amber-600",
    ring: "ring-amber-100",
    bg: "bg-amber-50",
  },
] as const;

export default async function AdminBooksPage() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const { data: books, error } = await supabase
    .from("books")
    .select("id,title,author,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700/90">Quản trị</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Sách trong hệ thống</h1>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-600">
            Thêm, sửa và upload bìa / PDF / audio cho từng đầu sách. Dùng các ô bên dưới để chuyển nhanh sang mượn
            trả, cấu hình, thành viên hoặc thử thách.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/admin/import"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Import CSV
          </Link>
          <Link href="/admin/books/new" className={`${btnPrimaryInlineClass} gap-2 px-5`}>
            <Plus className="h-4 w-4" />
            Thêm sách
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold text-zinc-900">Truy cập nhanh</h2>
        <p className="mt-0.5 text-xs text-zinc-500">Các module điều hành khác ngoài danh mục sách.</p>
        <nav className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5" aria-label="Điều hướng admin">
          {quickNav.map(({ href, label, hint, icon: Icon, color, ring, bg }) => (
            <Link
              key={href}
              href={href}
              className={`group flex gap-3 rounded-xl border border-zinc-200/90 ${bg} p-3.5 shadow-sm transition hover:border-teal-200/80 hover:shadow-md`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ${ring}`}
              >
                <Icon className={`h-5 w-5 ${color}`} strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-zinc-900 group-hover:text-teal-800">{label}</span>
                <span className="mt-0.5 block text-xs leading-snug text-zinc-600">{hint}</span>
              </span>
            </Link>
          ))}
        </nav>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error.message}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
        <div className="grid grid-cols-12 border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <div className="col-span-6 sm:col-span-5">Tên sách</div>
          <div className="col-span-4 sm:col-span-5">Tác giả</div>
          <div className="col-span-2 text-right">Thao tác</div>
        </div>
        {(books ?? []).map((b) => (
          <div
            key={b.id}
            className="grid grid-cols-12 items-center border-b border-zinc-100 px-4 py-3 text-sm last:border-b-0 hover:bg-zinc-50/50"
          >
            <div className="col-span-6 truncate font-medium text-zinc-900 sm:col-span-5">{b.title}</div>
            <div className="col-span-4 truncate text-zinc-600 sm:col-span-5">{b.author}</div>
            <div className="col-span-2 flex flex-wrap justify-end gap-x-3 gap-y-1 text-right text-xs font-medium sm:text-sm">
              <Link href={`/admin/books/${b.id}/edit`} className="text-teal-700 hover:underline">
                Sửa
              </Link>
              <Link href={`/admin/books/${b.id}/copies`} className="text-zinc-700 hover:underline">
                QR
              </Link>
              <Link href={`/books/${b.id}`} className="text-zinc-600 hover:underline">
                Xem
              </Link>
            </div>
          </div>
        ))}
        {(books?.length ?? 0) === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-zinc-600">Chưa có sách trong hệ thống.</div>
        ) : null}
      </div>
    </div>
  );
}
