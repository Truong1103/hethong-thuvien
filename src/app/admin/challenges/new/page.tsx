import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateChallengeForm } from "@/app/admin/challenges/CreateChallengeForm";
import { requireUser } from "@/lib/auth";

export default async function NewChallengePage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Tạo thử thách</h1>
        <Link href="/community/challenges" className="text-sm text-zinc-700 hover:text-zinc-950">
          ← Danh sách
        </Link>
      </div>

      <CreateChallengeForm />
    </div>
  );
}
