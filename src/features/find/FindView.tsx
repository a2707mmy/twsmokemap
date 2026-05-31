import { useEffect, useMemo, useState } from 'react';
import MapView from '../../components/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { fetchNearbyAreas } from '../../lib/data';
import { DEFAULT_RADIUS_M } from '../../lib/config';
import type { SmokingArea, SmokingAreaKind } from '../../lib/types';
import AreaList from './AreaList';
import AreaDetail from './AreaDetail';

const RADIUS_OPTIONS = [
  { value: 500, label: '500 公尺' },
  { value: 1000, label: '1 公里' },
  { value: 2000, label: '2 公里' },
  { value: 5000, label: '5 公里' },
];

export default function FindView() {
  const { center, status, locate } = useGeolocation();
  const [radius, setRadius] = useState(DEFAULT_RADIUS_M);
  const [areas, setAreas] = useState<SmokingArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 篩選
  const [kindFilter, setKindFilter] = useState<SmokingAreaKind | 'all'>('all');
  const [officialOnly, setOfficialOnly] = useState(false);

  // 進站自動定位一次
  useEffect(() => {
    locate();
  }, [locate]);

  // 中心或半徑變動時重新查詢
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchNearbyAreas(center, radius)
      .then((data) => active && setAreas(data))
      .catch(() => active && setAreas([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [center, radius]);

  const filtered = useMemo(
    () =>
      areas.filter(
        (a) =>
          (kindFilter === 'all' || a.kind === kindFilter) &&
          (!officialOnly || a.source === 'official'),
      ),
    [areas, kindFilter, officialOnly],
  );

  const selected = filtered.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex h-full flex-col sm:flex-row">
      {/* 側欄（桌機）/ 下半（手機） */}
      <aside className="order-2 flex min-h-0 flex-1 flex-col border-slate-200 sm:order-1 sm:w-96 sm:flex-none sm:border-r">
        {/* 控制列 */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
          <button
            onClick={locate}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            {status === 'locating' ? '定位中…' : '📍 我的位置'}
          </button>
          <label className="ml-auto text-xs text-slate-500">
            範圍
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="ml-1 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700"
            >
              {RADIUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* 篩選 */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-xs">
          <FilterChip active={kindFilter === 'all'} onClick={() => setKindFilter('all')}>
            全部
          </FilterChip>
          <FilterChip active={kindFilter === 'outdoor'} onClick={() => setKindFilter('outdoor')}>
            戶外
          </FilterChip>
          <FilterChip active={kindFilter === 'indoor'} onClick={() => setKindFilter('indoor')}>
            室內
          </FilterChip>
          <label className="ml-auto flex items-center gap-1 text-slate-500">
            <input
              type="checkbox"
              checked={officialOnly}
              onChange={(e) => setOfficialOnly(e.target.checked)}
              className="accent-brand-600"
            />
            只看官方
          </label>
        </div>

        {status === 'denied' && (
          <p className="bg-amber-50 px-3 py-2 text-xs text-amber-700">
            已關閉定位，改以台北市中心顯示。可點「我的位置」重新嘗試。
          </p>
        )}

        {/* 清單 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="px-4 pt-3 text-xs text-slate-400">
            找到 {filtered.length} 個吸菸區
          </p>
          <AreaList
            areas={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
          />
        </div>
      </aside>

      {/* 地圖 */}
      <div className="relative order-1 min-h-[40vh] flex-1 sm:order-2">
        <MapView
          center={center}
          areas={filtered}
          selectedId={selectedId}
          onSelectArea={setSelectedId}
        />
        {selected && <AreaDetail area={selected} onClose={() => setSelectedId(null)} />}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 font-medium transition ${
        active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}
