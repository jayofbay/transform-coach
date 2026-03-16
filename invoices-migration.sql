-- ─── INVOICES TABLE ───────────────────────────────────────────────────────────
create table if not exists invoices (
  id                       uuid primary key default gen_random_uuid(),
  thread_id                text not null,
  amount_cents             integer not null,
  currency                 text not null default 'usd',
  description              text not null,
  status                   text not null default 'pending'
                             check (status in ('pending', 'paid', 'cancelled')),
  stripe_payment_link_id   text,
  stripe_payment_link_url  text,
  stripe_payment_intent_id text,
  due_date                 date,
  paid_at                  timestamptz,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

alter table invoices enable row level security;
create policy "public all" on invoices for all using (true) with check (true);

alter publication supabase_realtime add table invoices;
