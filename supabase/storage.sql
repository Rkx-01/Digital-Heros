-- 1. Create a bucket for draw proofs
insert into storage.buckets (id, name, public) 
values ('draw-proofs', 'draw-proofs', false);

-- 2. Policy: Authenticated users can upload to their own folder
create policy "Users can upload their own proof"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'draw-proofs' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Policy: Owners can view their own proof
create policy "Users can view their own proof"
on storage.objects for select
to authenticated
using (
  bucket_id = 'draw-proofs' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy: Admins can view all proof
create policy "Admins can view all proof"
on storage.objects for select
to authenticated
using (
  bucket_id = 'draw-proofs' 
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
