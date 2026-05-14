import { BookOpen, CheckCircle2, Flame, Library } from "lucide-react";
import type { GamificationBadge, GamificationBadgeKey } from "@/lib/badges";

const BADGE_ICONS: Record<GamificationBadgeKey, typeof BookOpen> = {
  start: BookOpen,
  habit: Flame,
  motsach: Library,
};

type Props = {
  badges: GamificationBadge[];
  variant?: "profile" | "full";
};

export function BadgeCollection(props: Props) {
  const compact = props.variant === "profile";

  return (
    <section className={compact ? "mt-4" : ""} aria-labelledby="badges-heading">
      <div className="flex items-center gap-2">
        <span
          id="badges-heading"
          className={`font-semibold tracking-tight text-zinc-900 ${compact ? "text-sm" : "text-lg"}`}
        >
          Huy hiệu
        </span>
      </div>
      <p className={`mt-1 text-zinc-500 ${compact ? "text-[11px] leading-snug" : "text-xs"}`}>
        Đạt điều kiện để mở khóa — hiển thị trên hồ sơ công khai khi bạn bật thống kê.
      </p>

      <ul
        className={`mt-4 grid gap-3 ${compact ? "sm:grid-cols-3" : "sm:grid-cols-1 lg:grid-cols-3"}`}
        aria-label="Bộ sưu tập huy hiệu"
      >
        {props.badges.map((b) => {
          const Icon = BADGE_ICONS[b.key];
          return (
            <li
              key={b.key}
              className={`relative overflow-hidden rounded-2xl border transition-shadow ${
                b.earned
                  ? "border-amber-200/90 bg-gradient-to-br from-amber-50 via-white to-orange-50/60 shadow-sm ring-1 ring-amber-100/80"
                  : "border-zinc-200/90 bg-zinc-50/80 text-zinc-600"
              }`}
            >
              <div className={`flex gap-3 p-4 ${compact ? "flex-col sm:flex-row sm:items-start" : "items-start"}`}>
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    b.earned ? "bg-amber-100 text-amber-800 shadow-inner" : "bg-white text-zinc-400 ring-1 ring-zinc-200/80"
                  }`}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`font-semibold text-zinc-900 ${compact ? "text-sm" : "text-base"}`}>{b.title}</h3>
                    {b.earned ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
                        <CheckCircle2 className="h-3 w-3" aria-hidden />
                        Đã đạt
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                        Chưa đạt
                      </span>
                    )}
                  </div>
                  <p className={`mt-1.5 leading-snug text-zinc-600 ${compact ? "text-[11px]" : "text-sm"}`}>
                    {b.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
