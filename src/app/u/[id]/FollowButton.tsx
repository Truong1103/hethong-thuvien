"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { followUserAction, unfollowUserAction } from "@/app/actions/social";
import { btnPrimaryInlineClass } from "@/lib/ui";
import { toast } from "@/lib/toast";

export function FollowButton(props: { targetUserId: string; initialFollowing: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(props.initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      if (following) {
        await unfollowUserAction(props.targetUserId);
        setFollowing(false);
        toast.success("Đã bỏ theo dõi.");
      } else {
        await followUserAction(props.targetUserId);
        setFollowing(true);
        toast.success("Đã theo dõi.");
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={toggle}
      className={
        following
          ? "rounded-xl border-2 border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-55"
          : btnPrimaryInlineClass
      }
    >
      {loading ? "..." : following ? "Đang theo dõi" : "Theo dõi"}
    </button>
  );
}
