-- Create instagram_vendors table
create table if not exists public.instagram_vendors (
  id uuid default uuid_generate_v4() primary key,
  instagram_handle text not null,
  business_name text not null,
  category text not null,
  subcategory text,
  website_url text,
  email text,
  phone text,
  follower_count integer,
  post_count integer,
  bio text,
  profile_image_url text,
  is_verified boolean default false,
  is_business_account boolean default false,
  location text default 'Dallas, TX',
  city text default 'Dallas',
  state text default 'TX',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add a unique constraint for instagram_handle and category combination
-- This allows the same vendor to appear in multiple categories
alter table public.instagram_vendors 
  add constraint instagram_vendors_handle_category_key 
  unique (instagram_handle, category);

-- Enable RLS
alter table public.instagram_vendors enable row level security;

-- Create policies
create policy "Allow public read access"
  on public.instagram_vendors
  for select
  using (true);
