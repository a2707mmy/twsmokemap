import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = {};
for (const l of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = l.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const { count } = await sb
  .from('smoking_areas')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'approved');
console.log('全部已核准吸菸點：', count);

const center = { lat: 25.0375, lng: 121.5637 }; // 台北市政府
for (const r of [500, 1000, 2000, 5000, 10000, 30000]) {
  const { data } = await sb.rpc('nearby_smoking_areas', { lat: center.lat, lng: center.lng, radius_m: r });
  console.log(`市政府 ${r >= 1000 ? r / 1000 + 'km' : r + 'm'} 內：`, data?.length ?? 0, '個');
}

// 各行政區分布
const { data: all } = await sb.from('smoking_areas').select('district').eq('status', 'approved');
const byDist = {};
for (const a of all ?? []) byDist[a.district ?? '未填'] = (byDist[a.district ?? '未填'] || 0) + 1;
console.log('各行政區：', Object.entries(byDist).sort((a, b) => b[1] - a[1]).map(([d, n]) => `${d}:${n}`).join('  '));
