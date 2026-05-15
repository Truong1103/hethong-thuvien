"use client";

import { Plus, Trash2, Upload } from "lucide-react";
import { useCallback } from "react";

export type AudioChapterDraft = {
  clientId: string;
  /** ID DB nếu chapter đã tồn tại (sửa sách) */
  dbId?: string;
  title: string;
  file: File | null;
  /** File audio hiện tại trên storage (sửa sách) */
  existingAudioPath?: string | null;
};

function basename(path: string) {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(i + 1) : path;
}

function newChapter(index: number): AudioChapterDraft {
  return {
    clientId: crypto.randomUUID(),
    title: `Chương ${index + 1}`,
    file: null,
  };
}

type Props = {
  chapters: AudioChapterDraft[];
  onChange: (chapters: AudioChapterDraft[]) => void;
};

export function AudioChaptersField({ chapters, onChange }: Props) {
  const addChapter = useCallback(() => {
    onChange([...chapters, newChapter(chapters.length)]);
  }, [chapters, onChange]);

  const removeChapter = useCallback(
    (clientId: string) => {
      onChange(chapters.filter((c) => c.clientId !== clientId));
    },
    [chapters, onChange],
  );

  const updateChapter = useCallback(
    (clientId: string, patch: Partial<AudioChapterDraft>) => {
      onChange(chapters.map((c) => (c.clientId === clientId ? { ...c, ...patch } : c)));
    },
    [chapters, onChange],
  );

  return (
    <div className="col-span-full rounded-xl border-2 border-violet-200 bg-violet-50/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-violet-800">Nghe sách</div>
          <p className="mt-1 text-xs text-violet-700">Mỗi chương một file âm thanh (MP3, M4A, OGG…)</p>
        </div>
        <button
          type="button"
          onClick={addChapter}
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm font-semibold text-violet-800 shadow-sm transition hover:bg-violet-100"
        >
          <Plus className="h-4 w-4" />
          Tạo chapter
        </button>
      </div>

      {chapters.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-violet-200 bg-white/60 px-3 py-4 text-center text-sm text-violet-800/80">
          Chưa có chapter. Nhấn <strong>Tạo chapter</strong> để thêm và upload file âm thanh cho từng chương.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {chapters.map((ch, index) => (
            <li
              key={ch.clientId}
              className="rounded-xl border border-violet-200/90 bg-white p-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={ch.title}
                  onChange={(e) => updateChapter(ch.clientId, { title: e.target.value })}
                  placeholder="Tên chapter"
                  className="min-w-0 flex-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
                />
                <button
                  type="button"
                  onClick={() => removeChapter(ch.clientId)}
                  className="rounded-md p-1.5 text-zinc-500 transition hover:bg-red-50 hover:text-red-600"
                  title="Xóa chapter"
                  aria-label={`Xóa ${ch.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <label className="mt-3 flex cursor-pointer flex-col gap-2">
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus-within:ring-2 focus-within:ring-violet-500 focus-within:ring-offset-2">
                  <Upload className="h-4 w-4" />
                  Chọn file âm thanh
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  onChange={(e) => updateChapter(ch.clientId, { file: e.target.files?.[0] ?? null })}
                />
              </label>
              <p
                className="mt-2 truncate text-xs text-violet-900/80"
                title={ch.file?.name ?? ch.existingAudioPath ?? undefined}
              >
                {ch.file
                  ? ch.file.name
                  : ch.existingAudioPath
                    ? `Đang có: ${basename(ch.existingAudioPath)}`
                    : "Chưa chọn file"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
