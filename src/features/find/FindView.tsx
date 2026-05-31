import { useEffect, useMemo, useState } from 'react';
import MapView from '../../components/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { fetchAllAreas } from '../../lib/data';
import type { Bounds, SmokingArea, SmokingAreaKind } from '../../lib/types';
import AreaList from './AreaList';
import AreaDetail from './AreaDetail';

/** 某點是否落在地圖目前可視範圍內 */
function inBounds(a: SmokingArea, b: Bounds): boolean {
  return a.lat <= b.north && a.lat >= b.south && a.lng <= b.east && a.lng >= b.west;
}

export default function FindView() {
  const { center, status, message, locate } = useGeolocation();
  const [allAreas, setAllAreas] = useState<SmokingArea[]>([]);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false); // 手機底部清單是否展開

  // 篩選
  const [kindFilter, setKindFilter] = useState<SmokingAreaKind | 'all'>('all');
  const [officialOnly, setOfficialOnly] = useState(false);

  useEffect(() => {
    locate();
  }, [locate]);

  // 載入全部吸菸區（依距離排序）；之後由地圖視野決定顯示哪些
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAllAreas(center)
      .then((data) => active && setAllAreas(data))
      .catch(() => active && setAllAreas([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [center]);

  // 顯示：目前地圖視野內 + 套用篩選（視野未知前先全部顯示）
  const visible = useMemo(
    () =>
      allAreas.filter(
        (a) =>
          (!bounds || inBounds(a, bounds)) &&
          (kindFilter === 'all' || a.kind === kindFilter) &&
          (!officialOnly || a.source === 'official'),
      ),
    [allAreas, bounds, kindFilter, officialOnly],
  );

  const selected = visible.find((a) => a.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSheetOpen(false);
  };

  const panelProps = {
    status,
    message,
    locate,
    kindFilter,
    setKindFilter,
    officialOnly,
    setOfficialOnly,
    count: visible.length,
    areas: visible,
    selectedId,
    onSelect: handleSelect,
    loading,
  };

  return (
    <div className="relative flex h-full">
      {/* 桌機：左側欄 */}
      <aside className="hidden border-r border-slate-200 sm:flex sm:w-96 sm:flex-col">
        <AreaPanel {...panelProps} />
      </aside>

      {/* 地圖（手機填滿、桌機佔右側） */}
      <div className="relative flex-1">
        <MapView
          center={center}
          areas={visible}
          selectedId={selectedId}
          onSelectArea={handleSelect}
          onBoundsChange={setBounds}
        />

        {/* 手機：定位狀態提示（不論底部清單是否展開都看得到） */}
        {(status === 'locating' ||
          ((status === 'denied' || status === 'unavailable') && message)) && (
          <div className="absolute left-1/2 top-3 z-30 max-w-[64%] -translate-x-1/2 rounded-full bg-slate-900/85 px-4 py-2 text-center text-xs leading-snug text-white shadow-lg sm:hidden">
            {status === 'locating' ? '定位中,請允許瀏覽器存取位置…' : message}
          </div>
        )}

        {/* 手機：浮動「我的位置」按鈕（置右上，避開地圖縮放控制） */}
        <button
          onClick={locate}
          aria-label="定位我的位置"
          className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-lg ring-1 ring-slate-200 active:scale-95 disabled:opacity-60 sm:hidden"
          disabled={status === 'locating'}
        >
          {status === 'locating' ? '⏳' : '📍'}
        </button>

        {/* 詳情卡 */}
        {selected && <AreaDetail area={selected} onClose={() => setSelectedId(null)} />}

        {/* 手機：底部可展開清單（選到地點顯示詳情時隱藏） */}
        {!selected && (
          <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl sm:hidden">
            <button
              onClick={() => setSheetOpen((v) => !v)}
              className="flex w-full flex-col items-center gap-1 px-4 pt-2 pb-1"
              aria-expanded={sheetOpen}
            >
              <span className="h-1 w-10 rounded-full bg-slate-300" aria-hidden />
              <span className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">
                  畫面內吸菸區 · {visible.length} 個
                </span>
                <span
                  className={`text-slate-400 transition-transform ${sheetOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                >
                  ⌃
                </span>
              </span>
            </button>
            {sheetOpen && (
              <div className="flex max-h-[55vh] flex-col">
                <AreaPanel {...panelProps} hideCount />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 控制列 + 篩選 + 清單（桌機側欄與手機底部共用） ──────────────
interface AreaPanelProps {
  status: string;
  message: string | null;
  locate: () => void;
  kindFilter: SmokingAreaKind | 'all';
  setKindFilter: (k: SmokingAreaKind | 'all') => void;
  officialOnly: boolean;
  setOfficialOnly: (b: boolean) => void;
  count: number;
  areas: SmokingArea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  hideCount?: boolean;
}

function AreaPanel(p: AreaPanelProps) {
  return (
    <>
      {/* 控制列 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
        <button
          onClick={p.locate}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          {p.status === 'locating' ? '定位中…' : '📍 我的位置'}
        </button>
        <span className="ml-auto text-xs text-slate-400">移動地圖即可看不同區域</span>
      </div>

      {/* 篩選 */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-xs">
        <FilterChip active={p.kindFilter === 'all'} onClick={() => p.setKindFilter('all')}>
          全部
        </FilterChip>
        <FilterChip active={p.kindFilter === 'outdoor'} onClick={() => p.setKindFilter('outdoor')}>
          戶外
        </FilterChip>
        <FilterChip active={p.kindFilter === 'indoor'} onClick={() => p.setKindFilter('indoor')}>
          室內
        </FilterChip>
        <label className="ml-auto flex items-center gap-1 text-slate-500">
          <input
            type="checkbox"
            checked={p.officialOnly}
            onChange={(e) => p.setOfficialOnly(e.target.checked)}
            className="accent-brand-600"
          />
          只看官方
        </label>
      </div>

      {(p.status === 'denied' || p.status === 'unavailable') && p.message && (
        <p className="bg-amber-50 px-3 py-2 text-xs text-amber-700">{p.message}</p>
      )}

      {/* 清單 */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!p.hideCount && (
          <p className="px-4 pt-3 text-xs text-slate-400">畫面內 {p.count} 個吸菸區</p>
        )}
        <AreaList
          areas={p.areas}
          selectedId={p.selectedId}
          onSelect={p.onSelect}
          loading={p.loading}
        />
      </div>
    </>
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
