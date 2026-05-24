-- Ship Log Submission MVP
-- Additive only: extends the existing weekly ship_logs table for public Build Journey submissions.

alter table public.ship_logs
  add column if not exists title text,
  add column if not exists what_built text,
  add column if not exists why_built text,
  add column if not exists ai_tools text[] default '{}'::text[],
  add column if not exists what_broke text,
  add column if not exists what_learned text,
  add column if not exists project_url text,
  add column if not exists name text,
  add column if not exists x_handle text,
  add column if not exists email text,
  add column if not exists status text default 'pending';

update public.ship_logs
set
  what_built = coalesce(what_built, shipped),
  what_learned = coalesce(what_learned, learned),
  ai_tools = coalesce(ai_tools, '{}'::text[]),
  status = coalesce(status, 'published')
where what_built is null
   or what_learned is null
   or ai_tools is null
   or status is null;

alter table public.ship_logs
  alter column what_built set not null,
  alter column ai_tools set default '{}'::text[],
  alter column status set default 'pending';

create index if not exists idx_ship_logs_status_created_at
  on public.ship_logs(status, created_at desc);

drop policy if exists ship_logs_public_build_journey_insert on public.ship_logs;
create policy ship_logs_public_build_journey_insert
  on public.ship_logs for insert
  with check (
    builder_id is null
    and user_id is null
    and what_built is not null
    and shipped = what_built
    and coalesce(status, 'pending') = 'pending'
  );
