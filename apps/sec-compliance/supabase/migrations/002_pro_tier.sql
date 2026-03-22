-- Pro tier: organizations, members, reports, column additions

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id),
  logo_url text,
  plan text not null default 'solo' check (plan in ('solo', 'practice', 'firm')),
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'unpaid', 'canceled')),
  paymongo_customer_id text,
  paymongo_subscription_id text,
  corp_limit integer not null default 5,
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  current_period_ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role text not null default 'owner' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique(organization_id, user_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  corporation_id uuid not null references corporations(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  generated_at timestamptz not null default now(),
  report_type text not null default 'compliance_summary'
    check (report_type in ('compliance_summary')),
  storage_path text not null
);

alter table corporations add column organization_id uuid references organizations(id);
alter table corporations add column name text;

-- RLS
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table reports enable row level security;

create policy "Owners can read own organizations"
  on organizations for select using (auth.uid() = owner_id);
create policy "Owners can update own organizations"
  on organizations for update using (auth.uid() = owner_id);
create policy "Users can create organizations"
  on organizations for insert with check (auth.uid() = owner_id);

create policy "Members can read own memberships"
  on organization_members for select using (auth.uid() = user_id);
create policy "Owners can manage members"
  on organization_members for insert with check (
    organization_id in (select id from organizations where owner_id = auth.uid())
  );

create policy "Pro users can read org corporations"
  on corporations for select using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );
create policy "Pro users can insert org corporations"
  on corporations for insert with check (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );
create policy "Pro users can update org corporations"
  on corporations for update using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

create policy "Pro users can read org filing records"
  on filing_records for select using (
    corporation_id in (
      select c.id from corporations c
      join organization_members om on om.organization_id = c.organization_id
      where om.user_id = auth.uid()
    )
  );
create policy "Pro users can insert org filing records"
  on filing_records for insert with check (
    corporation_id in (
      select c.id from corporations c
      join organization_members om on om.organization_id = c.organization_id
      where om.user_id = auth.uid()
    )
  );

create policy "Pro users can read org computations"
  on computations for select using (
    corporation_id in (
      select c.id from corporations c
      join organization_members om on om.organization_id = c.organization_id
      where om.user_id = auth.uid()
    )
  );
create policy "Pro users can insert org computations"
  on computations for insert with check (
    corporation_id in (
      select c.id from corporations c
      join organization_members om on om.organization_id = c.organization_id
      where om.user_id = auth.uid()
    )
  );

create policy "Org members can read reports"
  on reports for select using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );
create policy "Org members can insert reports"
  on reports for insert with check (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

-- Storage bucket for PDF reports
insert into storage.buckets (id, name, public) values ('reports', 'reports', false);

create policy "Org members can read report files"
  on storage.objects for select using (
    bucket_id = 'reports' and
    (storage.foldername(name))[1] in (
      select id::text from organizations where owner_id = auth.uid()
    )
  );
create policy "Org members can upload report files"
  on storage.objects for insert with check (
    bucket_id = 'reports' and
    (storage.foldername(name))[1] in (
      select id::text from organizations where owner_id = auth.uid()
    )
  );
