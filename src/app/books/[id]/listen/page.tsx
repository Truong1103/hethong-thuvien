import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AudioPlayer, type AudioChapterTrack } from "@/components/AudioPlayer";

type Params = Promise<{ id: string }>;

export default async function ListenBookPage(props: { params: Params }) {
  const { id } = await props.params;
  const { supabase } = await requireUser();

  const [{ data: book }, { data: progress }, { data: chapters }] = await Promise.all([
    supabase.from("books").select("id,title,audio_path").eq("id", id).maybeSingle(),
    supabase
      .from("user_book_progress")
      .select("audio_position_seconds,audio_chapter_id")
      .eq("book_id", id)
      .maybeSingle(),
    supabase
      .from("book_audio_chapters")
      .select("id,title,audio_path,sort_order")
      .eq("book_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!book) return notFound();

  const chapterList = chapters ?? [];
  const hasChapters = chapterList.length > 0;
  const hasLegacyAudio = !!book.audio_path;

  if (!hasChapters && !hasLegacyAudio) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="text-lg font-semibold">Chưa có Audio</div>
          <p className="mt-1 text-sm text-zinc-600">Sách này chưa được đính kèm file audio.</p>
          <Link href={`/books/${book.id}`} className="mt-4 inline-block text-sm text-zinc-700 hover:text-zinc-950">
            ← Quay lại
          </Link>
        </div>
      </div>
    );
  }

  let tracks: AudioChapterTrack[] | undefined;
  let legacySrc: string | undefined;

  if (hasChapters) {
    const signed = await Promise.all(
      chapterList.map(async (ch) => {
        const url = await supabase.storage.from("audios").createSignedUrl(ch.audio_path, 60 * 30);
        return {
          id: ch.id,
          title: ch.title,
          src: url.data?.signedUrl ?? "",
          error: url.error?.message,
        };
      }),
    );

    const failed = signed.find((s) => !s.src);
    if (failed) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          Không tạo được link audio: {failed.error ?? "unknown"}
        </div>
      );
    }

    tracks = signed.map(({ id: chapterId, title, src }) => ({ id: chapterId, title, src }));
  } else {
    const signed = await supabase.storage.from("audios").createSignedUrl(book.audio_path!, 60 * 30);
    if (signed.error || !signed.data?.signedUrl) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          Không tạo được link audio: {signed.error?.message ?? "unknown"}
        </div>
      );
    }
    legacySrc = signed.data.signedUrl;
  }

  const initialSeconds = progress?.audio_position_seconds ?? 0;
  const initialChapterId = progress?.audio_chapter_id ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-600">Đang nghe</div>
          <h1 className="text-xl font-semibold tracking-tight">{book.title}</h1>
          {hasChapters ? (
            <p className="mt-1 text-xs text-zinc-500">{chapterList.length} chapter</p>
          ) : null}
        </div>
        <Link href={`/books/${book.id}`} className="text-sm text-zinc-700 hover:text-zinc-950">
          ← Chi tiết
        </Link>
      </div>

      <AudioPlayer
        bookId={book.id}
        chapters={tracks}
        src={legacySrc}
        initialSeconds={initialSeconds}
        initialChapterId={initialChapterId}
      />
    </div>
  );
}
