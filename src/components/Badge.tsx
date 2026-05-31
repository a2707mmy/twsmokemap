import type { DataSource, SmokingAreaKind } from '../lib/types';

export function SourceBadge({ source }: { source: DataSource }) {
  if (source === 'official') {
    return (
      <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
        ✓ 官方資料
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
      待驗證 · 使用者提供
    </span>
  );
}

export function KindBadge({ kind }: { kind: SmokingAreaKind }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      {kind === 'indoor' ? '室內' : '戶外'}
    </span>
  );
}
