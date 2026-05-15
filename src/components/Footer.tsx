import { BookOpen, LayoutGrid, Library, LogIn, LogOut, MessageSquare, Shield, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const footerLink = "text-sm text-zinc-600 transition hover:text-teal-700";

export async function Footer() {
  const year = new Date().getFullYear();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    : { data: null as { is_admin: boolean } | null };

  return (
    <footer className="mt-auto border-t border-zinc-200/90 bg-gradient-to-b from-white to-zinc-50/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight text-zinc-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-600/20">
                <Library className="h-4 w-4" strokeWidth={2.5} />
              </span>
              Thư viện Số Lá Xanh
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-600">
              Đọc PDF, nghe audio, tủ sách và cộng đồng — một nơi để khám phá và duy trì thói quen đọc.
            </p>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Khám phá</h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/books" className={`inline-flex items-center gap-2 ${footerLink}`}>
                  <BookOpen className="h-4 w-4 text-teal-600" />
                  Kho sách
                </Link>
              </li>
              <li>
                <Link href="/community" className={`inline-flex items-center gap-2 ${footerLink}`}>
                  <LayoutGrid className="h-4 w-4 text-indigo-600" />
                  Cộng đồng
                </Link>
              </li>
              <li>
                <Link href="/community/feed" className={`inline-flex items-center gap-2 ${footerLink}`}>
                  <MessageSquare className="h-4 w-4 text-sky-600" />
                  Feed
                </Link>
              </li>
              <li>
                <Link href="/community/challenges" className={`inline-flex items-center gap-2 ${footerLink}`}>
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  Thử thách đọc
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tài khoản</h2>
            <ul className="mt-4 space-y-2.5">
              {user ? (
                <>
                  <li>
                    <Link href="/me" className={`inline-flex items-center gap-2 ${footerLink}`}>
                      <User className="h-4 w-4 text-teal-600" />
                      Trang cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link href="/me/stats" className={footerLink}>
                      Thống kê đọc
                    </Link>
                  </li>
                  <li>
                    <form action={signOutAction}>
                      <button type="submit" className={`inline-flex items-center gap-2 ${footerLink}`}>
                        <LogOut className="h-4 w-4 text-zinc-500" />
                        Đăng xuất
                      </button>
                    </form>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className={`inline-flex items-center gap-2 ${footerLink}`}>
                      <LogIn className="h-4 w-4 text-zinc-500" />
                      Đăng nhập
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className={footerLink}>
                      Đăng ký
                    </Link>
                  </li>
                  <li>
                    <Link href="/me" className={footerLink}>
                      Trang cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link href="/me/stats" className={footerLink}>
                      Thống kê đọc
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Vận hành</h2>
            <ul className="mt-4 space-y-2.5">
              {profile?.is_admin ? (
                <li>
                  <Link href="/admin/books" className={`inline-flex items-center gap-2 ${footerLink}`}>
                    <Shield className="h-4 w-4 text-orange-600" />
                    Khu vực Admin
                  </Link>
                </li>
              ) : (
                <li className="text-sm leading-snug text-zinc-500">
                  {user ? "Admin chỉ hiện khi tài khoản có quyền thủ thư." : "Đăng nhập bằng tài khoản được cấp quyền để vào Admin."}
                </li>
              )}
              <li>
                <Link href="/" className={footerLink}>
                  Trang chủ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-zinc-200/80 pt-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Thư viện Số.</p>
          <p className="text-zinc-400">Designed by Hoang Ngoc Quyen</p>
        </div>
      </div>
    </footer>
  );
}
