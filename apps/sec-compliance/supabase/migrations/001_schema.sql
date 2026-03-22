-- Users handled by Supabase Auth

create table corporations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  domicile text not null default 'domestic' check (domicile in ('domestic', 'foreign')),
  corp_type text not null check (corp_type in ('stock', 'non_stock', 'opc')),
  re_bracket text not null,
  registration_date date not null,
  sec_registration_number text,
  mc28_compliant boolean not null default false,
  suspension_date date,
  revocation_date date,
  created_at timestamptz not null default now()
);

create table filing_records (
  id uuid primary key default gen_random_uuid(),
  corporation_id uuid not null references corporations(id) on delete cascade,
  report_type text not null check (report_type in ('GIS', 'AFS', 'BO')),
  year integer not null,
  status text not null check (status in ('not_filed', 'filed_late', 'filed_on_time')),
  filed_date date,
  unique(corporation_id, report_type, year)
);

create table computations (
  id uuid primary key default gen_random_uuid(),
  corporation_id uuid not null references corporations(id) on delete cascade,
  computed_at timestamptz not null default now(),
  result_json jsonb not null,
  total_penalty numeric not null
);

-- RLS policies
alter table corporations enable row level security;
alter table filing_records enable row level security;
alter table computations enable row level security;

create policy "Users can read own corporations"
  on corporations for select using (auth.uid() = user_id);
create policy "Users can insert own corporations"
  on corporations for insert with check (auth.uid() = user_id);

create policy "Users can read own filing records"
  on filing_records for select using (
    corporation_id in (select id from corporations where user_id = auth.uid())
  );
create policy "Users can insert own filing records"
  on filing_records for insert with check (
    corporation_id in (select id from corporations where user_id = auth.uid())
  );

create policy "Users can read own computations"
  on computations for select using (
    corporation_id in (select id from corporations where user_id = auth.uid())
  );
create policy "Users can insert own computations"
  on computations for insert with check (
    corporation_id in (select id from corporations where user_id = auth.uid())
  );
