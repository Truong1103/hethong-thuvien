"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { followUserAction, unfollowUserAction } from "@/app/actions/social";

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
      } else {
        await followUserAction(props.targetUserId);
        setFollowing(true);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={toggle}
      className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60 ${
        following ? "border border-zinc-300 bg-white hover:bg-zinc-50" : "bg-zinc-900 text-white hover:bg-zinc-800"
      }`}
    >
      {loading ? "..." : following ? "Đang theo dõi" : "Theo dõi"}
    </button>
  );
}
