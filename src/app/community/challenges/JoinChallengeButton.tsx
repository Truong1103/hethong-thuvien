"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { joinChallengeAction } from "@/app/actions/challenges";
import { btnPrimaryInlineClass } from "@/lib/ui";
import { toast } from "@/lib/toast";

export function JoinChallengeButton(props: { challengeId: string; joined: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function join() {
    setErr(null);
    setLoading(true);
    try {
      await joinChallengeAction(props.challengeId);
      toast.success("Đã tham gia thử thách.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi");
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }

  if (props.joined) {
    return <span className="text-xs font-medium text-emerald-700">Đã tham gia</span>;
  }

  return (
    <div>
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <button
        type="button"
        disabled={loading}
        onClick={join}
        className={btnPrimaryInlineClass}
      >
        {loading ? "..." : "Tham gia"}
      </button>
    </div>
  );
}
