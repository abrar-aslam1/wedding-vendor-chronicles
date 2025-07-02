-- Create location_metadata table for state and city aggregated data
create table if not exists public.location_metadata (
  id uuid default uuid_generate_v4() primary key,
  state text not null,
  city text null, -- null for state-level records
  vendor_count integer default 0,
  popular_cities jsonb default '[]'::jsonb, -- array of popular cities for state records
  average_rating decimal(3,2) default 0.0,
  seo_description text null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique combinations of state/city
  unique(state, city)
);

-- Create indexes for better performance
create index if not exists idx_location_metadata_state on public.location_metadata(state);
create index if not exists idx_location_metadata_city on public.location_metadata(city);
create index if not exists idx_location_metadata_vendor_count on public.location_metadata(vendor_count desc);

-- Enable RLS
alter table public.location_metadata enable row level security;

-- Create policy for public read access
create policy "Allow public read access"
  on public.location_metadata
  for select
  using (true);

-- Create policy for authenticated users to insert/update (for data population scripts)
create policy "Allow authenticated users to manage location metadata"
  on public.location_metadata
  for all
  using (auth.role() = 'authenticated');

-- Create function to update the updated_at timestamp
create or replace function update_location_metadata_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update the updated_at field
create trigger update_location_metadata_updated_at
  before update on public.location_metadata
  for each row
  execute function update_location_metadata_updated_at();
