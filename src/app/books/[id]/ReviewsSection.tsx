"use client";

import { upsertReviewAction, voteReviewAction } from "@/app/books/[id]/actions";
import { btnPrimaryClass, inputClass } from "@/lib/ui";
import { MessageSquare, Star, ThumbsDown, ThumbsUp, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ReviewRow = {
  id: string;
  rating: number;
  content: string | null;
  created_at: string;
  user_id: string;
  profiles: { display_name: string | null } | null;
};

const voteBtn =
  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition";

export function ReviewsSection(props: {
  bookId: string;
  reviews: ReviewRow[];
  voteUp: Record<string, number>;
  voteDown: Record<string, number>;
  myVotes: Record<string, 1 | -1>;
  myUserId: string | null;
  myReview: { rating: number; content: string | null } | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(props.myReview?.rating ?? 5);
  const [content, setContent] = useState(props.myReview?.content ?? "");
  const [saving, setSaving] = useState(false);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertReviewAction(props.bookId, rating, content);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function vote(reviewId: string, next: 1 | -1 | 0) {
    await voteReviewAction(reviewId, next);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-amber-50/15 to-orange-50/10 p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-amber-100">
            <MessageSquare className="h-5 w-5 text-amber-600" strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">Đánh giá & cảm nhận</h2>
            <p className="mt-1 text-sm text-zinc-600">Chia sẻ điểm số và vài dòng cảm nhận; có thể cập nhật bất cứ lúc nào.</p>
          </div>
        </div>

        {props.myUserId ? (
          <form onSubmit={submitReview} className="mt-6 space-y-4">
            <div>
              <span className="text-sm font-medium text-zinc-700">Điểm của bạn</span>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`rounded-xl border-2 px-2.5 py-2 transition ${
                      rating === n
                        ? "border-amber-400 bg-amber-50 shadow-sm ring-2 ring-amber-200/60"
                        : "border-zinc-200 bg-white hover:border-amber-200 hover:bg-amber-50/50"
                    }`}
                    aria-label={`${n} sao`}
                  >
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: n }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-500" strokeWidth={0} />
                      ))}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-zinc-500">Đang chọn: {rating}/5</p>
            </div>
            <div>
              <label htmlFor="review-content" className="text-sm font-medium text-zinc-700">
                Cảm nhận (tuỳ chọn)
              </label>
              <textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Điều bạn thích, điểm nổi bật, đối tượng phù hợp…"
                rows={4}
                className={`${inputClass} mt-2 min-h-[120px]`}
              />
            </div>
            <button type="submit" disabled={saving} className={btnPrimaryClass}>
              {saving ? "Đang lưu..." : "Gửi / cập nhật đánh giá"}
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-amber-200/80 bg-white/60 px-4 py-5 text-center">
            <p className="text-sm text-zinc-700">Đăng nhập để gửi đánh giá và bình chọn.</p>
            <Link
              href={`/login?next=${encodeURIComponent(`/books/${props.bookId}`)}`}
              className="mt-3 inline-flex text-sm font-semibold text-teal-700 hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        )}
      </section>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Bình luận ({props.reviews.length})</h3>
        {props.reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-10 text-center text-sm text-zinc-600">
            Chưa có đánh giá nào — hãy là người đầu tiên.
          </div>
        ) : (
          props.reviews.map((r) => {
            const name = r.profiles?.display_name ?? "Thành viên";
            const up = props.voteUp[r.id] ?? 0;
            const down = props.voteDown[r.id] ?? 0;
            const mine = props.myVotes[r.id];
            return (
              <article
                key={r.id}
                className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition hover:border-teal-100 hover:shadow-md sm:p-5"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-600 ring-1 ring-zinc-200/80">
                    <User className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold text-zinc-900">{name}</span>
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-900 ring-1 ring-amber-100">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-500" strokeWidth={0} />
                        ))}
                        <span className="ml-0.5 tabular-nums">{r.rating}/5</span>
                      </span>
                    </div>
                    <time className="mt-0.5 block text-xs text-zinc-500" dateTime={r.created_at}>
                      {new Date(r.created_at).toLocaleString("vi-VN")}
                    </time>
                    {r.content ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{r.content}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {props.myUserId && props.myUserId !== r.user_id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => vote(r.id, mine === 1 ? 0 : 1)}
                            className={`${voteBtn} ${
                              mine === 1
                                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-emerald-200 hover:bg-emerald-50/50"
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            Hữu ích <span className="tabular-nums">({up})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => vote(r.id, mine === -1 ? 0 : -1)}
                            className={`${voteBtn} ${
                              mine === -1
                                ? "border-red-300 bg-red-50 text-red-900"
                                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-red-200 hover:bg-red-50/50"
                            }`}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            Không thích <span className="tabular-nums">({down})</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex gap-3 text-xs text-zinc-500">
                          <span className="inline-flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5" /> {up}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ThumbsDown className="h-3.5 w-3.5" /> {down}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
