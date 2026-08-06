-- P2P Beacon: missions, bookmarks, profiles (все суммы строго в USD)
-- Применить в Supabase SQL Editor или через supabase db push.

create table if not exists public.missions (
  id text primary key,
  title text not null,
  story text not null,
  location text not null,
  tier text not null default 'gray',
  description text not null default '',
  tags text[] not null default '{}',
  raised_usd numeric(12, 2) not null default 0 check (raised_usd >= 0),
  goal_usd numeric(12, 2) not null check (goal_usd > 0),
  hours_left integer not null default 48,
  minutes_left integer not null default 0,
  lng double precision not null,
  lat double precision not null,
  status text not null default 'red' check (status in ('red', 'green')),
  image_url text,
  image_alt text,
  media_fallback text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  mission_id text not null references public.missions (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_email, mission_id)
);

create table if not exists public.profiles (
  email text primary key,
  balance_usd numeric(12, 2) not null default 120 check (balance_usd >= 0),
  donated_usd numeric(12, 2) not null default 0 check (donated_usd >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists missions_created_at_idx on public.missions (created_at desc);
create index if not exists bookmarks_user_email_idx on public.bookmarks (user_email);

alter table public.missions enable row level security;
alter table public.bookmarks enable row level security;
alter table public.profiles enable row level security;

-- Демо-политики: чтение миссий всем, запись через anon key (MVP).
-- Для продакшена заменить на auth.uid()-based policies.

drop policy if exists "missions_select_public" on public.missions;
create policy "missions_select_public"
  on public.missions for select
  using (true);

drop policy if exists "missions_write_anon" on public.missions;
create policy "missions_write_anon"
  on public.missions for all
  using (true)
  with check (true);

drop policy if exists "bookmarks_all_anon" on public.bookmarks;
create policy "bookmarks_all_anon"
  on public.bookmarks for all
  using (true)
  with check (true);

drop policy if exists "profiles_all_anon" on public.profiles;
create policy "profiles_all_anon"
  on public.profiles for all
  using (true)
  with check (true);

-- Seed демо-миссий (идемпотентно)
insert into public.missions (
  id, title, story, location, tier, description, tags,
  raised_usd, goal_usd, hours_left, minutes_left, lng, lat, status,
  image_url, image_alt, media_fallback
) values
  (
    'kole-farm',
    'Помочь Коле восстановить ферму',
    '🌾 Агро- и Эко-инициативы',
    'Тюмень',
    'yellow',
    'Прямой сбор на восстановление теплиц, техники и следующего урожая после пожара.',
    array['#MicroAgri', '#Permaculture', '#FarmRecovery'],
    5950, 7000, 21, 18, 65.5343, 57.1522, 'red',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85',
    'Фермерское поле на закате',
    'from-slate-900 via-red-950 to-slate-950'
  ),
  (
    'anna-clinic',
    'Сбор на операцию для Анны',
    '🏥 Медицина и Здоровье',
    'Москва',
    'green',
    'Адресная помощь на операцию и восстановление без посредников и скрытых комиссий.',
    array['#MedicalAid', '#HealthSupport', '#DirectAid'],
    12400, 18000, 8, 42, 37.6173, 55.7558, 'red',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85',
    'Врач в современной клинике',
    'from-slate-950 via-blue-950 to-slate-900'
  ),
  (
    'school-roof',
    'Крыша для сельской школы',
    '🏫 Инфраструктура и Школы',
    'Иркутск',
    'green',
    'Сообщество собирает средства на безопасную крышу до начала нового учебного года.',
    array['#Education', '#Infrastructure', '#CommunityAid'],
    3100, 9500, 46, 5, 104.2806, 52.2978, 'green',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=85',
    'Школьный класс и ученики',
    'from-slate-900 via-indigo-950 to-slate-950'
  ),
  (
    'veteran-home',
    'Ремонт дома для ветерана',
    '🤝 Сообщество и Семья',
    'Санкт-Петербург',
    'gray',
    'Прямое финансирование срочного ремонта кровли и отопления перед холодным сезоном.',
    array['#CommunityAid', '#FamilySupport', '#DirectSupport'],
    8700, 10000, 15, 30, 30.3141, 59.9386, 'green',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=85',
    'Портрет участника проекта',
    'from-slate-950 via-rose-950 to-slate-900'
  )
on conflict (id) do nothing;
