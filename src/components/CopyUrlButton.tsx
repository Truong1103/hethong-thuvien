"use client";

import { toast } from "@/lib/toast";
import { useState } from "react";

export function CopyUrlButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success("Đã sao chép URL.");
          setTimeout(() => setDone(false), 2000);
        } catch {
          toast.error("Không sao chép được (trình duyệt chặn).");
        }
      }}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
    >
      {done ? "Đã sao chép" : "Sao chép URL"}
    </button>
  );
}
