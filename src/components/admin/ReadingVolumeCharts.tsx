type Row = { label: string; sessions: number; minutes: number; detail?: string };

function shortDayAxis(key: string) {
  const p = key.split("-");
  if (p.length === 3) return `${p[2]}/${p[1]}`;
  return key;
}

function shortMonthAxis(key: string) {
  const [y, m] = key.split("-");
  if (!m) return key;
  return `${m}/${y?.slice(2) ?? ""}`;
}

function sumRows(rows: Row[]) {
  return rows.reduce(
    (a, r) => ({ sessions: a.sessions + r.sessions, minutes: a.minutes + r.minutes }),
    { sessions: 0, minutes: 0 },
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap gap-4 rounded-lg border border-zinc-200 bg-zinc-50/90 px-3 py-2 text-xs text-zinc-700">
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 shrink-0 rounded-sm bg-gradient-to-br from-teal-600 to-emerald-500" aria-hidden />
        <span>
          <strong className="text-zinc-900">Phiên đọc</strong> — số lần ghi nhận phiên mở sách (PDF / nghe), đơn vị:{" "}
          <span className="font-mono font-semibold">phiên</span>
        </span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 shrink-0 rounded-sm bg-gradient-to-br from-violet-600 to-indigo-500" aria-hidden />
        <span>
          <strong className="text-zinc-900">Thời lượng</strong> — tổng phút từ các phiên (seconds_spent), đơn vị:{" "}
          <span className="font-mono font-semibold">phút</span>
        </span>
      </span>
    </div>
  );
}

function DataTable(props: { rows: Row[]; axisShort: (label: string) => string; periodLabel: string }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full min-w-[280px] text-left text-xs">
        <caption className="border-b border-zinc-100 bg-zinc-50 px-3 py-2 text-left font-medium text-zinc-800">
          Bảng số liệu — {props.periodLabel}
        </caption>
        <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-3 py-2">Kỳ</th>
            <th className="px-3 py-2 text-right">Phiên</th>
            <th className="px-3 py-2 text-right">Phút</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((r) => (
            <tr key={r.label} className="border-b border-zinc-100 last:border-0">
              <td className="max-w-[min(100%,20rem)] px-3 py-1.5 align-top">
                <div className="font-mono text-sm font-semibold text-zinc-900">{props.axisShort(r.label)}</div>
                {r.detail ? <div className="mt-0.5 text-[10px] leading-snug text-zinc-500">{r.detail}</div> : null}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums text-zinc-900">{r.sessions}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-zinc-900">{r.minutes}</td>
            </tr>
          ))}
          {(() => {
            const t = sumRows(props.rows);
            return (
              <tr className="bg-teal-50/50 font-semibold">
                <td className="px-3 py-2 text-zinc-900">Tổng</td>
                <td className="px-3 py-2 text-right tabular-nums text-teal-900">{t.sessions}</td>
                <td className="px-3 py-2 text-right tabular-nums text-indigo-900">{t.minutes}</td>
              </tr>
            );
          })()}
        </tbody>
      </table>
    </div>
  );
}

function BarColumn(props: {
  value: number;
  max: number;
  barClass: string;
  fullTitle: string;
  axis: string;
  unit: string;
}) {
  const pct = props.max > 0 ? Math.min(100, Math.round((props.value / props.max) * 100)) : 0;
  const compactNum = props.value >= 10_000;
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5" title={`${props.fullTitle}: ${props.value} ${props.unit}`}>
      <span className="min-h-[2.25rem] w-full px-0.5 text-center">
        <span
          className={`inline-block max-w-full break-words rounded bg-zinc-100 px-1 py-0.5 font-mono font-bold tabular-nums leading-tight text-zinc-900 ${
            compactNum ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-[11px]"
          }`}
        >
          {props.value}
        </span>
        <span className="mt-0.5 block text-[8px] font-medium uppercase tracking-wide text-zinc-500">{props.unit}</span>
      </span>
      <div className="flex h-36 w-full max-w-11 flex-col justify-end sm:h-44">
        <div
          className={`mx-auto w-[88%] rounded-t-md ${props.barClass} shadow-sm transition hover:opacity-90`}
          style={{ height: `${pct}%`, minHeight: props.value > 0 ? "8px" : "0" }}
        />
      </div>
      <span className="max-w-full truncate px-0.5 text-center text-[9px] font-medium tabular-nums text-zinc-600 sm:text-[10px]">
        {props.axis}
      </span>
    </div>
  );
}

function ScaleHintSessions(props: { max: number }) {
  return (
    <p className="mt-2 text-[11px] text-zinc-500">
      Chiều cao cột <strong>phiên</strong> tỉ lệ với giá trị lớn nhất trong khối này:{" "}
      <strong className="tabular-nums text-zinc-800">{props.max}</strong> phiên.
    </p>
  );
}

function ScaleHintMinutes(props: { max: number }) {
  return (
    <p className="mt-2 text-[11px] text-zinc-500">
      Chiều cao cột <strong>phút</strong> tỉ lệ với giá trị lớn nhất trong khối này:{" "}
      <strong className="tabular-nums text-zinc-800">{props.max}</strong> phút.
    </p>
  );
}

/** Hai biểu đồ cột + bảng số: phiên và phút theo cùng trục thời gian. */
export function ReadingVolumeDualCharts(props: {
  rows: Row[];
  axisShort: (label: string) => string;
  periodTitle: string;
  periodDescription: string;
  sessionBarClass?: string;
  minuteBarClass?: string;
}) {
  const maxS = Math.max(1, ...props.rows.map((r) => r.sessions));
  const maxM = Math.max(1, ...props.rows.map((r) => r.minutes));
  const totals = sumRows(props.rows);
  const sessionBar = props.sessionBarClass ?? "bg-gradient-to-t from-teal-700 to-emerald-500";
  const minuteBar = props.minuteBarClass ?? "bg-gradient-to-t from-violet-700 to-indigo-400";

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-zinc-700">{props.periodDescription}</p>
      <Legend />
      <p className="text-xs text-zinc-600">
        <strong className="text-zinc-900">Tổng trong khối:</strong>{" "}
        <span className="tabular-nums font-semibold text-teal-800">{totals.sessions}</span> phiên ·{" "}
        <span className="tabular-nums font-semibold text-indigo-800">{totals.minutes}</span> phút
      </p>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800/90">Biểu đồ 1 — Số phiên đọc theo {props.periodTitle}</p>
        <ScaleHintSessions max={maxS} />
        <div
          className="mt-2 flex items-end divide-x divide-zinc-100 gap-0.5 border-b-2 border-zinc-300 bg-zinc-50/40 px-0.5 pb-0.5 sm:gap-1"
          role="img"
          aria-label={`Phiên đọc theo ${props.periodTitle}`}
        >
          {props.rows.map((row) => (
            <BarColumn
              key={`s-${row.label}`}
              value={row.sessions}
              max={maxS}
              barClass={sessionBar}
              fullTitle={`${row.label} (phiên)`}
              axis={props.axisShort(row.label)}
              unit="phiên"
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800/90">Biểu đồ 2 — Tổng phút đọc-nghe theo {props.periodTitle}</p>
        <p className="text-[11px] text-zinc-500">Cùng các kỳ như biểu đồ 1; đơn vị phút (làm tròn từ giây).</p>
        <ScaleHintMinutes max={maxM} />
        <div
          className="mt-2 flex items-end divide-x divide-zinc-100 gap-0.5 border-b-2 border-zinc-300 bg-zinc-50/40 px-0.5 pb-0.5 sm:gap-1"
          role="img"
          aria-label={`Phút đọc theo ${props.periodTitle}`}
        >
          {props.rows.map((row) => (
            <BarColumn
              key={`m-${row.label}`}
              value={row.minutes}
              max={maxM}
              barClass={minuteBar}
              fullTitle={`${row.label} (phút)`}
              axis={props.axisShort(row.label)}
              unit="phút"
            />
          ))}
        </div>
      </div>

      <DataTable rows={props.rows} axisShort={props.axisShort} periodLabel={props.periodTitle} />
    </div>
  );
}

export function dayAxisLabel(key: string) {
  return shortDayAxis(key);
}

export function monthAxisLabel(key: string) {
  return shortMonthAxis(key);
}

export function ReadingVolumeWeekCharts(props: { rows: Row[] }) {
  const chrono = [...props.rows].reverse();
  const maxS = Math.max(1, ...chrono.map((r) => r.sessions));
  const maxM = Math.max(1, ...chrono.map((r) => r.minutes));
  const totals = sumRows(chrono);
  const sessionBar = "bg-gradient-to-t from-teal-700 to-emerald-500";
  const minuteBar = "bg-gradient-to-t from-violet-700 to-indigo-400";

  const tableRows: Row[] = chrono.map((r, i) => ({
    label: `T${i + 1}`,
    detail: r.label,
    sessions: r.sessions,
    minutes: r.minutes,
  }));

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-zinc-700">
        Mỗi cột là <strong>một khối 7 ngày liên tiếp</strong> (lịch Việt Nam).{" "}
        <strong>T1</strong> là khối cũ nhất trong 8 khối, <strong>T{chrono.length}</strong> là 7 ngày gần nhất. Hai chỉ
        số: số phiên đọc được ghi nhận, và tổng phút đọc-nghe trong khối đó.
      </p>
      <Legend />
      <p className="text-xs text-zinc-600">
        <strong className="text-zinc-900">Tổng 8 khối:</strong>{" "}
        <span className="tabular-nums font-semibold text-teal-800">{totals.sessions}</span> phiên ·{" "}
        <span className="tabular-nums font-semibold text-indigo-800">{totals.minutes}</span> phút
      </p>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800/90">Biểu đồ 1 — Phiên / khối 7 ngày</p>
        <ScaleHintSessions max={maxS} />
        <div className="mt-2 flex items-end divide-x divide-zinc-100 gap-1 border-b-2 border-zinc-300 bg-zinc-50/40 px-0.5 pb-0.5 sm:gap-1.5" role="img" aria-label="Phiên theo tuần">
          {chrono.map((row, i) => (
            <BarColumn
              key={`ws-${row.label}`}
              value={row.sessions}
              max={maxS}
              barClass={sessionBar}
              fullTitle={row.label}
              axis={`T${i + 1}`}
              unit="phiên"
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800/90">Biểu đồ 2 — Phút / khối 7 ngày</p>
        <ScaleHintMinutes max={maxM} />
        <div className="mt-2 flex items-end divide-x divide-zinc-100 gap-1 border-b-2 border-zinc-300 bg-zinc-50/40 px-0.5 pb-0.5 sm:gap-1.5" role="img" aria-label="Phút theo tuần">
          {chrono.map((row, i) => (
            <BarColumn
              key={`wm-${row.label}`}
              value={row.minutes}
              max={maxM}
              barClass={minuteBar}
              fullTitle={row.label}
              axis={`T${i + 1}`}
              unit="phút"
            />
          ))}
        </div>
      </div>

      <DataTable rows={tableRows} axisShort={(l) => l} periodLabel="tuần (8 khối)" />
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 text-[11px] text-zinc-600">
        <p className="font-semibold text-zinc-800">Diễn giải nhanh</p>
        <p className="mt-1">
          Số trên mỗi cột là giá trị thực (phiên hoặc phút). Cột cao nhất = kỳ có số lớn nhất trong 8 khối. Chi tiết
          khoảng ngày của từng khối xem ở bảng cột <strong>Kỳ</strong> phía trên.
        </p>
      </div>
    </div>
  );
}
