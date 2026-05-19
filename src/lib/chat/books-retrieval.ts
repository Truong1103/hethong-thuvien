import type { SupabaseClient } from "@supabase/supabase-js";

export type ChatBookRow = {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  publisher: string | null;
  published_year: number | null;
  description: string | null;
  cover_path: string | null;
  view_count: number;
  rating_avg: number;
  rating_count: number;
};

const STOP_WORDS = new Set([
  "là",
  "có",
  "không",
  "gì",
  "nào",
  "cho",
  "với",
  "về",
  "của",
  "và",
  "hoặc",
  "một",
  "các",
  "những",
  "được",
  "bị",
  "đã",
  "sẽ",
  "này",
  "kia",
  "đó",
  "đây",
  "thì",
  "mà",
  "như",
  "khi",
  "nếu",
  "tôi",
  "mình",
  "bạn",
  "anh",
  "chị",
  "em",
  "ông",
  "bà",
  "the",
  "a",
  "an",
  "is",
  "are",
  "book",
  "sách",
  "gợi",
  "ý",
  "hay",
  "tốt",
  "nên",
  "đọc",
  "muốn",
  "cần",
  "hỏi",
  "giúp",
  "xin",
  "ạ",
  "nhé",
  "vui",
  "lòng",
]);

const BOOK_SELECT =
  "id,title,author,genre,publisher,published_year,description,cover_path,view_count,rating_avg,rating_count";

function escapeIlike(s: string) {
  return s.replace(/[%_\\]/g, "\\$&");
}

/** Tách từ khóa tiếng Việt / Latin để tra CSDL. */
export function extractSearchTerms(message: string): string[] {
  const normalized = message
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ");

  const raw = normalized.split(/\s+/).filter((w) => w.length > 1);
  const terms: string[] = [];
  const seen = new Set<string>();

  for (const w of raw) {
    if (STOP_WORDS.has(w) || seen.has(w)) continue;
    seen.add(w);
    terms.push(w);
  }

  // Cụm 2 từ liên tiếp (vd. "kỹ năng", "tâm lý")
  for (let i = 0; i < raw.length - 1; i++) {
    const a = raw[i];
    const b = raw[i + 1];
    if (STOP_WORDS.has(a) || STOP_WORDS.has(b)) continue;
    const phrase = `${a} ${b}`;
    if (!seen.has(phrase)) {
      seen.add(phrase);
      terms.push(phrase);
    }
  }

  return terms.slice(0, 10);
}

function orFilterForTerm(term: string) {
  const t = escapeIlike(term);
  return [
    `title.ilike.%${t}%`,
    `author.ilike.%${t}%`,
    `genre.ilike.%${t}%`,
    `publisher.ilike.%${t}%`,
    `description.ilike.%${t}%`,
  ].join(",");
}

function scoreBook(book: ChatBookRow, terms: string[]): number {
  if (terms.length === 0) return book.view_count + book.rating_avg * 10;
  const hay = [
    book.title,
    book.author,
    book.genre ?? "",
    book.publisher ?? "",
    (book.description ?? "").slice(0, 500),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (hay.includes(term)) score += term.includes(" ") ? 8 : 4;
    if (book.title.toLowerCase().includes(term)) score += 6;
    if (book.genre?.toLowerCase().includes(term)) score += 5;
  }
  score += Math.min(book.view_count / 100, 5);
  score += book.rating_avg * 2;
  return score;
}

/** Tra cứu sách trong kho phù hợp câu hỏi chat. */
export async function searchBooksForChat(
  supabase: SupabaseClient,
  message: string,
  limit = 40,
): Promise<ChatBookRow[]> {
  const terms = extractSearchTerms(message);
  const byId = new Map<string, ChatBookRow>();

  const addRows = (rows: ChatBookRow[] | null) => {
    for (const b of rows ?? []) {
      if (!byId.has(b.id)) byId.set(b.id, b);
    }
  };

  if (terms.length > 0) {
    for (const term of terms.slice(0, 6)) {
      const { data } = await supabase.from("books").select(BOOK_SELECT).or(orFilterForTerm(term)).limit(20);
      addRows(data as ChatBookRow[] | null);
    }
  }

  if (byId.size < 12) {
    const [{ data: popular }, { data: topRated }, { data: recent }] = await Promise.all([
      supabase.from("books").select(BOOK_SELECT).order("view_count", { ascending: false }).limit(15),
      supabase.from("books").select(BOOK_SELECT).order("rating_avg", { ascending: false }).limit(15),
      supabase.from("books").select(BOOK_SELECT).order("created_at", { ascending: false }).limit(15),
    ]);
    addRows(popular as ChatBookRow[] | null);
    addRows(topRated as ChatBookRow[] | null);
    addRows(recent as ChatBookRow[] | null);
  }

  const all = [...byId.values()];
  all.sort((a, b) => scoreBook(b, terms) - scoreBook(a, terms));
  return all.slice(0, limit);
}

export function formatCatalogForPrompt(books: ChatBookRow[]): string {
  if (books.length === 0) return "(Hiện chưa có sách nào trong kho dữ liệu.)";

  return books
    .map((b, i) => {
      const meta = [
        b.genre ? `thể loại: ${b.genre}` : null,
        b.publisher ? `NXB: ${b.publisher}` : null,
        b.published_year ? `năm ${b.published_year}` : null,
        b.rating_count > 0 ? `★${Number(b.rating_avg).toFixed(1)} (${b.rating_count})` : null,
        b.view_count > 0 ? `${b.view_count} lượt xem` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      const desc = b.description ? ` — ${String(b.description).replace(/\s+/g, " ").slice(0, 280)}` : "";

      return `${i + 1}. [ID:${b.id}] «${b.title}» — ${b.author}${meta ? ` (${meta})` : ""}${desc}`;
    })
    .join("\n");
}

export function pickTopSuggestions(books: ChatBookRow[], max = 6): ChatBookRow[] {
  return books.slice(0, max);
}
