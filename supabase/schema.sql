-- 공유 키즈카페 테이블
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.

create table if not exists public.kids_cafes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text not null default '',
  address text not null,
  lat double precision not null,
  lng double precision not null,
  description text not null default '',
  features text[] not null default '{}',
  phone text,
  created_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.kids_cafes enable row level security;

-- 누구나 읽기 가능 (공개 목록)
drop policy if exists "public read kids_cafes" on public.kids_cafes;
create policy "public read kids_cafes"
  on public.kids_cafes
  for select
  using (true);

-- 누구나(anon 포함) 추가 가능 — 공개 커뮤니티 입력 허용
-- 참고: 스팸/악용이 우려되면 이후에 인증(auth) 기반 정책으로 강화하세요.
drop policy if exists "public insert kids_cafes" on public.kids_cafes;
create policy "public insert kids_cafes"
  on public.kids_cafes
  for insert
  with check (
    length(name) between 1 and 100
    and length(address) between 1 and 200
    and lat between 33 and 39      -- 대한민국 위도 범위 근사
    and lng between 124 and 132    -- 대한민국 경도 범위 근사
  );

-- 최신순 조회 최적화
create index if not exists kids_cafes_created_at_idx
  on public.kids_cafes (created_at desc);
