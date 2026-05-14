import { NextResponse } from "next/server";
import { sendEmailResend } from "@/lib/email";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";

/** Cron: GET. Bảo vệ bằng CRON_SECRET (Authorization: Bearer …) hoặc header Vercel `x-vercel-cron: 1`. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const vercelCron = request.headers.get("x-vercel-cron") === "1";
  const bearer = request.headers.get("authorization");
  const bearerOk = Boolean(secret && bearer === `Bearer ${secret}`);
  const devOpen = process.env.NODE_ENV === "development" && !secret;

  if (!vercelCron && !bearerOk && !devOpen) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: "Thiếu SUPABASE_SERVICE_ROLE_KEY" }, { status: 501 });
  }

  const { data: loans, error } = await admin
    .from("loans")
    .select("id, due_at, borrower_email, due_reminder_sent_at, physical_copies ( books ( title ) )")
    .eq("status", "active")
    .not("due_at", "is", null)
    .is("due_reminder_sent_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  let sent = 0;
  for (const row of loans ?? []) {
    if (!row.due_at || !row.borrower_email) continue;
    const due = new Date(row.due_at);
    const startDue = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
    const diffDays = Math.round((startDue - startToday) / 86400000);
    if (diffDays !== 2) continue;

    const pc = row.physical_copies as { books?: { title?: string } | { title?: string }[] } | null;
    const b = pc?.books;
    const title = Array.isArray(b) ? b[0]?.title : b?.title;

    const r = await sendEmailResend({
      to: row.borrower_email,
      subject: `[Thư viện Số] Nhắc hạn trả sách${title ? `: ${title}` : ""}`,
      html: `<p>Sách giấy của bạn sẽ đến hạn trả sau <strong>2 ngày</strong>.</p>${
        title ? `<p><strong>${escapeHtml(title)}</strong></p>` : ""
      }<p>Vui lòng mang sách đến trả đúng hạn.</p>`,
    });
    if (!r.ok) continue;

    await admin.from("loans").update({ due_reminder_sent_at: new Date().toISOString() }).eq("id", row.id);
    sent++;
  }

  return NextResponse.json({ ok: true, checked: loans?.length ?? 0, remindersSent: sent });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
