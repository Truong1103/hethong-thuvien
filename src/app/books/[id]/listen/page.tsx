import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AudioPlayer } from "@/components/AudioPlayer";

type Params = Promise<{ id: string }>;

export default async function ListenBookPage(props: { params: Params }) {
  const { id } = await props.params;
  const { supabase } = await requireUser();

  const [{ data: book }, { data: progress }] = await Promise.all([
    supabase.from("books").select("id,title,audio_path").eq("id", id).maybeSingle(),
    supabase.from("user_book_progress").select("audio_position_seconds").eq("book_id", id).maybeSingle(),
  ]);

  if (!book) return notFound();
  if (!book.audio_path) {
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

  const signed = await supabase.storage.from("audios").createSignedUrl(book.audio_path, 60 * 30);
  if (signed.error || !signed.data?.signedUrl) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        Không tạo được link audio: {signed.error?.message ?? "unknown"}
      </div>
    );
  }

  const initialSeconds = progress?.audio_position_seconds ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-600">Đang nghe</div>
          <h1 className="text-xl font-semibold tracking-tight">{book.title}</h1>
        </div>
        <Link href={`/books/${book.id}`} className="text-sm text-zinc-700 hover:text-zinc-950">
          ← Chi tiết
        </Link>
      </div>

      <AudioPlayer src={signed.data.signedUrl} bookId={book.id} initialSeconds={initialSeconds} />
    </div>
  );
}

