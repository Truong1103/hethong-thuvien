"use client";

import { saveReadingGoalAction } from "@/app/me/goalActions";
import { btnPrimaryInlineClass, inputClass } from "@/lib/ui";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  year: number;
  defaultTarget: number;
};

export function ReadingGoalForm(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await saveReadingGoalAction(fd);
      toast.success("Đã lưu mục tiêu đọc.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không lưu được mục tiêu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <input type="hidden" name="year" value={props.year} readOnly />
      <label className="block text-sm font-medium text-zinc-700">
        Số cuốn mục tiêu
        <input name="targetBooks" type="number" min={1} defaultValue={props.defaultTarget} className={`${inputClass} mt-2`} />
      </label>
      <button type="submit" disabled={loading} className={btnPrimaryInlineClass}>
        {loading ? "Đang lưu..." : "Lưu mục tiêu"}
      </button>
    </form>
  );
}
