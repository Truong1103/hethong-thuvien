"use server";

import { approveLoanAdminAction } from "@/app/actions/loans";

export async function approveLoanFormAction(formData: FormData) {
  const id = String(formData.get("loan_id") ?? "");
  if (!id) return;
  await approveLoanAdminAction(id);
}
