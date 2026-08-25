import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  ShadingType,
} from "./node_modules/docx/dist/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HINH = path.join(__dirname, "hinh");
const OUT = path.join(__dirname, "Bao_cao_tieu_luan.docx");
const OUT_TMP = path.join(__dirname, "_bao_cao_tmp.docx");

const FONT = "Times New Roman";
const SIZE = 26; // 13pt
const SIZE_SM = 22;
const SIZE_H1 = 32;
const SIZE_H2 = 28;
const LINE = 360; // 1.5
const INDENT = 567; // 1 cm
const PAGE_W = 11906; // A4
const PAGE_H = 16838;
const MARGIN = { top: 1247, right: 1134, bottom: 1247, left: 1588 };
const CONTENT_W = PAGE_W - MARGIN.left - MARGIN.right;

const thin = { style: BorderStyle.SINGLE, size: 4, color: "1F2937" };
const borders = { top: thin, bottom: thin, left: thin, right: thin };
const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

const run = (text, extra = {}) =>
  new TextRun({ font: FONT, size: SIZE, ...extra, text });

const p = (text, extra = {}) =>
  new Paragraph({
    spacing: { after: 200, line: LINE },
    alignment: AlignmentType.JUSTIFIED,
    indent: extra.noIndent ? undefined : { firstLine: INDENT },
    ...extra,
    children: extra.children ?? [run(text)],
  });

const center = (text, extra = {}) =>
  new Paragraph({
    spacing: { after: extra.after ?? 80, line: 276 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        font: FONT,
        size: extra.size ?? SIZE,
        bold: extra.bold,
        italics: extra.italics,
        text,
      }),
    ],
  });

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200, line: LINE },
    children: [new TextRun({ font: FONT, size: SIZE_H1, bold: true, text })],
  });

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160, line: LINE },
    children: [new TextRun({ font: FONT, size: SIZE_H2, bold: true, text })],
  });

const h3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120, line: LINE },
    children: [new TextRun({ font: FONT, size: 26, bold: true, italics: true, text })],
  });

const caption = (text) =>
  new Paragraph({
    spacing: { before: 80, after: 240, line: 276 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ font: FONT, size: SIZE_SM, italics: true, text })],
  });

const empty = () => new Paragraph({ spacing: { after: 80 }, children: [] });

function img(file, width, height) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80 },
    children: [
      new ImageRun({
        type: "png",
        data: fs.readFileSync(path.join(HINH, file)),
        transformation: { width, height },
      }),
    ],
  });
}

function cell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: opts.w ?? 2000, type: WidthType.DXA },
    shading: opts.header ? { type: ShadingType.CLEAR, fill: "0F766E" } : opts.alt ? { type: ShadingType.CLEAR, fill: "F0FDFA" } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 0, line: 276 },
        children: [
          new TextRun({
            font: FONT,
            size: 22,
            bold: opts.header || opts.bold,
            color: opts.header ? "FFFFFF" : "111827",
            text,
          }),
        ],
      }),
    ],
  });
}

function table(headers, rows, widths) {
  const ws = widths ?? headers.map(() => Math.floor(CONTENT_W / headers.length));
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: ws,
    rows: [
      new TableRow({
        children: headers.map((h, i) => cell(h, { header: true, center: true, w: ws[i] })),
      }),
      ...rows.map((r, ri) =>
        new TableRow({
          children: r.map((c, i) =>
            cell(String(c), { alt: ri % 2 === 1, w: ws[i], center: i === 0 || headers[i] === "STT" }),
          ),
        }),
      ),
    ],
  });
}

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const children = [];

// ===================== COVER =====================
children.push(
  empty(),
  center("BỘ GIÁO DỤC VÀ ĐÀO TẠO", { bold: true, size: 28 }),
  center("TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI TP. HỒ CHÍ MINH", { bold: true, size: 28 }),
  center("KHOA CÔNG NGHỆ THÔNG TIN", { bold: true, size: 26 }),
  empty(),
  empty(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new ImageRun({
        type: "png",
        data: fs.readFileSync(path.join(HINH, "logo-thu-vien.png")),
        transformation: { width: 72, height: 72 },
      }),
    ],
  }),
  empty(),
  center("BÁO CÁO TIỂU LUẬN", { bold: true, size: 40, after: 120 }),
  center("Học phần COMP1810", { bold: true, size: 28 }),
  center("Học kỳ 3 – Năm học 2025–2026", { size: 26, after: 200 }),
  empty(),
  center("XÂY DỰNG HỆ THỐNG THƯ VIỆN SỐ LÁ XANH", { bold: true, size: 32, after: 80 }),
  center("Nền tảng đọc sách số, cộng đồng và trợ lý thủ thư ảo", { italics: true, size: 26, after: 280 }),
  empty(),
);

const coverInfo = [
  ["Nhóm thực hiện", "Hoàng Thị Ngọc Quỳnh (Nhóm trưởng)"],
  ["", "Nguyễn Trần Tuyết Nhi"],
  ["", "Phạm Thanh Sang"],
  ["", "Võ Trần Ngọc Thảo"],
  ["", "Nguyễn Lê Hương Lan"],
  ["", "Phạm Mỹ Ngọc"],
  ["Mã số sinh viên", "52.06.601.015; 52.06.601.012; 52.06.601.016;"],
  ["", "52.06.601.018; 52.06.101.015; 52.06.601.010"],
  ["Sản phẩm", "Thư viện Số Lá Xanh"],
  ["Điểm nhấn", "Chatbot thủ thư ảo gắn với kho sách thật"],
];
for (const [k, v] of coverInfo) {
  children.push(
    new Paragraph({
      spacing: { after: 40, line: 300 },
      indent: { left: 1800 },
      children: [
        new TextRun({ font: FONT, size: 26, bold: true, text: k ? `${k}: ` : "" }),
        new TextRun({ font: FONT, size: 26, text: v }),
      ],
    }),
  );
}
children.push(
  empty(),
  empty(),
  center("Tháng 8 năm 2026", { bold: true, size: 26 }),
  pageBreak(),
);

// ===================== TOC =====================
children.push(
  new Paragraph({
    spacing: { after: 240 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ font: FONT, size: 32, bold: true, text: "MỤC LỤC" })],
  }),
  new Paragraph({
    spacing: { after: 200 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        font: FONT,
        size: 22,
        italics: true,
        text: "Mở tệp trong Microsoft Word, chuột phải vào mục lục bên dưới và chọn Cập nhật trường để hiện số trang.",
      }),
    ],
  }),
  new TableOfContents("Mục lục", {
    hyperlink: true,
    headingStyleRange: "1-3",
  }),
  pageBreak(),
);

// ===================== LISTS =====================
children.push(
  h1("Danh mục hình ảnh"),
  p("Hình 1. Quy trình xây dựng sản phẩm Thư viện Số Lá Xanh.", { noIndent: true }),
  p("Hình 2. Hành trình sử dụng của bạn đọc trên hệ thống.", { noIndent: true }),
  p("Hình 3. Minh họa bố cục trang chủ.", { noIndent: true }),
  p("Hình 4. Minh họa khu vực kho sách.", { noIndent: true }),
  p("Hình 5. Quy trình hỏi trợ lý thủ thư ảo.", { noIndent: true }),
  p("Hình 6. Minh họa giao diện chatbot thủ thư ảo.", { noIndent: true }),
  p("Hình 7. Quy trình mượn sách giấy bằng mã QR.", { noIndent: true }),
  p("Hình 8. Biểu tượng nhận diện của Thư viện Số Lá Xanh.", { noIndent: true }),
  p("Hình 9. Nút liên hệ Zalo trên giao diện công khai.", { noIndent: true }),
  h1("Danh mục bảng biểu"),
  p("Bảng 1. Thành viên nhóm và nhiệm vụ phụ trách.", { noIndent: true }),
  p("Bảng 2. Đối tượng sử dụng và nhu cầu chính.", { noIndent: true }),
  p("Bảng 3. Yêu cầu đặt ra đối với sản phẩm.", { noIndent: true }),
  p("Bảng 4. Tiêu chí đánh giá sản phẩm sau khi hoàn thành.", { noIndent: true }),
  p("Bảng 5. Các khu vực chính của website.", { noIndent: true }),
  p("Bảng 6. Tình huống sử dụng chatbot.", { noIndent: true }),
  p("Bảng 7. Kết quả kiểm thử nội bộ các luồng chính.", { noIndent: true }),
  p("Bảng 8. Mức độ đáp ứng mục tiêu ban đầu.", { noIndent: true }),
  h1("Danh mục từ viết tắt"),
);
children.push(
  table(
    ["Viết tắt", "Nghĩa đầy đủ", "Cách hiểu trong báo cáo"],
    [
      ["AI", "Artificial Intelligence (trí tuệ nhân tạo)", "Khả năng của máy tính hỗ trợ hỏi đáp, tóm tắt và giải thích"],
      ["PDF", "Portable Document Format", "Định dạng tài liệu số dùng để đọc sách trên trình duyệt"],
      ["QR", "Quick Response", "Mã vuông gắn trên bản sách giấy để mượn/trả"],
      ["COMP1810", "Học phần tiểu luận", "Học phần yêu cầu xây dựng sản phẩm có ứng dụng AI"],
    ],
    [1800, 3800, CONTENT_W - 5600],
  ),
  pageBreak(),
);

// ===================== 2. MỞ ĐẦU =====================
children.push(
  h1("1. MỞ ĐẦU"),
  h2("1.1. Lý do lựa chọn đề tài"),
  p("Đọc sách vẫn là cách quen thuộc để học tập, giải trí và mở rộng hiểu biết, nhưng cách tổ chức việc đọc đang thay đổi. Nhiều bạn đọc vừa muốn mở tài liệu số ngay trên điện thoại hoặc máy tính, vừa vẫn cần mượn sách giấy khi muốn đọc bản in. Ở phía thư viện, thông tin sách, tình trạng bản in, hạn trả và phản hồi của người dùng nếu nằm rải rác ở sổ sách, bảng tính hay tin nhắn riêng sẽ khiến công việc phục vụ chậm và dễ sai."),
  p("Khi danh mục sách đã có, khó khăn không dừng lại ở chỗ “có sách hay không”. Người đọc thường không nhớ đúng tên sách. Họ hỏi theo nhu cầu: sách tâm lý dễ đọc, sách về lãnh đạo, nên đọc giấy hay nghe audio. Nếu không có chỗ hỏi bằng lời nói đời thường, họ phải lần từng đầu sách. Đó là khoảng trống mà một trợ lý thủ thư ảo gắn với kho sách thật có thể lấp được."),
  p("Nhóm chọn đề tài xây dựng Thư viện Số Lá Xanh vì đây là bài toán gần với đời sống học tập: vừa tạo một không gian đọc dùng được, vừa thử nghiệm trí tuệ nhân tạo ở mức có kiểm soát. Trợ lý không được bịa tên sách ngoài danh mục. Như vậy AI phục vụ người dùng thật, chứ không chỉ để “có cho có” trong tiểu luận."),
  p("Việc chọn đề tài còn xuất phát từ đặc điểm học phần: cần một sản phẩm có thể mở ra, thao tác được và giải thích được vì sao có AI. Nếu chỉ làm trang giới thiệu sách tĩnh, điểm nhấn trí tuệ nhân tạo sẽ gượng. Nếu chỉ làm chatbot nói về sách nổi tiếng trên mạng, thư viện sẽ mất vai trò lọc và chịu trách nhiệm về danh mục. Sự kết hợp “kho thật – trợ lý ảo – thói quen đọc – mượn giấy” giúp đề tài vừa đủ rộng để thành một hệ thống, vừa đủ hẹp để nhóm hoàn thành trong một học kỳ."),
  h2("1.2. Vấn đề thực tế dẫn đến việc thực hiện đề tài"),
  p("Trong thực tế, bạn đọc gặp bốn bất tiện lặp lại. Thứ nhất, tìm sách mất thời gian nếu chỉ có danh sách dài hoặc phải hỏi trực tiếp khi thư viện đóng cửa. Thứ hai, đọc file rời thì lần sau khó nhớ đang dừng ở trang nào, chưa kể nghe audio và đọc chữ thường bị tách thành hai thói quen khác nhau. Thứ ba, việc đọc dễ đứt đoạn vì thiếu mục tiêu, thiếu chỗ nhìn lại thời gian đã đọc và thiếu hoạt động cùng người khác. Thứ tư, mượn sách giấy nếu ghi tay dễ nhầm bản, quên hạn và khó nhắc trước ngày trả."),
  p("Với người phụ trách thư viện, khó khăn nằm ở chỗ phải vừa cập nhật danh mục, vừa theo dõi bản in, vừa xử lý mượn trả, vừa muốn biết sách nào được quan tâm. Khi các việc này không nằm trên cùng một hệ thống, số liệu phục vụ trở nên mỏng và việc điều chỉnh hoạt động mang tính cảm tính."),
  p("Một hệ quả ít được nói tới là người đọc dần chấp nhận “tự xoay xở”: tải file về máy, đặt nhắc trên điện thoại, hỏi bạn bè xem nên đọc gì. Thư viện khi đó vẫn tồn tại trên danh nghĩa nhưng không còn là điểm tựa. Đề tài muốn kéo các việc tự xoay xở ấy trở lại một chỗ có trách nhiệm: sách do đơn vị chọn, tiến độ do hệ thống giữ, gợi ý bị giới hạn bởi kho thật, mượn giấy có dấu vết. Đó không phải tham vọng thay thế thư viện lớn, mà là sửa đúng chỗ đứt gãy ở quy mô một đơn vị nhỏ."),
  p("Đề tài xuất phát từ các vấn đề đó: cần một nơi thống nhất để khám phá sách, đọc hoặc nghe, lưu tiến độ, duy trì thói quen, hỏi trợ lý và mượn bản giấy, đồng thời dành cho thủ thư các công cụ vận hành tương ứng."),
  h2("1.3. Ý nghĩa của đề tài"),
  p("Về phía bạn đọc, hệ thống rút ngắn đường từ nhu cầu đến cuốn sách phù hợp, giữ mạch đọc qua nhiều lần truy cập và tạo động lực bằng thống kê, mục tiêu, huy hiệu và thử thách. Về phía thư viện, hệ thống gom danh mục, tài liệu số, bản giấy và hoạt động đọc vào một vòng đời rõ ràng. Về phía học phần, đề tài cho thấy trí tuệ nhân tạo được dùng có trách nhiệm: hỗ trợ tư vấn trên dữ liệu thật, giải thích đoạn văn khi đọc, tóm tắt theo thông tin sách, và luôn để người dùng kiểm chứng bằng cách mở trang chi tiết."),
  h2("1.4. Mục tiêu đề tài"),
  p("Mục tiêu tổng quát là xây dựng một thư viện số dùng được, lấy trải nghiệm đọc làm trung tâm và lấy trợ lý thủ thư ảo làm điểm nhấn. Các mục tiêu cụ thể gồm:"),
  p("Một là, tạo website giúp người dùng tìm sách, xem thông tin, đọc tài liệu trên trình duyệt, nghe sách nói khi có file nghe, đánh giá và lưu tủ sách cá nhân."),
  p("Hai là, ứng dụng AI vào ba việc gần với bạn đọc: hỏi đáp và gợi ý sách có trong kho, tóm tắt sách theo thông tin đã có, giải thích đoạn văn khi đang đọc."),
  p("Ba là, hỗ trợ hình thành thói quen đọc qua thống kê thời gian, chuỗi ngày, mục tiêu năm, huy hiệu và thử thách cộng đồng."),
  p("Bốn là, kết nối đọc số với mượn giấy bằng mã QR, hạn trả, duyệt mượn theo cài đặt và nhắc hạn khi hệ thống được cấu hình gửi thư."),
  p("Năm là, cung cấp khu vực quản trị để cập nhật sách, bản sao, thành viên, thử thách, cài đặt mượn trả và xem báo cáo hoạt động."),
  h2("1.5. Đối tượng sử dụng và hưởng lợi"),
  p("Khách truy cập là người chưa đăng nhập. Họ xem trang chủ, trang giới thiệu, kho sách công khai và hiểu thư viện cung cấp gì trước khi tạo tài khoản."),
  p("Bạn đọc đã đăng ký là nhóm chính. Họ đọc, nghe, lưu tủ sách, xem thống kê, tham gia cộng đồng, hỏi trợ lý và mượn sách giấy."),
  p("Thủ thư hoặc quản trị viên cập nhật danh mục, tài liệu, bản in và mã QR, xử lý mượn trả, quản lý thành viên, tạo thử thách và xem báo cáo."),
  p("Nhóm thực hiện sáu thành viên vừa là người xây dựng vừa là người kiểm thử nội bộ. Phân công được ghi nhận trong bảng sau."),
);
children.push(
  table(
    ["STT", "Họ và tên", "MSSV", "Vai trò", "Nhiệm vụ phụ trách"],
    [
      ["1", "Hoàng Thị Ngọc Quỳnh", "52.06.601.015", "Nhóm trưởng", "Điều phối; khảo sát yêu cầu; thiết kế luồng; tổng hợp báo cáo; kiểm thử tích hợp"],
      ["2", "Nguyễn Trần Tuyết Nhi", "52.06.601.012", "Thành viên", "Kho sách số; tìm kiếm, lọc, đánh giá; trải nghiệm trang chi tiết và tài liệu đọc"],
      ["3", "Phạm Thanh Sang", "52.06.601.016", "Thành viên", "Tài khoản và thói quen đọc; hồ sơ, tủ sách, tiến độ, thống kê, mục tiêu, huy hiệu"],
      ["4", "Võ Trần Ngọc Thảo", "52.06.601.018", "Thành viên", "Cộng đồng; bảng tin, theo dõi, trích dẫn, thử thách; kiểm thử tương tác"],
      ["5", "Nguyễn Lê Hương Lan", "52.06.101.015", "Thành viên", "Trợ lý thủ thư ảo; kịch bản hỏi đáp, gợi ý theo kho, hội thoại nhiều lượt"],
      ["6", "Phạm Mỹ Ngọc", "52.06.601.010", "Thành viên", "Mượn sách giấy và vận hành; QR, bản sao, duyệt, cài đặt, báo cáo"],
    ],
    [700, 2800, 2200, 1600, CONTENT_W - 7300],
  ),
  caption("Bảng 1. Thành viên nhóm và nhiệm vụ phụ trách"),
);
children.push(
  h2("1.6. Phạm vi đề tài"),
  h3("1.6.1. Nội dung đã thực hiện"),
  p("Trong phạm vi tiểu luận, nhóm đã hoàn thành website Thư viện Số Lá Xanh với các nhóm việc: giới thiệu và đăng nhập; kho sách kèm lọc, chi tiết, đánh giá, tóm tắt hỗ trợ bởi AI; đọc PDF và nghe audio có lưu vị trí; tài khoản, hồ sơ, tủ sách, thống kê, mục tiêu năm và huy hiệu; cộng đồng gồm bảng tin, gợi ý theo dõi, trích dẫn, thử thách và chatbot; mượn trả sách giấy bằng mã QR; khu vực quản trị sách, nhập danh mục, bản sao, thành viên, thử thách, cài đặt mượn và báo cáo. Hệ thống ưu tiên mô hình Gemini khi được cấu hình, có thể dùng OpenAI nếu chỉ có khóa tương ứng."),
  h3("1.6.2. Nội dung chưa nằm trong phạm vi"),
  p("Đề tài không xây dựng ứng dụng cài trên điện thoại độc lập, không làm bài giảng điện tử, trò chơi học tập hay bộ slide thuyết trình tách khỏi website. Không triển khai kiểm kê toàn kho, quản lý nhiều chi nhánh, tính phạt quá hạn tự động hay liên thông với phần mềm thư viện khác. Chatbot không đọc hết nội dung từng cuốn sách; chỉ dựa trên thông tin danh mục được cung cấp. Báo cáo này cũng không bịa số liệu khảo sát diện rộng vì nhóm chưa thực hiện điều tra định lượng có mẫu lớn; phần thử nghiệm trình bày kết quả kiểm thử nội bộ theo các luồng thật của sản phẩm."),
);

// ===================== 3. CƠ SỞ LÝ THUYẾT =====================
children.push(
  h1("2. CƠ SỞ LÝ THUYẾT"),
  h2("2.1. Trí tuệ nhân tạo và khả năng hỗ trợ con người"),
  p("Trí tuệ nhân tạo, gọi tắt là AI, là khả năng của hệ thống máy tính thực hiện một số việc vốn gắn với trí tuệ người như nhận ngôn ngữ, tóm tắt ý, trả lời câu hỏi và gợi ý lựa chọn. Trong đời sống, AI không nhất thiết phải “thông minh như người”. Điều hữu ích hơn là nó giúp con người làm nhanh hơn những việc lặp lại hoặc mất nhiều thời gian tìm kiếm."),
  p("Với thư viện, AI có thể đóng vai trò người hỗ trợ phía trước quầy: lắng nghe nhu cầu diễn đạt tự nhiên, đối chiếu với những gì thư viện đang có, rồi chỉ đường tới cuốn sách phù hợp. AI cũng có thể giúp hiểu nhanh một đoạn khó khi đang đọc. Những hỗ trợ này vẫn cần người dùng tự quyết định và tự đọc nội dung gốc, vì máy có thể hiểu sai hoặc nói chung chung nếu dữ liệu đầu vào mỏng."),
  h2("2.2. Các công cụ AI được sử dụng trong đề tài"),
  p("Nhóm sử dụng dịch vụ tạo câu trả lời bằng ngôn ngữ tự nhiên. Hệ thống ưu tiên Gemini của Google khi có khóa sử dụng; nếu chưa có thì có thể dùng dịch vụ của OpenAI. Cách tổ chức này giúp sản phẩm vẫn chạy được khi nhóm đổi nhà cung cấp, miễn là vẫn giữ nguyên nguyên tắc: câu trả lời phải dựa trên danh mục sách của thư viện khi gợi ý đầu sách."),
  p("Việc chọn hai hướng cung cấp như vậy mang tính thực dụng trong học kỳ: không phụ thuộc một nhà duy nhất, nhưng người dùng vẫn gặp cùng một trợ lý thủ thư trên giao diện. Nhóm không đi sâu so sánh chất lượng từng mô hình vì đó không phải mục tiêu đề tài. Điều quan trọng là cùng một luật ứng xử: tiếng Việt, không bịa sách, nêu lý do, dẫn được tới trang chi tiết."),
  p("AI được dùng ở ba chỗ người đọc nhìn thấy. Chỗ thứ nhất là hộp chat thủ thư ảo trong khu cộng đồng. Chỗ thứ hai là phần tóm tắt trên trang chi tiết sách, dựa trên tên sách, tác giả, thể loại và phần giới thiệu đã nhập. Chỗ thứ ba là giải thích đoạn văn khi bạn đọc đang mở tài liệu PDF: người dùng chọn hoặc nhập đoạn ngắn, hệ thống diễn giải dễ hiểu, không bịa thêm ý không có trong đoạn."),
  h2("2.3. Vai trò của AI trong việc hỗ trợ xây dựng sản phẩm"),
  p("Trong quá trình làm đề tài, AI còn được dùng như công cụ hỗ trợ con người làm việc nhóm: gợi ý cách diễn đạt, sắp xếp mục lục báo cáo, rà lỗi câu chữ và kiểm tra tính nhất quán giữa mô tả sản phẩm với những gì hệ thống thực sự có. Nhóm không để AI thay thế việc xác định nhu cầu, phân công hay kiểm thử. Mọi chức năng đưa vào báo cáo đều được đối chiếu với sản phẩm đang chạy."),
  p("Cách dùng này phù hợp nguyên tắc có trách nhiệm: máy gợi ý, người quyết. Nếu một đoạn mô tả nghe hay nhưng không có trên website, đoạn đó bị loại. Nếu trợ lý trên sản phẩm trả lời lạc, nhóm chỉnh lại định hướng và kịch bản hỏi, chứ không sửa báo cáo cho khớp với câu trả lời sai. Phân biệt hai việc “AI giúp viết” và “AI giúp bạn đọc” giúp đề tài không bị hiểu nhầm là chỉ dùng chatbot để soạn tiểu luận."),
  p("Vai trò đúng mức của AI là tăng tốc công việc trí óc ở khâu soạn thảo và hỗ trợ người đọc ở khâu sử dụng. Quyết định cuối cùng về nội dung sách, quyền mượn, khóa tài khoản và dữ liệu vận hành vẫn thuộc về con người."),
  h2("2.4. Nguyên tắc sử dụng AI phù hợp, có trách nhiệm và hiệu quả"),
  p("Nhóm thống nhất vài nguyên tắc. Thứ nhất, minh bạch: người dùng biết mình đang trò chuyện với trợ lý ảo, không phải thủ thư người. Thứ hai, trung thực với kho sách: không giới thiệu đầu sách không có trong danh mục. Thứ ba, tiết chế: trợ lý được yêu cầu nói rõ khi kho chưa có sách phù hợp, thay vì cố lấy lòng bằng câu trả lời bịa. Thứ tư, kiểm chứng: mỗi gợi ý cần dẫn được tới trang sách để người dùng tự xem. Thứ năm, giới hạn nhiệm vụ: AI không thay việc đọc, không kết luận đã “hiểu hết” cuốn sách, không xử lý các vấn đề pháp lý hay bản quyền thay đơn vị quản lý."),
  h2("2.5. Lưu ý khi sử dụng nội dung do AI hỗ trợ tạo ra"),
  p("Nội dung do AI tạo ra có thể trôi chảy nhưng sai ý, thiếu ngữ cảnh hoặc quá tự tin. Khi dùng AI để viết báo cáo, nhóm chỉ giữ những câu đã hiểu và đã khớp với sản phẩm. Khi dùng AI trên website, người đọc nên xem tóm tắt như gợi ý định hướng, xem lời giải thích đoạn như trợ giúp đọc hiểu, rồi quay lại văn bản gốc. Thủ thư cần nhập mô tả sách đầy đủ vì chất lượng tư vấn phụ thuộc trực tiếp vào dữ liệu danh mục."),
  p("Một lưu ý thêm là phân biệt ba lớp nội dung. Lớp thứ nhất là dữ liệu do thủ thư nhập: tên sách, tác giả, mô tả, bìa, file đọc, file nghe. Lớp thứ hai là dữ liệu do bạn đọc tạo: đánh giá, trích dẫn, tủ sách, phiên đọc. Lớp thứ ba là câu chữ do AI sinh ra. Nhóm coi lớp thứ ba là lớp phải bị ràng bởi hai lớp trước. Nếu đảo thứ tự này, thư viện số sẽ trông hiện đại nhưng không còn là thư viện của một danh mục cụ thể."),
  p("Phần lý thuyết trên đây chỉ nhằm đủ nền để đọc các chương sau, không mở rộng thành chuyên luận về AI."),
);

// ===================== 4. PHÂN TÍCH NHU CẦU =====================
children.push(
  h1("3. PHÂN TÍCH NHU CẦU VÀ BỐI CẢNH"),
  h2("3.1. Bối cảnh thực tế"),
  p("Bối cảnh của đề tài là nhu cầu đọc vừa số vừa giấy trong môi trường học tập. Người học quen tìm thông tin trên mạng, nhưng vẫn cần một chỗ có chọn lọc hơn mạng mở: sách được thư viện đưa vào danh mục, có bìa, có mô tả, có thể đọc hoặc nghe, có thể mượn bản in. Đồng thời, họ mong được hỗ trợ bằng ngôn ngữ tự nhiên thay vì phải nhớ đúng tựa sách."),
  p("Chuyển đổi số trong giáo dục và thư viện không chỉ là đưa file lên mạng. Nếu chỉ lưu file, người dùng vẫn thiếu tủ sách cá nhân, thiếu tiến độ, thiếu cộng đồng và thiếu cầu nối với quầy mượn. Thư viện Số Lá Xanh được đặt trong bối cảnh đó: số hóa trải nghiệm, không chỉ số hóa tài liệu."),
  p("Bối cảnh học phần cũng chi phối cách làm. Sản phẩm phải trình bày được trước giảng viên: mở được trang, hỏi được trợ lý, thấy được sách thật, giải thích được giới hạn. Vì vậy nhóm ưu tiên những việc nhìn thấy và kiểm chứng được hơn những việc “hậu trường” phức tạp. Quyết định này giải thích vì sao đề tài có chatbot và kho sách hoàn chỉnh, trong khi chưa có phân hệ phạt muộn hay liên thông nhiều cơ sở."),
  h2("3.2. Khó khăn hoặc bất tiện đang tồn tại"),
  p("Khó khăn phía bạn đọc gồm: danh mục phân tán; tìm sách theo nhu cầu chứ không theo tên; đọc dở thì mất mạch; nghe và đọc không gắn với cùng hồ sơ; thiếu động lực duy trì; mượn giấy thiếu minh bạch về hạn và trạng thái."),
  p("Khó khăn phía vận hành gồm: nhập sách thủ công dễ lệch; không rõ bản in nào đang được mượn; khó nhắc hạn đồng loạt; thiếu số liệu đọc theo ngày, tuần, tháng để điều chỉnh hoạt động. Những khó khăn này liên hệ nhân quả: dữ liệu không tập trung thì vừa bạn đọc vừa thủ thư đều phải làm lại các bước đã có thể tự động."),
  h2("3.3. Nhu cầu của người sử dụng"),
);
children.push(
  table(
    ["Đối tượng", "Nhu cầu nổi bật", "Hệ thống đáp ứng bằng cách nào"],
    [
      ["Khách truy cập", "Hiểu thư viện có gì trước khi đăng ký", "Trang chủ, giới thiệu, kho sách xem được khi chưa đăng nhập"],
      ["Bạn đọc", "Tìm, đọc/nghe, lưu tiến độ, được gợi ý", "Kho sách, PDF, audio, tủ sách, chatbot, thống kê"],
      ["Bạn đọc", "Có động lực và bạn đọc cùng sở thích", "Mục tiêu, huy hiệu, thử thách, feed, trích dẫn"],
      ["Bạn đọc", "Mượn sách giấy rõ ràng", "QR, hạn trả, lịch sử mượn, nhắc hạn khi cấu hình thư"],
      ["Thủ thư", "Quản lý tập trung và có số liệu", "Admin sách, bản sao, mượn, thành viên, báo cáo"],
    ],
    [1800, 3200, CONTENT_W - 5000],
  ),
  caption("Bảng 2. Đối tượng sử dụng và nhu cầu chính"),
);
children.push(
  h2("3.4. Yêu cầu đặt ra đối với sản phẩm"),
);
children.push(
  table(
    ["Nhóm yêu cầu", "Nội dung yêu cầu", "Mức ưu tiên"],
    [
      ["Trải nghiệm đọc", "Tìm–lọc sách; đọc PDF; nghe audio; lưu trang/vị trí", "Bắt buộc"],
      ["Tài khoản", "Đăng ký, đăng nhập email hoặc Google; hồ sơ; tủ sách", "Bắt buộc"],
      ["AI", "Chat theo kho thật; tóm tắt; giải thích đoạn", "Bắt buộc (điểm nhấn)"],
      ["Cộng đồng", "Feed, theo dõi, quotes, thử thách", "Cần có"],
      ["Mượn giấy", "QR, duyệt/tự duyệt, hạn, lịch sử, nhắc hạn", "Cần có"],
      ["Vận hành", "Thêm/sửa sách, nhập danh mục, báo cáo, khóa tài khoản", "Bắt buộc"],
      ["Ngôn ngữ", "Giao diện tiếng Việt, thân thiện người không chuyên kỹ thuật", "Bắt buộc"],
    ],
    [2200, 5200, CONTENT_W - 7400],
  ),
  caption("Bảng 3. Yêu cầu đặt ra đối với sản phẩm"),
);
children.push(
  h2("3.5. Những vấn đề cần giải quyết"),
  p("Từ nhu cầu trên, nhóm chốt các vấn đề then chốt: làm sao để một đầu sách đi suốt hành trình từ danh mục đến đọc, nghe, đánh giá, tủ sách, thống kê, thử thách và mượn giấy; làm sao chatbot chỉ nói về sách đang có; làm sao thủ thư thấy được hoạt động đọc mà không phải hỏi từng người. Giải pháp phải là một hệ thống liên kết, không phải tập hợp trang rời."),
  p("Nhân quả có thể tóm tắt như sau. Vì thông tin sách phân tán nên người dùng mất thời gian tìm; vì tìm chậm nên họ bỏ cuộc trước khi đọc; vì đọc không được ghi nhận nên họ không thấy tiến bộ; vì không thấy tiến bộ nên thói quen đứt; vì thói quen đứt nên thư viện khó chứng minh giá trị phục vụ. Mỗi mắt xích này được gắn một phần sản phẩm: kho và chatbot xử lý khâu tìm; PDF/audio và tiến độ xử lý khâu đọc; thống kê, huy hiệu và thử thách xử lý khâu duy trì; QR và báo cáo xử lý khâu vận hành. Cách nhìn theo chuỗi giúp nhóm tránh thêm tính năng không giải quyết mắt xích nào."),
  h2("3.6. Tiêu chí đánh giá sản phẩm sau khi hoàn thành"),
);
children.push(
  table(
    ["Tiêu chí", "Cách nhìn nhận", "Dấu hiệu đạt"],
    [
      ["Dùng được", "Người lạ vẫn thao tác được các việc cơ bản", "Đi từ trang chủ đến mở sách hoặc hỏi chat mà không lạc"],
      ["Đúng kho", "Gợi ý AI không bịa đầu sách", "Sách được nêu có trong danh mục và mở được trang chi tiết"],
      ["Liền mạch", "Đọc dở quay lại đúng chỗ", "PDF/audio nhớ vị trí khi đã đăng nhập"],
      ["Có động lực", "Nhìn thấy tiến bộ cá nhân", "Có phút đọc, chuỗi ngày, mục tiêu, huy hiệu"],
      ["Vận hành được", "Thủ thư làm việc hàng ngày trên hệ thống", "Thêm sách, tạo QR, xem mượn, xem báo cáo"],
      ["Trung thực đề tài", "Báo cáo khớp sản phẩm", "Không mô tả chức năng không tồn tại"],
    ],
    [2200, 3600, CONTENT_W - 5800],
  ),
  caption("Bảng 4. Tiêu chí đánh giá sản phẩm sau khi hoàn thành"),
);

// ===================== 5. THIẾT KẾ =====================
children.push(
  h1("4. THIẾT KẾ GIẢI PHÁP VÀ QUY TRÌNH XÂY DỰNG SẢN PHẨM"),
  h2("4.1. Ý tưởng ban đầu"),
  p("Ý tưởng xuất phát từ hình ảnh một thư viện nhỏ nhưng hiện đại: kệ sách vẫn còn, bạn đọc vẫn mượn giấy, đồng thời ai cũng có thể mở sách số lúc đêm khuya. Trên nền đó, nhóm thêm một thủ thư ảo đứng ở cửa: hỏi tiếng Việt, nhớ mạch câu chuyện, chỉ những cuốn đang có trên kệ số. Tên Thư viện Số Lá Xanh gợi sự gần gũi, gắn với việc đọc như một thói quen nuôi dưỡng chứ không phải một kho file lạnh."),
  h2("4.2. Cách xác định nhu cầu"),
  p("Nhóm xác định nhu cầu bằng cách đi theo hành trình người dùng thay vì liệt kê tính năng kỹ thuật. Câu hỏi đặt ra là: người mới vào trang đầu tiên sẽ làm gì; khi chưa biết tên sách thì hỏi ai; khi đọc dở thì hệ thống giữ gì; khi muốn có bạn đọc thì gặp nhau ở đâu; khi cầm sách giấy thì thư viện nhận diện bản sách ra sao. Các câu hỏi này được đối chiếu với quan sát thực tế về việc tìm tài liệu học tập và được ghi thành yêu cầu trong Bảng 3."),
  p("Nhóm trưởng phụ trách khảo sát yêu cầu và thiết kế luồng. Các thành viên góp tình huống từ phần mình phụ trách, rồi thống nhất những việc “phải có” trước khi làm đẹp. Nhờ vậy sản phẩm không phình theo hướng thêm nút cho vui."),
  h2("4.3. Cách lựa chọn giải pháp"),
  p("Nhóm chọn làm một website dùng được trên trình duyệt để người dùng không phải cài phần mềm. Giao diện tiếng Việt, bố cục theo từng việc: sách, cộng đồng, tài khoản, quản trị. Phần trí tuệ nhân tạo được gắn vào đúng lúc người dùng cần tư vấn hoặc hiểu đoạn văn, chứ không hiện tràn mọi trang. Phần mượn giấy dùng mã QR vì thao tác quét vừa quen, vừa giảm nhầm bản sách."),
  p("Giải pháp chatbot được chọn theo hướng “có kiểm soát”: trước khi trả lời về sách, hệ thống đối chiếu danh mục đang có, rồi mới viết lời. Nếu kho không có sách phù hợp, trợ lý phải nói thẳng. Lựa chọn này đánh đổi độ “hào nhoáng” để lấy độ tin cậy – phù hợp một đề tài thư viện."),
  h2("4.4. Các bước xây dựng sản phẩm"),
  p("Quy trình thực hiện gồm năm bước nối nhau, tương ứng phân công trong nhóm."),
);
children.push(
  img("quy-trinh-xay-dung.png", 600, 120),
  caption("Hình 1. Quy trình xây dựng sản phẩm Thư viện Số Lá Xanh"),
);
children.push(
  p("Bước xác định bài toán chốt điểm nhấn chatbot gắn kho thật. Bước phân công và thiết kế chia việc theo kho sách, tài khoản, cộng đồng, trợ lý và mượn giấy, đồng thời phác luồng màn hình. Bước xây dựng chức năng lần lượt làm các khu vực người dùng nhìn thấy. Bước tinh chỉnh trợ lý ảo tập trung hội thoại nhiều lượt, lý do gợi ý và thẻ sách dẫn tới trang chi tiết. Bước kiểm thử và hoàn thiện chạy các kịch bản đọc, mượn, chat, quản trị, sửa chỗ gây lạc hướng rồi chuẩn bị minh chứng."),
  p("Thứ tự làm việc có chủ đích. Nếu làm chatbot trước khi có kho sách, trợ lý sẽ không có gì để chỉ. Nếu làm mượn giấy trước khi có tài khoản, sẽ không biết ai đang giữ sách. Nếu làm thống kê trước khi ghi nhận phiên đọc, biểu đồ sẽ trống. Vì vậy nhóm dựng danh mục và tài khoản sớm, rồi mới gắn đọc/nghe, rồi mới gắn AI và cộng đồng, rồi mới siết vận hành. Báo cáo viết lại đúng thứ tự tư duy này để người đọc thấy sản phẩm được xây, không phải được liệt kê."),
  h2("4.5. Cách tổ chức nội dung trên sản phẩm"),
  p("Nội dung được tổ chức theo việc người dùng muốn làm, không theo thuật ngữ kỹ thuật. Thanh trên cùng dẫn tới giới thiệu, sách, cộng đồng, bảng tin, chat; khi đã đăng nhập còn tủ sách, thống kê, tài khoản và khu quản trị nếu có quyền. Trang chủ giải thích ngắn gọn thư viện làm được gì. Trang giới thiệu trình bày đề tài, thành viên, mục tiêu, quy trình và đường dẫn minh chứng. Mỗi cuốn sách có một trang chi tiết làm “trạm trung chuyển”: từ đây người dùng đọc, nghe, lưu tủ, xem tóm tắt, đánh giá hoặc chia sẻ trích dẫn."),
);
children.push(
  img("hanh-trinh-ban-doc.png", 600, 120),
  caption("Hình 2. Hành trình sử dụng của bạn đọc trên hệ thống"),
);
children.push(
  h2("4.6. Cách sử dụng AI trong từng giai đoạn"),
  p("Giai đoạn phân tích: AI hỗ trợ nhóm diễn đạt lại nhu cầu cho dễ hiểu, không thay quan sát thực tế. Giai đoạn thiết kế: AI gợi ý cách nói trên giao diện cho người không chuyên. Giai đoạn xây dựng sản phẩm: AI được gắn vào chat, tóm tắt và giải thích đoạn; nhóm viết rõ “luật” cho trợ lý: tiếng Việt, không bịa sách, nêu lý do ngắn, nhớ ngữ cảnh hội thoại. Giai đoạn kiểm thử: nhóm cố tình hỏi những câu dễ khiến máy bịa để xem trợ lý có thừa nhận kho thiếu sách hay không. Giai đoạn viết báo cáo: AI hỗ trợ sắp ý và diễn đạt; nhóm đối chiếu từng đoạn với sản phẩm trước khi giữ lại."),
  h2("4.7. Cách kiểm tra và điều chỉnh sản phẩm"),
  p("Kiểm tra được làm theo luồng, không theo từng mảnh rời. Ví dụ luồng “hỏi chat rồi mở sách” phải đi hết: đăng nhập, đặt câu, nhận gợi ý, bấm sang trang chi tiết. Luồng mượn giấy đi từ tạo bản sao, mở trang mã, đăng nhập, gửi yêu cầu, xem trạng thái, trả sách. Chỗ nào lời trên nút gây hiểu nhầm thì đổi câu chữ. Chỗ nào khách chưa đăng nhập mà vào việc cá nhân thì hiện lời mời đăng nhập thay vì trang trống."),
  h2("4.8. Hoàn thiện trước khi đưa vào thử nghiệm"),
  p("Trước khi nhóm dùng sản phẩm như người dùng thật, các phần giới thiệu, câu hỏi thường gặp trên trang chủ và gợi ý câu hỏi mẫu của chatbot được rà để người lạ biết bắt đầu từ đâu. Biểu tượng sách, màu xanh lá – teal và nút liên hệ Zalo được giữ thống nhất để nhận diện. Việc hoàn thiện ở đây là đủ để trải nghiệm, không phải tuyên bố sản phẩm đã sẵn sàng thay thế phần mềm thư viện chuyên nghiệp."),
  p("Nhóm cũng thống nhất cách nói trên giao diện: dùng từ “kho sách”, “tủ sách”, “thủ thư ảo”, “mượn giấy” thay cho thuật ngữ khó. Trang giới thiệu được viết để giảng viên và người ngoài ngành đọc được mục tiêu, thành viên, quy trình và đường dẫn minh chứng mà không cần mở tài liệu kỹ thuật. Đây là bước hoàn thiện về nội dung, song hành với hoàn thiện về thao tác."),
);

// ===================== 6. SẢN PHẨM =====================
children.push(
  h1("5. MÔ TẢ CÁC SẢN PHẨM ĐÃ TẠO"),
  p("Chương này chỉ mô tả những gì đang có trên hệ thống. Đề tài không có bài giảng độc lập, trò chơi học tập hay bộ slide thuyết trình tách website; các công cụ hỗ trợ nằm trong chính thư viện số (thống kê, huy hiệu, thử thách)."),
  h2("5.1. Website Thư viện Số Lá Xanh"),
  h3("5.1.1. Website phục vụ mục đích gì"),
  p("Website là sản phẩm trung tâm: một cửa cho việc khám phá sách, đọc và nghe tài liệu số, quản lý tủ sách, theo dõi thói quen, sinh hoạt cộng đồng, hỏi trợ lý và mượn sách giấy. Với thủ thư, website còn là bàn làm việc: cập nhật sách, bản in, thành viên và xem tình hình sử dụng."),
  h3("5.1.2. Người dùng có thể làm gì trên website"),
  p("Người chưa đăng nhập xem trang chủ, giới thiệu, kho sách và thông tin chi tiết công khai. Người đã đăng nhập thêm được: đọc PDF, nghe audio, lưu tiến độ, đánh giá, viết trích dẫn, quản lý tủ sách, xem thống kê, tham gia thử thách, theo dõi thành viên, hỏi chatbot, mượn trả sách giấy. Người có quyền quản trị vào khu Admin."),
);
children.push(
  table(
    ["Khu vực", "Người dùng chính", "Việc làm được"],
    [
      ["Trang chủ", "Mọi khách", "Hiểu dịch vụ, vào kho sách hoặc đăng nhập"],
      ["Giới thiệu", "Giảng viên, khách, nhóm", "Xem mục tiêu, thành viên, quy trình, đường dẫn demo"],
      ["Kho sách", "Bạn đọc", "Tìm, lọc, sắp xếp, mở chi tiết"],
      ["Đọc / nghe", "Bạn đọc đã đăng nhập", "Đọc PDF, nghe audio, lưu vị trí, giải thích đoạn"],
      ["Tài khoản", "Bạn đọc", "Hồ sơ, tủ sách, thống kê, mượn giấy"],
      ["Cộng đồng", "Bạn đọc", "Feed, chat, quotes, thử thách, gợi ý theo dõi"],
      ["Admin", "Thủ thư", "Sách, nhập danh mục, QR, mượn, thành viên, báo cáo"],
    ],
    [2200, 2400, CONTENT_W - 4600],
  ),
  caption("Bảng 5. Các khu vực chính của website"),
);
children.push(
  h3("5.1.3. Cách người dùng sử dụng website"),
  p("Lộ trình điển hình gồm ba bước trên trang chủ: tạo tài khoản hoặc đăng nhập (có thể dùng Google), vào kho sách chọn cuốn và đưa vào tủ đang đọc hoặc muốn đọc, rồi mở PDF hoặc audio. Khi muốn tương tác, người dùng sang cộng đồng. Nếu cầm sách giấy có dán mã, họ quét mã để mượn hoặc trả."),
  p("Việc vào hệ thống được làm gọn: đăng ký bằng thư điện tử, đăng nhập lại, hoặc dùng tài khoản Google. Người dùng có thể yêu cầu đặt lại mật khẩu khi quên. Nếu tài khoản bị thủ thư khóa, họ được đưa tới trang thông báo thay vì tiếp tục các việc trong thư viện. Những chi tiết này không nổi bật như chatbot nhưng cần thiết để sản phẩm dùng thử ổn định."),
  h3("5.1.4. Điểm nổi bật"),
  p("Điểm nổi bật không phải là “có nhiều nút”, mà là một đầu sách được dùng xuyên suốt: được tìm, được trợ lý nhắc tới, được đọc hoặc nghe, được đánh giá, được đưa vào tủ, được tính vào mục tiêu và thử thách, và nếu có bản in thì được mượn bằng mã. Giao diện tiếng Việt, có câu hỏi thường gặp, có trang giới thiệu đề tài, có nút Zalo liên hệ."),
  p("Trên trang chi tiết, người dùng thấy bìa, tác giả, thể loại, nhà xuất bản, năm, mô tả, lượt xem và điểm đánh giá. Nếu đã đăng nhập, họ chuyển sách giữa các ngăn tủ. Nút đọc chỉ hoạt động khi có tài liệu PDF; nút nghe chỉ hoạt động khi có file nghe hoặc các phần nghe theo chương. Khi thiếu file, hệ thống báo rõ chứ không để người dùng bấm vào trang trống. Phần tóm tắt hỗ trợ bởi AI nằm ngay dưới khối thông tin chính, rồi đến nhận xét và nơi chia sẻ trích dẫn công khai."),
  p("Khi đọc PDF, bạn đọc lật trang, phóng to, thu nhỏ hoặc xoay trang ngay trên trình duyệt, không cần cài thêm phần mềm. Vị trí trang được nhớ cho lần sau. Nếu một đoạn khó, họ có thể yêu cầu lời giải thích ngắn. Khi nghe, họ tua, đổi tốc độ và chuyển phần nếu sách được chia chương; vị trí nghe cũng được giữ. Thời gian mở sách được ghi nhận để cộng vào thống kê. Cách làm này biến việc đọc rời thành việc đọc có lịch sử."),
  p("Phần đánh giá cho phép chấm điểm và viết nhận xét; người khác có thể bày tỏ đồng tình hoặc không đồng tình với nhận xét đó. Điểm trung bình hiện trên danh mục giúp người mới có thêm căn cứ chọn sách. Trích dẫn công khai gắn với đúng cuốn sách, tránh tình trạng câu hay bị tách khỏi nguồn. Những việc này làm kho sách sống hơn một danh sách tĩnh."),
);
children.push(
  img("giao-dien-trang-chu.png", 540, 304),
  caption("Hình 3. Minh họa bố cục trang chủ (theo nội dung thực tế của sản phẩm)"),
  img("giao-dien-kho-sach.png", 540, 304),
  caption("Hình 4. Minh họa khu vực kho sách và trang chi tiết"),
);
children.push(
  h2("5.2. Chatbot thủ thư ảo"),
  h3("5.2.1. Mục đích"),
  p("Chatbot được xây dựng để giảm khoảng cách giữa câu hỏi đời thường và danh mục thư viện. Người dùng không cần nhớ đúng tựa. Họ mô tả nhu cầu; trợ lý trả lời tiếng Việt và chỉ giới thiệu sách đang có trong kho, kèm đường dẫn xem chi tiết."),
  h3("5.2.2. Chatbot hỗ trợ người dùng như thế nào"),
  p("Trợ lý trả lời các câu về đọc sách, thể loại, thói quen, so sánh đọc chữ với nghe audio. Khi câu hỏi liên quan đến việc chọn sách, hệ thống đối chiếu kho rồi nêu một đến sáu đầu phù hợp cùng lý do ngắn. Hội thoại nhiều lượt: người dùng hỏi tiếp mà không phải giải thích lại từ đầu. Nếu kho trống chủ đề đó, trợ lý nói rõ và gợi ý hướng tìm trong kho sách."),
);
children.push(
  img("quy-trinh-chatbot.png", 600, 120),
  caption("Hình 5. Quy trình hỏi trợ lý thủ thư ảo"),
);
children.push(
  h3("5.2.3. Người dùng có thể hỏi những nội dung gì"),
);
children.push(
  table(
    ["Nhóm câu hỏi", "Ví dụ trên sản phẩm", "Kỳ vọng câu trả lời"],
    [
      ["Gợi ý sách", "Gợi ý 3 cuốn tâm lý dễ đọc cho người mới", "Vài đầu có trong kho, có lý do ngắn, có liên kết"],
      ["Hỏi tồn tại", "Trong thư viện có sách về lãnh đạo không?", "Có thì chỉ đúng sách đang có; không thì nói kho chưa có"],
      ["So sánh cách đọc", "So sánh đọc PDF và nghe audio — nên chọn cách nào?", "Tư vấn thói quen; nếu gợi sách thì vẫn lấy từ kho"],
      ["Hỏi tiếp mạch", "Cuốn vừa rồi có khó hơn không?", "Nhớ ngữ cảnh lượt trước, không đổi sang sách ngoài danh mục"],
    ],
    [2200, 4200, CONTENT_W - 6400],
  ),
  caption("Bảng 6. Tình huống sử dụng chatbot"),
);
children.push(
  h3("5.2.4. Cách chatbot phản hồi và hỗ trợ"),
  p("Câu trả lời được trình bày rõ, khi liệt kê sách thì tách ý để dễ đọc. Cạnh lời thoại, hệ thống có thể hiện thẻ sách với bìa, tác giả, thể loại và điểm đánh giá để người dùng bấm sang trang chi tiết. Trợ lý được định hướng không khẳng định đã đọc hết sách, chỉ dựa trên mô tả trong danh mục. Người dùng cần đăng nhập mới chat, phù hợp việc gợi ý gắn với thành viên thư viện."),
  h3("5.2.5. Tình huống sử dụng thực tế"),
  p("Một bạn muốn bắt đầu đọc tâm lý nhưng sợ sách nặng: hỏi câu mẫu trên trang chat, nhận vài gợi ý, mở cuốn vừa sức, thêm vào tủ đang đọc. Một bạn làm việc nhóm cần sách lãnh đạo: hỏi kho có không, nếu có thì mở ngay, nếu không thì đổi từ khóa trong kho sách. Một bạn phân vân đọc hay nghe: hỏi so sánh, rồi chọn định dạng trên trang sách. Các tình huống này trùng với gợi ý sẵn trên giao diện chatbot."),
);
children.push(
  img("giao-dien-chatbot.png", 540, 304),
  caption("Hình 6. Minh họa giao diện chatbot thủ thư ảo"),
);
children.push(
  h2("5.3. Công cụ hỗ trợ đọc: tủ sách, thống kê, huy hiệu và thử thách"),
  p("Nhóm công cụ này nằm trong website, phục vụ việc duy trì thói quen chứ không phải trò chơi tách rời hay bài giảng."),
  p("Tủ sách chia sách thành đang đọc, muốn đọc và đã đọc xong. Hồ sơ có tên hiển thị, ảnh, giới thiệu, thể loại yêu thích và tùy chọn công khai thống kê. Hồ sơ công khai cho người khác xem và nhấn theo dõi."),
  p("Trang thống kê ghi phút đọc và nghe từ các phiên mở sách, theo múi giờ Việt Nam. Người dùng xem hôm nay, bảy ngày, một tháng, cả quá trình, chuỗi ngày đọc liên tiếp, mục tiêu số sách trong năm và mức hoàn thành. Biểu đồ bảy ngày giúp nhìn nhịp đọc gần đây. Ba huy hiệu hiện có: Khởi đầu khi đọc xong cuốn đầu; Thói quen tốt khi đọc bảy ngày liên tiếp; Mọt sách khi hoàn thành mười cuốn. Huy hiệu hiện trên hồ sơ khi người dùng bật thống kê công khai."),
  p("Thử thách đọc do quản trị tạo, có thời gian và số sách mục tiêu. Bạn đọc tham gia, theo dõi số sách hoàn thành; khi đánh dấu đã đọc xong một cuốn, tiến độ thử thách đang diễn ra có thể được cộng nếu người đó đã tham gia. Có bảng xếp hạng theo số sách đã ghi nhận."),
  p("Bảng tin cộng đồng chỉ hiện hoạt động tủ sách của những người đang theo dõi, giống một mạng xã hội thu nhỏ cho việc đọc. Nếu chưa theo dõi ai, hệ thống giải thích và dẫn tới trang gợi ý thành viên có thể loại gần với hồ sơ. Trang trích dẫn tập hợp những câu được chia sẻ công khai từ sách trong kho, giúp người đọc tìm cảm hứng mà vẫn neo vào đầu sách cụ thể. Các mảnh cộng đồng này không thay thế diễn đàn lớn; chúng đủ để việc đọc bớt cô đơn trong phạm vi đề tài."),
  h2("5.4. Media"),
  p("Các sản phẩm truyền thông đi kèm hệ thống gồm biểu tượng sách mở dùng làm nhận diện trên thanh điều hướng và biểu tượng trang; hình minh họa không gian đọc trên trang chủ; nút Zalo cố định góc màn hình dẫn tới số liên hệ 0348177164 để bạn đọc nhắn tin khi cần hỗ trợ ngoài website. Đề tài không sản xuất chuỗi video hay podcast độc lập."),
);
children.push(
  img("logo-thu-vien.png", 80, 80),
  caption("Hình 8. Biểu tượng nhận diện của Thư viện Số Lá Xanh"),
  img("icon-zalo.png", 64, 64),
  caption("Hình 9. Nút liên hệ Zalo trên giao diện công khai"),
);
children.push(
  h2("5.5. Slide"),
  p("Trong nguồn sản phẩm hiện có không có bộ slide thuyết trình độc lập. Nhóm trình bày đề tài trực tiếp trên website, nhất là trang Giới thiệu và các kịch bản dùng chatbot, kho sách, mượn QR. Báo cáo này không mô tả thêm bộ slide không tồn tại."),
  h2("5.6. Mượn sách giấy và khu vực quản trị"),
  p("Mỗi bản sách giấy có thể được tạo trong khu quản trị, gắn nhãn kệ và mã QR. Bạn đọc quét mã hoặc mở đường dẫn tương ứng, xem thông tin sách, đăng nhập rồi chọn mượn. Hệ thống kiểm tra tình trạng bản và số sách đang mượn. Tùy cài đặt, yêu cầu được chấp nhận ngay hoặc chờ thủ thư duyệt. Thời hạn mặc định có thể đặt theo số ngày (mặc định mười bốn ngày) và giới hạn số sách đang giữ. Trang mượn của tài khoản hiện lịch sử và hạn; nếu quá hạn, thanh điều hướng báo hiệu. Khi cấu hình gửi thư, người dùng có thể nhận xác nhận trả và lời nhắc trước hạn hai ngày."),
);
children.push(
  img("quy-trinh-muon.png", 600, 120),
  caption("Hình 7. Quy trình mượn sách giấy bằng mã QR"),
);
children.push(
  p("Khu quản trị gồm: danh mục sách (thêm, sửa, xóa, bìa, file đọc, file nghe và các phần nghe nếu chia chương), nhập nhiều sách từ danh sách, bản sao giấy và QR, danh sách mượn, thành viên (xem lịch sử đọc, khóa tài khoản khi cần), tạo thử thách, cài đặt mượn, báo cáo thời gian đọc theo ngày/tuần/tháng, sách được xem nhiều, thành viên đọc nhiều và mức tăng thành viên mới. Chỉ tài khoản được cấp quyền thủ thư mới vào được khu này."),
  p("Đối với một đơn vị nhỏ, các màn hình quản trị trên đây đủ để vận hành hàng tuần: nạp sách mới, in hoặc dán mã cho bản giấy, xem ai đang giữ sách, khóa tài khoản gây rối, mở thử thách đọc theo đợt. Báo cáo không thay thế phân tích chuyên sâu nhưng cho thủ thư biết khoảng thời gian nào có nhiều phiên đọc và đầu sách nào đang được mở nhiều. Đó là mức “thấy được tình hình”, phù hợp mục tiêu đề tài."),
);

// ===================== 7. THỬ NGHIỆM =====================
children.push(
  h1("6. KẾT QUẢ THỬ NGHIỆM VÀ ĐÁNH GIÁ"),
  h2("6.1. Đối tượng và cách thức thử nghiệm"),
  p("Vì đề tài chưa tổ chức khảo sát định lượng trên mẫu lớn, nhóm không đưa số phần trăm hài lòng hay điểm trung bình bịa. Thử nghiệm được thực hiện nội bộ bởi sáu thành viên, mỗi người đóng hai vai: người phụ trách phần việc và người dùng giả lập (khách, bạn đọc, thủ thư). Cách làm là đi hết các luồng đã công bố trên trang giới thiệu: đọc, mượn, chat, quản trị; ghi chỗ vướng; sửa rồi chạy lại."),
  h2("6.2. Chức năng đã kiểm tra và kết quả"),
);
children.push(
  table(
    ["Luồng kiểm tra", "Việc làm", "Kết quả nội bộ"],
    [
      ["Truy cập công khai", "Xem trang chủ, giới thiệu, kho sách chưa đăng nhập", "Đạt: xem được thông tin; việc cá nhân yêu cầu đăng nhập"],
      ["Tài khoản", "Đăng ký, đăng nhập email, đăng nhập Google, sửa hồ sơ", "Đạt trên môi trường đã cấu hình dịch vụ đăng nhập"],
      ["Kho sách", "Tìm, lọc, sắp xếp, mở chi tiết, đánh giá", "Đạt khi danh mục có dữ liệu"],
      ["Đọc / nghe", "Mở PDF, đổi trang, nghe audio, quay lại đúng chỗ", "Đạt khi sách có file tương ứng"],
      ["AI tóm tắt / giải thích", "Tạo tóm tắt; giải thích đoạn khi đọc", "Đạt khi đã cấu hình khóa AI; nếu thiếu khóa thì hệ thống báo"],
      ["Chatbot", "Hỏi gợi ý, hỏi kho có sách không, hỏi tiếp mạch", "Đạt: gợi ý gắn kho; câu ngoài sách vẫn trả lời tiếng Việt"],
      ["Cộng đồng", "Feed khi chưa theo dõi; theo dõi; quotes; thử thách", "Đạt các trạng thái trống và có dữ liệu"],
      ["Mượn QR", "Tạo bản sao, mở trang QR, mượn, duyệt, trả", "Đạt theo cài đặt tự duyệt hoặc chờ duyệt"],
      ["Admin báo cáo", "Xem sách nhiều lượt xem, biểu đồ đọc, thành viên", "Đạt: hiển thị theo dữ liệu phiên đọc có thật"],
    ],
    [2400, 4200, CONTENT_W - 6600],
  ),
  caption("Bảng 7. Kết quả kiểm thử nội bộ các luồng chính"),
);
children.push(
  h2("6.3. Phản hồi trong nhóm"),
  p("Phản hồi chung là người mới hiểu được thư viện làm gì nhờ trang chủ và trang giới thiệu. Chatbot giúp bắt đầu chọn sách nhanh hơn lọc tay khi người dùng chưa biết tựa. Một số góp ý đã được chỉnh trong quá trình làm: làm rõ nút đọc/nghe khi sách chưa có file; mời đăng nhập thay vì im lặng ở feed; báo quá hạn trên thanh trên cùng. Những góp ý này mang tính chất nhóm thực hiện, không được suy thành ý kiến của số đông bạn đọc bên ngoài."),
  p("Khi đóng vai khách, các thành viên nhận thấy trang chủ đủ để biết bốn nhóm việc: kho sách, đọc/nghe, cộng đồng, thống kê. Khi đóng vai bạn đọc mới, họ hay đi theo thứ tự đăng nhập – kho sách – chi tiết – tủ sách, rồi mới sang chat. Khi đóng vai người không nhớ tựa sách, họ vào chat trước rồi mới tới trang chi tiết. Khi đóng vai thủ thư, họ cần vào admin sách, tạo bản sao và xem mượn trước khi xem báo cáo. Việc đóng vai giúp phát hiện chỗ “người trong nhóm biết đường đi” nhưng người ngoài sẽ không biết, từ đó thêm lời dẫn trên giao diện."),
  p("Một tình huống kiểm thử có chủ đích với chatbot là hỏi tên sách chắc chắn không có trong kho. Kết quả mong muốn không phải là trợ lý lấy một tựa nổi tiếng trên mạng để cho có câu trả lời, mà là thừa nhận kho chưa có và hướng người dùng sang cách tìm khác. Tình huống thứ hai là hỏi tiếp sau một gợi ý, ví dụ hỏi cuốn vừa nêu có phù hợp người mới không. Kết quả mong muốn là trợ lý nhớ mạch, không đổi sang một cuốn ngoài danh mục. Hai tình huống này gắn trực tiếp tiêu chí “đúng kho” ở Bảng 4."),
  h2("6.4. Điểm hoạt động tốt"),
  p("Hành trình từ hỏi trợ lý đến mở sách là mạch đáng giá nhất so với mục tiêu học phần. Việc lưu tiến độ đọc/nghe và thống kê phút tạo cảm giác “đọc có để lại dấu vết”. Mượn QR giúp bản giấy không tách khỏi hệ thống số. Khu quản trị đủ để nạp sách và theo dõi mượn trong quy mô nhỏ."),
  h2("6.5. Điểm còn hạn chế"),
  p("Chất lượng gợi ý phụ thuộc mô tả sách. Kho ít chủ đề thì trợ lý dễ phải nhận là chưa có. Tóm tắt không thay được việc đọc. Báo cáo quản trị mới ở mức các chỉ số cơ bản. Giao diện chưa được đánh giá bài bản với người khiếm thị hoặc người lớn tuổi. Chưa có số liệu người dùng thật bên ngoài nhóm."),
  h2("6.6. Mức độ đáp ứng mục tiêu ban đầu"),
);
children.push(
  table(
    ["Mục tiêu ban đầu", "Mức đạt", "Minh chứng trong sản phẩm"],
    [
      ["Web thư viện số dùng được", "Đạt trong phạm vi đề tài", "Kho sách, đọc/nghe, tài khoản, cộng đồng, mượn giấy, admin"],
      ["AI thực tế qua thủ thư ảo", "Đạt có điều kiện dữ liệu và khóa AI", "Trang chat; gợi ý theo kho; tóm tắt; giải thích đoạn"],
      ["Tạo thói quen đọc", "Đạt mức công cụ hỗ trợ", "Thống kê, mục tiêu, huy hiệu, thử thách"],
      ["Minh chứng học phần", "Đạt", "Sản phẩm chạy được; trang giới thiệu; báo cáo này"],
    ],
    [2800, 2800, CONTENT_W - 5600],
  ),
  caption("Bảng 8. Mức độ đáp ứng mục tiêu ban đầu"),
);

// ===================== 8. KHÓ KHĂN =====================
children.push(
  h1("7. KHÓ KHĂN VÀ GIỚI HẠN"),
  h2("7.1. Khó khăn khi xác định nhu cầu"),
  p("Nhu cầu thư viện rất rộng. Nếu làm hết kiểm kê, phạt muộn, nhiều chi nhánh thì vượt sức một tiểu luận. Nhóm phải cắt phạm vi mà vẫn đủ một vòng đời đọc. Việc cắt này mất thời gian thống nhất vì mỗi thành viên thấy phần mình đều quan trọng."),
  h2("7.2. Khó khăn khi xây dựng sản phẩm"),
  p("Sản phẩm có nhiều vai trò người dùng nên dễ thiếu liên kết: sách không gắn thử thách, chat không gắn kho, QR không gắn hạn trả. Nhóm phải kiểm thử chéo. Việc vừa có tài liệu số vừa có bản giấy buộc phải xử lý trường hợp sách chưa có file đọc hoặc chưa có bản in mà không để nút “chết” gây hiểu nhầm."),
  h2("7.3. Khó khăn khi sử dụng công cụ AI"),
  p("AI viết hay nhưng dễ kéo báo cáo sang hướng hướng dẫn kỹ thuật; nhóm phải viết lại theo góc đề tài. Trên sản phẩm, AI có lúc muốn giới thiệu sách nổi tiếng ngoài kho. Nhóm đã siết luật gợi ý chỉ trong danh mục, đổi lại trợ lý kém “hào hứng” hơn khi kho nghèo. Chất lượng tóm tắt và giải thích phụ thuộc nhà cung cấp và cách diễn đạt đầu vào."),
  h2("7.4. Hạn chế thời gian, dữ liệu và nguồn lực"),
  p("Thời gian học kỳ không đủ cho khảo sát rộng. Dữ liệu sách phụ thuộc nhóm tự nhập. Gửi thư nhắc hạn và đăng nhập Google chỉ chạy khi được cấu hình đầy đủ. Sáu người song song dễ lệch giao diện nếu không rà soát chung."),
  h2("7.5. Giới hạn hiện tại của sản phẩm và vấn đề chưa giải quyết"),
  p("Hệ thống phù hợp thư viện nhỏ hoặc vừa, phụ thuộc danh mục được cập nhật. Chưa có kiểm kê toàn kho, nhiều cơ sở, phạt quá hạn, duyệt nội dung cộng đồng nâng cao, tìm theo toàn văn sách, hay hỗ trợ tiếp cận đầy đủ cho người khuyết tật. Chatbot không thay thủ thư người trong các tình huống nghiệp vụ phức tạp. Các giới hạn này được chấp nhận trong phạm vi COMP1810 và được chuyển thành hướng phát triển ở chương sau."),
  p("Một giới hạn trung thực nữa là môi trường chạy. Đăng nhập Google, gửi thư nhắc hạn và chất lượng câu trả lời AI chỉ đầy đủ khi các dịch vụ bên ngoài được cấu hình. Trong báo cáo, nhóm mô tả đúng khả năng của sản phẩm khi được cấu hình, đồng thời nêu rõ nếu thiếu cấu hình thì hệ thống báo thiếu chứ không im lặng tạo cảm giác tính năng vẫn chạy. Cách này tránh thổi phồng kết quả thử nghiệm."),
);

// ===================== 9. ĐỊNH HƯỚNG =====================
children.push(
  h1("8. ĐỊNH HƯỚNG PHÁT TRIỂN"),
  p("Các hướng dưới đây bám đúng sản phẩm hiện có, không mở sang một đề tài khác."),
  p("Về trải nghiệm, nhóm có thể làm gợi ý sách sát sở thích đã lưu trong hồ sơ hơn, tinh chỉnh chữ và nút cho màn hình nhỏ, bổ sung hướng dẫn ngắn ngay trong từng khu vực lần đầu sử dụng."),
  p("Về nội dung, thủ thư cần quy trình nhập mô tả sách đầy đủ hơn vì chatbot sống nhờ dữ liệu này. Có thể thêm thông báo phong phú hơn về thử thách và hoạt động người đang theo dõi, trên nền cơ chế gửi thư đã có cho mượn trả."),
  p("Về đối tượng, hệ thống có thể thử với một nhóm lớp thật để lấy phản hồi định tính, rồi mới tính khảo sát định lượng. Hướng hỗ trợ người đọc khó khăn về thị lực hoặc thao tác nên được ưu tiên nếu sản phẩm được dùng lâu dài."),
  p("Về trợ lý ảo, nên có chỗ để bạn đọc đánh dấu câu trả lời hữu ích hay không hữu ích, từ đó tinh chỉnh cách nói. Vẫn giữ nguyên tắc không bịa sách ngoài kho."),
  p("Về vận hành, các bước tiếp theo hợp lý là quét mã lúc nhận trả, quản lý vị trí kệ chi tiết hơn, và báo cáo theo thể loại, tỷ lệ hoàn thành mục tiêu. Liên thông phần mềm thư viện lớn chỉ nên đặt sau khi quy mô thật sự cần."),
  p("Một hướng gần và khả thi là chuẩn hóa kịch bản demo cho giờ báo cáo: một tài khoản bạn đọc hỏi chatbot, mở sách được gợi ý, đọc vài trang, đánh dấu tiến độ; một tài khoản thủ thư thêm bản giấy, đưa mã QR, duyệt mượn. Kịch bản này không thêm chức năng mới nhưng làm tăng giá trị học phần vì người nghe nhìn thấy vòng khép kín."),
);

// ===================== 10. KẾT LUẬN =====================
children.push(
  h1("9. KẾT LUẬN"),
  p("Đề tài đã xử lý một vấn đề cụ thể: việc đọc và mượn sách bị cắt khúc giữa danh mục, file rời, ghi chép mượn và thiếu chỗ hỏi bằng lời tự nhiên. Thư viện Số Lá Xanh gom các khúc đó vào một hành trình: tìm hoặc hỏi, xem, đọc hoặc nghe, lưu tiến độ, duy trì thói quen, chia sẻ và mượn bản giấy."),
  p("Sản phẩm hoàn thành gồm website dùng được với kho sách, đọc PDF, nghe audio, tài khoản và tủ sách, thống kê – mục tiêu – huy hiệu, cộng đồng, chatbot thủ thư ảo, mượn QR và khu quản trị. Không có bài giảng, trò chơi hay bộ slide tách riêng trong nguồn hiện có."),
  p("So với mục tiêu ban đầu, nhóm đạt được một thư viện số có thể demo và sử dụng ở quy mô nhỏ, với AI đóng vai trò trợ lý có kiểm soát chứ không phải công cụ trang trí. Giá trị thực tế nằm ở chỗ bạn đọc tự phục vụ nhiều hơn, thủ thư có dữ liệu tập trung hơn, và việc chọn sách trở nên gần với cách người ta hỏi nhau trong đời thường."),
  p("Kinh nghiệm rút ra là phạm vi phải đủ hẹp để làm xong nhưng đủ rộng để thành một vòng đời; AI chỉ đáng tin khi bị neo vào dữ liệu thật; báo cáo đề tài phải nói đúng những gì sản phẩm làm được. Những hạn chế về khảo sát người dùng ngoài nhóm và về nghiệp vụ thư viện chuyên sâu là chỗ nhóm nhận rõ để phát triển tiếp, không phải chỗ để viết cho đủ chương."),
  p("Nhìn lại toàn bộ quá trình, nhóm thấy đề tài thành công nhất ở chỗ biến trí tuệ nhân tạo thành một khâu trong hành trình đọc, chứ không phải một ô chat đặt cạnh cho đủ tiêu chí học phần. Website vẫn dùng được khi người dùng không hỏi AI, nhưng khi họ hỏi, câu trả lời dẫn họ trở lại kệ sách của chính thư viện. Đó là tiêu chí nhóm muốn giữ nếu sản phẩm được phát triển tiếp sau môn học."),
);

// ===================== 11. TÀI LIỆU =====================
children.push(
  h1("10. TÀI LIỆU THAM KHẢO"),
  p("American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.). American Psychological Association.", { noIndent: true }),
  p("Google. (n.d.). Gemini API documentation. Google AI for Developers. https://ai.google.dev/gemini-api/docs", { noIndent: true }),
  p("IFLA. (2019). IFLA toolkit: Libraries and the sustainable development goals. International Federation of Library Associations and Institutions. https://www.ifla.org/libraries-development/", { noIndent: true }),
  p("OpenAI. (n.d.). Prompt engineering. OpenAI Platform. https://platform.openai.com/docs/guides/prompt-engineering", { noIndent: true }),
  p("Russell, S., & Norvig, P. (2021). Artificial intelligence: A modern approach (4th ed.). Pearson.", { noIndent: true }),
  p("Supabase. (n.d.). Supabase documentation. https://supabase.com/docs", { noIndent: true }),
  p("Thủ tướng Chính phủ. (2020). Quyết định số 749/QĐ-TTg ngày 03 tháng 6 năm 2020 phê duyệt “Chương trình Chuyển đổi số quốc gia đến năm 2025, định hướng đến năm 2030”.", { noIndent: true }),
  p("UNESCO. (2021). Recommendation on the ethics of artificial intelligence. United Nations Educational, Scientific and Cultural Organization. https://www.unesco.org/en/artificial-intelligence/recommendation-ethics", { noIndent: true }),
  p("Vercel. (n.d.). Next.js documentation. https://nextjs.org/docs", { noIndent: true }),
);

// ===================== 12. PHỤ LỤC =====================
children.push(
  h1("11. PHỤ LỤC"),
  h2("Phụ lục A. Prompt tiêu biểu đã sử dụng"),
  p("Dưới đây là các định hướng đã dùng khi làm việc với AI, viết lại bằng lời thường, không phải tài liệu kỹ thuật."),
  p("Định hướng cho trợ lý thủ thư: Hãy đóng vai thủ thư thân thiện của Thư viện Số Lá Xanh. Trả lời tiếng Việt đầy đủ. Khi gợi ý sách, chỉ nêu sách có trong danh mục được cung cấp. Không bịa tên sách hoặc tác giả. Nếu kho không có sách phù hợp thì nói thẳng và gợi ý cách tìm trong kho. Nêu lý do ngắn cho từng gợi ý. Nhớ các lượt hỏi trước. Không khẳng định đã đọc hết nội dung sách."),
  p("Câu hỏi mẫu khi kiểm thử chat: Gợi ý 3 cuốn tâm lý dễ đọc cho người mới. Trong thư viện có sách về lãnh đạo không? So sánh đọc PDF và nghe audio — nên chọn cách nào?"),
  p("Định hướng khi giải thích đoạn đọc: Hãy giải thích đoạn trích cho dễ hiểu, không thêm ý không có trong đoạn, trả lời tiếng Việt."),
  p("Định hướng khi viết báo cáo: Viết như báo cáo đề tài đã thực hiện, không như tài liệu lập trình; chỉ mô tả chức năng đang có; văn phong sinh viên, tiếng Việt mạch lạc."),
  h2("Phụ lục B. Liên kết sản phẩm trên website"),
  p("Trang chủ: /", { noIndent: true }),
  p("Giới thiệu đề tài: /gioi-thieu", { noIndent: true }),
  p("Kho sách: /books", { noIndent: true }),
  p("Chatbot thủ thư ảo: /community/chat", { noIndent: true }),
  p("Cộng đồng: /community", { noIndent: true }),
  p("Liên hệ Zalo: https://zalo.me/0348177164", { noIndent: true }),
  h2("Phụ lục C. Hình minh họa bổ sung"),
  p("Các hình trong báo cáo được dựng theo đúng nội dung chữ và luồng thao tác trên sản phẩm, dùng để người đọc hình dung bố cục khi không đứng trước màn hình. Khi báo cáo trực tiếp, nhóm mở website thật để minh chứng."),
  h2("Phụ lục D. Ghi chú về số liệu thử nghiệm"),
  p("Bảng 7 phản ánh kiểm thử nội bộ, không phải khảo sát độc lập. Không có bảng điểm hài lòng hay cỡ mẫu người dùng ngoài nhóm trong hồ sơ đề tài tại thời điểm viết báo cáo."),
  h2("Phụ lục E. Nhật ký hoàn thiện sản phẩm (tóm tắt)"),
  p("Sau khi các phần việc được ghép lại, nhóm rà soát những chỗ dễ lệch trải nghiệm. Trang cộng đồng khi chưa đăng nhập chuyển sang lời mời rõ ràng. Feed khi chưa theo dõi ai thì hướng tới trang gợi ý theo dõi. Sách thiếu PDF hoặc audio được ghi chú trên trang chi tiết. Tài khoản bị khóa được xử lý bằng trang thông báo thay vì để người dùng thao tác tiếp các việc cá nhân. Các điều chỉnh này không tạo ra sản phẩm mới, chỉ làm các sản phẩm đã mô tả ở chương 5 dùng được trọn vẹn hơn."),
  p("Về mặt nhận diện, tên Thư viện Số Lá Xanh, biểu tượng sách mở và gam màu xanh được giữ xuyên suốt trang chủ, thanh điều hướng và chân trang. Nút Zalo đặt cố định nhằm hỗ trợ liên lạc nhanh khi người dùng gặp vướng lúc dùng thử, phù hợp quy mô đề tài chưa có bộ phận chăm sóc khách hàng."),
  h2("Phụ lục F. Kịch bản trình diễn đề xuất"),
  p("Kịch bản 1 – Bạn đọc mới: mở trang chủ, đọc phần giới thiệu ngắn, đăng nhập, vào kho sách, lọc theo thể loại, mở một cuốn, thêm vào tủ đang đọc, mở tài liệu đọc vài trang rồi xem thống kê."),
  p("Kịch bản 2 – Hỏi thủ thư ảo: vào chat, hỏi câu gợi ý sách cho người mới, xem thẻ sách được nêu, mở trang chi tiết, đối chiếu mô tả với lời gợi ý. Tiếp tục hỏi một câu nối mạch để thấy trợ lý không quên lượt trước."),
  p("Kịch bản 3 – Thủ thư: vào khu quản trị, kiểm tra danh mục, tạo bản sách giấy và mã, xem yêu cầu mượn, mở báo cáo lượt đọc và sách được xem nhiều. Kịch bản này chứng minh đề tài không chỉ phục vụ bạn đọc mà còn phục vụ vận hành."),
);

const doc = new Document({
  creator: "Nhom Thu vien So La Xanh",
  title: "Bao cao tieu luan - Thu vien So La Xanh",
  description: "Bao cao COMP1810",
  styles: {
    default: {
      document: {
        run: { font: FONT, size: SIZE },
        paragraph: { spacing: { line: LINE } },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickStyle: true,
        run: { font: FONT, size: SIZE_H1, bold: true, color: "0F766E" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickStyle: true,
        run: { font: FONT, size: SIZE_H2, bold: true, color: "134E4A" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickStyle: true,
        run: { font: FONT, size: 26, bold: true, italics: true, color: "1F2937" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "heading-num",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.START,
            style: { paragraph: { indent: { left: 0, hanging: 0 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: MARGIN,
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  font: FONT,
                  size: 18,
                  italics: true,
                  color: "6B7280",
                  text: "Thư viện Số Lá Xanh – COMP1810",
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ font: FONT, size: 20, children: [PageNumber.CURRENT] }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const buf = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_TMP, buf);
try {
  fs.copyFileSync(OUT_TMP, OUT);
  fs.unlinkSync(OUT_TMP);
  console.log("Wrote", OUT, "bytes", buf.length);
} catch (e) {
  console.log("Wrote temp", OUT_TMP, "bytes", buf.length);
  console.log("Could not replace Bao_cao_tieu_luan.docx (file may be open):", e.message);
}
