import { formatWalk } from '../../lib/geo';
import type { SmokingArea } from '../../lib/types';
import { SourceBadge } from '../../components/Badge';

interface Props {
  areas: SmokingArea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

export default function AreaList({ areas, selectedId, onSelect, loading }: Props) {
  if (loading) {
    return (
      <ul className="space-y-2 p-3" aria-busy>
        {[0, 1, 2].map((i) => (
          <li key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </ul>
    );
  }

  if (areas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-sm text-slate-500">
        <span className="text-3xl" aria-hidden>🔍</span>
        <p>這個範圍內找不到吸菸區。</p>
        <p className="text-xs">試著擴大搜尋半徑，或在地圖上換個區域。</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {areas.map((a) => (
        <li key={a.id}>
          <button
            onClick={() => onSelect(a.id)}
            className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-slate-50 ${
              selectedId === a.id ? 'bg-brand-50' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-slate-900">{a.name}</span>
              {typeof a.distance_m === 'number' && (
                <span className="shrink-0 text-sm font-medium text-brand-600">
                  {formatWalk(a.distance_m)}
                </span>
              )}
            </div>
            {a.address && <span className="text-sm text-slate-500">{a.address}</span>}
            <div className="mt-0.5 flex flex-wrap gap-1.5">
              <SourceBadge source={a.source} />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
