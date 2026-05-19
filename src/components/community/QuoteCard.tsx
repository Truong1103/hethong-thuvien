import { BookOpen, Calendar, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type QuoteCardProps = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  bookId: string;
  bookTitle: string;
  bookAuthor: string | null;
  coverUrl: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function QuoteCard(props: QuoteCardProps) {
  const initial = (props.userName?.trim()?.[0] ?? "?").toUpperCase();

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition hover:border-teal-200/70 hover:shadow-lg hover:shadow-teal-100/40 sm:flex-row">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-400 via-teal-500 to-emerald-500 opacity-80" />

      <div className="relative flex flex-1 flex-col p-5 pl-6 sm:p-6 sm:pl-7">
        <Quote
          className="pointer-events-none absolute right-3 top-3 h-10 w-10 text-teal-100 transition group-hover:text-teal-200/90 sm:h-12 sm:w-12"
          strokeWidth={1.25}
          aria-hidden
        />
        <p className="relative text-[11px] font-semibold uppercase tracking-wider text-teal-600/90">Trích dẫn</p>
        <blockquote className="relative mt-2 flex-1">
          <p className="font-serif text-base italic leading-relaxed text-zinc-800 sm:text-lg">&ldquo;{props.content}&rdquo;</p>
        </blockquote>

        <footer className="relative mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
          <Link
            href={`/u/${props.userId}`}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-50 py-1 pl-1 pr-2.5 font-medium text-zinc-700 ring-1 ring-zinc-100 transition hover:bg-teal-50 hover:text-teal-900 hover:ring-teal-100"
          >
            {props.userAvatar ? (
              <Image
                src={props.userAvatar}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-[10px] font-bold text-white">
                {initial}
              </span>
            )}
            <span className="max-w-[120px] truncate sm:max-w-[160px]">{props.userName}</span>
          </Link>
          <span className="hidden text-zinc-300 sm:inline" aria-hidden>
            •
          </span>
          <span className="inline-flex items-center gap-1 text-zinc-500">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <time dateTime={props.createdAt}>{formatDate(props.createdAt)}</time>
          </span>
        </footer>
      </div>

      <Link
        href={`/books/${props.bookId}`}
        className="flex shrink-0 flex-col border-t border-zinc-100 bg-gradient-to-br from-zinc-50/80 to-teal-50/30 p-4 transition hover:from-teal-50/50 hover:to-emerald-50/30 sm:w-36 sm:border-l sm:border-t-0 sm:p-4"
      >
        <div className="relative mx-auto aspect-[2/3] w-full max-w-[88px] overflow-hidden rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 shadow-md ring-1 ring-zinc-200/80 transition group-hover:ring-teal-200/80 sm:max-w-none">
          {props.coverUrl ? (
            <Image src={props.coverUrl} alt="" fill className="object-cover" sizes="88px" />
          ) : (
            <BookOpen className="absolute inset-0 m-auto h-8 w-8 text-zinc-400" strokeWidth={1.25} />
          )}
        </div>
        <p className="mt-3 line-clamp-2 text-center text-xs font-semibold leading-snug text-zinc-900 group-hover:text-teal-800">
          {props.bookTitle}
        </p>
        {props.bookAuthor ? (
          <p className="mt-0.5 line-clamp-1 text-center text-[11px] text-zinc-500">{props.bookAuthor}</p>
        ) : null}
        <span className="mt-2 inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-teal-700">
          <BookOpen className="h-3 w-3" />
          Xem sách
        </span>
      </Link>
    </article>
  );
}
