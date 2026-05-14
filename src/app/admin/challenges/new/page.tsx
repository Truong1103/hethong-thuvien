import Link from "next/link";
import { redirect } from "next/navigation";
import { createChallengeAction } from "@/app/admin/actions";
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

      <form action={createChallengeAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tiêu đề</label>
          <input name="title" required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Mô tả</label>
          <textarea name="description" className="min-h-24 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Bắt đầu</label>
            <input name="starts_at" type="datetime-local" required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Kết thúc</label>
            <input name="ends_at" type="datetime-local" required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Số sách cần đọc</label>
          <input name="target_books" type="number" min={1} defaultValue={3} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Tạo
        </button>
      </form>
    </div>
  );
}
