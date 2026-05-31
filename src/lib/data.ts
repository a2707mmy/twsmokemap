import { HAS_SUPABASE } from './config';
import { distanceMeters } from './geo';
import { SAMPLE_AREAS, SAMPLE_SMELL_REPORTS } from './sampleData';
import { supabase } from './supabase';
import type {
  LatLng,
  ReportType,
  SmellReport,
  SmokingArea,
  SmokingAreaKind,
  TimeSlot,
} from './types';

// ── Demo 模式的記憶體資料（session 期間有效） ──────────────
const demoAreas: SmokingArea[] = [...SAMPLE_AREAS];
const demoReports: SmellReport[] = [...SAMPLE_SMELL_REPORTS];

// ── 吸菸區 ──────────────────────────────────────────────

/** 取得中心點附近、半徑內的吸菸區，依距離排序。 */
export async function fetchNearbyAreas(
  center: LatLng,
  radiusM: number,
): Promise<SmokingArea[]> {
  if (HAS_SUPABASE && supabase) {
    const { data, error } = await supabase.rpc('nearby_smoking_areas', {
      lat: center.lat,
      lng: center.lng,
      radius_m: radiusM,
    });
    if (error) throw error;
    return (data ?? []) as SmokingArea[];
  }

  // demo fallback：本地計算距離 + 過濾 + 排序
  return demoAreas
    .map((a) => ({ ...a, distance_m: distanceMeters(center, { lat: a.lat, lng: a.lng }) }))
    .filter((a) => (a.distance_m ?? Infinity) <= radiusM)
    .sort((a, b) => (a.distance_m ?? 0) - (b.distance_m ?? 0));
}

/**
 * 取得所有（已核准）吸菸區，並附上與 center 的距離（供清單排序）。
 * 重用 nearby RPC 搭配極大半徑，免額外 SQL；前端再依地圖視野過濾顯示。
 */
export async function fetchAllAreas(center: LatLng): Promise<SmokingArea[]> {
  return fetchNearbyAreas(center, 100000); // 100km，足以涵蓋全台北
}

export interface NewSmokingArea {
  name: string;
  address?: string;
  district?: string;
  lat: number;
  lng: number;
  kind: SmokingAreaKind;
  note?: string;
}

/** 新增使用者眾包吸菸區（寫入 pending，待審核）。 */
export async function addSmokingArea(input: NewSmokingArea): Promise<void> {
  if (HAS_SUPABASE && supabase) {
    const { error } = await supabase.from('smoking_areas').insert({
      name: input.name,
      address: input.address ?? null,
      district: input.district ?? null,
      // PostGIS：以 WKT 寫入點位
      location: `SRID=4326;POINT(${input.lng} ${input.lat})`,
      kind: input.kind,
      source: 'user',
      status: 'pending',
      note: input.note ?? null,
    });
    if (error) throw error;
    return;
  }

  // demo fallback
  demoAreas.push({
    id: `demo-${Date.now()}`,
    name: input.name,
    address: input.address ?? null,
    district: input.district ?? null,
    lat: input.lat,
    lng: input.lng,
    kind: input.kind,
    source: 'user',
    status: 'pending',
    note: input.note ?? null,
    upvotes: 0,
    created_at: new Date().toISOString(),
  });
}

// ── 煙味回報 ────────────────────────────────────────────

/** 取得所有煙味回報（用於熱區圖）。透過 RPC 取出 lat/lng（location 為 PostGIS 欄位）。 */
export async function fetchSmellReports(): Promise<SmellReport[]> {
  if (HAS_SUPABASE && supabase) {
    const { data, error } = await supabase.rpc('all_smell_reports');
    if (error) throw error;
    return (data ?? []) as SmellReport[];
  }
  return [...demoReports];
}

export interface NewSmellReport {
  lat: number;
  lng: number;
  report_type: ReportType;
  time_slot: TimeSlot;
  note?: string;
}

/** 新增煙味回報。 */
export async function addSmellReport(input: NewSmellReport): Promise<void> {
  if (HAS_SUPABASE && supabase) {
    const { error } = await supabase.from('smell_reports').insert({
      location: `SRID=4326;POINT(${input.lng} ${input.lat})`,
      report_type: input.report_type,
      time_slot: input.time_slot,
      note: input.note ?? null,
    });
    if (error) throw error;
    return;
  }

  demoReports.push({
    id: `sr-${Date.now()}`,
    lat: input.lat,
    lng: input.lng,
    report_type: input.report_type,
    time_slot: input.time_slot,
    note: input.note ?? null,
    created_at: new Date().toISOString(),
  });
}
