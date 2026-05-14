import { saveReadingGoalAction } from "@/app/me/goalActions";
import { BadgeCollection } from "@/components/BadgeCollection";
import { addDaysVN, computeGamificationBadges, readingStreakDays, todayVN, vnDay } from "@/lib/badges";
import { btnPrimaryInlineClass, inputClass } from "@/lib/ui";
import { requireUser } from "@/lib/auth";
import { ArrowLeft, Award, Flame, Timer } from "lucide-react";
import Link from "next/link";

export default async function StatsPage() {
  const { supabase, user } = await requireUser();
  const year = new Date().getFullYear();

  const [{ data: sessions }, { count: finishedCountRaw }, { data: goalRow }] = await Promise.all([
    supabase
      .from("reading_sessions")
      .select("started_at, ended_at, seconds_spent")
      .eq("user_id", user.id),
    supabase
      .from("user_bookshelves")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "finished"),
    supabase.from("reading_goals").select("target_books").eq("user_id", user.id).eq("year", year).maybeSingle(),
  ]);

  const secsList = (sessions ?? []).map((s) => s.seconds_spent ?? 0);
  const totalMinutesAll = Math.round(secsList.reduce((a, b) => a + b, 0) / 60);

  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startWeek = new Date(now);
  startWeek.setDate(startWeek.getDate() - 7);
  const startMonth = new Date(now);
  startMonth.setMonth(startMonth.getMonth() - 1);

  function sumRange(start: Date) {
    let sec = 0;
    for (const s of sessions ?? []) {
      const t = new Date(s.started_at);
      if (t >= start && s.seconds_spent) sec += s.seconds_spent;
    }
    return Math.round(sec / 60);
  }

  const minToday = sumRange(startToday);
  const minWeek = sumRange(startWeek);
  const minMonth = sumRange(startMonth);

  const startedAts = (sessions ?? []).map((s) => s.started_at);
  const streak = readingStreakDays(startedAts);

  const finishedCount = finishedCountRaw ?? 0;

  const target = goalRow?.target_books != null ? goalRow.target_books : 12;
  const pct = Math.min(100, Math.round((finishedCount / Math.max(1, target)) * 100));

  const behind =
    finishedCount < Math.ceil((new Date().getMonth() + 1) * (target / 12)) &&
    target > 0 &&
    finishedCount < target;

  const badges = computeGamificationBadges({
    finishedBookCount: finishedCount,
    sessionStartedAts: startedAts,
  });

  const last7: { label: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = addDaysVN(todayVN(), -i);
    let m = 0;
    for (const s of sessions ?? []) {
      if (vnDay(s.started_at) === day && s.seconds_spent) m += s.seconds_spent / 60;
    }
    last7.push({ label: day.slice(5), minutes: Math.round(m) });
  }
  const maxBar = Math.max(1, ...last7.map((x) => x.minutes));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">Thống kê</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Thói quen đọc của bạn</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
            Phút đọc và nghe được ghi từ phiên mở sách (PDF / Audio), theo múi giờ Việt Nam. Dùng biểu đồ 7 ngày để
            nhìn nhanh nhịp đọc gần đây.
          </p>
        </div>
        <Link
          href="/me"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-500" />
          Tài khoản
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-teal-50/80 to-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-teal-800/80">Hôm nay</div>
              <div className="mt-2 text-3xl font-bold tabular-nums text-zinc-900">{minToday}</div>
              <div className="mt-1 text-xs text-zinc-600">phút</div>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-teal-100">
              <Timer className="h-5 w-5 text-teal-600" strokeWidth={2} />
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-indigo-50/80 to-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-800/80">7 ngày</div>
              <div className="mt-2 text-3xl font-bold tabular-nums text-zinc-900">{minWeek}</div>
              <div className="mt-1 text-xs text-zinc-600">phút</div>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-indigo-100">
              <Flame className="h-5 w-5 text-indigo-600" strokeWidth={2} />
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-violet-50/80 to-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-violet-800/80">30 ngày</div>
              <div className="mt-2 text-3xl font-bold tabular-nums text-zinc-900">{minMonth}</div>
              <div className="mt-1 text-xs text-zinc-600">phút</div>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-violet-100">
              <Award className="h-5 w-5 text-violet-600" strokeWidth={2} />
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-zinc-900">Biểu đồ 7 ngày (phút)</h2>
        <p className="mt-1 text-xs text-zinc-500">Chiều cao cột tỷ lệ với ngày có nhiều phút nhất trong tuần.</p>
        <div className="mt-6 flex h-44 items-end gap-2 sm:h-48">
          {last7.map((d) => (
            <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full max-w-[3rem] rounded-t-lg bg-gradient-to-t from-teal-700 to-emerald-500 transition hover:opacity-90"
                style={{ height: `${(d.minutes / maxBar) * 100}%`, minHeight: d.minutes > 0 ? "6px" : "0" }}
                title={`${d.minutes} phút`}
              />
              <span className="text-[10px] font-medium text-zinc-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Tổng quan</h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-700">
            <li className="flex justify-between gap-4 border-b border-zinc-50 pb-2">
              <span className="text-zinc-600">Tổng phút (mọi thời gian)</span>
              <span className="font-semibold tabular-nums text-zinc-900">{totalMinutesAll}</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-zinc-50 pb-2">
              <span className="text-zinc-600">Sách đã đọc xong</span>
              <span className="font-semibold tabular-nums text-zinc-900">{finishedCount}</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-zinc-600">Chuỗi ngày đọc 🔥</span>
              <span className="font-semibold tabular-nums text-teal-800">{streak} ngày</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-zinc-500">Chuỗi tính theo Asia/Ho_Chi_Minh (có ít nhất một phiên trong ngày).</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-emerald-50/40 to-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Mục tiêu năm {year}</h2>
          <p className="mt-1 text-xs text-zinc-600">Số cuốn muốn đánh dấu &quot;đã đọc xong&quot; trong năm.</p>
          <form action={saveReadingGoalAction} className="mt-5 space-y-4">
            <input type="hidden" name="year" value={year} readOnly />
            <label className="block text-sm font-medium text-zinc-700">
              Số cuốn mục tiêu
              <input
                name="targetBooks"
                type="number"
                min={1}
                defaultValue={target}
                className={`${inputClass} mt-2`}
              />
            </label>
            <button type="submit" className={btnPrimaryInlineClass}>
              Lưu mục tiêu
            </button>
          </form>
          <div className="mt-6">
            <div className="flex justify-between text-sm text-zinc-600">
              <span>Tiến độ</span>
              <span className="font-semibold tabular-nums text-zinc-900">
                {finishedCount}/{target} ({pct}%)
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-zinc-200/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            {behind ? (
              <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Bạn đang chậm hơn tiến độ gợi ý theo tháng — cố lên nhé.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-8">
        <BadgeCollection badges={badges} variant="full" />
      </div>
    </div>
  );
}
