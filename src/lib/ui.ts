/** Lớp input / nút dùng chung cho giao diện mới */
export const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/15";

const btnPrimaryCore =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:from-teal-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-55";

/** Nút chính full width (form đăng nhập, v.v.) */
export const btnPrimaryClass = `w-full ${btnPrimaryCore}`;

/** Nút chính chiều rộng theo nội dung (toolbar, lọc) */
export const btnPrimaryInlineClass = btnPrimaryCore;

export const btnGoogleClass =
  "flex w-full items-center justify-center gap-3 rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-55";

/** Link/nút CTA chính (trang chủ, chi tiết sách) */
export const linkBtnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-500 hover:to-emerald-500";

/** Link/nút viền (trang chủ, chi tiết sách) */
export const linkBtnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50";

/** Link nhẹ (quay lại, v.v.) */
export const linkBtnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950";
