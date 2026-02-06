-- Evolve photo_pins into work points with richer metadata
-- Add work point fields to existing photo_pins table

alter table public.photo_pins
  add column title text not null default '',
  add column description text not null default '',
  add column status text not null default 'planned'
    check (status in ('planned', 'in-progress', 'completed')),
  add column due_date date,
  add column updated_at timestamptz default now() not null;

create index idx_photo_pins_status on public.photo_pins(status);

create trigger photo_pins_updated_at
  before update on public.photo_pins
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Pin Images table (multiple photos per work point)
-- ============================================================
create table public.pin_images (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  pin_id uuid references public.photo_pins(id) on delete cascade not null,
  image_path text not null,
  caption text not null default '',
  owner_id uuid references auth.users(id) on delete cascade not null
);

create index idx_pin_images_pin on public.pin_images(pin_id);
create index idx_pin_images_owner on public.pin_images(owner_id);

alter table public.pin_images enable row level security;

create policy "Users can view own pin images"
  on public.pin_images for select using (auth.uid() = owner_id);
create policy "Users can insert own pin images"
  on public.pin_images for insert with check (auth.uid() = owner_id);
create policy "Users can delete own pin images"
  on public.pin_images for delete using (auth.uid() = owner_id);

-- ============================================================
-- Pin Comments table
-- ============================================================
create table public.pin_comments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  pin_id uuid references public.photo_pins(id) on delete cascade not null,
  text text not null,
  author_name text not null default '',
  owner_id uuid references auth.users(id) on delete cascade not null
);

create index idx_pin_comments_pin on public.pin_comments(pin_id);
create index idx_pin_comments_owner on public.pin_comments(owner_id);

alter table public.pin_comments enable row level security;

create policy "Users can view own pin comments"
  on public.pin_comments for select using (auth.uid() = owner_id);
create policy "Users can insert own pin comments"
  on public.pin_comments for insert with check (auth.uid() = owner_id);
create policy "Users can delete own pin comments"
  on public.pin_comments for delete using (auth.uid() = owner_id);
