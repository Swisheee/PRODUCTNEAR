-- Identity and authorization
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 nickname text not null check (char_length(nickname) between 1 and 40),
 avatar_path text, sports text[] not null default '{}', main_sport text,
 region text, experience_level text, onboarding_completed boolean not null default false,
 is_demo boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.staff (user_id uuid primary key references public.profiles on delete cascade);
create table public.clubs (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles,
 name text not null check (char_length(name) between 2 and 80), sport text not null, region text,
 description text not null default '', cover_path text, avatar_path text,
 visibility text not null default 'public' check (visibility in ('public','private')),
 join_policy text not null default 'open' check (join_policy in ('open','approval','invite')),
 is_demo boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (visibility <> 'private' or join_policy <> 'open')
);
create table public.club_members (
 club_id uuid references public.clubs on delete cascade, user_id uuid references public.profiles on delete cascade,
 role text not null default 'member' check (role in ('owner','admin','member')),
 status text not null default 'active' check (status in ('active','pending')),
 created_at timestamptz not null default now(), primary key(club_id,user_id)
);
create table public.club_invites (
 id uuid primary key default gen_random_uuid(), club_id uuid not null references public.clubs on delete cascade,
 token text unique not null default replace(gen_random_uuid()::text,'-',''),
 created_by uuid not null references public.profiles, expires_at timestamptz not null default now()+interval '7 days',
 revoked_at timestamptz, created_at timestamptz not null default now()
);
create table public.categories (id uuid primary key default gen_random_uuid(), name text unique not null, slug text unique not null);
create table public.brands (id uuid primary key default gen_random_uuid(), name text unique not null);
create table public.products (
 id uuid primary key default gen_random_uuid(), brand text not null, name text not null check (char_length(name) between 2 and 160),
 model_name text, category text not null, subcategory text, description text not null default '', primary_image text,
 release_year integer, gtin text, provider text, external_product_id text,
 normalized_name text generated always as (lower(regexp_replace(brand || ' ' || name,'[^a-zA-Z0-9가-힣]','','g'))) stored,
 product_metadata jsonb not null default '{}', created_by uuid references public.profiles,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(provider,external_product_id)
);
create unique index products_gtin_unique on public.products(gtin) where gtin is not null;
create unique index products_name_unique on public.products(normalized_name);
create table public.product_aliases (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products on delete cascade, alias text unique not null);
create table public.user_gears (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade,
 product_id uuid not null references public.products, club_id uuid references public.clubs on delete set null,
 nickname text, size text, color text, purchase_date date, usage_start_date date, usage_frequency text,
 usage_context text, review_text text check (char_length(review_text)<=4000), pros text, cons text, buy_again boolean,
 recommend_for text, purchase_price numeric(14,2) check (purchase_price>=0), purchase_url text,
 visibility text not null default 'public' check (visibility in ('public','club','private')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (visibility <> 'club' or club_id is not null)
);
create table public.gear_images (id uuid primary key default gen_random_uuid(), gear_id uuid not null references public.user_gears on delete cascade, path text unique not null, created_at timestamptz not null default now());
create table public.questions (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products,
 author_id uuid not null references public.profiles, target_user_id uuid references public.profiles,
 club_id uuid references public.clubs on delete cascade,
 question text not null check (char_length(question) between 5 and 2000), created_at timestamptz not null default now()
);
create table public.answers (
 id uuid primary key default gen_random_uuid(), question_id uuid not null references public.questions on delete cascade,
 author_id uuid not null references public.profiles, answer text not null check (char_length(answer) between 2 and 4000), created_at timestamptz not null default now()
);
create table public.reactions (user_id uuid references public.profiles on delete cascade, answer_id uuid references public.answers on delete cascade, created_at timestamptz not null default now(), primary key(user_id,answer_id));
create table public.merchants (
 id uuid primary key default gen_random_uuid(), name text not null, domain text unique not null, logo text,
 provider text not null default 'generic', affiliate_enabled boolean not null default false,
 status text not null default 'active' check(status in ('active','disabled')),
 tracking_type text, affiliate_parameter text, coupon_code text, commission_rate numeric(6,4), created_at timestamptz not null default now()
);
-- Secrets belong in deployment environment / Supabase Vault, never in this configuration table.
create table public.commerce_provider_configs (id text primary key, enabled boolean not null default false, public_config jsonb not null default '{}', updated_at timestamptz not null default now());
create table public.offers (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products,
 merchant_id uuid not null references public.merchants, external_product_id text,
 product_url text not null check(product_url ~ '^https://'), affiliate_url text check(affiliate_url ~ '^https://'),
 price numeric(14,2) check(price>=0), original_price numeric(14,2), shipping_fee numeric(14,2) check(shipping_fee>=0),
 currency text not null default 'KRW', availability text not null default 'unknown' check(availability in ('in_stock','out_of_stock','unknown')),
 last_checked_at timestamptz, created_at timestamptz not null default now()
);
create table public.affiliate_links (id uuid primary key default gen_random_uuid(), offer_id uuid not null references public.offers on delete cascade, url text not null, provider text not null, expires_at timestamptz, created_at timestamptz not null default now());
create table public.click_events (
 id uuid primary key default gen_random_uuid(), click_id uuid unique not null default gen_random_uuid(), user_id uuid references public.profiles on delete set null,
 product_id uuid not null references public.products, offer_id uuid not null references public.offers,
 merchant_id uuid not null references public.merchants, club_id uuid references public.clubs on delete set null,
 source text, created_at timestamptz not null default now()
);
create table public.conversions (
 id uuid primary key default gen_random_uuid(), click_id uuid references public.click_events(click_id), user_id uuid references public.profiles on delete set null,
 merchant_id uuid not null references public.merchants, product_id uuid references public.products, order_reference text not null,
 revenue numeric(14,2) not null, commission numeric(14,2) not null, currency text not null default 'KRW',
 status text not null default 'pending' check (status in ('pending','approved','cancelled','refunded')),
 occurred_at timestamptz not null default now(), confirmed_at timestamptz, unique(merchant_id,order_reference)
);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade,
 kind text not null, message text not null, href text not null, read_at timestamptz, created_at timestamptz not null default now()
);
create table public.favorites (user_id uuid references public.profiles on delete cascade, product_id uuid references public.products on delete cascade, created_at timestamptz not null default now(), primary key(user_id,product_id));
create table public.reports (id uuid primary key default gen_random_uuid(), author_id uuid not null references public.profiles, gear_id uuid references public.user_gears on delete set null, reason text not null, status text not null default 'pending', created_at timestamptz not null default now());
create table public.audit_logs (id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles, action text not null, details jsonb not null default '{}', created_at timestamptz not null default now());
create table public.events (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles on delete set null, name text not null check (name in ('club_joined','gear_registered','product_viewed','profile_viewed','question_asked','offers_viewed')), product_id uuid references public.products, club_id uuid references public.clubs on delete set null, created_at timestamptz not null default now());
create table public.rate_limits (key text primary key, hits integer not null, window_start timestamptz not null);

create index club_members_user_idx on public.club_members(user_id,status);
create index user_gears_product_idx on public.user_gears(product_id);
create index user_gears_club_idx on public.user_gears(club_id,created_at desc);
create index user_gears_user_idx on public.user_gears(user_id);
create index questions_product_idx on public.questions(product_id,created_at desc);
create index answers_question_idx on public.answers(question_id);
create index notifications_user_idx on public.notifications(user_id,created_at desc);
create index offers_product_idx on public.offers(product_id);
create index events_created_idx on public.events(created_at,name);
create index click_events_created_idx on public.click_events(created_at);

create function public.is_staff() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.staff where user_id=auth.uid()) $$;
create function public.is_member(cid uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.club_members where club_id=cid and user_id=auth.uid() and status='active') $$;
create function public.manages_club(cid uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.club_members where club_id=cid and user_id=auth.uid() and role in ('owner','admin') and status='active') $$;
create function public.can_read_club(cid uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.clubs where id=cid and (visibility='public' or public.is_member(cid))) $$;
create function public.can_read_gear(gid uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.user_gears where id=gid and (visibility='public' or user_id=auth.uid() or (visibility='club' and public.is_member(club_id)))) $$;
create function public.owns_gear(gid uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.user_gears where id=gid and user_id=auth.uid()) $$;

-- Default-deny all entities, including operational tables.
do $$ declare t text; begin
 for t in select tablename from pg_tables where schemaname='public' loop
  execute format('alter table public.%I enable row level security',t);
 end loop;
end $$;
create policy profiles_read on public.profiles for select using (true);
create policy profiles_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy staff_self on public.staff for select to authenticated using(user_id=auth.uid());
create policy clubs_read on public.clubs for select using(visibility='public' or public.is_member(id) or owner_id=auth.uid() or public.is_staff());
create policy clubs_edit on public.clubs for update to authenticated using(public.manages_club(id)) with check(public.manages_club(id));
create policy members_read on public.club_members for select using(user_id=auth.uid() or public.can_read_club(club_id) or public.is_staff());
create policy invites_read on public.club_invites for select to authenticated using(public.manages_club(club_id));
create policy invites_create on public.club_invites for insert to authenticated with check(public.manages_club(club_id) and created_by=auth.uid());
create policy invites_revoke on public.club_invites for update to authenticated using(public.manages_club(club_id)) with check(public.manages_club(club_id));
create policy gear_read on public.user_gears for select using(visibility='public' or user_id=auth.uid() or (visibility='club' and public.is_member(club_id)) or public.is_staff());
create policy gear_create on public.user_gears for insert to authenticated with check(user_id=auth.uid() and (club_id is null or public.is_member(club_id)));
create policy gear_update on public.user_gears for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and (club_id is null or public.is_member(club_id)));
create policy gear_delete on public.user_gears for delete to authenticated using(user_id=auth.uid() or public.is_staff());
create policy images_read on public.gear_images for select using(public.can_read_gear(gear_id));
create policy images_write on public.gear_images for insert to authenticated with check(public.owns_gear(gear_id) and path like auth.uid()::text || '/' || gear_id::text || '/%');
create policy images_delete on public.gear_images for delete to authenticated using(public.owns_gear(gear_id));
create policy questions_read on public.questions for select using(club_id is null or public.is_member(club_id) or public.is_staff());
create policy questions_create on public.questions for insert to authenticated with check(author_id=auth.uid() and (club_id is null or public.is_member(club_id)) and (target_user_id is null or exists(select 1 from public.user_gears g where g.product_id=questions.product_id and g.user_id=target_user_id)));
create policy questions_delete on public.questions for delete to authenticated using(author_id=auth.uid() or public.is_staff());
create policy answers_read on public.answers for select using(exists(select 1 from public.questions q where q.id=question_id));
create policy answers_create on public.answers for insert to authenticated with check(author_id=auth.uid() and exists(select 1 from public.questions q where q.id=question_id));
create policy answers_delete on public.answers for delete to authenticated using(author_id=auth.uid() or public.is_staff());
create policy notifications_read on public.notifications for select to authenticated using(user_id=auth.uid());
create policy notifications_update on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy favorites_own on public.favorites for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy reactions_read on public.reactions for select using(exists(select 1 from public.answers a where a.id=answer_id));
create policy reactions_own on public.reactions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.answers a where a.id=answer_id));
create policy reports_create on public.reports for insert to authenticated with check(author_id=auth.uid());
create policy reports_read on public.reports for select to authenticated using(author_id=auth.uid() or public.is_staff());
create policy reports_moderate on public.reports for update to authenticated using(public.is_staff());
create policy events_create on public.events for insert to authenticated with check(user_id=auth.uid() and (club_id is null or public.is_member(club_id)));
do $$ declare t text; begin
 foreach t in array array['products','product_aliases','brands','categories','merchants','offers'] loop
  execute format('create policy catalog_read on public.%I for select using (true)',t);
  execute format('create policy catalog_admin on public.%I for all to authenticated using(public.is_staff()) with check(public.is_staff())',t);
 end loop;
 foreach t in array array['commerce_provider_configs','affiliate_links','click_events','conversions','events','audit_logs'] loop
  execute format('create policy operations_read on public.%I for select to authenticated using(public.is_staff())',t);
 end loop;
end $$;
-- Narrow column grants prevent mass-assignment escalation.
revoke update on public.profiles from authenticated;
grant update(nickname,avatar_path,sports,main_sport,region,experience_level,onboarding_completed) on public.profiles to authenticated;
revoke update on public.clubs from authenticated;
grant update(name,sport,region,description,cover_path,avatar_path,visibility,join_policy) on public.clubs to authenticated;
revoke update on public.notifications from authenticated;
grant update(read_at) on public.notifications to authenticated;
revoke update on public.club_invites from authenticated;
grant update(revoked_at) on public.club_invites to authenticated;

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles(id,nickname) values(new.id, left(coalesce(nullif(new.raw_user_meta_data->>'nickname',''),'새로운 멤버'),40)); return new; end $$;
create trigger auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['profiles','clubs','products','user_gears','commerce_provider_configs'] loop execute format('create trigger update_timestamp before update on public.%I for each row execute function public.set_updated_at()',t); end loop; end $$;

create function public.create_club(p_name text,p_sport text,p_region text,p_description text,p_visibility text,p_join_policy text) returns uuid language plpgsql security definer set search_path = '' as $$
declare cid uuid;
begin
 if auth.uid() is null then raise exception '로그인이 필요합니다'; end if;
 insert into public.clubs(owner_id,name,sport,region,description,visibility,join_policy) values(auth.uid(),p_name,p_sport,p_region,left(p_description,2000),p_visibility,p_join_policy) returning id into cid;
 insert into public.club_members(club_id,user_id,role) values(cid,auth.uid(),'owner');
 return cid;
end $$;
create function public.join_club(p_club_id uuid) returns text language plpgsql security definer set search_path = '' as $$
declare c public.clubs; s text;
begin
 if auth.uid() is null then raise exception '로그인이 필요합니다'; end if;
 select * into c from public.clubs where id=p_club_id and visibility='public';
 if not found or c.join_policy='invite' then raise exception '유효한 초대가 필요합니다'; end if;
 s=case when c.join_policy='approval' then 'pending' else 'active' end;
 insert into public.club_members(club_id,user_id,status) values(c.id,auth.uid(),s) on conflict do nothing;
 select status into s from public.club_members where club_id=c.id and user_id=auth.uid();
 return s;
end $$;
create function public.accept_invite(p_token text) returns uuid language plpgsql security definer set search_path = '' as $$
declare cid uuid;
begin
 if auth.uid() is null then raise exception '로그인이 필요합니다'; end if;
 select club_id into cid from public.club_invites where token=p_token and expires_at>now() and revoked_at is null for update;
 if cid is null then raise exception '만료되었거나 유효하지 않은 초대입니다'; end if;
 insert into public.club_members(club_id,user_id) values(cid,auth.uid()) on conflict(club_id,user_id) do update set status='active';
 return cid;
end $$;
create function public.approve_member(p_club_id uuid,p_user_id uuid) returns void language plpgsql security definer set search_path = '' as $$ begin
 if not public.manages_club(p_club_id) then raise exception '권한이 없습니다'; end if;
 update public.club_members set status='active' where club_id=p_club_id and user_id=p_user_id and status='pending';
end $$;

create function public.register_product(p_brand text,p_name text,p_category text) returns uuid language plpgsql security definer set search_path = '' as $$
declare pid uuid; norm text;
begin
 if auth.uid() is null then raise exception '로그인이 필요합니다'; end if;
 if char_length(p_brand) not between 1 and 80 or char_length(p_name) not between 2 and 160 or char_length(p_category) not between 1 and 60 then raise exception '제품 정보를 확인해주세요'; end if;
 norm=lower(regexp_replace(p_brand||' '||p_name,'[^a-zA-Z0-9가-힣]','','g'));
 insert into public.products(brand,name,category,created_by) values(p_brand,p_name,p_category,auth.uid()) on conflict(normalized_name) do nothing returning id into pid;
 if pid is null then select id into pid from public.products where normalized_name=norm; end if;
 return pid;
end $$;

create function public.notify_question() returns trigger language plpgsql security definer set search_path = '' as $$ begin
 insert into public.notifications(user_id,kind,message,href)
 select distinct g.user_id,'question','등록한 장비에 새로운 질문이 도착했어요.','/questions/'||new.id from public.user_gears g
 where g.product_id=new.product_id and g.user_id<>new.author_id
 and (new.target_user_id is null or g.user_id=new.target_user_id)
 and (g.visibility='public' or (g.visibility='club' and exists(select 1 from public.club_members m where m.club_id=g.club_id and m.user_id=new.author_id and m.status='active')))
 and (new.club_id is null or exists(select 1 from public.club_members m where m.club_id=new.club_id and m.user_id=g.user_id and m.status='active'));
 return new; end $$;
create trigger question_notification after insert on public.questions for each row execute function public.notify_question();
create function public.notify_answer() returns trigger language plpgsql security definer set search_path = '' as $$ begin
 insert into public.notifications(user_id,kind,message,href) select author_id,'answer','질문에 새로운 답변이 달렸어요.','/questions/'||new.question_id from public.questions where id=new.question_id and author_id<>new.author_id;
 return new; end $$;
create trigger answer_notification after insert on public.answers for each row execute function public.notify_answer();

-- Shared rate limiter: a fixed per-user window, never an in-process map.
create function public.consume_rate_limit(p_action text,p_limit integer default 30) returns boolean language plpgsql security definer set search_path = '' as $$
declare n integer; k text;
begin
 if auth.uid() is null then return false; end if;
 k=auth.uid()::text||':'||left(p_action,40);
 insert into public.rate_limits(key,hits,window_start) values(k,1,now()) on conflict(key) do update set hits=case when public.rate_limits.window_start<now()-interval '1 minute' then 1 else public.rate_limits.hits+1 end, window_start=case when public.rate_limits.window_start<now()-interval '1 minute' then now() else public.rate_limits.window_start end returning hits into n;
 return n<=least(greatest(p_limit,1),60);
end $$;
create function public.track_outbound(p_offer_id uuid,p_club_id uuid default null) returns uuid language plpgsql security definer set search_path = '' as $$
declare o public.offers; cid uuid;
begin
 if auth.uid() is not null and not public.consume_rate_limit('outbound',30) then raise exception '잠시 후 다시 시도해주세요'; end if;
 if p_club_id is not null and not public.is_member(p_club_id) then raise exception '권한이 없습니다'; end if;
 select * into o from public.offers where id=p_offer_id and exists(select 1 from public.merchants m where m.id=merchant_id and m.status='active');
 if not found then raise exception '판매처를 찾을 수 없습니다'; end if;
 insert into public.click_events(user_id,product_id,offer_id,merchant_id,club_id,source) values(auth.uid(),o.product_id,o.id,o.merchant_id,p_club_id,'product') returning click_id into cid;
 return cid;
end $$;
create function public.merge_products(p_source uuid,p_target uuid) returns void language plpgsql security definer set search_path = '' as $$ begin
 if not public.is_staff() then raise exception '관리자 권한이 필요합니다'; end if;
 if p_source=p_target then raise exception '서로 다른 제품을 선택해주세요'; end if;
 perform id from public.products where id in (p_source,p_target) order by id for update;
 if (select count(*) from public.products where id in (p_source,p_target))<>2 then raise exception '제품을 찾을 수 없습니다'; end if;
 update public.user_gears set product_id=p_target where product_id=p_source;
 update public.offers set product_id=p_target where product_id=p_source;
 update public.questions set product_id=p_target where product_id=p_source;
 update public.product_aliases set product_id=p_target where product_id=p_source;
 update public.click_events set product_id=p_target where product_id=p_source;
 update public.conversions set product_id=p_target where product_id=p_source;
 update public.events set product_id=p_target where product_id=p_source;
 insert into public.favorites(user_id,product_id) select user_id,p_target from public.favorites where product_id=p_source on conflict do nothing;
 delete from public.favorites where product_id=p_source;
 insert into public.product_aliases(product_id,alias) select p_target,brand||' '||name from public.products where id=p_source on conflict do nothing;
 delete from public.products where id=p_source;
 insert into public.audit_logs(actor_id,action,details) values(auth.uid(),'product_merged',jsonb_build_object('source',p_source,'target',p_target));
end $$;
-- Explicit execution permissions: anonymous users only need read helpers and outbound tracking.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.is_staff(),public.is_member(uuid),public.manages_club(uuid),public.can_read_club(uuid),public.can_read_gear(uuid),public.owns_gear(uuid) to anon,authenticated;
grant execute on function public.create_club(text,text,text,text,text,text),public.join_club(uuid),public.accept_invite(text),public.approve_member(uuid,uuid),public.register_product(text,text,text),public.consume_rate_limit(text,integer),public.merge_products(uuid,uuid) to authenticated;
grant execute on function public.track_outbound(uuid,uuid) to anon,authenticated;
