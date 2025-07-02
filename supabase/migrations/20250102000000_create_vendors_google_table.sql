-- Create vendors_google table for storing Google Maps vendor data
create table if not exists public.vendors_google (
  id uuid default uuid_generate_v4() primary key,
  place_id text unique not null,
  business_name text not null,
  category text not null,
  city text not null,
  state text not null,
  state_code text not null,
  address text,
  phone text,
  website_url text,
  email text,
  rating jsonb,
  description text,
  images text[],
  business_hours jsonb,
  price_range text,
  coordinates point,
  latitude decimal,
  longitude decimal,
  reviews_count integer,
  year_established integer,
  payment_methods text[],
  service_area text[],
  categories text[],
  postal_code text,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  data_source text default 'google_maps' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_vendors_google_place_id on public.vendors_google(place_id);
create index if not exists idx_vendors_google_category on public.vendors_google(category);
create index if not exists idx_vendors_google_city_state on public.vendors_google(city, state);
create index if not exists idx_vendors_google_last_updated on public.vendors_google(last_updated);
create index if not exists idx_vendors_google_coordinates on public.vendors_google using gist(coordinates);

-- Enable RLS
alter table public.vendors_google enable row level security;

-- Create policies
create policy "Allow public read access"
  on public.vendors_google
  for select
  using (true);

create policy "Allow service role full access"
  on public.vendors_google
  for all
  using (auth.role() = 'service_role');

-- Create a function to update the last_updated timestamp
create or replace function update_vendors_google_updated_at()
returns trigger as $$
begin
  new.last_updated = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update last_updated
create trigger update_vendors_google_updated_at
  before update on public.vendors_google
  for each row
  execute function update_vendors_google_updated_at();

-- Create a view that combines all vendor sources for easier querying
create or replace view public.all_vendors as
select 
  'google' as source_type,
  place_id as vendor_id,
  business_name,
  category,
  city,
  state,
  address,
  phone,
  website_url as url,
  email,
  rating,
  description,
  images,
  latitude,
  longitude,
  last_updated
from public.vendors_google
union all
select 
  'instagram' as source_type,
  instagram_handle as vendor_id,
  business_name,
  category,
  city,
  state,
  location as address,
  phone,
  website_url as url,
  email,
  null as rating,
  bio as description,
  case when profile_image_url is not null then array[profile_image_url] else array[]::text[] end as images,
  null as latitude,
  null as longitude,
  updated_at as last_updated
from public.instagram_vendors
union all
select 
  'database' as source_type,
  id::text as vendor_id,
  business_name,
  category,
  city,
  state,
  city || ', ' || state as address,
  (contact_info->>'phone') as phone,
  (contact_info->>'website') as url,
  (contact_info->>'email') as email,
  null as rating,
  description,
  images,
  null as latitude,
  null as longitude,
  created_at as last_updated
from public.vendors;

-- Grant permissions
grant select on public.all_vendors to anon, authenticated;
