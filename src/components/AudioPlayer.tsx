"use client";

import debounce from "lodash.debounce";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  endReadingSessionAction,
  saveAudioProgressAction,
  startReadingSessionAction,
} from "@/app/books/[id]/actions";

export function AudioPlayer(props: {
  src: string;
  bookId: string;
  initialSeconds?: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [rate, setRate] = useState(1);
  const initialSeconds = Math.max(0, props.initialSeconds ?? 0);

  const emitProgress = useMemo(
    () =>
      debounce((s: number) => {
        void saveAudioProgressAction(props.bookId, Math.floor(s));
      }, 1200),
    [props],
  );

  useEffect(() => () => emitProgress.cancel(), [emitProgress]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = rate;
  }, [rate]);

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
    emitProgress(a.currentTime);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3">
        <button
          onClick={() => seek(-10)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          -10s
        </button>
        <button
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
        <audio
          ref={audioRef}
          src={props.src}
          controls
          className="w-full"
          onLoadedMetadata={() => {
            const a = audioRef.current;
            if (!a) return;
            a.currentTime = initialSeconds;
          }}
          onTimeUpdate={() => {
            const a = audioRef.current;
            if (!a) return;
            emitProgress(a.currentTime);
          }}
        />
      </div>
    </div>
  );
}

