-- ═══════════════════════════════════════════════════════════
-- Transform Coach — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- ─── MESSAGES ────────────────────────────────────────────────
create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   text not null default 'default',
  sender      text not null check (sender in ('coach', 'client')),
  content     text not null,
  media_url   text,
  created_at  timestamptz default now()
);

-- ─── EXERCISE LOGS ───────────────────────────────────────────
create table if not exists exercise_logs (
  id            uuid primary key default gen_random_uuid(),
  thread_id     text not null default 'default',
  session_day   text not null,
  exercise_name text not null,
  done          boolean default false,
  week_number   integer not null default 8,
  logged_at     timestamptz default now(),
  unique (thread_id, session_day, exercise_name, week_number)
);

-- ─── PROGRESS LOGS ───────────────────────────────────────────
create table if not exists progress_logs (
  id           uuid primary key default gen_random_uuid(),
  thread_id    text not null default 'default',
  logged_date  date not null default current_date,
  weight_kg    numeric,
  body_fat_pct numeric,
  notes        text,
  created_at   timestamptz default now()
);

-- ─── BODY MEASUREMENTS ───────────────────────────────────────
create table if not exists body_measurements (
  id          uuid primary key default gen_random_uuid(),
  thread_id   text not null default 'default',
  logged_date date not null default current_date,
  chest_cm    numeric,
  waist_cm    numeric,
  hips_cm     numeric,
  arms_cm     numeric,
  thighs_cm   numeric,
  created_at  timestamptz default now()
);

-- ─── FOOD PHOTO LOGS ─────────────────────────────────────────
create table if not exists food_photo_logs (
  id              uuid primary key default gen_random_uuid(),
  thread_id       text not null default 'default',
  storage_path    text not null,
  public_url      text,
  caption         text,
  meal_type       text,
  coach_seen      boolean default false,
  coach_feedback  text,
  logged_date     date default current_date,
  created_at      timestamptz default now()
);

-- ─── COMPLIANCE HISTORY ──────────────────────────────────────
create table if not exists compliance_history (
  id              uuid primary key default gen_random_uuid(),
  thread_id       text not null default 'default',
  week_number     integer not null,
  sessions_done   integer default 0,
  sessions_total  integer default 7,
  compliance_pct  numeric,
  recorded_date   date default current_date,
  created_at      timestamptz default now(),
  unique (thread_id, week_number)
);

-- ─── NUTRITION PLANS ─────────────────────────────────────────
create table if not exists nutrition_plans (
  id               uuid primary key default gen_random_uuid(),
  thread_id        text not null default 'default',
  name             text not null,
  target_calories  integer,
  target_protein_g integer,
  target_carbs_g   integer,
  target_fat_g     integer,
  target_water_l   numeric,
  notes            text,
  is_active        boolean default true,
  created_at       timestamptz default now()
);

-- ─── WORKOUT PLANS ───────────────────────────────────────────
create table if not exists workout_plans (
  id          uuid primary key default gen_random_uuid(),
  thread_id   text not null default 'default',
  name        text not null,
  total_weeks integer default 16,
  week_num    integer default 1,
  goal        text,
  phase       text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ─── RLS (open policies — add auth later) ────────────────────
alter table messages          enable row level security;
alter table exercise_logs     enable row level security;
alter table progress_logs     enable row level security;
alter table body_measurements enable row level security;
alter table food_photo_logs   enable row level security;
alter table compliance_history enable row level security;
alter table nutrition_plans   enable row level security;
alter table workout_plans     enable row level security;

create policy "public all" on messages          for all using (true) with check (true);
create policy "public all" on exercise_logs     for all using (true) with check (true);
create policy "public all" on progress_logs     for all using (true) with check (true);
create policy "public all" on body_measurements for all using (true) with check (true);
create policy "public all" on food_photo_logs   for all using (true) with check (true);
create policy "public all" on compliance_history for all using (true) with check (true);
create policy "public all" on nutrition_plans   for all using (true) with check (true);
create policy "public all" on workout_plans     for all using (true) with check (true);

-- ─── REALTIME ────────────────────────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table exercise_logs;
alter publication supabase_realtime add table food_photo_logs;

-- ─── STORAGE BUCKET (run separately if needed) ───────────────
-- insert into storage.buckets (id, name, public) values ('food-photos', 'food-photos', true);
-- create policy "public all" on storage.objects for all using (bucket_id = 'food-photos') with check (bucket_id = 'food-photos');
