-- Pending applicants are visible only to themselves and club managers.
drop policy members_read on public.club_members;
create policy members_read on public.club_members for select using (
 user_id=auth.uid() or public.manages_club(club_id) or
 (status='active' and public.can_read_club(club_id)) or public.is_staff()
);
-- Enforce write limits at the database boundary as well as server actions.
create function public.limit_content_writes() returns trigger language plpgsql security definer set search_path = '' as $$ begin
 if auth.uid() is not null and not public.consume_rate_limit('content_write',30) then
  raise exception '요청이 많아요. 1분 뒤 다시 시도해주세요.';
 end if;
 return new;
end $$;
do $$ declare t text; begin foreach t in array array['clubs','club_invites','products','user_gears','questions','answers','reports'] loop
 execute format('create trigger limit_insert before insert on public.%I for each row execute function public.limit_content_writes()',t);
end loop; end $$;
create function public.record_creation_event() returns trigger language plpgsql security definer set search_path = '' as $$ begin
 if tg_table_name='user_gears' then
  insert into public.events(user_id,name,product_id,club_id) values(new.user_id,'gear_registered',new.product_id,new.club_id);
 elsif tg_table_name='questions' then
  insert into public.events(user_id,name,product_id,club_id) values(new.author_id,'question_asked',new.product_id,new.club_id);
 elsif tg_table_name='club_members' and new.status='active' and (tg_op='INSERT' or old.status is distinct from new.status) then
  insert into public.events(user_id,name,club_id) values(new.user_id,'club_joined',new.club_id);
 end if;
 return new;
end $$;
create trigger gear_created_event after insert on public.user_gears for each row execute function public.record_creation_event();
create trigger question_created_event after insert on public.questions for each row execute function public.record_creation_event();
create trigger club_joined_event after insert or update of status on public.club_members for each row execute function public.record_creation_event();
revoke execute on function public.limit_content_writes(),public.record_creation_event() from public,anon,authenticated;
-- Supporting indexes for foreign-key lookups and RLS checks.
create index gear_images_gear_idx on public.gear_images(gear_id);
create index club_invites_club_idx on public.club_invites(club_id);
create index questions_author_idx on public.questions(author_id);
create index questions_club_idx on public.questions(club_id);
create index answers_author_idx on public.answers(author_id);
create index conversions_click_idx on public.conversions(click_id);
create index affiliate_links_offer_idx on public.affiliate_links(offer_id);
create index favorites_product_idx on public.favorites(product_id);
