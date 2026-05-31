/**
 * 匯入「臺北市指定吸菸區」開放資料到 Supabase。
 *
 * 用法：
 *   1. 在 .env 設定 SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY
 *      （service role key 在 Supabase → Project Settings → API；
 *        匯入 official+approved 資料需繞過 RLS，故用 service role，切勿外洩）
 *   2. npm run import:taipei
 *
 * 資料來源：https://data.gov.tw/dataset/177504
 * 政府資料開放授權條款第 1 版。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const CSV_URL =
  'https://data.taipei/api/dataset/8b2fcdeb-d14b-46c4-92d8-66ad07b96a91/resource/acaa0f43-3b92-4241-b5eb-3f7fdd76b74f/download';

// ── 讀取 .env（Node 不會自動載入） ──────────────────────────
function loadEnv() {
  try {
    const text = readFileSync('.env', 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* 沒有 .env 也沒關係，改用系統環境變數 */
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    '✗ 缺少環境變數。請在 .env 設定 SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY。',
  );
  process.exit(1);
}

// ── 簡易 CSV 解析（處理引號內逗號與換行） ───────────────────
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* skip */ }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

async function main() {
  console.log('↓ 下載台北市指定吸菸區資料…');
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`下載失敗：HTTP ${res.status}`);
  const csv = (await res.text()).replace(/^﻿/, ''); // 去除 BOM

  const rows = parseCsv(csv);
  const header = rows[0];
  const idx = (name: string) => header.findIndex((h) => h.trim() === name);
  const iDistrict = idx('行政區');
  const iName = idx('地點');
  const iAddress = idx('地址');
  const iKind = idx('樣態');
  const iHours = idx('開放時間');
  const iLat = idx('緯度');
  const iLng = idx('經度');
  const iRel = idx('相對位置');

  const records = rows
    .slice(1)
    .filter((r) => r[iLat] && r[iLng])
    .map((r) => {
      const lat = parseFloat(r[iLat]);
      const lng = parseFloat(r[iLng]);
      const noteParts = [r[iHours], r[iRel]].filter((x) => x && x.trim());
      return {
        name: (r[iName] || '吸菸區').trim(),
        address: (r[iAddress] || '').trim() || null,
        district: (r[iDistrict] || '').trim() || null,
        lat,
        lng,
        location: `SRID=4326;POINT(${lng} ${lat})`,
        kind: (r[iKind] || '').includes('室內') ? 'indoor' : 'outdoor',
        source: 'official' as const,
        status: 'approved' as const,
        note: noteParts.join('｜') || null,
      };
    })
    .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));

  console.log(`✓ 解析到 ${records.length} 筆有效資料`);

  // ── 一律產生 SQL 種子檔（可直接貼到 Supabase SQL Editor，免金鑰、免權限問題） ──
  const sqlEsc = (s: string | null) => (s == null ? 'null' : `'${s.replace(/'/g, "''")}'`);
  const values = records
    .map(
      (r) =>
        `  (${sqlEsc(r.name)}, ${sqlEsc(r.address)}, ${sqlEsc(r.district)}, ` +
        `st_setsrid(st_makepoint(${r.lng}, ${r.lat}), 4326)::geography, ` +
        `'${r.kind}', 'official', 'approved', ${sqlEsc(r.note)})`,
    )
    .join(',\n');
  const sql =
    `-- 台北市指定吸菸區種子資料（由 scripts/import-taipei.ts 產生，共 ${records.length} 筆）\n` +
    `-- 用法：整段貼到 Supabase SQL Editor 按 Run。\n` +
    `delete from public.smoking_areas where source = 'official';\n` +
    `insert into public.smoking_areas (name, address, district, location, kind, source, status, note) values\n` +
    `${values};\n`;
  writeFileSync('supabase/seed-taipei.sql', sql, 'utf8');
  console.log('✓ 已產生 SQL 種子檔：supabase/seed-taipei.sql（可直接在 SQL Editor 執行）');

  // ── 若有設定後端金鑰，嘗試用 API 直接寫入（失敗則改用上面的 SQL 檔） ──
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.log('（未設定 SUPABASE_URL / SERVICE_ROLE_KEY，略過 API 寫入，請改執行 SQL 種子檔。）');
    return;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    await supabase.from('smoking_areas').delete().eq('source', 'official');
    const BATCH = 100;
    let inserted = 0;
    for (let i = 0; i < records.length; i += BATCH) {
      const batch = records.slice(i, i + BATCH).map(({ lat: _lat, lng: _lng, ...rest }) => rest);
      const { error } = await supabase.from('smoking_areas').insert(batch);
      if (error) throw error;
      inserted += batch.length;
      console.log(`  寫入 ${inserted}/${records.length}…`);
    }
    console.log(`✓ 完成！已透過 API 匯入 ${inserted} 筆台北市吸菸區。`);
  } catch (e) {
    const msg = (e as { message?: string })?.message ?? String(e);
    console.warn(`\n⚠ API 寫入失敗（${msg}）。`);
    console.warn('   這通常是新版 sb_secret 金鑰的權限問題。');
    console.warn('   請改用備援方式：把 supabase/seed-taipei.sql 整段貼到 Supabase SQL Editor 按 Run 即可完成匯入。');
  }
}

main().catch((e) => {
  console.error('✗ 匯入失敗：', e.message ?? e);
  process.exit(1);
});
