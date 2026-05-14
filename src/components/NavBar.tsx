import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Library,
  LogOut,
  MessageSquare,
  Rss,
  Shield,
  User,
  Users,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function NavBar() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    : { data: null };

  let overdueLoans = 0;
  if (user) {
    const { count } = await supabase
      .from("loans")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active")
      .lt("due_at", new Date().toISOString());
    overdueLoans = count ?? 0;
  }

  const navLink =
    "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-zinc-900 transition hover:text-teal-700"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-600/25">
            <Library className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="hidden sm:inline">Thư viện Số</span>
        </Link>

        <nav className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1 sm:gap-2 md:justify-center">
          <Link href="/books" className={navLink}>
            <BookOpen className="h-4 w-4 shrink-0 text-teal-600" />
            <span className="hidden sm:inline">Sách</span>
          </Link>
          <Link href="/community" className={navLink}>
            <Users className="h-4 w-4 shrink-0 text-indigo-600" />
            <span className="hidden md:inline">Cộng đồng</span>
          </Link>
          <Link href="/community/feed" className={navLink}>
            <Rss className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="hidden md:inline">Feed</span>
          </Link>
          <Link href="/community/chat" className={navLink}>
            <MessageSquare className="h-4 w-4 shrink-0 text-sky-600" />
            <span className="hidden md:inline">Chat</span>
          </Link>
          {user ? (
            <>
              {overdueLoans > 0 ? (
                <Link
                  href="/me/loans"
                  className="flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
                >
                  Quá hạn {overdueLoans}
                </Link>
              ) : null}
              <Link href="/me/shelf" className={navLink}>
                <Library className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="hidden lg:inline">Tủ sách</span>
              </Link>
              <Link href="/me/stats" className={navLink}>
                <BarChart3 className="h-4 w-4 shrink-0 text-violet-600" />
                <span className="hidden lg:inline">Thống kê</span>
              </Link>
              <Link href="/me" className={navLink}>
                <User className="h-4 w-4 shrink-0 text-zinc-500" />
                <span className="hidden lg:inline">Tài khoản</span>
              </Link>
              {profile?.is_admin ? (
                <Link href="/admin/books" className={navLink}>
                  <Shield className="h-4 w-4 shrink-0 text-orange-600" />
                  <span className="hidden lg:inline">Admin</span>
                </Link>
              ) : null}
              <form action={signOutAction} className="inline">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition hover:from-teal-500 hover:to-emerald-500"
            >
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
