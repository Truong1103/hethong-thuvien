"use client";

import debounce from "lodash.debounce";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  endReadingSessionAction,
  saveAudioProgressAction,
  startReadingSessionAction,
} from "@/app/books/[id]/actions";

export type AudioChapterTrack = {
  id: string;
  title: string;
  src: string;
};

export function AudioPlayer(props: {
  bookId: string;
  chapters?: AudioChapterTrack[];
  src?: string;
  initialSeconds?: number;
  initialChapterId?: string | null;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [rate, setRate] = useState(1);

  const hasChapters = (props.chapters?.length ?? 0) > 0;
  const [activeChapterId, setActiveChapterId] = useState<string | null>(() => {
    if (hasChapters) {
      const match = props.chapters!.find((c) => c.id === props.initialChapterId);
      return match?.id ?? props.chapters![0].id;
    }
    return null;
  });

  const activeChapter = hasChapters
    ? props.chapters!.find((c) => c.id === activeChapterId) ?? props.chapters![0]
    : null;

  const src = activeChapter?.src ?? props.src ?? "";
  const initialSeconds = Math.max(0, props.initialSeconds ?? 0);

  const emitProgress = useMemo(
    () =>
      debounce((seconds: number, chapterId: string | null) => {
        void saveAudioProgressAction(props.bookId, Math.floor(seconds), chapterId);
      }, 1200),
    [props.bookId],
  );

  useEffect(() => () => emitProgress.cancel(), [emitProgress]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = rate;
  }, [rate, src]);

  useEffect(() => {
    const t0 = Date.now();
    let sessionId: string | null = null;
    const p = startReadingSessionAction(props.bookId).then((id) => {
      sessionId = id;
    });
    return () => {
      void p.then(() => {
        if (sessionId) {
          const secs = Math.max(1, Math.floor((Date.now() - t0) / 1000));
          void endReadingSessionAction(sessionId, null, secs);
        }
      });
    };
  }, [props.bookId]);

  function seek(delta: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, a.currentTime + delta);
    emitProgress(a.currentTime, activeChapter?.id ?? null);
  }

  function selectChapter(chapterId: string) {
    if (chapterId === activeChapterId) return;
    const a = audioRef.current;
    if (a) emitProgress(a.currentTime, activeChapter?.id ?? null);
    setActiveChapterId(chapterId);
  }

  return (
    <div className="space-y-3">
      {hasChapters ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Danh sách chapter</p>
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {props.chapters!.map((ch, index) => {
              const active = ch.id === activeChapterId;
              return (
                <li key={ch.id}>
                  <button
                    type="button"
                    onClick={() => selectChapter(ch.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                      active
                        ? "bg-violet-100 font-semibold text-violet-900"
                        : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                        active ? "bg-violet-600 text-white" : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="truncate">{ch.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3">
        <button
          type="button"
          onClick={() => seek(-10)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          -10s
        </button>
        <button
          type="button"
          onClick={() => seek(10)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          +10s
        </button>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-zinc-700">Tốc độ</label>
          <select
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="rounded-md border border-zinc-200 px-2 py-1 text-sm outline-none focus:border-zinc-400"
          >
            {[0.75, 1, 1.25, 1.5, 2].map((v) => (
              <option key={v} value={v}>
                {v}x
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        {activeChapter ? (
          <p className="mb-2 text-sm font-medium text-zinc-800">{activeChapter.title}</p>
        ) : null}
        <audio
          key={src}
          ref={audioRef}
          src={src}
          controls
          className="w-full"
          onLoadedMetadata={() => {
            const a = audioRef.current;
            if (!a) return;
            const isResumeChapter =
              !hasChapters || activeChapter?.id === props.initialChapterId || !props.initialChapterId;
            a.currentTime = isResumeChapter ? initialSeconds : 0;
          }}
          onTimeUpdate={() => {
            const a = audioRef.current;
            if (!a) return;
            emitProgress(a.currentTime, activeChapter?.id ?? null);
          }}
          onEnded={() => {
            if (!hasChapters || !props.chapters) return;
            const idx = props.chapters.findIndex((c) => c.id === activeChapterId);
            if (idx >= 0 && idx < props.chapters.length - 1) {
              selectChapter(props.chapters[idx + 1].id);
            }
          }}
        />
      </div>
    </div>
  );
}
