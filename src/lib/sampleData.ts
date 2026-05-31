import type { SmellReport, SmokingArea } from './types';

/**
 * Demo 模式範例資料（台北市，示意座標）。
 * 尚未串接 Supabase 時，網站用這份資料展示與截圖。
 * 正式資料由 scripts/import-taipei.ts 從台北市開放資料匯入。
 */
export const SAMPLE_AREAS: SmokingArea[] = [
  {
    id: 'demo-1',
    name: '台北車站東三門外吸菸區',
    address: '台北市中正區忠孝西路一段',
    district: '中正區',
    lat: 25.0478,
    lng: 121.5173,
    kind: 'outdoor',
    source: 'official',
    status: 'approved',
    note: '車站外人行道指定區域',
    upvotes: 12,
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'demo-2',
    name: '市民廣場旁吸菸區',
    address: '台北市信義區市府路',
    district: '信義區',
    lat: 25.0367,
    lng: 121.5645,
    kind: 'outdoor',
    source: 'official',
    status: 'approved',
    note: null,
    upvotes: 8,
    created_at: '2026-01-12T00:00:00Z',
  },
  {
    id: 'demo-3',
    name: '大安森林公園東側',
    address: '台北市大安區新生南路二段',
    district: '大安區',
    lat: 25.0299,
    lng: 121.5354,
    kind: 'outdoor',
    source: 'user',
    status: 'approved',
    note: '使用者回報，待更多人驗證',
    upvotes: 3,
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'demo-4',
    name: '西門町徒步區指定吸菸點',
    address: '台北市萬華區漢中街',
    district: '萬華區',
    lat: 25.0421,
    lng: 121.5076,
    kind: 'outdoor',
    source: 'official',
    status: 'approved',
    note: null,
    upvotes: 15,
    created_at: '2026-01-20T00:00:00Z',
  },
];

export const SAMPLE_SMELL_REPORTS: SmellReport[] = [
  {
    id: 'sr-1',
    lat: 25.0455,
    lng: 121.5169,
    report_type: 2,
    time_slot: 'morning',
    note: null,
    created_at: '2026-05-20T00:00:00Z',
  },
  {
    id: 'sr-2',
    lat: 25.0461,
    lng: 121.5158,
    report_type: 1,
    time_slot: 'evening',
    note: null,
    created_at: '2026-05-22T00:00:00Z',
  },
  {
    id: 'sr-3',
    lat: 25.038,
    lng: 121.5648,
    report_type: 3,
    time_slot: 'noon',
    note: null,
    created_at: '2026-05-25T00:00:00Z',
  },
];
