// 用前端的 anon/publishable 金鑰驗證資料與讀取路徑（RLS + RPC）
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const url = env.VITE_SUPABASE_URL;
const anon = env.VITE_SUPABASE_ANON_KEY;
console.log('URL:', url);
const sb = createClient(url, anon);

// 1) 總筆數
const { count, error: e1 } = await sb
  .from('smoking_areas')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'approved');
console.log('已核准吸菸區總數:', count, e1?.message ?? '');

// 2) 附近搜尋 RPC（台北市中心 2 公里）
const { data, error: e2 } = await sb.rpc('nearby_smoking_areas', {
  lat: 25.0375,
  lng: 121.5637,
  radius_m: 2000,
});
if (e2) console.log('RPC 錯誤:', e2.message);
else {
  console.log('台北市府 2km 內:', data.length, '筆');
  data.slice(0, 3).forEach((a) => console.log(`  - ${a.name}（${Math.round(a.distance_m)}m）`));
}
