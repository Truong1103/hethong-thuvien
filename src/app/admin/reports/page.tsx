import Link from "next/link";
import { redirect } from "next/navigation";
import {
  dayAxisLabel,
  monthAxisLabel,
  ReadingVolumeDualCharts,
  ReadingVolumeWeekCharts,
} from "@/components/admin/ReadingVolumeCharts";
import {
  aggregateByMonth,
  aggregateByVNCalendarDayAsc,
  aggregateRollingWeekBuckets,
  bucketProfileCreatedMonths,
  lastNDaysVNKeysAscending,
  lastNMonthsKeysVN,
  type SessionRow,
} from "@/lib/admin-reports";
import { requireUser } from "@/lib/auth";

export default async function AdminReportsPage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");

  const since = new Date();
  since.setDate(since.getDate() - 180);
  const sinceIso = since.toISOString();

  const growthStart = new Date();
  growthStart.setMonth(growthStart.getMonth() - 14);

  const [{ data: sessions }, { data: popularBooks }, { data: profilesRecent }] = await Promise.all([
    supabase
      .from("reading_sessions")
      .select("started_at, seconds_spent, user_id, book_id")
      .gte("started_at", sinceIso)
      .limit(12000),
    supabase.from("books").select("id, title, author, view_count").order("view_count", { ascending: false }).limit(12),
    supabase.from("profiles").select("created_at").gte("created_at", growthStart.toISOString()),
  ]);

  const sess = (sessions ?? []) as SessionRow[];

  const dayKeys14 = lastNDaysVNKeysAscending(14);
  const byDay = aggregateByVNCalendarDayAsc(sess, dayKeys14);

  const byWeek = aggregateRollingWeekBuckets(sess, 8);

  const monthKeys6 = lastNMonthsKeysVN(6);
  const byMonth = aggregateByMonth(sess, monthKeys6);

  const userAgg = new Map<string, { minutes: number; sessions: number }>();
  for (const s of sess) {
    const uid = s.user_id;
    if (!uid) continue;
    if (!userAgg.has(uid)) userAgg.set(uid, { minutes: 0, sessions: 0 });
    const u = userAgg.get(uid)!;
    u.sessions += 1;
    u.minutes += Math.round((s.seconds_spent ?? 0) / 60);
  }
  const topUserIds = [...userAgg.entries()]
    .sort((a, b) => b[1].minutes - a[1].minutes)
    .slice(0, 12)
    .map(([uid]) => uid);
  const { data: topProfiles } =
    topUserIds.length > 0
      ? await supabase.from("profiles").select("id, display_name").in("id", topUserIds)
      : { data: [] as { id: string; display_name: string | null }[] };
  const nameById = Object.fromEntries((topProfiles ?? []).map((p) => [p.id, p.display_name ?? "—"]));

  const growthMonths = lastNMonthsKeysVN(12);
  const createdAts = (profilesRecent ?? []).map((p) => p.created_at as string);
  const growth = bucketProfileCreatedMonths(createdAts, growthMonths);
  const maxGrowth = Math.max(1, ...growth.map((g) => g.newMembers));

  const weekRows = byWeek.map((w) => ({ label: w.label, sessions: w.sessions, minutes: w.minutes }));
  const dayRows = byDay.map((d) => ({
    label: d.key,
    detail: `Ngày ${d.key} (VN)`,
    sessions: d.sessions,
    minutes: d.minutes,
  }));
  const monthRows = byMonth.map((d) => ({
    label: d.key,
    detail: `Tháng ${d.key}`,
    sessions: d.sessions,
    minutes: d.minutes,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Thống kê &amp; báo cáo</h1>
          <p className="text-sm text-zinc-600">
            Phiên đọc trong ~180 ngày gần nhất; biểu đồ cột theo ngày / tuần / tháng (múi giờ VN). Tăng trưởng thành
            viên theo tháng đăng ký.
          </p>
        </div>
        <Link href="/admin/books" className="text-sm text-zinc-700 hover:text-zinc-950">
          ← Admin sách
        </Link>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Tổng lượt đọc — biểu đồ &amp; số liệu</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700">
          Dữ liệu lấy từ bảng <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">reading_sessions</code> trong
          khoảng <strong>~180 ngày</strong> gần nhất (tối đa 12.000 bản ghi). Mỗi biểu đồ có{" "}
          <strong>hai chỉ số</strong>: số phiên (mỗi lần ghi nhận một phiên) và tổng phút (từ trường thời lượng). Trục
          thời gian theo <strong>Asia/Ho_Chi_Minh</strong>.
        </p>

        <div className="mt-8 space-y-12">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">Theo ngày — 14 ngày liên tiếp</h3>
            <ReadingVolumeDualCharts
              rows={dayRows}
              axisShort={dayAxisLabel}
              periodTitle="ngày (14 mốc)"
              periodDescription="Mỗi cột là một ngày dương lịch (VN). Trục dưới dạng ngày/tháng. Số trên cột là giá trị đếm được của ngày đó."
            />
          </div>

          <div className="border-t border-zinc-100 pt-10">
            <h3 className="text-base font-semibold text-zinc-900">Theo tuần — 8 khối, mỗi khối 7 ngày</h3>
            <ReadingVolumeWeekCharts rows={weekRows} />
          </div>

          <div className="border-t border-zinc-100 pt-10">
            <h3 className="text-base font-semibold text-zinc-900">Theo tháng — 6 tháng dương lịch</h3>
            <ReadingVolumeDualCharts
              rows={monthRows}
              axisShort={monthAxisLabel}
              periodTitle="tháng (6 mốc)"
              periodDescription="Mỗi cột gộp mọi phiên có ngày bắt đầu thuộc tháng đó (theo lịch VN). Trục dạng tháng/năm (2 số cuối năm)."
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Sách phổ biến (lượt xem)</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {(popularBooks ?? []).map((b, i) => (
              <li key={b.id} className="flex items-center justify-between gap-2 border-b border-zinc-50 pb-2 last:border-0">
                <span className="min-w-0">
                  <span className="text-zinc-400">{i + 1}. </span>
                  <Link href={`/books/${b.id}`} className="font-medium text-teal-800 hover:underline">
                    {b.title}
                  </Link>
                  <span className="block truncate text-xs text-zinc-500">{b.author}</span>
                </span>
                <span className="shrink-0 tabular-nums text-zinc-700">{b.view_count ?? 0}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Người dùng tích cực (180 ngày)</h2>
          <p className="mt-1 text-xs text-zinc-500">Xếp theo tổng phút đọc/ghi nhận.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {[...userAgg.entries()]
              .sort((a, b) => b[1].minutes - a[1].minutes)
              .slice(0, 12)
              .map(([uid, agg], i) => (
                <li key={uid} className="flex items-center justify-between gap-2 border-b border-zinc-50 pb-2 last:border-0">
                  <span className="min-w-0">
                    <span className="text-zinc-400">{i + 1}. </span>
                    <Link href={`/admin/users/${uid}/reading`} className="font-medium text-indigo-800 hover:underline">
                      {nameById[uid] ?? uid.slice(0, 8)}
                    </Link>
                    <span className="block text-xs text-zinc-500">{agg.sessions} phiên</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-zinc-700">{agg.minutes} phút</span>
                </li>
              ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Tăng trưởng thành viên (theo tháng đăng ký)</h2>
        <p className="mt-1 text-xs text-zinc-500">Đếm số hồ sơ có ngày tạo (created_at) trong từng tháng — 12 tháng gần nhất.</p>
        <div className="mt-6 flex h-52 items-end gap-2 sm:h-56">
          {growth.map((g) => (
            <div key={g.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-indigo-700 to-violet-500"
                style={{ height: `${(g.newMembers / maxGrowth) * 100}%`, minHeight: g.newMembers > 0 ? "8px" : "0" }}
                title={`${g.newMembers} thành viên`}
              />
              <span className="text-[10px] font-medium text-zinc-500">{g.key.slice(2)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
