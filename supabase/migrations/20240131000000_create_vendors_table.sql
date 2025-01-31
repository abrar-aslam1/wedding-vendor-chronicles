-- Create vendors table
create table if not exists public.vendors (
  id uuid default uuid_generate_v4() primary key,
  business_name text not null,
  description text not null,
  contact_info jsonb not null,
  category text not null references vendor_subcategories(category),
  city text not null,
  state text not null,
  images text[] not null,
  owner_id uuid not null references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.vendors enable row level security;

-- Create policies
create policy "Allow public read access"
  on public.vendors
  for select
  using (true);

create policy "Allow authenticated users to create vendors"
  on public.vendors
  for insert
  with check (auth.role() = 'authenticated');

create policy "Allow owners to update their vendors"
  on public.vendors
  for update
  using (auth.uid() = owner_id);

-- Create storage bucket for business images
insert into storage.buckets (id, name, public)
values ('vendor-images', 'vendor-images', true);

-- Storage policies
create policy "Allow public read access"
  on storage.objects
  for select
  using (bucket_id = 'vendor-images');

create policy "Allow authenticated users to upload images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'vendor-images' 
    and auth.role() = 'authenticated'
  );
