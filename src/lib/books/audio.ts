/** Sách có audio nếu có file đơn hoặc ít nhất một chapter. */
export function bookHasAudio(book: {
  audio_path: string | null;
  audio_chapter_count?: number | null;
}): boolean {
  if (book.audio_path) return true;
  return (book.audio_chapter_count ?? 0) > 0;
}
