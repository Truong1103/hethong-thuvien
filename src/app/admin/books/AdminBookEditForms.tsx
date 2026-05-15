"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { deleteBookAdminAction, updateBookMetadataAction } from "@/app/admin/actions";
import { AudioChaptersField, type AudioChapterDraft } from "@/components/admin/AudioChaptersField";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  publisher: string | null;
  published_year: number | null;
  description: string | null;
  cover_path: string | null;
  pdf_path: string | null;
  audio_path: string | null;
};

type ExistingChapter = {
  id: string;
  title: string;
  audio_path: string;
  sort_order: number;
};

function fileLabel(path: string | null) {
  if (!path) return null;
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(i + 1) : path;
}

function chaptersFromDb(rows: ExistingChapter[]): AudioChapterDraft[] {
  return [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((ch) => ({
      clientId: ch.id,
      dbId: ch.id,
      title: ch.title,
      file: null,
      existingAudioPath: ch.audio_path,
    }));
}

export function AdminBookEditForm(props: { book: Book; initialChapters: ExistingChapter[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const b = props.book;

  const [loading, setLoading] = useState(false);
  const [cover, setCover] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [audioChapters, setAudioChapters] = useState<AudioChapterDraft[]>(() =>
    chaptersFromDb(props.initialChapters),
  );
  const [initialChapterIds] = useState(() => props.initialChapters.map((c) => c.id));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await updateBookMetadataAction(b.id, fd);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Bạn cần đăng nhập.");

      let coverPath = b.cover_path;
      let pdfPath = b.pdf_path;

      if (cover) {
        coverPath = `books/${b.id}/cover-${Date.now()}-${cover.name}`;
        const up = await supabase.storage.from("covers").upload(coverPath, cover, { upsert: true });
        if (up.error) throw up.error;
      }
      if (pdf) {
        pdfPath = `books/${b.id}/book-${Date.now()}-${pdf.name}`;
        const up = await supabase.storage.from("pdfs").upload(pdfPath, pdf, { upsert: true });
        if (up.error) throw up.error;
      }

      const keptIds = new Set(audioChapters.map((c) => c.dbId).filter(Boolean) as string[]);
      const toDelete = initialChapterIds.filter((id) => !keptIds.has(id));
      if (toDelete.length > 0) {
        const { error: delErr } = await supabase.from("book_audio_chapters").delete().in("id", toDelete);
        if (delErr) throw delErr;
      }

      let firstAudioPath: string | null = null;

      for (let i = 0; i < audioChapters.length; i++) {
        const ch = audioChapters[i];
        const title = ch.title.trim() || `Chương ${i + 1}`;

        if (ch.dbId) {
          let audioPath = ch.existingAudioPath ?? null;
          if (ch.file) {
            audioPath = `books/${b.id}/chapters/${i + 1}-${Date.now()}-${ch.file.name}`;
            const up = await supabase.storage.from("audios").upload(audioPath, ch.file, { upsert: true });
            if (up.error) throw up.error;
          }
          if (!audioPath) continue;

          const { error: updErr } = await supabase
            .from("book_audio_chapters")
            .update({ title, sort_order: i, audio_path: audioPath })
            .eq("id", ch.dbId);
          if (updErr) throw updErr;
          if (!firstAudioPath) firstAudioPath = audioPath;
        } else {
          if (!ch.file) continue;
          const audioPath = `books/${b.id}/chapters/${i + 1}-${Date.now()}-${ch.file.name}`;
          const up = await supabase.storage.from("audios").upload(audioPath, ch.file, { upsert: true });
          if (up.error) throw up.error;

          const { error: insErr } = await supabase.from("book_audio_chapters").insert({
            book_id: b.id,
            sort_order: i,
            title,
            audio_path: audioPath,
          });
          if (insErr) throw insErr;
          if (!firstAudioPath) firstAudioPath = audioPath;
        }
      }

      let audioPath: string | null = b.audio_path;
      if (firstAudioPath) {
        audioPath = firstAudioPath;
      } else if (initialChapterIds.length > 0 && audioChapters.length === 0) {
        audioPath = null;
      }

      const bookPatch: Record<string, string | null> = {};
      if (cover) bookPatch.cover_path = coverPath;
      if (pdf) bookPatch.pdf_path = pdfPath;
      if (
        firstAudioPath ||
        cover ||
        pdf ||
        (initialChapterIds.length > 0 && audioChapters.length === 0)
      ) {
        if (firstAudioPath || (initialChapterIds.length > 0 && audioChapters.length === 0)) {
          bookPatch.audio_path = audioPath;
        }
      }

      if (Object.keys(bookPatch).length > 0) {
        const { error: bookErr } = await supabase.from("books").update(bookPatch).eq("id", b.id);
        if (bookErr) throw bookErr;
      }

      toast.success("Đã lưu thông tin và tệp đính kèm.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không lưu được");
    } finally {
      setLoading(false);
    }
  }

  const coverLabel = cover?.name ?? (b.cover_path ? `Đang có: ${fileLabel(b.cover_path)}` : "Chưa chọn file");
  const pdfLabel = pdf?.name ?? (b.pdf_path ? `Đang có: ${fileLabel(b.pdf_path)}` : "Chưa chọn file");

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tên sách</label>
          <input name="title" required defaultValue={b.title} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Tác giả</label>
          <input name="author" required defaultValue={b.author} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Thể loại</label>
          <input name="genre" defaultValue={b.genre ?? ""} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">NXB</label>
          <input name="publisher" defaultValue={b.publisher ?? ""} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Năm</label>
          <input name="published_year" defaultValue={b.published_year ?? ""} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Mô tả</label>
        <textarea name="description" defaultValue={b.description ?? ""} className="min-h-28 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm" />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-zinc-800">Tệp đính kèm</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Bìa sách</div>
            <p className="mt-1 text-xs text-emerald-700">JPG, PNG, WebP</p>
            <label className="mt-3 flex cursor-pointer flex-col gap-2">
              <span className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-within:ring-2 focus-within:ring-offset-2">
                {b.cover_path ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
              </span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
            </label>
            <p className="mt-2 truncate text-xs text-emerald-900/80" title={coverLabel}>
              {coverLabel}
            </p>
          </div>

          <div className="rounded-xl border-2 border-red-200 bg-red-50/80 p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-red-800">Đọc online</div>
            <p className="mt-1 text-xs text-red-700">Chỉ PDF</p>
            <label className="mt-3 flex cursor-pointer flex-col gap-2">
              <span className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-within:ring-2 focus-within:ring-offset-2">
                {b.pdf_path ? "Đổi file PDF" : "Chọn file PDF"}
              </span>
              <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => setPdf(e.target.files?.[0] ?? null)} />
            </label>
            <p className="mt-2 truncate text-xs text-red-900/80" title={pdfLabel}>
              {pdfLabel}
            </p>
          </div>

          <AudioChaptersField chapters={audioChapters} onChange={setAudioChapters} />
        </div>

        {b.audio_path && audioChapters.length === 0 ? (
          <p className="mt-3 text-xs text-violet-800">
            Sách đang có file audio đơn (cũ). Thêm chapter bên dưới để quản lý nhiều chương — file cũ sẽ được thay khi lưu chapter mới.
          </p>
        ) : null}
      </div>

      <button type="submit" disabled={loading} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}

/** @deprecated dùng AdminBookEditForm */
export function AdminBookMetadataForm(props: { book: Omit<Book, "cover_path" | "pdf_path" | "audio_path"> }) {
  return (
    <AdminBookEditForm
      book={{ ...props.book, cover_path: null, pdf_path: null, audio_path: null }}
      initialChapters={[]}
    />
  );
}

export function AdminDeleteBookButton(props: { bookId: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm(`Xóa vĩnh viễn sách «${props.title}»? Hành động không hoàn tác.`)) return;
    setLoading(true);
    try {
      await deleteBookAdminAction(props.bookId);
      toast.success("Đã xóa sách.");
      router.push("/admin/books");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không xóa được");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-900">Xóa vĩnh viễn sách và các dữ liệu liên quan (theo ràng buộc DB).</p>
      <button
        type="button"
        disabled={loading}
        onClick={onClick}
        className="mt-3 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60"
      >
        {loading ? "Đang xóa..." : "Xóa sách"}
      </button>
    </div>
  );
}
