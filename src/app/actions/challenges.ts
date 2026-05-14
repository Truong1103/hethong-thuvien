"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function joinChallengeAction(challengeId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("challenge_participants").insert({
    challenge_id: challengeId,
    user_id: user.id,
  });
  if (error && error.code !== "23505") throw error;
  revalidatePath("/community/challenges");
}

export async function updateChallengeProgressAction(challengeId: string, booksCompleted: number) {
  const { supabase, user } = await requireUser();
  if (!Number.isFinite(booksCompleted) || booksCompleted < 0) throw new Error("Số không hợp lệ");
  await supabase
    .from("challenge_participants")
    .update({ books_completed: Math.floor(booksCompleted) })
    .eq("challenge_id", challengeId)
    .eq("user_id", user.id);
  revalidatePath("/community/challenges");
}
