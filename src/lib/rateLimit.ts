// 簡易前端速率限制（localStorage）：降低短時間大量灌水。
// 注意：前端限制可被繞過，僅為第一層防護；正式環境應另在 Supabase 端加限制。

const KEY = 'twsmokemap_report_times';
const WINDOW_MS = 60 * 60 * 1000; // 1 小時
const MAX_IN_WINDOW = 5; // 每小時最多 5 筆

function readTimes(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

/** 是否還能再回報。 */
export function canReport(): boolean {
  const now = Date.now();
  const recent = readTimes().filter((t) => now - t < WINDOW_MS);
  return recent.length < MAX_IN_WINDOW;
}

/** 記錄一次回報。 */
export function recordReport(): void {
  const now = Date.now();
  const recent = readTimes().filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  try {
    localStorage.setItem(KEY, JSON.stringify(recent));
  } catch {
    /* ignore */
  }
}

export const RATE_LIMIT_INFO = { windowLabel: '1 小時', max: MAX_IN_WINDOW };
