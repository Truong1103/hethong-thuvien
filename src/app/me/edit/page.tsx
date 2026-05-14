import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { updateProfileAction } from "@/app/me/profileActions";

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

      <form action={updateProfileAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
        <div className="space-y-1">
          <label className="text-sm font-medium">Ảnh đại diện</label>
          <input name="avatar" type="file" accept="image/*" className="text-sm" />
          <p className="text-xs text-zinc-500">Tải lên ảnh mới (tuỳ chọn).</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Tên hiển thị</label>
          <input
            name="display_name"
            defaultValue={profile?.display_name ?? ""}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Giới thiệu</label>
          <textarea
            name="bio"
            defaultValue={profile?.bio ?? ""}
            className="min-h-24 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Thể loại yêu thích</label>
          <input
            name="genres"
            defaultValue={genresStr}
            placeholder="Ví dụ: Kỹ năng, Lịch sử"
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          />
          <p className="text-xs text-zinc-500">Phân tách bằng dấu phẩy.</p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="stats_public"
            defaultChecked={profile?.stats_public ?? true}
            className="rounded border-zinc-300"
          />
          Cho phép người khác xem thống kê đọc sách trên hồ sơ công khai
        </label>

        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Lưu
        </button>
      </form>
    </div>
  );
}
