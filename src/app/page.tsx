import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Clock,
  Headphones,
  MessageCircle,
  QrCode,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MotionCard, MotionSection, StaggerContainer, StaggerItem } from "@/components/motion";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { linkBtnGhost, linkBtnPrimary, linkBtnSecondary } from "@/lib/ui";

const HERO_IMAGE =
  "https://nhietnangviet.vn/thumbs/400x444x1/upload/news/thiet-ke-chua-co-ten-23-1741246734.png.webp";

const READING_IMAGE =
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80";

const faq = [
  {
    q: "Tôi có cần cài phần mềm để đọc PDF không?",
    a: "Không. Bạn đọc trực tiếp trên trình duyệt; tiến độ trang được lưu khi đã đăng nhập.",
  },
  {
    q: "Tóm tắt AI dùng mô hình nào?",
    a: "Hệ thống ưu tiên Google Gemini (mặc định gemini-2.5-flash) khi bạn cấu hình GEMINI_API_KEY. Có thể fallback OpenAI nếu chỉ đặt OPENAI_API_KEY.",
  },
  {
    q: "Mượn sách giấy hoạt động thế nào?",
    a: "Đội ngũ thư viện có thể gắn mã QR cho bản sao vật lý; bạn quét mã hoặc vào mục mượn trả trong tài khoản để theo dõi hạn.",
  },
  {
    q: "Làm sao tham gia cộng đồng đọc?",
    a: "Sau khi đăng nhập, vào Feed, Chat hoặc Thử thách đọc để chia sẻ tiến độ và gợi ý sách.",
  },
];

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    : { data: null as { is_admin: boolean } | null };
  const isAdmin = !!profile?.is_admin;

  return (
    <div className="space-y-16 pb-12">
      <MotionSection immediate className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/30 shadow-xl shadow-zinc-900/5">
        <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)] lg:gap-8 xl:gap-10">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Đọc mọi nơi
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              Hệ thống Thư viện Số hiện đại
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              Tìm sách, đọc PDF trên trình duyệt, nghe audio và lưu tiến độ đọc — cùng cộng đồng, thử thách và
              thống kê cá nhân. Một nền tảng cho cả đọc số và hỗ trợ hoạt động mượn tại chỗ.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/books" className={linkBtnPrimary}>
                <BookOpen className="h-4 w-4" />
                Vào kho sách
              </Link>
              {user ? (
                <>
                  <Link href="/me" className={linkBtnSecondary}>
                    Tài khoản
                  </Link>
                  <Link href="/me/shelf" className={linkBtnGhost}>
                    Tủ sách
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className={linkBtnSecondary}>
                    Đăng nhập
                  </Link>
                  <Link href="/signup" className={linkBtnGhost}>
                    Tạo tài khoản
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="relative aspect-[4/3] min-h-[220px] w-full overflow-hidden rounded-2xl border border-zinc-200/80 shadow-lg ring-1 ring-black/5 sm:min-h-[280px] lg:aspect-auto lg:min-h-[340px] xl:min-h-[380px]">
            <Image
              src={HERO_IMAGE}
              alt="Không gian thư viện với kệ sách"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 52vw"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-900/50 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white drop-shadow-md">
              Khám phá kho sách và trải nghiệm đọc liền mạch.
            </p>
          </div>
        </div>
      </MotionSection>

      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: BookOpen,
            title: "Kho sách",
            desc: "Tìm kiếm theo tác giả, thể loại, năm xuất bản; xem bìa và mở ngay trang chi tiết.",
            color: "text-teal-600",
            bg: "from-teal-500/10 to-emerald-500/5",
          },
          {
            icon: Headphones,
            title: "PDF & Audio",
            desc: "Đọc và nghe trực tiếp, lưu vị trí tự động để lần sau tiếp tục đúng chỗ.",
            color: "text-indigo-600",
            bg: "from-indigo-500/10 to-violet-500/5",
          },
          {
            icon: MessageCircle,
            title: "Cộng đồng",
            desc: "Feed, chat và thử thách đọc — kết nối với người cùng sở thích.",
            color: "text-sky-600",
            bg: "from-sky-500/10 to-cyan-500/5",
          },
          {
            icon: Sparkles,
            title: "Thống kê & mục tiêu",
            desc: "Theo dõi thời gian đọc, huy hiệu, tủ sách và mục tiêu tuần/tháng.",
            color: "text-amber-600",
            bg: "from-amber-500/12 to-orange-500/5",
          },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <StaggerItem key={title}>
            <MotionCard
              className={`rounded-2xl border border-zinc-200/90 bg-gradient-to-br ${bg} p-5 shadow-sm transition hover:border-teal-200/80 hover:shadow-md`}
            >
            <div className="mb-3 inline-flex rounded-xl bg-white/90 p-2.5 shadow-sm ring-1 ring-zinc-100">
              <Icon className={`h-6 w-6 ${color}`} strokeWidth={2} />
            </div>
            <h2 className="font-semibold text-zinc-900">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{desc}</p>
            </MotionCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <MotionSection className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Mọi thứ bạn cần để đọc có hệ thống</h2>
          <p className="mt-2 text-sm text-zinc-600 sm:text-base">
            Từ khám phá nhanh đến đọc sâu và chia sẻ — các tính năng được gom gọn, dễ tìm trên thanh điều hướng.
          </p>
        </div>
        <StaggerContainer className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          {[
            { icon: Target, t: "Gợi ý & lọc thông minh", d: "Lọc theo NXB, năm, thể loại; sắp xếp theo mới nhất, phổ biến hoặc đánh giá." },
            { icon: Clock, t: "Phiên đọc có log", d: "Ghi nhận thời gian đọc PDF để thống kê và gamification nhẹ nhàng." },
            { icon: QrCode, t: "Mượn vật lý minh bạch", d: "Theo dõi kỳ hạn mượn, nhắc hạn và trạng thái bản sao qua luồng quản trị." },
            { icon: Trophy, t: "Thử thách & động lực", d: "Tham gia thử thách cộng đồng, xem tiến độ và đồng hành cùng bạn đọc khác." },
            { icon: BarChart3, t: "Bảng điều khiển cá nhân", d: "Trang thống kê tổng hợp thói quen đọc, mục tiêu và huy hiệu đã đạt." },
            { icon: Users, t: "Hồ sơ & tủ sách công khai", d: "Chia sẻ tủ sách, xem hoạt động cộng đồng và tương tác qua feed." },
          ].map(({ icon: Icon, t, d }) => (
            <StaggerItem key={t}>
              <li className="flex gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 text-left transition hover:border-teal-100 hover:bg-white">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-100">
                  <Icon className="h-5 w-5 text-teal-600" strokeWidth={2} />
                </span>
                <div>
                  <h3 className="font-semibold text-zinc-900">{t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">{d}</p>
                </div>
              </li>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </MotionSection>

      <MotionSection delay={0.06} className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] min-h-[220px] overflow-hidden rounded-3xl border border-zinc-200/80 shadow-lg ring-1 ring-black/5">
          <Image
            src={READING_IMAGE}
            alt="Người đọc sách và ghi chú"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-teal-900/20 to-transparent" />
        </div>
        <div className="space-y-5">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Bắt đầu trong vài phút</h2>
          <ol className="space-y-4">
            {[
              "Đăng ký hoặc đăng nhập — có thể dùng Google một chạm.",
              "Vào kho sách, chọn cuốn yêu thích và thêm vào tủ sách (đang đọc / muốn đọc).",
              "Mở PDF hoặc audio; hệ thống ghi nhận tiến độ. Khám phá Feed và Chat khi muốn tương tác.",
            ].map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white shadow-md shadow-teal-600/30">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-zinc-700 sm:text-base">{step}</p>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/books" className={linkBtnPrimary}>
              Mở kho sách
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/community/challenges" className={linkBtnSecondary}>
              Xem thử thách
            </Link>
          </div>
        </div>
      </MotionSection>

      <MotionSection delay={0.08} className="overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 px-6 py-10 text-center shadow-xl shadow-teal-900/25 sm:px-10">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Sẵn sàng đọc cùng cộng đồng?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-teal-50 sm:text-base">
          {user
            ? "Bạn đã đăng nhập — đồng bộ tủ sách, xem thống kê và tham gia Feed / Chat bất cứ lúc nào."
            : "Đăng nhập để đồng bộ tủ sách, nhận tóm tắt AI và tham gia thảo luận. Quản trị viên có thể mở rộng kho sách và cấu hình mượn trả theo nhu cầu đơn vị."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {user ? (
            <Link
              href="/me"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Vào tài khoản
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Đăng nhập ngay
            </Link>
          )}
          <Link
            href="/community/feed"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-teal-800 shadow-md transition hover:bg-teal-50"
          >
            Xem Feed cộng đồng
          </Link>
        </div>
      </MotionSection>

      <MotionSection delay={0.1} className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900">Câu hỏi thường gặp</h2>
        <p className="mt-2 text-center text-sm text-zinc-600">Một vài điểm người mới hay hỏi về Thư viện Số.</p>
        <StaggerContainer className="mt-8 space-y-3">
          {faq.map((item) => (
            <StaggerItem key={item.q}>
              <details className="group rounded-2xl border border-zinc-200/90 bg-white px-4 py-3 shadow-sm open:shadow-md">
                <summary className="cursor-pointer list-none font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    {item.q}
                    <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 transition group-open:rotate-90" />
                  </span>
                </summary>
                <p className="mt-3 border-t border-zinc-100 pt-3 text-sm leading-relaxed text-zinc-600">{item.a}</p>
              </details>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </MotionSection>

      <MotionSection delay={0.12} className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-10 text-center">
        <p className="text-sm font-medium text-zinc-700">Dành cho đội ngũ vận hành</p>
        {user ? (
          isAdmin ? (
            <>
              <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600">
                Tài khoản của bạn có quyền quản trị — quản lý danh mục, import, mượn trả và cấu hình email nhắc hạn
                trong khu vực Admin.
              </p>
              <Link href="/admin/books" className={`${linkBtnPrimary} mt-4 inline-flex`}>
                Mở khu vực Admin
              </Link>
            </>
          ) : (
            <>
              <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600">
                Khu vực Admin (danh mục, import, duyệt mượn, cấu hình email) chỉ dành cho tài khoản được cấp quyền
                thủ thư. Tài khoản của bạn dùng để đọc sách và tham gia cộng đồng.
              </p>
              <Link href="/me" className={`${linkBtnSecondary} mt-4 inline-flex`}>
                Vào tài khoản của bạn
              </Link>
            </>
          )
        ) : (
          <>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600">
              Quản lý danh mục, import dữ liệu, duyệt mượn và cấu hình email nhắc hạn — tập trung trong khu vực Admin
              sau khi được cấp quyền.
            </p>
            <Link href="/login" className={`${linkBtnGhost} mt-4 inline-flex`}>
              Đăng nhập để kiểm tra quyền của bạn
            </Link>
          </>
        )}
      </MotionSection>
    </div>
  );
}
