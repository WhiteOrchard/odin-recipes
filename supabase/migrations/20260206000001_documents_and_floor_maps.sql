-- Documents and Floor Maps migration
-- Adds tables for document management and interactive floor plan photo pins

-- ============================================================
-- Documents table (contracts, photos, inspection reports, etc.)
-- ============================================================
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  name text not null,
  category text not null default 'other' check (category in ('contract', 'photo', 'inspection', 'insurance', 'other')),
  property_id uuid references public.properties(id) on delete set null,
  file_path text not null,
  file_size bigint not null default 0,
  mime_type text not null default '',
  thumbnail_path text,
  owner_id uuid references auth.users(id) on delete cascade not null
);

-- ============================================================
-- Floor Plans table
-- ============================================================
create table public.floor_plans (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  name text not null,
  floor text not null default 'Main',
  image_path text, -- optional uploaded floor plan image
  owner_id uuid references auth.users(id) on delete cascade not null
);

-- ============================================================
-- Photo Pins table (pins placed on floor plans)
-- ============================================================
create table public.photo_pins (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  floor_plan_id uuid references public.floor_plans(id) on delete cascade not null,
  x_percent numeric(5, 2) not null, -- X position as percentage (0-100)
  y_percent numeric(5, 2) not null, -- Y position as percentage (0-100)
  label text not null default '',
  room text not null default '',
  image_path text not null, -- path in Supabase Storage
  owner_id uuid references auth.users(id) on delete cascade not null
);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_documents_owner on public.documents(owner_id);
create index idx_documents_property on public.documents(property_id);
create index idx_documents_category on public.documents(category);
create index idx_floor_plans_owner on public.floor_plans(owner_id);
create index idx_floor_plans_property on public.floor_plans(property_id);
create index idx_photo_pins_floor_plan on public.photo_pins(floor_plan_id);
create index idx_photo_pins_owner on public.photo_pins(owner_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.documents enable row level security;
alter table public.floor_plans enable row level security;
alter table public.photo_pins enable row level security;

-- Documents
create policy "Users can view own documents"
  on public.documents for select using (auth.uid() = owner_id);
create policy "Users can insert own documents"
  on public.documents for insert with check (auth.uid() = owner_id);
create policy "Users can update own documents"
  on public.documents for update using (auth.uid() = owner_id);
create policy "Users can delete own documents"
  on public.documents for delete using (auth.uid() = owner_id);

-- Floor Plans
create policy "Users can view own floor plans"
  on public.floor_plans for select using (auth.uid() = owner_id);
create policy "Users can insert own floor plans"
  on public.floor_plans for insert with check (auth.uid() = owner_id);
create policy "Users can update own floor plans"
  on public.floor_plans for update using (auth.uid() = owner_id);
create policy "Users can delete own floor plans"
  on public.floor_plans for delete using (auth.uid() = owner_id);

-- Photo Pins
create policy "Users can view own photo pins"
  on public.photo_pins for select using (auth.uid() = owner_id);
create policy "Users can insert own photo pins"
  on public.photo_pins for insert with check (auth.uid() = owner_id);
create policy "Users can update own photo pins"
  on public.photo_pins for update using (auth.uid() = owner_id);
create policy "Users can delete own photo pins"
  on public.photo_pins for delete using (auth.uid() = owner_id);

-- Updated_at trigger for floor_plans
create trigger floor_plans_updated_at
  before update on public.floor_plans
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Supabase Storage buckets
-- ============================================================
-- Note: Run these via Supabase Dashboard or CLI, not via SQL migration:
-- supabase storage create-bucket documents --public false
-- supabase storage create-bucket property-photos --public true
-- supabase storage create-bucket floor-plans --public false
