"use client";

import { updateProfileAction } from "@/app/me/profileActions";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  displayName: string;
  bio: string;
  genresStr: string;
  statsPublic: boolean;
};

export function ProfileEditForm(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await updateProfileAction(fd);
      toast.success("Đã lưu hồ sơ.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không lưu được hồ sơ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
      <div className="space-y-1">
        <label className="text-sm font-medium">Ảnh đại diện</label>
        <input name="avatar" type="file" accept="image/*" className="text-sm" />
        <p className="text-xs text-zinc-500">Tải lên ảnh mới (tuỳ chọn).</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Tên hiển thị</label>
        <input
          name="display_name"
          defaultValue={props.displayName}
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Giới thiệu</label>
        <textarea name="bio" defaultValue={props.bio} className="min-h-24 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Thể loại yêu thích</label>
        <input
          name="genres"
          defaultValue={props.genresStr}
          placeholder="Ví dụ: Kỹ năng, Lịch sử"
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
        />
        <p className="text-xs text-zinc-500">Phân tách bằng dấu phẩy.</p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="stats_public" defaultChecked={props.statsPublic} className="rounded border-zinc-300" />
        Cho phép người khác xem thống kê đọc sách trên hồ sơ công khai
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Đang lưu..." : "Lưu"}
      </button>
    </form>
  );
}
