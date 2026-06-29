-- Run this once in Supabase Dashboard → SQL Editor if client photo uploads fail.
-- Shared by transform-coach and client-plan apps.

-- ─── PROGRESS PHOTOS TABLE ───────────────────────────────────────────────────
create table if not exists progress_photos (
  id           uuid primary key default gen_random_uuid(),
  thread_id    text not null default 'default',
  angle        text not null check (angle in ('front', 'left', 'back', 'right')),
  storage_path text not null,
  public_url   text,
  logged_date  date default current_date,
  created_at   timestamptz default now()
);

alter table if exists public.progress_photos enable row level security;

drop policy if exists "public all" on public.progress_photos;
drop policy if exists "Anon read progress photos table" on public.progress_photos;
drop policy if exists "Anon insert progress photos table" on public.progress_photos;

create policy "Anon read progress photos table"
  on public.progress_photos for select
  using (true);

create policy "Anon insert progress photos table"
  on public.progress_photos for insert
  with check (true);

do $$
begin
  alter publication supabase_realtime add table progress_photos;
exception
  when duplicate_object then null;
end $$;

-- ─── FOOD PHOTO LOGS ─────────────────────────────────────────────────────────
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

alter table if exists public.food_photo_logs enable row level security;

drop policy if exists "public all" on public.food_photo_logs;
drop policy if exists "Anon read food photo logs" on public.food_photo_logs;
drop policy if exists "Anon insert food photo logs" on public.food_photo_logs;

create policy "Anon read food photo logs"
  on public.food_photo_logs for select
  using (true);

create policy "Anon insert food photo logs"
  on public.food_photo_logs for insert
  with check (true);

-- ─── STORAGE BUCKETS ─────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('food-photos', 'food-photos', true),
  ('progress-photos', 'progress-photos', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public read food photos" on storage.objects;
drop policy if exists "Public read progress photos" on storage.objects;
drop policy if exists "Anon upload food photos" on storage.objects;
drop policy if exists "Anon upload progress photos" on storage.objects;
drop policy if exists "Anon update food photos" on storage.objects;
drop policy if exists "Anon update progress photos" on storage.objects;

create policy "Public read food photos"
  on storage.objects for select
  using (bucket_id = 'food-photos');

create policy "Public read progress photos"
  on storage.objects for select
  using (bucket_id = 'progress-photos');

create policy "Anon upload food photos"
  on storage.objects for insert
  with check (bucket_id = 'food-photos');

create policy "Anon upload progress photos"
  on storage.objects for insert
  with check (bucket_id = 'progress-photos');

create policy "Anon update food photos"
  on storage.objects for update
  using (bucket_id = 'food-photos')
  with check (bucket_id = 'food-photos');

create policy "Anon update progress photos"
  on storage.objects for update
  using (bucket_id = 'progress-photos')
  with check (bucket_id = 'progress-photos');
