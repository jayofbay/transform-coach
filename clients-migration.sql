-- ─── CLIENTS TABLE ───────────────────────────────────────────
create table if not exists clients (
  id           uuid primary key default gen_random_uuid(),
  thread_id    text unique not null default gen_random_uuid()::text,
  name         text not null,
  avatar       text not null default 'XX',
  goal         text default 'Fat Loss',
  phase        text default 'Cut',
  accent_color text default '#FF4D00',
  watch        text,
  connected    boolean default false,
  weight       numeric default 0,
  start_weight numeric default 0,
  target_weight numeric default 0,
  body_fat     numeric default 0,
  start_body_fat  numeric default 0,
  target_body_fat numeric default 15,
  week_num     integer default 1,
  total_weeks  integer default 16,
  compliance   integer default 0,
  streak       integer default 0,
  created_at   timestamptz default now()
);

alter table clients enable row level security;
create policy "public all" on clients for all using (true) with check (true);

alter publication supabase_realtime add table clients;

-- ─── SEED EXISTING CLIENTS ───────────────────────────────────
insert into clients (thread_id, name, avatar, goal, phase, accent_color, watch, connected, weight, start_weight, target_weight, body_fat, start_body_fat, target_body_fat, week_num, total_weeks, compliance, streak)
values
  ('jordan-blake', 'Jordan Blake', 'JB', 'Fat Loss',    'Cut',         '#FF4D00', 'Apple Watch Series 9',    true,  89.4, 102, 78, 24.1, 31, 15, 8, 16, 91, 12),
  ('priya-sharma', 'Priya Sharma', 'PS', 'Muscle Gain', 'Bulk',        '#00C896', 'Garmin Forerunner 255',   true,  62.1,  58, 65, 22.3, 24, 20, 5, 12, 84,  7),
  ('marcus-webb',  'Marcus Webb',  'MW', 'Recomp',      'Maintenance', '#FFB800', null,                      false, 95.8,  97, 90, 18.7, 20, 15, 3, 20, 58,  2)
on conflict (thread_id) do nothing;
