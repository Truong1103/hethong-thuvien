import { BarChart3, BookMarked, Library, Pencil, QrCode, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FadeUp, MotionSection, StaggerContainer, StaggerItem } from "@/components/motion";
import { linkBtnGhost, linkBtnPrimary, linkBtnSecondary } from "@/lib/ui";
import { requireUser } from "@/lib/auth";

const shortcuts = [
  { href: "/me/edit", label: "Sửa hồ sơ", desc: "Tên, ảnh, giới thiệu, thể loại", icon: Pencil },
  { href: "/me/shelf", label: "Tủ sách", desc: "Đang đọc, muốn đọc, đã xong", icon: Library },
  { href: "/me/stats", label: "Thống kê đọc", desc: "Phút đọc, streak, mục tiêu năm, huy hiệu", icon: BarChart3 },
  { href: "/me/loans", label: "Mượn giấy", desc: "Theo dõi hạn & bản sao", icon: QrCode },
] as const;

export default async function MePage() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, bio, favorite_genres, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-8">
      <MotionSection className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-teal-50/20 to-zinc-50/40 p-6 shadow-xl shadow-zinc-900/5 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 shadow-md ring-4 ring-white sm:mx-0">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="" fill className="object-cover" sizes="96px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-400">
                <User className="h-12 w-12" strokeWidth={1.25} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Tài khoản</p>
            <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {profile?.display_name ?? user.email}
            </h1>
            <p className="mt-1 truncate text-sm text-zinc-600">{user.email}</p>
            {profile?.is_admin ? (
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80">
                Quản trị viên
              </span>
            ) : null}
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Link href={`/u/${user.id}`} className={linkBtnSecondary}>
                <BookMarked className="h-4 w-4" />
                Hồ sơ công khai
              </Link>
              <Link href="/me/edit" className={linkBtnPrimary}>
                Chỉnh sửa
              </Link>
            </div>
          </div>
        </div>

        {profile?.bio ? (
          <p className="mt-6 rounded-2xl border border-zinc-100 bg-white/70 p-4 text-sm leading-relaxed text-zinc-700">
            {profile.bio}
          </p>
        ) : null}

        {profile?.favorite_genres?.length ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Thể loại yêu thích</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(profile.favorite_genres as string[]).map((g: string) => (
                <span key={g} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-900 ring-1 ring-teal-100">
                  {g}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </MotionSection>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Lối tắt</h2>
        <StaggerContainer className="mt-3 grid gap-3 sm:grid-cols-2">
          {shortcuts.map(({ href, label, desc, icon: Icon }) => (
            <StaggerItem key={href}>
            <Link
              href={href}
              className="group flex gap-4 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition hover:border-teal-200/80 hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-teal-700 ring-1 ring-zinc-100 group-hover:bg-teal-50">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <div className="font-semibold text-zinc-900 group-hover:text-teal-800">{label}</div>
                <div className="mt-0.5 text-xs text-zinc-600">{desc}</div>
              </div>
            </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <FadeUp className="flex flex-wrap justify-center gap-2 border-t border-zinc-200/80 pt-8 sm:justify-start">
        <Link href="/books" className={linkBtnGhost}>
          ← Kho sách
        </Link>
        <Link href="/community" className={linkBtnGhost}>
          Cộng đồng
        </Link>
      </FadeUp>
    </div>
  );
}
