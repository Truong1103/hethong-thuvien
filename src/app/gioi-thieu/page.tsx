import {
  Bot,
  ExternalLink,
  Flag,
  GitBranch,
  Info,
  Link2,
  Package,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MotionSection, StaggerContainer, StaggerItem } from "@/components/motion";
import { linkBtnPrimary, linkBtnSecondary } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Giới thiệu | Thư viện Số Lá Xanh",
  description:
    "Giới thiệu dự án Thư viện Số Lá Xanh, chatbot thủ thư ảo, mục tiêu, quy trình, sản phẩm và liên kết minh chứng.",
};

const toc = [
  { href: "#du-an", label: "Dự án & chatbot" },
  { href: "#muc-tieu", label: "Mục tiêu" },
  { href: "#quy-trinh", label: "Quy trình" },
  { href: "#san-pham", label: "Sản phẩm" },
  { href: "#minh-chung", label: "Minh chứng" },
] as const;

const processSteps = [
  {
    title: "Xác định bài toán",
    desc: "Khảo sát nhu cầu đọc số, mượn sách giấy và hỗ trợ tìm sách. Chốt điểm nhấn: chatbot thủ thư ảo gắn với kho sách thật.",
  },
  {
    title: "Phân công & thiết kế",
    desc: "Chia việc theo các phần sách, tài khoản, mượn, cộng đồng và trợ lý ảo. Thiết kế luồng sử dụng rõ ràng, phù hợp với nhu cầu đọc và quản lý thư viện.",
  },
  {
    title: "Phát triển tính năng",
    desc: "Xây kho sách, đọc PDF/audio, tủ sách, thống kê, cộng đồng, admin. Tích hợp Gemini/OpenAI cho tóm tắt, giải thích đoạn và chat.",
  },
  {
    title: "Tinh chỉnh chatbot",
    desc: "Tinh chỉnh khả năng hỏi đáp nhiều lượt, gợi ý sách phù hợp và dẫn người đọc tới trang chi tiết của từng cuốn trong thư viện.",
  },
  {
    title: "Kiểm thử & triển khai",
    desc: "Chạy thử các luồng chính (đọc, mượn, chat, admin), sửa lỗi giao diện, đưa lên môi trường demo và gom liên kết minh chứng.",
  },
] as const;

const products = [
  {
    href: "/books",
    title: "Kho sách số",
    desc: "Tìm, lọc, đọc PDF trên trình duyệt, nghe audio, đánh giá và tóm tắt AI.",
  },
  {
    href: "/community/chat",
    title: "Chatbot thủ thư ảo",
    desc: "Hỏi đáp tiếng Việt, nhớ ngữ cảnh, gợi ý sách có thật trong kho kèm link.",
  },
  {
    href: "/community",
    title: "Cộng đồng đọc",
    desc: "Feed, thử thách, trích dẫn và gợi ý theo dõi theo thể loại yêu thích.",
  },
  {
    href: "/me",
    title: "Tài khoản & thói quen",
    desc: "Tủ sách, thống kê phút đọc, streak, mục tiêu năm và huy hiệu.",
  },
  {
    href: "/me/loans",
    title: "Mượn sách giấy",
    desc: "QR bản sao, hạn trả, nhắc hạn và khu vực admin duyệt mượn.",
  },
  {
    href: "/admin/books",
    title: "Khu vực admin",
    desc: "CRUD sách, import, bản sao vật lý, người dùng, thử thách và báo cáo.",
  },
] as const;

const evidence = [
  {
    href: "/",
    external: false,
    title: "Trang chủ sản phẩm",
    desc: "Giao diện công khai của Thư viện Số Lá Xanh.",
  },
  {
    href: "/community/chat",
    external: false,
    title: "Demo chatbot",
    desc: "Thủ thư ảo — tính năng trọng tâm của tiểu luận.",
  },
  {
    href: "/books",
    external: false,
    title: "Kho sách",
    desc: "Danh mục sách mà chatbot tra cứu khi gợi ý.",
  },
  {
    href: "/community",
    external: false,
    title: "Cộng đồng",
    desc: "Feed, thử thách, quotes và gợi ý theo dõi.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="space-y-8 pb-8">
      <MotionSection
        immediate
        className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-violet-50/30 to-teal-50/25 p-6 shadow-xl shadow-zinc-900/5 sm:p-10"
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-800 shadow-sm">
          <Info className="h-3.5 w-3.5" />
          Tiểu luận COMP1810
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Giới thiệu dự án</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
          <strong className="font-semibold text-zinc-800">Thư viện Số Lá Xanh</strong> là nền tảng đọc sách số kết hợp
          mượn giấy. Điểm nhấn là <strong className="font-semibold text-violet-800">chatbot thủ thư ảo</strong>: hỏi
          đáp tiếng Việt và gợi ý sách có thật trong kho, không bịa đầu sách ngoài danh mục.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/community/chat" className={linkBtnPrimary}>
            <Bot className="h-4 w-4" />
            Mở chatbot
          </Link>
          <Link href="/" className={linkBtnSecondary}>
            Về trang chủ
          </Link>
        </div>
      </MotionSection>

      <div className="lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <aside className="mb-6 lg:sticky lg:top-20 lg:mb-0">
          <nav
            aria-label="Mục lục trang giới thiệu"
            className="flex gap-2 overflow-x-auto rounded-2xl border border-zinc-200/90 bg-white/80 p-2 shadow-sm lg:flex-col lg:overflow-visible"
          >
            {toc.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-teal-50 hover:text-teal-800"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-10">
          <section id="du-an" className="scroll-mt-24">
            <MotionSection className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                    Dự án web & chatbot thủ thư ảo
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">Thư viện Số Lá Xanh — đọc sách số và trợ lý ảo</p>
                </div>
              </div>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-zinc-600 sm:text-base">
                <p>
                  Website giúp người đọc tìm sách, đọc PDF, nghe audio, theo dõi tiến độ và tham gia cộng đồng. Phía
                  vận hành quản lý danh mục, bản sao vật lý (QR) và mượn trả.
                </p>
                <p>
                  <strong className="font-semibold text-zinc-800">Chatbot là trọng tâm:</strong> người dùng hỏi bằng
                  tiếng Việt (thể loại, mức độ khó, so sánh cách đọc…). Hệ thống tra cứu kho sách, trả lời có cấu trúc
                  và đính kèm thẻ sách dẫn tới trang chi tiết. Hội thoại nhiều lượt, gợi ý chỉ lấy từ kho sách.
                </p>
                <ul className="list-inside list-disc space-y-1.5">
                  <li>Gợi ý 1–6 đầu sách phù hợp, nêu lý do ngắn.</li>
                  <li>Không bịa tên sách/tác giả nếu không có trong thư viện.</li>
                  <li>Kết hợp tóm tắt AI và giải thích đoạn khi đọc PDF.</li>
                </ul>
              </div>
              <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-sm text-violet-950">
                <Sparkles className="mb-1 inline h-4 w-4 text-violet-600" /> Thử ngay:{" "}
                <em>«Gợi ý 3 cuốn tâm lý dễ đọc cho người mới»</em> hoặc{" "}
                <em>«Trong thư viện có sách về lãnh đạo không?»</em>
              </div>
            </MotionSection>
          </section>

          <section id="muc-tieu" className="scroll-mt-24">
            <MotionSection className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-amber-600" />
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">Mục tiêu</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-600 sm:text-base">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-600" />
                  Xây web thư viện số dùng được: kho sách, đọc/nghe, tài khoản, cộng đồng và mượn giấy.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                  Ứng dụng AI thực tế qua chatbot thủ thư — giảm thời gian tìm sách, gợi ý dựa trên kho thật.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  Tạo thói quen đọc (thống kê, mục tiêu, thử thách) thay vì chỉ lưu file PDF rời.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-600" />
                  Minh chứng học phần: sản phẩm chạy được, các tính năng chính và kịch bản demo chatbot rõ ràng.
                </li>
              </ul>
            </MotionSection>
          </section>

          <section id="quy-trinh" className="scroll-mt-24">
            <div className="mb-4 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">Quy trình</h2>
            </div>
            <ol className="space-y-3">
              {processSteps.map((step, i) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="san-pham" className="scroll-mt-24">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">Sản phẩm</h2>
            </div>
            <StaggerContainer className="grid gap-3 sm:grid-cols-2">
              {products.map((p) => (
                <StaggerItem key={p.href}>
                  <Link
                    href={p.href}
                    className="block h-full rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-white to-teal-50/30 p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
                  >
                    <h3 className="font-semibold text-zinc-900">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{p.desc}</p>
                    <span className="mt-3 inline-block text-sm font-semibold text-teal-700">Xem →</span>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          <section id="minh-chung" className="scroll-mt-24">
            <div className="mb-4 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-sky-600" />
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">Liên kết minh chứng</h2>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-zinc-600">
              Các đường dẫn dùng khi báo cáo: sản phẩm, kho sách và kịch bản chatbot.
            </p>
            <ul className="space-y-3">
              {evidence.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/40"
                    >
                      <span>
                        <span className="font-semibold text-zinc-900">{item.title}</span>
                        <span className="mt-1 block text-sm text-zinc-600">{item.desc}</span>
                        <span className="mt-1 block break-all font-mono text-xs text-sky-700">{item.href}</span>
                      </span>
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:bg-teal-50/30"
                    >
                      <span>
                        <span className="font-semibold text-zinc-900">{item.title}</span>
                        <span className="mt-1 block text-sm text-zinc-600">{item.desc}</span>
                        <span className="mt-1 block font-mono text-xs text-teal-700">{item.href === "/" ? "/" : item.href}</span>
                      </span>
                      <span className="mt-0.5 text-sm font-semibold text-teal-700">Mở</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
