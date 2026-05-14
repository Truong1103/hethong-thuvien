"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminImportPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setMsg(null);
    setLoading(true);
    try {
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      let ok = 0;
      for (const line of lines) {
        const parts = line.split(",").map((s) => s.trim());
        const [title, author, genre, publisher, yearStr] = parts;
        if (!title || !author) continue;
        const published_year = yearStr ? Number(yearStr) : null;
        const { error } = await supabase.from("books").insert({
          title,
          author,
          genre: genre || null,
          publisher: publisher || null,
          published_year: published_year != null && Number.isFinite(published_year) ? Math.trunc(published_year) : null,
        });
        if (!error) ok++;
      }
      setMsg(`Đã nhập khoảng ${ok} dòng (bỏ qua dòng thiếu tên/tác giả).`);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Import CSV (đơn giản)</h1>
          <p className="text-sm text-zinc-600">
            Mỗi dòng: <code className="rounded bg-zinc-100 px-1">title,author,genre,publisher,year</code> — chỉ title và author là bắt buộc.
          </p>
        </div>
        <Link href="/admin/books" className="text-sm text-zinc-700 hover:text-zinc-950">
          ← Admin sách
        </Link>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-48 w-full rounded-xl border border-zinc-200 p-4 font-mono text-sm"
        placeholder={`Sách A,Tác giả A,Văn học,NXB Trẻ,2024\nSách B,Tác giả B,,,`}
      />

      {msg ? <p className="text-sm text-zinc-700">{msg}</p> : null}

      <button
        type="button"
        disabled={loading}
        onClick={run}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Đang import..." : "Import"}
      </button>
    </div>
  );
}
