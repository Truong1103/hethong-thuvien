"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function incrementBookViewsAction(bookId: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.rpc("increment_book_views", { p_book_id: bookId });
}

export async function savePdfProgressAction(bookId: string, page: number | null) {
  const { supabase, user } = await requireUser();
  await supabase.from("user_book_progress").upsert(
    {
      user_id: user.id,
      book_id: bookId,
      pdf_page: page,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,book_id" },
  );
}

export async function saveAudioProgressAction(bookId: string, seconds: number | null) {
  const { supabase, user } = await requireUser();
  await supabase.from("user_book_progress").upsert(
    {
      user_id: user.id,
      book_id: bookId,
      audio_position_seconds: seconds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,book_id" },
  );
}

export async function startReadingSessionAction(bookId: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("reading_sessions")
    .insert({
      user_id: user.id,
      book_id: bookId,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function endReadingSessionAction(
  sessionId: string,
  lastPdfPage: number | null,
  secondsSpent: number,
) {
  const { supabase, user } = await requireUser();
  const ended = new Date().toISOString();
  await supabase
    .from("reading_sessions")
    .update({
      ended_at: ended,
      seconds_spent: Math.max(0, secondsSpent),
      last_pdf_page: lastPdfPage,
    })
    .eq("id", sessionId)
    .eq("user_id", user.id);
}

export type BookshelfStatus = "reading" | "finished" | "wishlist";

async function bumpChallengeProgressOnFinished(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
) {
  const nowIso = new Date().toISOString();
  const { data: challenges } = await supabase
    .from("reading_challenges")
    .select("id, target_books")
    .lte("starts_at", nowIso)
    .gte("ends_at", nowIso);

  for (const c of challenges ?? []) {
    const { data: part } = await supabase
      .from("challenge_participants")
      .select("books_completed")
      .eq("challenge_id", c.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!part) continue;
    const cur = part.books_completed ?? 0;
    const cap = Math.max(1, c.target_books ?? 1);
    const next = Math.min(cap, cur + 1);
    await supabase
      .from("challenge_participants")
      .update({ books_completed: next })
      .eq("challenge_id", c.id)
      .eq("user_id", userId);
  }
}

export async function setShelfStatusAction(bookId: string, status: BookshelfStatus | null) {
  const { supabase, user } = await requireUser();

  let wasFinished = false;
  if (status === "finished") {
    const { data: prev } = await supabase
      .from("user_bookshelves")
      .select("status")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle();
    wasFinished = prev?.status === "finished";
  }

  if (status === null) {
    await supabase.from("user_bookshelves").delete().eq("user_id", user.id).eq("book_id", bookId);
  } else {
    await supabase.from("user_bookshelves").upsert(
      {
        user_id: user.id,
        book_id: bookId,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,book_id" },
    );
    if (status === "finished" && !wasFinished) {
      await bumpChallengeProgressOnFinished(supabase, user.id);
    }
  }
  revalidatePath(`/books/${bookId}`);
  revalidatePath("/me/shelf");
  revalidatePath("/community/challenges");
}

export async function upsertReviewAction(bookId: string, rating: number, content: string | null) {
  const { supabase, user } = await requireUser();
  if (rating < 1 || rating > 5) throw new Error("Điểm không hợp lệ");
  await supabase.from("book_reviews").upsert(
    {
      book_id: bookId,
      user_id: user.id,
      rating,
      content: content?.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "book_id,user_id" },
  );
  revalidatePath(`/books/${bookId}`);
}

export async function voteReviewAction(reviewId: string, vote: 1 | -1 | 0) {
  const { supabase, user } = await requireUser();
  if (vote === 0) {
    await supabase.from("review_votes").delete().eq("review_id", reviewId).eq("user_id", user.id);
  } else {
    await supabase.from("review_votes").upsert(
      { review_id: reviewId, user_id: user.id, vote },
      { onConflict: "review_id,user_id" },
    );
  }
}

export async function addPublicQuoteAction(bookId: string, content: string) {
  const { supabase, user } = await requireUser();
  const t = content.trim();
  if (t.length < 3) throw new Error("Trích dẫn quá ngắn");
  const { error } = await supabase.from("book_quotes").insert({
    user_id: user.id,
    book_id: bookId,
    content: t,
    is_public: true,
  });
  if (error) throw error;
  revalidatePath(`/books/${bookId}`);
  revalidatePath("/community/quotes");
}
