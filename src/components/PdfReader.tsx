"use client";

import {
  endReadingSessionAction,
  savePdfProgressAction,
  startReadingSessionAction,
} from "@/app/books/[id]/actions";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker qua CDN — `new URL(..., import.meta.url)` thường lỗi với Next/Turbopack, khiến PDF không tải.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfReader(props: {
  url: string;
  bookId: string;
  bookTitle?: string;
  initialPage?: number;
  /** Chiều cao vùng đọc (toolbar + PDF). Mặc định trừ navbar + padding main + tiêu đề gọn. */
  readerHeightClass?: string;
}) {
  const initialPage = Math.max(1, props.initialPage ?? 1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [page, setPage] = useState(initialPage);
  const [scale, setScale] = useState(1.1);
  const [rotate, setRotate] = useState(0);
  const [snippet, setSnippet] = useState("");
  const [explain, setExplain] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainErr, setExplainErr] = useState<string | null>(null);
  const [pdfLoadErr, setPdfLoadErr] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const readerHeight =
    props.readerHeightClass ?? "h-[calc(170dvh-9rem)] min-h-[360px] sm:h-[calc(170dvh-11rem)] sm:min-h-[380px]";

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  const pageRef = useRef(page);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, scale, rotate]);

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
          void endReadingSessionAction(sessionId, pageRef.current, secs);
        }
      });
    };
  }, [props.bookId]);

  const emitPageChange = useMemo(
    () =>
      debounce((p: number) => {
        void savePdfProgressAction(props.bookId, p);
      }, 800),
    [props],
  );

  useEffect(() => () => emitPageChange.cancel(), [emitPageChange]);

  const onDocumentLoadSuccess = useCallback(({ numPages: np }: { numPages: number }) => {
    setPdfLoadErr(null);
    setNumPages(np);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    const msg = err?.message?.trim() || "Lỗi không xác định";
    setPdfLoadErr(msg);
  }, []);

  function go(delta: number) {
    const max = numPages ?? page;
    const next = Math.min(max, Math.max(1, page + delta));
    setPage(next);
    emitPageChange(next);
  }

  async function runExplain() {
    setExplainErr(null);
    setExplainLoading(true);
    setExplain(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: snippet.trim(),
          bookTitle: props.bookTitle,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Lỗi");
      if (data.reply) setExplain(data.reply);
    } catch (e) {
      setExplainErr(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setExplainLoading(false);
    }
  }

  const toolBtn =
    "rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100";

  return (
    <div className={`flex flex-col gap-2 ${readerHeight}`}>
      {/* Thanh điều khiển: luôn cố định phía trên vùng đọc, không theo cuộn của trang PDF */}
      <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-zinc-200/90 bg-white/95 p-2 shadow-sm ring-1 ring-zinc-100 backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => go(-1)} className={toolBtn} aria-label="Trang trước">
            ← Trước
          </button>
          <button type="button" onClick={() => go(1)} className={toolBtn} aria-label="Trang sau">
            Sau →
          </button>
          <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-800 ring-1 ring-zinc-100">
            Trang <span className="font-semibold tabular-nums">{page}</span>
            {numPages ? <span className="text-zinc-500"> / {numPages}</span> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button type="button" onClick={() => setScale((s) => Math.max(0.6, Math.round((s - 0.1) * 10) / 10))} className={toolBtn}>
            −
          </button>
          <div className="min-w-[3.25rem] text-center text-sm font-medium tabular-nums text-zinc-700">{Math.round(scale * 100)}%</div>
          <button type="button" onClick={() => setScale((s) => Math.min(2.2, Math.round((s + 0.1) * 10) / 10))} className={toolBtn}>
            +
          </button>
          <button type="button" onClick={() => setRotate((r) => (r + 90) % 360)} className={toolBtn}>
            Xoay
          </button>
        </div>
      </div>

      {/* Chỉ khối PDF cuộn */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto rounded-xl border border-zinc-200/90 bg-zinc-50/50 p-2 sm:p-4"
      >
        {pdfLoadErr ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold">Không tải được PDF</p>
            <p className="mt-1 wrap-break-word font-mono text-xs opacity-90">{pdfLoadErr}</p>
            <p className="mt-2 text-xs text-red-900/90">Thử tải lại trang. Nếu vẫn lỗi, kiểm tra đã đăng nhập và file PDF trên Supabase Storage.</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <Document
              file={props.url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className="p-8 text-center text-sm text-zinc-600">Đang tải PDF...</div>}
            >
              <Page
                pageNumber={page}
                scale={scale}
                rotate={rotate}
                className="shadow-md ring-1 ring-zinc-200/80 [&_.react-pdf__Page__canvas]:mx-auto"
              />
            </Document>
          </div>
        )}
      </div>

      {/* AI: thu gọn mặc định để không đẩy PDF xuống */}
      <details className="group shrink-0 rounded-xl border border-violet-200/90 bg-violet-50/80 ring-1 ring-violet-100 open:bg-violet-50">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-semibold text-violet-950 sm:px-4 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            Giải thích đoạn (AI)
            <span className="text-xs font-normal text-violet-700 group-open:hidden">Mở</span>
            <span className="hidden text-xs font-normal text-violet-700 group-open:inline">Thu</span>
          </span>
        </summary>
        <div className="max-h-[min(40vh,320px)] overflow-y-auto border-t border-violet-200/80 px-3 pb-3 pt-2 sm:px-4">
          <p className="text-xs text-violet-800">
            Gõ hoặc dán đoạn cần giải thích (PDF trên web khó bôi đen toàn bộ).
          </p>
          <textarea
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
            className="mt-2 min-h-20 w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm"
            placeholder="Dán đoạn văn..."
          />
          <button
            type="button"
            disabled={explainLoading || snippet.trim().length < 5}
            onClick={runExplain}
            className="mt-2 rounded-lg bg-violet-700 px-3 py-2 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50"
          >
            {explainLoading ? "Đang giải thích..." : "Giải thích"}
          </button>
          {explainErr ? <p className="mt-2 text-xs text-red-700">{explainErr}</p> : null}
          {explain ? <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-violet-950">{explain}</p> : null}
        </div>
      </details>
    </div>
  );
}
