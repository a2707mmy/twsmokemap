import type { LatLng } from './types';

/** Haversine 公式：回傳兩座標間的距離（公尺）。用於 demo 模式與前端排序。 */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000; // 地球半徑（公尺）
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 把公尺距離格式化為易讀字串（如 850 公尺 / 1.2 公里）。 */
export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} 公尺`;
  return `${(m / 1000).toFixed(1)} 公里`;
}

/**
 * 以步行時間呈現距離（一般步行約 80 公尺/分鐘 ≈ 4.8 km/h）。
 * 太遠（超過約 45 分鐘）則改顯示公里數。
 */
export function formatWalk(m: number): string {
  if (!Number.isFinite(m)) return '';
  if (m < 80) return '步行 1 分鐘內';
  const mins = Math.round(m / 80);
  if (mins <= 45) return `步行約 ${mins} 分鐘`;
  return `${(m / 1000).toFixed(1)} 公里`;
}
