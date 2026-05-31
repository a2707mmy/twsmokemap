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
import { readFileSync } from 'node:fs';
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
        location: `SRID=4326;POINT(${lng} ${lat})`,
        kind: (r[iKind] || '').includes('室內') ? 'indoor' : 'outdoor',
        source: 'official',
        status: 'approved',
        note: noteParts.join('｜') || null,
      };
    })
    .filter((r) => Number.isFinite(parseFloat(r.location.split(' ')[1])));

  console.log(`✓ 解析到 ${records.length} 筆有效資料`);

  const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!);

  // 先清掉舊的官方資料，避免重複（眾包 user 資料保留）
  await supabase.from('smoking_areas').delete().eq('source', 'official');

  // 分批寫入
  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await supabase.from('smoking_areas').insert(batch);
    if (error) throw error;
    inserted += batch.length;
    console.log(`  寫入 ${inserted}/${records.length}…`);
  }

  console.log(`✓ 完成！共匯入 ${inserted} 筆台北市吸菸區。`);
}

main().catch((e) => {
  console.error('✗ 匯入失敗：', e.message ?? e);
  process.exit(1);
});
