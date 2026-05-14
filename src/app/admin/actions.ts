"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!data?.is_admin) throw new Error("Không có quyền quản trị.");
  return { supabase, user };
}

export async function updateSystemSettingsAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const loan_default_days = Number(formData.get("loan_default_days"));
  const loan_max_active = Number(formData.get("loan_max_active"));
  const loan_auto_approve = formData.get("loan_auto_approve") === "on";
  if (!Number.isFinite(loan_default_days) || loan_default_days < 1) throw new Error("Số ngày mượn không hợp lệ");
  if (!Number.isFinite(loan_max_active) || loan_max_active < 1) throw new Error("Giới hạn số sách không hợp lệ");

  await supabase
    .from("system_settings")
    .upsert({ key: "loan_default_days", value: loan_default_days }, { onConflict: "key" });
  await supabase
    .from("system_settings")
    .upsert({ key: "loan_max_active", value: loan_max_active }, { onConflict: "key" });
  await supabase
    .from("system_settings")
    .upsert({ key: "loan_auto_approve", value: loan_auto_approve }, { onConflict: "key" });

  revalidatePath("/admin/settings");
}

export async function setUserBlockedAction(userId: string, blocked: boolean) {
  const { supabase, user } = await requireAdmin();
  if (userId === user.id) throw new Error("Không thể khóa chính mình.");
  await supabase.from("profiles").update({ is_blocked: blocked }).eq("id", userId);
  revalidatePath("/admin/users");
}

export async function createPhysicalCopyFormAction(formData: FormData) {
  const bookId = String(formData.get("book_id") ?? "");
  const shelfLabel = String(formData.get("shelf_label") ?? "");
  await createPhysicalCopyAction(bookId, shelfLabel);
}

export async function createPhysicalCopyAction(bookId: string, shelfLabel: string) {
  const { supabase } = await requireAdmin();
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
  const { error } = await supabase.from("physical_copies").insert({
    book_id: bookId,
    qr_token: token,
    shelf_label: shelfLabel.trim() || null,
  });
  if (error) throw error;
  revalidatePath(`/admin/books/${bookId}/copies`);
  return token;
}

export async function updateBookMetadataAction(bookId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const genre = String(formData.get("genre") ?? "").trim() || null;
  const publisher = String(formData.get("publisher") ?? "").trim() || null;
  const yearRaw = String(formData.get("published_year") ?? "").trim();
  const published_year = yearRaw ? Number(yearRaw) : null;
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!title || !author) throw new Error("Thiếu tên sách hoặc tác giả");

  const { error } = await supabase
    .from("books")
    .update({
      title,
      author,
      genre,
      publisher,
      published_year: published_year != null && Number.isFinite(published_year) ? Math.trunc(published_year) : null,
      description,
    })
    .eq("id", bookId);
  if (error) throw error;
  revalidatePath(`/books/${bookId}`);
  revalidatePath("/admin/books");
}

export async function deleteBookAdminAction(bookId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("books").delete().eq("id", bookId);
  if (error) throw error;
  revalidatePath("/admin/books");
  redirect("/admin/books");
}

export async function deleteBookFormAction(formData: FormData) {
  const bookId = String(formData.get("book_id") ?? "");
  if (!bookId) return;
  await deleteBookAdminAction(bookId);
}

export async function createChallengeAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const starts_at = String(formData.get("starts_at") ?? "");
  const ends_at = String(formData.get("ends_at") ?? "");
  const target_books = Number(formData.get("target_books"));
  if (!title) throw new Error("Thiếu tiêu đề");
  if (!starts_at || !ends_at) throw new Error("Thiếu ngày");
  await supabase.from("reading_challenges").insert({
    title,
    description,
    starts_at: new Date(starts_at).toISOString(),
    ends_at: new Date(ends_at).toISOString(),
    target_books: Number.isFinite(target_books) ? Math.max(1, Math.floor(target_books)) : 1,
  });
  revalidatePath("/community/challenges");
  redirect("/community/challenges");
}
