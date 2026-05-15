"use client";

import { setUserBlockedAction } from "@/app/admin/actions";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ToggleUserBlockButton(props: { userId: string; blocked: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await setUserBlockedAction(props.userId, !props.blocked);
      toast.success(props.blocked ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" disabled={loading} onClick={onClick} className="text-sm text-zinc-700 underline hover:text-zinc-950 disabled:opacity-60">
      {loading ? "..." : props.blocked ? "Mở khóa" : "Khóa"}
    </button>
  );
}
