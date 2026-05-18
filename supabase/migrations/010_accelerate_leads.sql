-- Accelerate programme lead capture
create table if not exists accelerate_leads (
  id          uuid primary key default gen_random_uuid(),
  track       text not null check (track in ('solo', 'team', 'insider')),
  goal        text not null,
  timeline    text not null,
  wechat      text not null,
  email       text,
  created_at  timestamptz not null default now()
);

alter table accelerate_leads enable row level security;

drop policy if exists "public_insert_accelerate_leads" on accelerate_leads;
create policy "public_insert_accelerate_leads"
  on accelerate_leads for insert
  with check (true);
