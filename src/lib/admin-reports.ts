import { addDaysVN, todayVN, vnDay } from "@/lib/badges";

export type SessionRow = {
  started_at: string;
  seconds_spent: number | null;
  user_id?: string | null;
  book_id?: string | null;
};

/** dayKeys: thứ tự thời gian tăng dần (cũ → mới). */
export function aggregateByVNCalendarDayAsc(
  sessions: SessionRow[],
  dayKeysChronoAsc: string[],
): { key: string; sessions: number; minutes: number }[] {
  const map = new Map<string, { sessions: number; minutes: number }>();
  for (const k of dayKeysChronoAsc) map.set(k, { sessions: 0, minutes: 0 });
  for (const s of sessions) {
    const k = vnDay(s.started_at);
    const cur = map.get(k);
    if (!cur) continue;
    cur.sessions += 1;
    cur.minutes += Math.round((s.seconds_spent ?? 0) / 60);
  }
  return dayKeysChronoAsc.map((key) => ({ key, sessions: map.get(key)!.sessions, minutes: map.get(key)!.minutes }));
}

export function lastNDaysVNKeysAscending(n: number): string[] {
  const end = todayVN();
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) keys.push(addDaysVN(end, -i));
  return keys;
}

export function lastNMonthsKeysVN(n: number): string[] {
  const [y, m] = todayVN().split("-").map(Number);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    let mm = m - i;
    let yy = y;
    while (mm <= 0) {
      mm += 12;
      yy -= 1;
    }
    out.push(`${yy}-${String(mm).padStart(2, "0")}`);
  }
  return out;
}

export function aggregateByMonth(sessions: SessionRow[], monthKeysChronoAsc: string[]): { key: string; sessions: number; minutes: number }[] {
  const map = new Map<string, { sessions: number; minutes: number }>();
  for (const k of monthKeysChronoAsc) map.set(k, { sessions: 0, minutes: 0 });
  for (const s of sessions) {
    const mk = vnDay(s.started_at).slice(0, 7);
    const cur = map.get(mk);
    if (!cur) continue;
    cur.sessions += 1;
    cur.minutes += Math.round((s.seconds_spent ?? 0) / 60);
  }
  return monthKeysChronoAsc.map((key) => ({ key, sessions: map.get(key)!.sessions, minutes: map.get(key)!.minutes }));
}

/** n tuần: tuần đầu = 7 ngày gần nhất, tuần sau = 7 ngày cũ hơn (theo lịch VN). */
export function aggregateRollingWeekBuckets(
  sessions: SessionRow[],
  nWeeks: number,
): { label: string; sessions: number; minutes: number }[] {
  const dayKeys = lastNDaysVNKeysAscending(nWeeks * 7);
  const daily = aggregateByVNCalendarDayAsc(sessions, dayKeys);
  const total = daily.length;
  const result: { label: string; sessions: number; minutes: number }[] = [];
  for (let w = 0; w < nWeeks; w++) {
    const start = total - (w + 1) * 7;
    const slice = daily.slice(start, start + 7);
    const sessionsC = slice.reduce((a, x) => a + x.sessions, 0);
    const minutesC = slice.reduce((a, x) => a + x.minutes, 0);
    const oldest = slice[0]?.key ?? "";
    const newest = slice[6]?.key ?? "";
    const label =
      w === 0 ? `7 ngày gần nhất (${oldest} → ${newest})` : `7 ngày trước đó (${oldest} → ${newest})`;
    result.push({ label, sessions: sessionsC, minutes: minutesC });
  }
  return result;
}

export function bucketProfileCreatedMonths(
  createdAts: string[],
  monthKeysChronoAsc: string[],
): { key: string; newMembers: number }[] {
  const map = new Map<string, number>();
  for (const k of monthKeysChronoAsc) map.set(k, 0);
  for (const iso of createdAts) {
    const mk = vnDay(iso).slice(0, 7);
    if (map.has(mk)) map.set(mk, (map.get(mk) ?? 0) + 1);
  }
  return monthKeysChronoAsc.map((key) => ({ key, newMembers: map.get(key) ?? 0 }));
}
