"use server";

import { setUserBlockedAction } from "@/app/admin/actions";

export async function toggleUserBlockFormAction(formData: FormData) {
  const uid = String(formData.get("user_id") ?? "");
  const blocked = formData.get("blocked") === "true";
  if (!uid) return;
  await setUserBlockedAction(uid, blocked);
}
