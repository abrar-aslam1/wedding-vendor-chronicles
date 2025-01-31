-- Create the storage bucket for vendor uploads
insert into storage.buckets (id, name, public)
values ('lovable-uploads', 'lovable-uploads', true);

-- Policy to allow authenticated users to upload files
create policy "Allow authenticated users to upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'lovable-uploads' AND
  auth.role() = 'authenticated'
);

-- Policy to allow public access to read files
create policy "Allow public read access"
on storage.objects for select
to public
using (bucket_id = 'lovable-uploads');
