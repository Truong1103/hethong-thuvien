/** Múi giờ VN — đồng bộ với /me/stats (chuỗi ngày đọc, huy hiệu). */

export function vnDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

export function todayVN(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

export function addDaysVN(dayStr: string, delta: number): string {
  const [y, m, d] = dayStr.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const next = new Date(utc + delta * 86400000);
  return next.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

function streakFromDaySet(days: Set<string>): number {
  let cur = todayVN();
  let n = 0;
  const max = 400;
  while (n < max && days.has(cur)) {
    n++;
    cur = addDaysVN(cur, -1);
  }
  return n;
}

/** Chuỗi ngày (VN) có ít nhất một phiên đọc/ghi nhận, tính liên tục từ hôm nay. */
export function readingStreakDays(sessionStartedAts: string[]): number {
  const daySet = new Set<string>();
  for (const iso of sessionStartedAts) daySet.add(vnDay(iso));
  return streakFromDaySet(daySet);
}

export type GamificationBadgeKey = "start" | "habit" | "motsach";

export type GamificationBadge = {
  key: GamificationBadgeKey;
  title: string;
  description: string;
  earned: boolean;
};

/** Khởi đầu = đã đánh dấu đọc xong ít nhất 1 cuốn (tủ sách). */
export function computeGamificationBadges(input: {
  finishedBookCount: number;
  sessionStartedAts: string[];
}): GamificationBadge[] {
  const streak = readingStreakDays(input.sessionStartedAts);
  const start = input.finishedBookCount >= 1;
  const habit = streak >= 7;
  const motsach = input.finishedBookCount >= 10;
  return [
    { key: "start", title: "Khởi đầu", description: "Đọc xong cuốn đầu tiên", earned: start },
    { key: "habit", title: "Thói quen tốt", description: "7 ngày đọc liên tiếp", earned: habit },
    { key: "motsach", title: "Mọt sách", description: "Hoàn thành 10 cuốn", earned: motsach },
  ];
}
