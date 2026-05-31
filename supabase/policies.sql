-- ============================================================
-- Row Level Security（RLS）權限政策
-- 在 schema.sql 之後執行
-- 原則：匿名公開讀寫「新增」，但不可竄改既有資料；審核交由後台（service role）
-- ============================================================

-- 吸菸區 -----------------------------------------------------
alter table public.smoking_areas enable row level security;

-- 任何人可讀「已核准」資料
drop policy if exists "read approved areas" on public.smoking_areas;
create policy "read approved areas"
  on public.smoking_areas for select
  using (status = 'approved');

-- 任何人可新增，但只能新增為「眾包 + 待審核」（眾包投稿）
drop policy if exists "insert pending user areas" on public.smoking_areas;
create policy "insert pending user areas"
  on public.smoking_areas for insert
  with check (source = 'user' and status = 'pending');

-- 不開放匿名 update / delete（審核、修改僅由 service role 於後台進行）

-- 煙味回報 ---------------------------------------------------
alter table public.smell_reports enable row level security;

-- 任何人可讀（用於熱區圖彙總）
drop policy if exists "read smell reports" on public.smell_reports;
create policy "read smell reports"
  on public.smell_reports for select
  using (true);

-- 任何人可新增回報
drop policy if exists "insert smell reports" on public.smell_reports;
create policy "insert smell reports"
  on public.smell_reports for insert
  with check (true);

-- 不開放匿名 update / delete

-- 備註：
--   upvote_smoking_area() 為 SQL 函式，預設以呼叫者權限執行；
--   若要讓匿名也能投票，於 Supabase 將其設為 security definer 並 grant execute。
