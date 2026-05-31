import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = {};
for (const l of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = l.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const sb = createClient(env.SUPABASE_URL ?? env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await sb
  .from('smoking_areas')
  .delete()
  .eq('name', '測試新增點')
  .select('id');

if (error) {
  console.log('刪除失敗:', error.message);
  console.log('→ 請改在 Supabase SQL Editor 執行：');
  console.log("   delete from public.smoking_areas where name = '測試新增點';");
} else {
  console.log(`已刪除測試列：${data?.length ?? 0} 筆`);
}
