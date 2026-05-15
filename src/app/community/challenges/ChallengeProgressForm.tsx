"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateChallengeProgressAction } from "@/app/actions/challenges";
import { toast } from "@/lib/toast";

export function ChallengeProgressForm(props: { challengeId: string; current: number; target: number }) {
  const router = useRouter();
  const [n, setN] = useState(String(props.current));
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const v = Math.min(props.target, Math.max(0, Math.floor(Number(n))));
      await updateChallengeProgressAction(props.challengeId, v);
      toast.success("Đã cập nhật tiến độ thử thách.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không cập nhật được");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={save} className="mt-3 flex flex-wrap items-center gap-2 text-sm">
      <label className="text-zinc-600">
        Tiến độ
        <input
          type="number"
          min={0}
          max={props.target}
          value={n}
          onChange={(e) => setN(e.target.value)}
          className="ml-2 w-16 rounded border border-zinc-200 px-2 py-1 text-center"
        />
        <span className="ml-1 text-zinc-500">/ {props.target}</span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-50"
      >
        Cập nhật
      </button>
    </form>
  );
}
