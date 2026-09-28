-- LOCAL DEVELOPMENT ONLY. Never seed these known-password accounts into production.
-- Demo accounts are labelled in profiles; their text is example copy, not real reviews.
do $$
declare item record;
begin
 for item in select * from (values
 ('00000000-0000-4000-8000-000000000101'::uuid,'demo-minsu@example.test','민수 · 데모','농구'),
 ('00000000-0000-4000-8000-000000000102'::uuid,'demo-jiyoon@example.test','지윤 · 데모','러닝'),
 ('00000000-0000-4000-8000-000000000103'::uuid,'demo-seung@example.test','승희 · 데모','피클볼')
 ) as t(id,email,nickname,sport) loop
  insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change_token_new,email_change)
  values('00000000-0000-0000-0000-000000000000',item.id,'authenticated','authenticated',item.email,extensions.crypt('LocalDemo-Only-2026!',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}',jsonb_build_object('nickname',item.nickname),now(),now(),'','','','') on conflict(id) do nothing;
  insert into auth.identities(id,provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
  values(gen_random_uuid(),item.id::text,item.id,jsonb_build_object('sub',item.id,'email',item.email,'email_verified',true),'email',now(),now(),now()) on conflict(provider_id,provider) do nothing;
  update public.profiles set is_demo=true,main_sport=item.sport,sports=array[item.sport],region='대전',onboarding_completed=true where id=item.id;
 end loop;
end $$;
insert into public.clubs(id,owner_id,name,sport,region,description,is_demo) values
('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101','KAIST Basketball','농구','대전 유성구','데모 동호회입니다. 실제 동호회 운영 데이터가 아닙니다.',true),
('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000103','ONE Pickleball','피클볼','대전','데모 동호회입니다.',true),
('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000102','Daejeon Running Crew','러닝','대전 갑천','데모 동호회입니다.',true)
on conflict(id) do nothing;
insert into public.club_members(club_id,user_id,role) select id,owner_id,'owner' from public.clubs where is_demo on conflict do nothing;
insert into public.brands(name) values('NIKE'),('ANTA'),('WAY OF WADE'),('SELKIRK'),('JOOLA'),('GARMIN') on conflict do nothing;
insert into public.categories(name,slug) values('농구화','basketball-shoes'),('피클볼 패들','pickleball-paddles'),('러닝 워치','running-watches') on conflict do nothing;
insert into public.products(id,brand,name,category,description) values
('20000000-0000-4000-8000-000000000001','NIKE','Kobe 9 Protro Elite Low','농구화','초기 카탈로그 샘플. 현재 판매 여부와 가격은 검증되지 않았습니다.'),
('20000000-0000-4000-8000-000000000002','NIKE','Hyperdunk 2017 Low','농구화','초기 카탈로그 샘플'),
('20000000-0000-4000-8000-000000000003','ANTA','KAI 1','농구화','초기 카탈로그 샘플'),
('20000000-0000-4000-8000-000000000004','WAY OF WADE','WOW 11','농구화','초기 카탈로그 샘플'),
('20000000-0000-4000-8000-000000000005','SELKIRK','LUXX Control Air','피클볼 패들','초기 카탈로그 샘플'),
('20000000-0000-4000-8000-000000000006','JOOLA','Perseus paddle','피클볼 패들','초기 카탈로그 샘플'),
('20000000-0000-4000-8000-000000000007','GARMIN','Forerunner 265','러닝 워치','초기 카탈로그 샘플')
on conflict do nothing;
insert into public.user_gears(id,user_id,product_id,club_id,usage_frequency,usage_context,review_text,visibility) values
('30000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','주 2~3회','실내 코트 · 가드','데모 예시입니다. 함께 뛰는 사람의 사이즈와 착용감 이야기가 이곳에 쌓여요.','public'),
('30000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000102','20000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000003','주 3회','갑천 5km 러닝','데모 예시입니다. 실제 사용자 경험이 아닙니다.','public'),
('30000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000103','20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000002','주 1~2회','주말 복식','데모 예시입니다. 실제 사용자 경험이 아닙니다.','public')
on conflict(id) do nothing;
-- Offers are intentionally not fabricated; add verified merchant URLs through an operator.
insert into public.commerce_provider_configs(id) values('generic'),('coupang'),('linkprice'),('direct') on conflict do nothing;
