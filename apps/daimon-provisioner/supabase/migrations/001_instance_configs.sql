create table instance_configs (
  id uuid primary key,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- No RLS — internal tool, no auth
alter table instance_configs enable row level security;

create policy "Allow all access"
  on instance_configs for all
  using (true)
  with check (true);
