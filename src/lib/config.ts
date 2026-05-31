// 環境變數與常數集中管理

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/** 台北市政府（市政大樓）作為定位失敗時的預設中心 */
export const TAIPEI_CENTER = { lat: 25.0375, lng: 121.5637 };

/** 附近搜尋預設半徑（公尺） */
export const DEFAULT_RADIUS_M = 1000;

/** 是否已設定 Supabase（未設定時走 demo 模式，使用內建範例資料） */
export const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** 是否已設定 Google Maps 金鑰 */
export const HAS_GOOGLE_MAPS = Boolean(GOOGLE_MAPS_API_KEY);
