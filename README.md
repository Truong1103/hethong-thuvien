## Hệ thống Thư viện Số (Next.js + Supabase)

### Tính năng (theo module)

- **M1 Thư viện sách**: CRUD admin (thêm/sửa/xóa), import CSV đơn giản, lượt xem, đánh giá + vote review, tóm tắt AI (OpenAI), đọc PDF / nghe audio
- **M2 Tài khoản**: tủ sách (đang đọc / đã đọc / wishlist), hồ sơ (bio, ảnh, thể loại yêu thích, bật/tắt thống kê công khai), trang `/u/[id]`
- **M3 Mượn giấy**: QR `/p/[token]`, mượn/trả, admin duyệt (tuỳ cài đặt), lịch sử `/me/loans`
- **M4 Thói quen**: phiên đọc/nghe ghi `reading_sessions`, `/me/stats` (phút, streak, biểu đồ 7 ngày, mục tiêu năm, huy hiệu)
- **M5 Cộng đồng**: `/community/feed` (người follow), `/community/suggestions`, `/community/chat` (chatbot), `/community/quotes`, thử thách + **tự +1 tiến độ** khi đánh dấu sách **Đã đọc xong** (nếu đã tham gia thử thách đang diễn ra)
- **M6 AI**: tóm tắt sách, **giải thích đoạn** khi đọc PDF, chatbot Q&A theo kho sách
- **M7 Admin**: như trước

**Email & cron (tuỳ cấu hình):** xác nhận trả sách (Resend), nhắc hạn trước 2 ngày (`/api/cron/loan-reminders` + `SUPABASE_SERVICE_ROLE_KEY`). Chi tiết env bên dưới.

### Database

Chạy **theo thứ tự** trong Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/schema_extensions.sql`
3. `supabase/schema_extensions_followup.sql` (cột `borrower_email`, `due_reminder_sent_at` cho email/cron)

### Cài đặt

1) Tạo Supabase project và chạy schema SQL

- Mở Supabase SQL editor và chạy file `supabase/schema.sql`
- Bật Email auth trong Supabase Auth (nếu chưa)
- Bật Google provider trong Supabase Auth > Providers
- Trong Google Cloud Console, thêm Authorized redirect URL:
  - `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`

2) Cấu hình env

- Copy `.env.local.example` → `.env.local`
- Điền:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - (tuỳ chọn AI) `OPENAI_API_KEY`, `OPENAI_MODEL`
  - (tuỳ chọn email) `RESEND_API_KEY`, `RESEND_FROM` (ví dụ `Thư viện <onboarding@resend.dev>`)
  - (cron nhắc hạn) `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` (gọi tay: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/loan-reminders`). Trên Vercel dùng `vercel.json` — job gửi kèm header `x-vercel-cron` nên không cần Bearer.

3) Chạy dev

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

### Set tài khoản Admin (1 lần)

Sau khi tạo tài khoản đầu tiên, vào Supabase Table Editor → `profiles` và set `is_admin = true` cho user đó.

### Storage buckets

Schema đã tạo các bucket:

- `covers` (public)
- `pdfs` (private: chỉ user đã login đọc được)
- `audios` (private: chỉ user đã login đọc được)
- `avatars` (public — ảnh đại diện upload tại `/me/edit`, extension SQL)
