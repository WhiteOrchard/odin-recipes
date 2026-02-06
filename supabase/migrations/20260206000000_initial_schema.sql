-- LuxeEstates Database Schema
-- Initial migration: core tables with RLS policies

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- Properties table
-- ============================================================
create table public.properties (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  type text not null check (type in ('penthouse', 'villa', 'estate', 'mansion', 'chateau', 'townhouse')),
  status text not null default 'available' check (status in ('available', 'occupied', 'maintenance', 'listed')),
  address text not null,
  city text not null,
  country text not null,
  price numeric(15, 2) not null,
  monthly_rent numeric(12, 2) not null,
  bedrooms integer not null,
  bathrooms integer not null,
  sqft integer not null,
  year_built integer not null,
  description text not null default '',
  amenities text[] default '{}',
  images text[] default '{}',
  lat double precision,
  lng double precision,
  rating numeric(2, 1) default 0,
  owner_id uuid references auth.users(id) on delete cascade not null
);

-- ============================================================
-- Tenants table
-- ============================================================
create table public.tenants (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null default '',
  avatar_initials text not null default '',
  property_id uuid references public.properties(id) on delete set null,
  lease_start date not null,
  lease_end date not null,
  monthly_rent numeric(12, 2) not null,
  deposit numeric(12, 2) not null default 0,
  status text not null default 'active' check (status in ('active', 'pending', 'expired')),
  owner_id uuid references auth.users(id) on delete cascade not null
);

-- ============================================================
-- Maintenance Requests table
-- ============================================================
create table public.maintenance_requests (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete set null,
  title text not null,
  description text not null default '',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in-progress', 'resolved', 'closed')),
  category text not null default 'General',
  assigned_to text,
  estimated_cost numeric(10, 2),
  owner_id uuid references auth.users(id) on delete cascade not null
);

-- ============================================================
-- Calendar Events table
-- ============================================================
create table public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  title text not null,
  date date not null,
  time time not null,
  type text not null check (type in ('viewing', 'inspection', 'maintenance', 'lease-renewal', 'meeting')),
  property_id uuid references public.properties(id) on delete set null,
  description text not null default '',
  color text not null default '#3b82f6',
  owner_id uuid references auth.users(id) on delete cascade not null
);

-- ============================================================
-- Payments table
-- ============================================================
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  date date not null,
  amount numeric(12, 2) not null,
  status text not null default 'pending' check (status in ('paid', 'pending', 'overdue')),
  method text not null default '',
  owner_id uuid references auth.users(id) on delete cascade not null
);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_properties_owner on public.properties(owner_id);
create index idx_properties_status on public.properties(status);
create index idx_properties_city on public.properties(city);
create index idx_tenants_owner on public.tenants(owner_id);
create index idx_tenants_property on public.tenants(property_id);
create index idx_maintenance_owner on public.maintenance_requests(owner_id);
create index idx_maintenance_property on public.maintenance_requests(property_id);
create index idx_maintenance_status on public.maintenance_requests(status);
create index idx_calendar_owner on public.calendar_events(owner_id);
create index idx_calendar_date on public.calendar_events(date);
create index idx_payments_tenant on public.payments(tenant_id);
create index idx_payments_owner on public.payments(owner_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.properties enable row level security;
alter table public.tenants enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.calendar_events enable row level security;
alter table public.payments enable row level security;

-- Properties: users can only CRUD their own properties
create policy "Users can view own properties"
  on public.properties for select using (auth.uid() = owner_id);
create policy "Users can insert own properties"
  on public.properties for insert with check (auth.uid() = owner_id);
create policy "Users can update own properties"
  on public.properties for update using (auth.uid() = owner_id);
create policy "Users can delete own properties"
  on public.properties for delete using (auth.uid() = owner_id);

-- Tenants: users can only CRUD their own tenants
create policy "Users can view own tenants"
  on public.tenants for select using (auth.uid() = owner_id);
create policy "Users can insert own tenants"
  on public.tenants for insert with check (auth.uid() = owner_id);
create policy "Users can update own tenants"
  on public.tenants for update using (auth.uid() = owner_id);
create policy "Users can delete own tenants"
  on public.tenants for delete using (auth.uid() = owner_id);

-- Maintenance requests
create policy "Users can view own maintenance"
  on public.maintenance_requests for select using (auth.uid() = owner_id);
create policy "Users can insert own maintenance"
  on public.maintenance_requests for insert with check (auth.uid() = owner_id);
create policy "Users can update own maintenance"
  on public.maintenance_requests for update using (auth.uid() = owner_id);
create policy "Users can delete own maintenance"
  on public.maintenance_requests for delete using (auth.uid() = owner_id);

-- Calendar events
create policy "Users can view own events"
  on public.calendar_events for select using (auth.uid() = owner_id);
create policy "Users can insert own events"
  on public.calendar_events for insert with check (auth.uid() = owner_id);
create policy "Users can update own events"
  on public.calendar_events for update using (auth.uid() = owner_id);
create policy "Users can delete own events"
  on public.calendar_events for delete using (auth.uid() = owner_id);

-- Payments
create policy "Users can view own payments"
  on public.payments for select using (auth.uid() = owner_id);
create policy "Users can insert own payments"
  on public.payments for insert with check (auth.uid() = owner_id);
create policy "Users can update own payments"
  on public.payments for update using (auth.uid() = owner_id);
create policy "Users can delete own payments"
  on public.payments for delete using (auth.uid() = owner_id);

-- ============================================================
-- Updated_at trigger function
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.handle_updated_at();

create trigger tenants_updated_at
  before update on public.tenants
  for each row execute function public.handle_updated_at();

create trigger maintenance_requests_updated_at
  before update on public.maintenance_requests
  for each row execute function public.handle_updated_at();
