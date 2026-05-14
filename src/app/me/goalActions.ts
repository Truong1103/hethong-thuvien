"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function saveReadingGoalAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const year = Number(formData.get("year"));
  const targetBooks = Number(formData.get("targetBooks"));
  if (!Number.isFinite(year) || !Number.isFinite(targetBooks) || targetBooks < 1) {
    throw new Error("Mục tiêu không hợp lệ");
  }
  await supabase.from("reading_goals").upsert(
    {
      user_id: user.id,
      year: Math.floor(year),
      target_books: Math.floor(targetBooks),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,year" },
  );
  revalidatePath("/me/stats");
}
