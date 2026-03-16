-- Progress photos table
create table if not exists progress_photos (
  id          uuid primary key default gen_random_uuid(),
  thread_id   text not null default 'default',
  angle       text not null check (angle in ('front', 'left', 'back', 'right')),
  storage_path text not null,
  public_url  text,
  logged_date date default current_date,
  created_at  timestamptz default now()
);

alter table progress_photos enable row level security;
create policy "public all" on progress_photos for all using (true) with check (true);

alter publication supabase_realtime add table progress_photos;

-- Storage bucket for progress photos (run if not already created via dashboard)
-- insert into storage.buckets (id, name, public) values ('progress-photos', 'progress-photos', true);
-- create policy "public all" on storage.objects for all using (bucket_id = 'progress-photos') with check (bucket_id = 'progress-photos');
