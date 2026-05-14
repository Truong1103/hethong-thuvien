import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export default async function AdminUserReadingPage(props: { params: Params }) {
  const { id } = await props.params;
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const { data: targetProfile } = await supabase.from("profiles").select("id, display_name").eq("id", id).maybeSingle();
  if (!targetProfile) return notFound();

  const { data: sessions } = await supabase
    .from("reading_sessions")
    .select(
      `
      id,
      started_at,
      ended_at,
      seconds_spent,
      last_pdf_page,
      books ( id, title, author )
    `,
    )
    .eq("user_id", id)
    .order("started_at", { ascending: false })
    .limit(200);

  type BookEmb = { id: string; title: string; author: string } | { id: string; title: string; author: string }[] | null;
  type Row = {
    id: string;
    started_at: string;
    ended_at: string | null;
    seconds_spent: number | null;
    last_pdf_page: number | null;
    books: BookEmb;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lịch sử đọc</h1>
          <p className="text-sm text-zinc-600">
            {targetProfile.display_name ?? "Thành viên"}{" "}
            <span className="font-mono text-xs text-zinc-400">({id.slice(0, 8)}…)</span>
          </p>
        </div>
        <Link href="/admin/users" className="text-sm text-zinc-700 hover:text-zinc-950">
          ← Danh sách thành viên
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-600">
            <tr>
              <th className="px-4 py-3">Sách</th>
              <th className="px-4 py-3">Bắt đầu</th>
              <th className="px-4 py-3">Phút</th>
              <th className="px-4 py-3">Trang PDF</th>
            </tr>
          </thead>
          <tbody>
            {(sessions as Row[] | null)?.map((row) => {
              const emb = row.books;
              const book = Array.isArray(emb) ? emb[0] : emb;
              const mins = row.seconds_spent != null ? Math.round(row.seconds_spent / 60) : "—";
              return (
                <tr key={row.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3">
                    {book ? (
                      <Link href={`/books/${book.id}`} className="font-medium text-teal-800 hover:underline">
                        {book.title}
                      </Link>
                    ) : (
                      "—"
                    )}
                    {book?.author ? <div className="text-xs text-zinc-500">{book.author}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 tabular-nums">
                    {new Date(row.started_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{mins}</td>
                  <td className="px-4 py-3 text-zinc-600">{row.last_pdf_page ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(sessions?.length ?? 0) === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-zinc-600">Chưa có phiên đọc nào.</div>
        ) : null}
      </div>
    </div>
  );
}
