-- ============================================================
-- TWsmokemap 資料庫 schema（在 Supabase SQL Editor 執行）
-- 需求：PostgreSQL + PostGIS
-- ============================================================

-- 1. 啟用 PostGIS（提供地理型別與空間查詢）
create extension if not exists postgis;

-- 2. 吸菸區資料表 ------------------------------------------------
create table if not exists public.smoking_areas (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  district    text,
  location    geography(Point, 4326) not null,  -- 經緯度（WGS84）
  kind        text not null default 'outdoor' check (kind in ('indoor', 'outdoor')),
  source      text not null default 'user'    check (source in ('official', 'user')),
  status      text not null default 'pending' check (status in ('approved', 'pending')),
  note        text,
  upvotes     integer not null default 0,
  created_at  timestamptz not null default now()
);

-- 空間索引：加速「附近搜尋」
create index if not exists smoking_areas_location_idx
  on public.smoking_areas using gist (location);
create index if not exists smoking_areas_status_idx
  on public.smoking_areas (status);

-- 3. 煙味回報資料表 --------------------------------------------
create table if not exists public.smell_reports (
  id           uuid primary key default gen_random_uuid(),
  location     geography(Point, 4326) not null,
  -- 回報狀況（描述性）：1=我看到有人在抽菸、2=我聞到濃烈煙味、3=我聞到些微煙味
  report_type  smallint not null check (report_type in (1, 2, 3)),
  time_slot    text not null check (time_slot in ('morning', 'noon', 'evening', 'night')),
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists smell_reports_location_idx
  on public.smell_reports using gist (location);

-- 4. 附近吸菸區 RPC：回傳半徑內、依距離排序、已核准的吸菸區 -------
create or replace function public.nearby_smoking_areas(
  lat double precision,
  lng double precision,
  radius_m double precision default 1000
)
returns table (
  id uuid,
  name text,
  address text,
  district text,
  lat double precision,
  lng double precision,
  kind text,
  source text,
  status text,
  note text,
  upvotes integer,
  created_at timestamptz,
  distance_m double precision
)
language sql
stable
as $$
  select
    a.id,
    a.name,
    a.address,
    a.district,
    st_y(a.location::geometry) as lat,
    st_x(a.location::geometry) as lng,
    a.kind,
    a.source,
    a.status,
    a.note,
    a.upvotes,
    a.created_at,
    st_distance(
      a.location,
      st_setsrid(st_makepoint(lng, lat), 4326)::geography
    ) as distance_m
  from public.smoking_areas a
  where a.status = 'approved'
    and st_dwithin(
      a.location,
      st_setsrid(st_makepoint(lng, lat), 4326)::geography,
      radius_m
    )
  order by distance_m asc;
$$;

-- 5. 給吸菸區投票（「這裡正確嗎？」）--------------------------
create or replace function public.upvote_smoking_area(area_id uuid)
returns void
language sql
as $$
  update public.smoking_areas set upvotes = upvotes + 1 where id = area_id;
$$;
