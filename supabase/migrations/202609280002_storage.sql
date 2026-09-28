insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('gear-images','gear-images',false,4194304,array['image/jpeg','image/png','image/webp']);
-- The first folder is the uploader and the second the gear UUID. No public bucket bypass.
create policy gear_storage_read on storage.objects for select using (
 bucket_id='gear-images' and exists(select 1 from public.gear_images i where i.path=name and public.can_read_gear(i.gear_id))
);
create policy gear_storage_insert on storage.objects for insert to authenticated with check (
 bucket_id='gear-images' and (storage.foldername(name))[1]=auth.uid()::text and
 exists(select 1 from public.user_gears g where g.id::text=(storage.foldername(name))[2] and g.user_id=auth.uid())
);
create policy gear_storage_delete on storage.objects for delete to authenticated using(bucket_id='gear-images' and (storage.foldername(name))[1]=auth.uid()::text);
