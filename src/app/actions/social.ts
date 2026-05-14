"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function followUserAction(targetId: string) {
  const { supabase, user } = await requireUser();
  if (targetId === user.id) throw new Error("Không thể follow chính mình.");
  const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
  if (error && error.code !== "23505") throw error;
  revalidatePath(`/u/${targetId}`);
  revalidatePath("/community/feed");
}

export async function unfollowUserAction(targetId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
  revalidatePath(`/u/${targetId}`);
  revalidatePath("/community/feed");
}
