"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { sendEmailResend } from "@/lib/email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function loadLoanSettings(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", ["loan_auto_approve", "loan_default_days", "loan_max_active"]);
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  const rawAuto = map.loan_auto_approve;
  const autoApprove = rawAuto !== false && rawAuto !== "false";
  const days = typeof map.loan_default_days === "number" ? map.loan_default_days : Number(map.loan_default_days ?? 14);
  const maxActive = typeof map.loan_max_active === "number" ? map.loan_max_active : Number(map.loan_max_active ?? 5);
  return {
    autoApprove,
    defaultDays: Number.isFinite(days) ? days : 14,
    maxActive: Number.isFinite(maxActive) ? maxActive : 5,
  };
}

export async function borrowPhysicalCopyAction(physicalCopyId: string, qrToken?: string) {
  const { supabase, user } = await requireUser();

  const { data: busy } = await supabase
    .from("loans")
    .select("id")
    .eq("physical_copy_id", physicalCopyId)
    .in("status", ["pending", "active"])
    .maybeSingle();
  if (busy) throw new Error("Bản sách giấy này đang được mượn hoặc chờ duyệt.");

  const { count } = await supabase
    .from("loans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["pending", "active"]);

  const settings = await loadLoanSettings(supabase);
  if ((count ?? 0) >= settings.maxActive) throw new Error(`Bạn chỉ được mượn tối đa ${settings.maxActive} cuốn cùng lúc.`);

  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + settings.defaultDays);

  const status = settings.autoApprove ? "active" : "pending";
  const borrowed_at = settings.autoApprove ? now.toISOString() : null;
  const due_at = settings.autoApprove ? due.toISOString() : null;

  const { error } = await supabase.from("loans").insert({
    user_id: user.id,
    physical_copy_id: physicalCopyId,
    status,
    borrowed_at,
    due_at,
    borrower_email: user.email ?? null,
  });
  if (error) throw error;

  revalidatePath("/me/loans");
  if (qrToken) revalidatePath(`/p/${qrToken}`);
}

export async function returnLoanAction(loanId: string, qrToken?: string) {
  const { supabase, user } = await requireUser();

  const { data: row } = await supabase
    .from("loans")
    .select(
      `
      id,
      status,
      borrower_email,
      physical_copies (
        books ( title )
      )
    `,
    )
    .eq("id", loanId)
    .eq("user_id", user.id)
    .maybeSingle();

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("loans")
    .update({ status: "returned", returned_at: now })
    .eq("id", loanId)
    .eq("user_id", user.id)
    .in("status", ["active", "pending"]);
  if (error) throw error;

  const pc = row?.physical_copies as { books?: { title?: string } | { title?: string }[] } | null | undefined;
  let bookTitle: string | undefined;
  if (pc?.books) {
    bookTitle = Array.isArray(pc.books) ? pc.books[0]?.title : pc.books.title;
  }
  const to = user.email ?? (row?.borrower_email as string | null | undefined);
  if (to && bookTitle) {
    try {
      await sendEmailResend({
        to,
        subject: `[Thư viện Số] Xác nhận đã trả sách: ${bookTitle}`,
        html: `<p>Bạn đã trả sách giấy: <strong>${escapeHtml(bookTitle)}</strong>.</p><p>Thời gian: ${escapeHtml(now)}</p>`,
      });
    } catch {
      // không chặn trả sách nếu email lỗi
    }
  }

  revalidatePath("/me/loans");
  if (qrToken) revalidatePath(`/p/${qrToken}`);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function approveLoanAdminAction(loanId: string) {
  const { supabase, user } = await requireUser();
  const { data: admin } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!admin?.is_admin) throw new Error("Không có quyền.");

  const { data: before } = await supabase
    .from("loans")
    .select("physical_copies ( qr_token )")
    .eq("id", loanId)
    .maybeSingle();
  const pc = before?.physical_copies as { qr_token?: string } | { qr_token?: string }[] | null | undefined;
  const qrTok = Array.isArray(pc) ? pc[0]?.qr_token : pc?.qr_token;

  const settings = await loadLoanSettings(supabase);
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + settings.defaultDays);

  const { error } = await supabase
    .from("loans")
    .update({
      status: "active",
      borrowed_at: now.toISOString(),
      due_at: due.toISOString(),
    })
    .eq("id", loanId)
    .eq("status", "pending");
  if (error) throw error;
  revalidatePath("/admin/loans");
  revalidatePath("/me/loans");
  if (qrTok) revalidatePath(`/p/${qrTok}`);
}
