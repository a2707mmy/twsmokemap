import { useEffect, useRef } from 'react';
import { APIProvider, AdvancedMarker, Map, Pin, useMap } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_API_KEY, HAS_GOOGLE_MAPS } from '../lib/config';
import type { Bounds, LatLng, SmellReport, SmokingArea } from '../lib/types';

export interface MapViewProps {
  center: LatLng;
  areas: SmokingArea[];
  selectedId?: string | null;
  onSelectArea?: (id: string) => void;
  smellReports?: SmellReport[];
  /** 回報模式：點地圖選位置 */
  pickedPoint?: LatLng | null;
  onPick?: (p: LatLng) => void;
  /** 地圖視野（縮放/拖曳）改變時回報目前可視邊界 */
  onBoundsChange?: (b: Bounds) => void;
  /** 每次成功定位遞增；變動時地圖強制平移＋拉近到 center */
  recenterKey?: number;
}

const AREA_COLORS = {
  officialBg: '#0b7575',
  crowdBg: '#d97706',
  glyph: '#ffffff',
};

/** 過濾掉座標無效（NaN/undefined）的項目，避免地圖標記崩潰 */
const hasValidCoords = <T extends { lat: number; lng: number }>(x: T) =>
  Number.isFinite(x.lat) && Number.isFinite(x.lng);

/** 對外的地圖元件：有金鑰用 Google Maps，否則用示意地圖。 */
export default function MapView(props: MapViewProps) {
  return HAS_GOOGLE_MAPS ? <GoogleMapView {...props} /> : <SchematicMap {...props} />;
}

// 每次成功定位（recenterKey 遞增）就把地圖平移＋拉近到使用者位置，
// 即使座標與上次相同（手動拖開後再按定位）也會回到所在位置。
function MapController({ center, recenterKey }: { center: LatLng; recenterKey?: number }) {
  const map = useMap();
  const centerRef = useRef(center);
  centerRef.current = center;
  const lastKey = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!map || recenterKey == null || recenterKey === 0) return;
    if (recenterKey !== lastKey.current) {
      lastKey.current = recenterKey;
      map.panTo(centerRef.current);
      map.setZoom(16);
    }
  }, [map, recenterKey]);
  return null;
}

// ── Google Maps ────────────────────────────────────────────
function GoogleMapView({
  center,
  areas,
  selectedId,
  onSelectArea,
  smellReports,
  pickedPoint,
  onPick,
  onBoundsChange,
  recenterKey,
}: MapViewProps) {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        className="h-full w-full"
        defaultCenter={center}
        defaultZoom={15}
        gestureHandling="greedy"
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        mapId="twsmokemap"
        onClick={(e) => {
          const ll = e.detail.latLng;
          if (ll && onPick) onPick({ lat: ll.lat, lng: ll.lng });
        }}
        onIdle={(e) => {
          if (!onBoundsChange) return;
          const b = e.map.getBounds();
          if (!b) return;
          const ne = b.getNorthEast();
          const sw = b.getSouthWest();
          onBoundsChange({ north: ne.lat(), east: ne.lng(), south: sw.lat(), west: sw.lng() });
        }}
      >
        <MapController center={center} recenterKey={recenterKey} />
        {/* 使用者位置 */}
        <AdvancedMarker position={center} title="你的位置">
          <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow" />
        </AdvancedMarker>

        {/* 煙味回報（紅點，半透明） */}
        {smellReports?.filter(hasValidCoords).map((r) => (
          <AdvancedMarker key={r.id} position={{ lat: r.lat, lng: r.lng }}>
            <div className="h-3 w-3 rounded-full bg-smell/60 ring-2 ring-smell/30" />
          </AdvancedMarker>
        ))}

        {/* 吸菸區 */}
        {areas.filter(hasValidCoords).map((a) => (
          <AdvancedMarker
            key={a.id}
            position={{ lat: a.lat, lng: a.lng }}
            onClick={() => onSelectArea?.(a.id)}
          >
            <Pin
              background={a.source === 'official' ? AREA_COLORS.officialBg : AREA_COLORS.crowdBg}
              borderColor="#ffffff"
              glyphColor={AREA_COLORS.glyph}
              scale={selectedId === a.id ? 1.4 : 1}
            />
          </AdvancedMarker>
        ))}

        {/* 回報選取的點 */}
        {pickedPoint && (
          <AdvancedMarker position={pickedPoint}>
            <Pin background="#dc2626" borderColor="#ffffff" glyphColor="#fff" />
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
}

// ── 示意地圖（無金鑰時的 fallback） ─────────────────────────
const SPAN = 0.02; // 顯示範圍（約 ±2 公里）

function project(p: LatLng, center: LatLng) {
  // 將經緯度投影到 0–100% 的方框座標（北上、東右）
  const x = 50 + ((p.lng - center.lng) / SPAN) * 50;
  const y = 50 - ((p.lat - center.lat) / SPAN) * 50;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
}

function SchematicMap({
  center,
  areas,
  selectedId,
  onSelectArea,
  smellReports,
  pickedPoint,
  onPick,
}: MapViewProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[linear-gradient(0deg,#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] bg-slate-100"
      onClick={(e) => {
        if (!onPick) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        onPick({
          lat: center.lat + ((50 - py) / 50) * SPAN,
          lng: center.lng + ((px - 50) / 50) * SPAN,
        });
      }}
    >
      <div className="pointer-events-none absolute left-2 top-2 rounded bg-white/80 px-2 py-1 text-[11px] text-slate-500">
        示意地圖（設定 Google Maps 金鑰後顯示實際地圖）
      </div>

      {/* 煙味回報 */}
      {smellReports?.filter(hasValidCoords).map((r) => {
        const { x, y } = project({ lat: r.lat, lng: r.lng }, center);
        return (
          <span
            key={r.id}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-smell/50 ring-2 ring-smell/20"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        );
      })}

      {/* 使用者位置 */}
      <span
        className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 shadow"
        style={{ left: '50%', top: '50%' }}
        title="你的位置"
      />

      {/* 吸菸區標記 */}
      {areas.filter(hasValidCoords).map((a) => {
        const { x, y } = project({ lat: a.lat, lng: a.lng }, center);
        const selected = selectedId === a.id;
        return (
          <button
            key={a.id}
            onClick={(e) => { e.stopPropagation(); onSelectArea?.(a.id); }}
            className={`absolute -translate-x-1/2 -translate-y-full transition ${selected ? 'z-10 scale-125' : ''}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            title={a.name}
          >
            <svg width="26" height="34" viewBox="0 0 26 34" aria-hidden>
              <path
                d="M13 0C5.8 0 0 5.8 0 13c0 9 13 21 13 21s13-12 13-21C26 5.8 20.2 0 13 0z"
                fill={a.source === 'official' ? '#0b7575' : '#d97706'}
                stroke="#fff"
                strokeWidth="2"
              />
              <circle cx="13" cy="13" r="4.5" fill="#fff" />
            </svg>
          </button>
        );
      })}

      {/* 回報選取的點 */}
      {pickedPoint && (() => {
        const { x, y } = project(pickedPoint, center);
        return (
          <span
            className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border-2 border-white bg-smell shadow"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        );
      })()}
    </div>
  );
}
