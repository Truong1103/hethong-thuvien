import Link from "next/link";
import { ProfileEditForm } from "@/app/me/ProfileEditForm";
import { requireUser } from "@/lib/auth";

export default async function EditProfilePage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, favorite_genres, stats_public")
    .eq("id", user.id)
    .maybeSingle();

  const genresStr = (profile?.favorite_genres as string[] | undefined)?.join(", ") ?? "";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Hồ sơ</h1>
        <Link href="/me" className="text-sm text-zinc-700 hover:text-zinc-950">
          ← Tài khoản
        </Link>
      </div>

      <ProfileEditForm
        displayName={profile?.display_name ?? ""}
        bio={profile?.bio ?? ""}
        genresStr={genresStr}
        statsPublic={profile?.stats_public ?? true}
      />
    </div>
  );
}
