"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function updateProfileAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const display_name = String(formData.get("display_name") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const genresRaw = String(formData.get("genres") ?? "");
  const favorite_genres = genresRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const stats_public = formData.get("stats_public") === "on";

  let avatar_url: string | undefined;
  const file = formData.get("avatar");
  if (file instanceof File && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${safeExt}`;
    const up = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (up.error) throw new Error(up.error.message);
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    avatar_url = pub.publicUrl;
  }

  await supabase
    .from("profiles")
    .update({
      display_name,
      bio,
      favorite_genres,
      stats_public,
      ...(avatar_url ? { avatar_url } : {}),
    })
    .eq("id", user.id);

  revalidatePath("/me");
  revalidatePath("/me/edit");
}
