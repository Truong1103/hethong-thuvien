"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function toInt(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export default function AdminNewBookPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Bạn cần đăng nhập.");

      const { data: created, error: insertErr } = await supabase
        .from("books")
        .insert({
          title,
          author,
          genre: genre || null,
          publisher: publisher || null,
          published_year: year ? toInt(year) : null,
          description: description || null,
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      const bookId = created.id as string;

      let coverPath: string | null = null;
      let pdfPath: string | null = null;
      let audioPath: string | null = null;

      if (cover) {
        coverPath = `books/${bookId}/cover-${Date.now()}-${cover.name}`;
        const up = await supabase.storage.from("covers").upload(coverPath, cover, { upsert: true });
        if (up.error) throw up.error;
      }
      if (pdf) {
        pdfPath = `books/${bookId}/book-${Date.now()}-${pdf.name}`;
        const up = await supabase.storage.from("pdfs").upload(pdfPath, pdf, { upsert: true });
        if (up.error) throw up.error;
      }
      if (audio) {
        audioPath = `books/${bookId}/audio-${Date.now()}-${audio.name}`;
        const up = await supabase.storage.from("audios").upload(audioPath, audio, { upsert: true });
        if (up.error) throw up.error;
      }

      if (coverPath || pdfPath || audioPath) {
        const { error: updErr } = await supabase
          .from("books")
          .update({ cover_path: coverPath, pdf_path: pdfPath, audio_path: audioPath })
          .eq("id", bookId);
        if (updErr) throw updErr;
      }

      router.push(`/books/${bookId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo sách thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Thêm sách</h1>
          <p className="text-sm text-zinc-600">Upload bìa/PDF/Audio (Admin).</p>
        </div>
        <Link href="/admin/books" className="text-sm text-zinc-700 hover:text-zinc-950">
          ← Danh sách
        </Link>
      </div>

      <form onSubmit={onSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Tên sách</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tác giả</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Thể loại</label>
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Nhà xuất bản</label>
            <input
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Năm</label>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2025"
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-zinc-800">Tệp đính kèm</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Ảnh bìa — xanh lá */}
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Bìa sách</div>
              <p className="mt-1 text-xs text-emerald-700">JPG, PNG, WebP</p>
              <label className="mt-3 flex cursor-pointer flex-col gap-2">
                <span className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm ring-emerald-600 transition hover:bg-emerald-700 focus-within:ring-2 focus-within:ring-offset-2">
                  Chọn ảnh bìa
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="mt-2 truncate text-xs text-emerald-900/80" title={cover?.name}>
                {cover ? cover.name : "Chưa chọn file"}
              </p>
            </div>

            {/* PDF — đỏ */}
            <div className="rounded-xl border-2 border-red-200 bg-red-50/80 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-red-800">Đọc online</div>
              <p className="mt-1 text-xs text-red-700">Chỉ PDF</p>
              <label className="mt-3 flex cursor-pointer flex-col gap-2">
                <span className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm ring-red-600 transition hover:bg-red-700 focus-within:ring-2 focus-within:ring-offset-2">
                  Chọn file PDF
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="mt-2 truncate text-xs text-red-900/80" title={pdf?.name}>
                {pdf ? pdf.name : "Chưa chọn file"}
              </p>
            </div>

            {/* Audio — tím */}
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50/80 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-violet-800">Nghe sách</div>
              <p className="mt-1 text-xs text-violet-700">MP3, M4A, OGG…</p>
              <label className="mt-3 flex cursor-pointer flex-col gap-2">
                <span className="inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm ring-violet-600 transition hover:bg-violet-700 focus-within:ring-2 focus-within:ring-offset-2">
                  Chọn file âm thanh
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="mt-2 truncate text-xs text-violet-900/80" title={audio?.name}>
                {audio ? audio.name : "Chưa chọn file"}
              </p>
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? "Đang tạo..." : "Tạo sách"}
        </button>
      </form>
    </div>
  );
}

