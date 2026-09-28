import { beforeAll, afterAll, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
let db: PGlite;
const A = '00000000-0000-4000-8000-000000000001',
  B = '00000000-0000-4000-8000-000000000002',
  C = '00000000-0000-4000-8000-000000000003';
let clubId: string, productId: string, gearId: string, questionId: string;
async function as(id: string | null) {
  await db.exec(
    `reset role; select set_config('request.jwt.claim.sub','${id || ''}',false); set role ${id ? 'authenticated' : 'anon'};`,
  );
}
async function scalar(sql: string, params: unknown[] = []) {
  const result = await db.query<Record<string, unknown>>(sql, params);
  return Object.values(result.rows[0] || {})[0] as string;
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create table auth.users(id uuid primary key,raw_user_meta_data jsonb);grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;alter default privileges in schema public grant select,insert,update,delete on tables to anon,authenticated;`,
  );
  await db.exec(readFileSync('supabase/migrations/202609280001_initial.sql', 'utf8'));
  await db.exec(
    `create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;create function storage.foldername(path text) returns text[] language sql immutable as $$select string_to_array(path,'/')$$;grant usage on schema storage to anon,authenticated;grant select,insert,delete on storage.objects to anon,authenticated;grant execute on function storage.foldername(text) to anon,authenticated;`,
  );
  await db.exec(readFileSync('supabase/migrations/202609280002_storage.sql', 'utf8'));
  await db.exec(readFileSync('supabase/migrations/202609280003_hardening.sql', 'utf8'));
  await db.exec(
    `insert into auth.users values('${A}','{"nickname":"A"}'),('${B}','{"nickname":"B"}'),('${C}','{"nickname":"C"}');`,
  );
});
afterAll(async () => {
  await db.close();
});
it('creates club + owner atomically, hides private membership, admits only valid invite', async () => {
  await as(A);
  clubId = await scalar(
    `select public.create_club('Private Club','농구','','','private','invite')`,
  );
  expect(await scalar(`select role from club_members where club_id=$1`, [clubId])).toBe('owner');
  const token = await scalar(
    `insert into club_invites(club_id,created_by) values($1,$2) returning token`,
    [clubId, A],
  );
  await as(B);
  expect(await scalar(`select count(*) from club_members where club_id=$1`, [clubId])).toBe(0);
  expect(await scalar(`select count(*) from clubs where id=$1`, [clubId])).toBe(0);
  await expect(scalar(`select public.join_club($1)`, [clubId])).rejects.toThrow();
  await expect(scalar(`select public.accept_invite('invalid')`)).rejects.toThrow();
  expect(await scalar(`select public.accept_invite($1)`, [token])).toBe(clubId);
  expect(await scalar(`select count(*) from club_members where club_id=$1`, [clubId])).toBe(2);
});
it('prevents privilege escalation by profile and membership writes', async () => {
  await as(B);
  await expect(db.exec(`insert into staff(user_id) values('${B}')`)).rejects.toThrow();
  await expect(db.exec(`update profiles set is_demo=true where id='${B}'`)).rejects.toThrow();
  await db.exec(`update club_members set role='owner' where user_id='${B}'`);
  expect(await scalar(`select role from club_members where user_id=$1`, [B])).toBe('member');
  await expect(scalar(`select public.approve_member($1,$2)`, [clubId, C])).rejects.toThrow();
});
it('matches identical products and enforces public / club / private gear on the backend', async () => {
  await as(A);
  productId = await scalar(`select public.register_product('NIKE','Kobe 9','농구화')`);
  gearId = await scalar(
    `insert into user_gears(user_id,product_id,club_id,visibility,review_text) values($1,$2,$3,'club','A 실제 경험') returning id`,
    [A, productId, clubId],
  );
  await as(B);
  expect(await scalar(`select public.register_product('Nike','Kobe-9','농구화')`)).toBe(productId);
  await db.query(
    `insert into user_gears(user_id,product_id,club_id,visibility) values($1,$2,$3,'public')`,
    [B, productId, clubId],
  );
  expect(await scalar('select count(*) from user_gears where product_id=$1', [productId])).toBe(2);
  await as(C);
  expect(await scalar('select count(*) from user_gears where id=$1', [gearId])).toBe(0);
  await expect(
    db.query(
      `insert into user_gears(user_id,product_id,club_id,visibility) values($1,$2,$3,'club')`,
      [C, productId, clubId],
    ),
  ).rejects.toThrow();
  await as(A);
  await db.query(`update user_gears set visibility='private' where id=$1`, [gearId]);
  await as(B);
  expect(await scalar('select count(*) from user_gears where id=$1', [gearId])).toBe(0);
  await as(A);
  await db.query(`update user_gears set visibility='club' where id=$1`, [gearId]);
});
it('notifies gear owner and question author, protects private questions', async () => {
  await as(B);
  questionId = await scalar(
    `insert into questions(product_id,author_id,target_user_id,club_id,question) values($1,$2,$3,$4,'발볼이 넓은데 어떤가요?') returning id`,
    [productId, B, A, clubId],
  );
  await as(A);
  expect(await scalar(`select count(*) from notifications where user_id=$1`, [A])).toBe(1);
  await db.query(
    `insert into answers(question_id,author_id,answer) values($1,$2,'제 경험으로는 반업이 편했어요.')`,
    [questionId, A],
  );
  await as(B);
  expect(await scalar(`select count(*) from notifications where user_id=$1`, [B])).toBe(1);
  expect(await scalar(`select count(*) from notifications where user_id=$1`, [A])).toBe(0);
  await as(C);
  expect(await scalar('select count(*) from questions where id=$1', [questionId])).toBe(0);
  expect(await scalar('select count(*) from answers where question_id=$1', [questionId])).toBe(0);
  await expect(
    db.query(`insert into answers(question_id,author_id,answer) values($1,$2,'침입 답변')`, [
      questionId,
      C,
    ]),
  ).rejects.toThrow();
});
it('only operators can merge, migrates ownership and offer references atomically', async () => {
  await as(A);
  const other = await scalar(`select public.register_product('Nike','Kobe IX','농구화')`);
  await expect(scalar(`select public.merge_products($1,$2)`, [productId, other])).rejects.toThrow();
  await db.exec('reset role');
  await db.query('insert into staff values($1)', [A]);
  const mid = await scalar(
    `insert into merchants(name,domain) values('Example','shop.example') returning id`,
  );
  const oid = await scalar(
    `insert into offers(product_id,merchant_id,product_url) values($1,$2,'https://shop.example/kobe') returning id`,
    [productId, mid],
  );
  await as(A);
  await db.query('select public.merge_products($1,$2)', [productId, other]);
  expect(await scalar('select product_id from user_gears where id=$1', [gearId])).toBe(other);
  expect(await scalar('select product_id from offers where id=$1', [oid])).toBe(other);
  expect(await scalar(`select count(*) from audit_logs where action='product_merged'`)).toBe(1);
  await as(null);
  const click = await scalar('select public.track_outbound($1)', [oid]);
  expect(click).toMatch(/^[a-f0-9-]{36}$/);
  expect(await scalar('select count(*) from click_events')).toBe(0);
  await as(A);
  expect(await scalar('select count(*) from click_events where click_id=$1', [click])).toBe(1);
});

it('protects private image paths and ties uploads to owned gear', async () => {
  await as(A);
  const path = `${A}/${gearId}/test.png`;
  await db.query(`insert into storage.objects(bucket_id,name) values('gear-images',$1)`, [path]);
  await db.query(`insert into gear_images(gear_id,path) values($1,$2)`, [gearId, path]);
  await as(B);
  expect(await scalar(`select count(*) from storage.objects where name=$1`, [path])).toBe(1);
  await as(C);
  expect(await scalar(`select count(*) from storage.objects where name=$1`, [path])).toBe(0);
  await expect(
    db.query(`insert into storage.objects(bucket_id,name) values('gear-images',$1)`, [path]),
  ).rejects.toThrow();
  await as(A);
  await db.query(`update user_gears set visibility='private' where id=$1`, [gearId]);
  await as(B);
  expect(await scalar(`select count(*) from storage.objects where name=$1`, [path])).toBe(0);
});
it('uses shared database rate windows', async () => {
  await as(C);
  expect(await scalar(`select public.consume_rate_limit('test',1)`)).toBe(true);
  expect(await scalar(`select public.consume_rate_limit('test',1)`)).toBe(false);
});
