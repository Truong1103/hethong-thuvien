import {
  BookOpen,
  MessageSquare,
  Quote,
  Rss,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { MotionSection, StaggerContainer, StaggerItem } from "@/components/motion";
import { linkBtnPrimary, linkBtnSecondary } from "@/lib/ui";

const blocks = [
  {
    href: "/community/feed",
    icon: Rss,
    title: "Feed đọc sách",
    desc: "Xem cập nhật tủ sách (đang đọc, đã xong, muốn đọc) của những người bạn theo dõi — gần gũi như mạng xã hội cho sách.",
    color: "text-sky-600",
    bg: "from-sky-500/12 to-cyan-500/5",
  },
  {
    href: "/community/chat",
    icon: MessageSquare,
    title: "Chat AI — thủ thư ảo",
    desc: "Đặt câu hỏi tiếng Việt; AI tra cứu trong danh mục sách của hệ thống để gợi ý hoặc so khớp nhu cầu (không thay thế đọc kỹ toàn bộ).",
    color: "text-violet-600",
    bg: "from-violet-500/12 to-indigo-500/5",
  },
  {
    href: "/community/challenges",
    icon: Sparkles,
    title: "Thử thách đọc",
    desc: "Tham gia thử thách theo mùa, cập nhật số sách đã hoàn thành và xem bảng xếp hạng cộng đồng.",
    color: "text-amber-600",
    bg: "from-amber-500/12 to-orange-500/5",
  },
  {
    href: "/community/quotes",
    icon: Quote,
    title: "Trích dẫn công khai",
    desc: "Đọc những câu trích hay được chia sẻ từ sách trong kho — nguồn cảm hứng nhanh cho danh sách đọc tiếp theo.",
    color: "text-teal-600",
    bg: "from-teal-500/10 to-emerald-500/5",
  },
  {
    href: "/community/suggestions",
    icon: UserPlus,
    title: "Gợi ý theo dõi",
    desc: "Hệ thống gợi ý thành viên có thể loại trùng với hồ sơ của bạn để bạn mở rộng vòng kết nối đọc.",
    color: "text-emerald-600",
    bg: "from-emerald-500/12 to-teal-500/5",
  },
];

export default function CommunityHubPage() {
  return (
    <div className="space-y-8">
      <MotionSection className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-indigo-50/25 to-teal-50/30 p-6 shadow-xl shadow-zinc-900/5 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              <Users className="h-4 w-4" />
              Cộng đồng
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Đọc không cô đơn</h1>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
              Kết nối qua hoạt động tủ sách, thử thách và trích dẫn; hỏi thủ thư AI khi cần gợi ý nhanh từ kho sách.
              Chọn mục bên dưới hoặc dùng thanh điều hướng để chuyển trang.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:shrink-0">
            <Link href="/books" className={linkBtnSecondary}>
              <BookOpen className="h-4 w-4" />
              Kho sách
            </Link>
            <Link href="/community/feed" className={linkBtnPrimary}>
              Mở Feed
            </Link>
          </div>
        </div>
      </MotionSection>

      <CommunitySubnav current="hub" />

      <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {blocks.map(({ href, icon: Icon, title, desc, color, bg }) => (
          <StaggerItem key={href}>
          <Link
            href={href}
            className={`group flex flex-col rounded-2xl border border-zinc-200/90 bg-gradient-to-br ${bg} p-5 shadow-sm transition hover:border-teal-200/80 hover:shadow-md`}
          >
            <span className="mb-3 inline-flex w-fit rounded-xl bg-white/90 p-2.5 shadow-sm ring-1 ring-zinc-100">
              <Icon className={`h-6 w-6 ${color}`} strokeWidth={2} />
            </span>
            <h2 className="text-lg font-bold text-zinc-900 group-hover:text-teal-800">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{desc}</p>
            <span className="mt-4 text-sm font-semibold text-teal-700 group-hover:underline">Vào trang →</span>
          </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <MotionSection delay={0.1} className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-8 text-center">
        <p className="text-sm font-medium text-zinc-800">Mẹo</p>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
          Thêm thể loại yêu thích trong hồ sơ để gợi ý theo dõi chính xác hơn; theo dõi vài bạn đọc để Feed luôn có hoạt
          động mới.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/me/edit" className="text-sm font-semibold text-teal-700 hover:underline">
            Sửa hồ sơ
          </Link>
          <span className="text-zinc-300">|</span>
          <Link href="/community/suggestions" className="text-sm font-semibold text-teal-700 hover:underline">
            Xem gợi ý theo dõi
          </Link>
        </div>
      </MotionSection>
    </div>
  );
}
